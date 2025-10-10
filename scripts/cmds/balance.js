/**
 * balance_v7.js
 * v7 — Animated Neon Edition + Theme System + Auto Rank Upgrade
 *
 * Dependencies: canvas, axios (for remote avatar if needed)
 *
 * Works with your bot's usersData storage (get/set). Stores per-user:
 *  - money (number)
 *  - exp (number)
 *  - rank (string)
 *  - balance_theme (string)  <-- theme name or hex
 *
 * Commands:
 *  .bal                     -> show your balance card
 *  .bal @user               -> show mentioned user's balance card
 *  .bal add <amount>        -> (admin) add money to your account
 *  .bal transfer <amount>   -> reply to user to transfer
 *  .bal theme <color|name>  -> set your preferred theme (blue, red, gold, green or hex like #ff00aa)
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

// ---------- Utilities ----------
function addCommas(num) {
  if (num === null || num === undefined) return "0";
  const s = Math.floor(num).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMoney(amount) {
  amount = Number(amount) || 0;
  const units = [
    { value: 1e33, symbol: "Dc" },
    { value: 1e30, symbol: "No" },
    { value: 1e27, symbol: "Oc" },
    { value: 1e24, symbol: "Sp" },
    { value: 1e21, symbol: "Sx" },
    { value: 1e18, symbol: "Qa" },
    { value: 1e15, symbol: "Q" },
    { value: 1e12, symbol: "T" },
    { value: 1e9,  symbol: "B" },
    { value: 1e6,  symbol: "M" },
    { value: 1e3,  symbol: "K" }
  ];
  for (let u of units) {
    if (amount >= u.value) {
      return (amount / u.value).toFixed(2).replace(/\.00$/, "") + u.symbol;
    }
  }
  return addCommas(amount);
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// roundRect helper (for older canvas versions)
function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === "undefined") r = 6;
  if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

// ---------- Rank System ----------
const RANKS = [
  { name: "Bronze", minExp: 0 },
  { name: "Silver", minExp: 5000 },
  { name: "Gold",   minExp: 20000 },
  { name: "Diamond", minExp: 100000 },
  { name: "Master",  minExp: 500000 }
];

function computeRank(exp) {
  exp = Number(exp || 0);
  let current = RANKS[0].name;
  for (let i = 0; i < RANKS.length; i++) {
    if (exp >= RANKS[i].minExp) current = RANKS[i].name;
  }
  return current;
}

// ---------- Themes ----------
const BUILT_THEMES = {
  blue: { start: "#00f0ff", end: "#0066ff", accent: "#00ffe5" },
  red:  { start: "#ff4d6d", end: "#ff0033", accent: "#ffd1d1" },
  gold: { start: "#ffd166", end: "#ff9f1c", accent: "#fff1c1" },
  green:{ start: "#47d07d", end: "#0bb77a", accent: "#eafff3" }
};

function resolveTheme(theme) {
  if (!theme) return BUILT_THEMES.blue;
  theme = String(theme).toLowerCase();
  if (BUILT_THEMES[theme]) return BUILT_THEMES[theme];
  // if hex provided like '#ff00aa' or 'ff00aa'
  const hex = String(theme).replace(/[^0-9a-fA-F#]/g, "");
  if (/^#?[0-9A-F]{6}$/i.test(hex)) {
    const h = hex.startsWith("#") ? hex : "#" + hex;
    // make a subtle gradient: h -> slightly darker
    return { start: h, end: shadeHex(h, -30), accent: h };
  }
  return BUILT_THEMES.blue;
}

// helper to shade hex color
function shadeHex(hex, percent) {
  hex = hex.replace("#",""); if (hex.length!==6) return "#000000";
  const num = parseInt(hex,16);
  let r = (num >> 16) + percent; r = clamp(r,0,255);
  let g = ((num >> 8) & 0x00FF) + percent; g = clamp(g,0,255);
  let b = (num & 0x0000FF) + percent; b = clamp(b,0,255);
  return "#" + ( (1<<24) + (r<<16) + (g<<8) + b ).toString(16).slice(1);
}

// ---------- Avatar fetch helper ----------
async function fetchAvatarBuffer(fbId) {
  try {
    // Facebook graph picture
    const url = `https://graph.facebook.com/${fbId}/picture?width=512&height=512`;
    // Try to fetch and return buffer path via loadImage directly (canvas supports URL)
    return url;
  } catch (e) {
    return null;
  }
}

// ---------- Main module ----------
module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "7.0",
    author: "SHIFAT x",
    countDown: 3,
    role: 0,
    description: "Balance card v7 — themes, transfer, add, auto-rank, avatar & neon look",
    category: "economy",
    guide: {
      en: [
        ".bal — show your balance card",
        ".bal @user — show someone else's card",
        ".bal transfer <amount> — reply to user to transfer",
        ".bal add <amount> — admin add money",
        ".bal theme <blue|red|gold|green|#hex> — set your theme"
      ].join("\n")
    }
  },

  onStart: async function ({ api, message, usersData, event, args }) {
    const adminIDs = ["100078859776449"]; // change as needed
    const mention = Object.keys(event.mentions || {})[0];
    const isReply = !!event.messageReply;
    const targetID = mention || (isReply ? event.messageReply.senderID : event.senderID);
    const targetName = mention
      ? event.mentions[mention]
      : isReply
      ? event.messageReply.senderName
      : (event.senderName || "You");

    try {
      // Helper to read/create user record shape
      async function getUser(uid) {
        const ud = (await usersData.get(uid)) || {};
        ud.money = Number(ud.money) || 0;
        ud.exp = Number(ud.exp) || 0;
        ud.rank = ud.rank || computeRank(ud.exp);
        ud.balance_theme = ud.balance_theme || "blue";
        return ud;
      }

      // ADMIN: add money
      if (args[0] === "add") {
        if (!adminIDs.includes(event.senderID)) return message.reply("❌ Only admin can use 'add'.");
        const amount = Math.floor(Number(args[1]));
        if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
        const senderData = await getUser(event.senderID);
        senderData.money += amount;
        // persist
        await usersData.set(event.senderID, senderData);
        return message.reply(`✅ Added ${formatMoney(amount)} to your account.\n🎁 New Balance: ${formatMoney(senderData.money)}`);
      }

      // TRANSFER
      if (args[0] === "transfer") {
        if (!isReply) return message.reply("❌ Please reply to the user you want to transfer to.");
        const amount = Math.floor(Number(args[1]));
        if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
        const senderData = await getUser(event.senderID);
        if (senderData.money < amount) return message.reply("❌ You don't have enough money.");
        const recipientData = await getUser(targetID);
        senderData.money -= amount;
        recipientData.money += amount;
        // save both
        await usersData.set(event.senderID, senderData);
        await usersData.set(targetID, recipientData);
        return message.reply(`✨ You transferred ${formatMoney(amount)} to ${targetName}.\n💰 Your Balance: ${formatMoney(senderData.money)}`);
      }

      // THEME: set user's theme
      if (args[0] === "theme") {
        const param = args[1];
        if (!param) return message.reply("❌ Usage: .bal theme <blue|red|gold|green|#hex>");
        const ud = await getUser(event.senderID);
        ud.balance_theme = param;
        await usersData.set(event.senderID, ud);
        return message.reply(`✅ Theme set to: ${param}`);
      }

      // DEFAULT: SHOW BALANCE CARD
      const user = await getUser(targetID);

      // Auto rank update (if exp changed elsewhere)
      const newRank = computeRank(user.exp);
      if (newRank !== user.rank) {
        user.rank = newRank;
        await usersData.set(targetID, user);
      }

      // Gather display info
      const displayName = targetName;
      const moneyText = formatMoney(user.money);
      const exp = Number(user.exp || 0);
      const rankName = user.rank || computeRank(exp);
      const level = Math.floor(exp / 10000) + 1; // adjust level formula
      const nextLevelExp = (level) * 10000;
      const progress = clamp((exp / nextLevelExp) * 100, 0, 100);

      // Theme
      const theme = resolveTheme(user.balance_theme);

      // Background image (premium) — use your own or this built-in digital art
      const bgUrl = "https://files.catbox.moe/5b5d8o.jpg"; // premium background (changeable)
      const bg = await loadImage(bgUrl).catch(() => null);

      // Avatar (try facebook graph, fallback to placeholder)
      const avatarUrl = await fetchAvatarBuffer(targetID);
      let avatarImg = null;
      try {
        if (avatarUrl) avatarImg = await loadImage(avatarUrl);
      } catch (e) {
        avatarImg = null;
      }

      // Canvas
      const W = bg ? bg.width : 1400;
      const H = bg ? bg.height : 800;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      // Draw background
      if (bg) {
        ctx.drawImage(bg, 0, 0, W, H);
        // subtle overlay for readability
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, W, H);
      } else {
        // fallback gradient
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, theme.start);
        g.addColorStop(1, theme.end);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Neon frame (animated-look static)
      ctx.lineWidth = 6;
      const frameGrad = ctx.createLinearGradient(0, 0, W, 0);
      frameGrad.addColorStop(0, theme.start);
      frameGrad.addColorStop(1, theme.end);
      ctx.strokeStyle = frameGrad;
      roundRect(ctx, 24, 24, W - 48, H - 48, 24);
      ctx.stroke();

      // Left: avatar circle with glow
      const avatarSize = Math.floor(H * 0.45); // proportional
      const ax = 80;
      const ay = Math.floor(H * 0.12);

      // draw glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax + avatarSize / 2, ay + avatarSize / 2, avatarSize / 2 + 12, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fill();
      ctx.shadowColor = theme.accent || "#fff";
      ctx.shadowBlur = 30;
      // avatar clip + draw
      ctx.beginPath();
      ctx.arc(ax + avatarSize / 2, ay + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (avatarImg) {
        ctx.drawImage(avatarImg, ax, ay, avatarSize, avatarSize);
      } else {
        // placeholder
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(ax, ay, avatarSize, avatarSize);
        ctx.fillStyle = theme.accent || "#fff";
        ctx.font = `${Math.floor(avatarSize / 2)}px Sans`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayName ? displayName[0].toUpperCase() : "?", ax + avatarSize / 2, ay + avatarSize / 2);
      }
      ctx.restore();

      // Right: card box
      const cardX = ax + avatarSize + 40;
      const cardY = ay;
      const cardW = W - cardX - 80;
      const cardH = avatarSize;

      // card background with slight glass
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      roundRect(ctx, cardX, cardY, cardW, cardH, 20);
      ctx.fill();
      ctx.restore();

      // Header title
      ctx.textAlign = "left";
      ctx.fillStyle = theme.accent || "#fff";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 12;
      ctx.font = "bold 46px Sans";
      ctx.fillText("💳 Balance Card", cardX + 28, cardY + 60);

      // Name
      ctx.font = "bold 32px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Name: ${displayName}`, cardX + 28, cardY + 110);

      // Money (big)
      ctx.font = "bold 48px Sans";
      ctx.fillStyle = theme.start;
      ctx.fillText(`Balance: ${moneyText} $`, cardX + 28, cardY + 170);

      // EXP & Rank & Level
      ctx.font = "28px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`EXP: ${addCommas(exp)}  •  Rank: ${rankName}  •  Level: ${level}`, cardX + 28, cardY + 220);

      // Progress bar container
      const barX = cardX + 28;
      const barY = cardY + 260;
      const barW = cardW - 56;
      const barH = 28;
      // bg
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, barX, barY, barW, barH, 16);
      ctx.fill();
      // fill
      const barFillW = Math.max(6, (barW * progress) / 100);
      const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      barGrad.addColorStop(0, theme.start);
      barGrad.addColorStop(1, theme.end);
      ctx.fillStyle = barGrad;
      roundRect(ctx, barX, barY, barFillW, barH, 16);
      ctx.fill();

      // progress text
      ctx.font = "bold 20px Sans";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "right";
      ctx.fillText(`${progress.toFixed(0)}%`, barX + barW, barY + barH - 6);

      // Footer: last update + usage tips
      ctx.textAlign = "left";
      ctx.font = "16px Sans";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`ID: ${targetID}`, 40, H - 40);
      ctx.textAlign = "right";
      ctx.fillText(`Tip: .bal transfer <amount> (reply) • .bal theme <color>`, W - 40, H - 40);

      // Save image
      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      const filePath = path.join(dir, `balance_v7_${targetID}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      // Reply with image
      return message.reply({
        body: `✨ ${displayName}'s Balance — ${moneyText} $`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (err) {
      console.error("balance_v7 err:", err);
      return message.reply("❌ Error generating balance card. Check console for details.");
    }
  }
};
