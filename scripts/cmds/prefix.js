const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// Convert normal text to bold full-width
function toFullWidthBold(str) {
  const map = {
    A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',
    H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',
    O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',
    V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',
    a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',
    h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',
    o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',
    v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',
    0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',
    6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'
  };
  return str.split('').map(c => map[c] || c).join('');
}

// 🖼️ Prefix Card তৈরি ফাংশন
async function createPrefixCard(info, bgUrl) {
  const W = 520, H = 420;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const bg = await loadImage(bgUrl);
  ctx.drawImage(bg, 0, 0, W, H);

  // হালকা কালো ব্লার ব্যাকগ্রাউন্ড
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  // নীয়ন বর্ডার
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, "#ff00cc");
  grd.addColorStop(0.5, "#00ffff");
  grd.addColorStop(1, "#00ff66");
  ctx.lineWidth = 6;
  ctx.strokeStyle = grd;
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 25;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // টাইটেল
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#FFFF66";
  ctx.textAlign = "center";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 25;
  ctx.fillText("𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐍𝐅𝐎", W / 2, 80);

  // তথ্যগুলো মাঝখানে
  const lines = [
    `🔹 𝐏𝐑𝐄𝐅𝐈𝐗: ${toFullWidthBold(info.prefix)}`,
    `🔹 𝐎𝐖𝐍𝐄𝐑: ${toFullWidthBold(info.owner)}`,
    `🔹 𝐁𝐎𝐓 𝐍𝐀𝐌𝐄: ${toFullWidthBold(info.botName)}`
  ];

  ctx.font = "bold 26px Arial";
  ctx.textAlign = "center";
  ctx.shadowBlur = 15;
  let startY = 180;
  const lineGap = 60; // ফাঁকা জায়গা

  for (const line of lines) {
    const color = line.includes("𝐏𝐑𝐄𝐅𝐈𝐗") ? "#00ffff" :
                  line.includes("𝐎𝐖𝐍𝐄𝐑") ? "#ff00ff" : "#00ff66";
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.fillText(line, W / 2, startY);
    startY += lineGap;
  }

  return canvas.toBuffer("image/png");
}

// 🧩 Command Module
module.exports = {
  config: {
    name: "prefix",
    version: "4.0.0",
    role: 0,
    author: "𝐒𝐇𝐈𝐅𝐀𝐓",
    category: "system",
    description: "Show bot prefix and info in a neon-styled image card",
    countDown: 5
  },

  onStart: async ({ api, message, event, commands, globalData }) => {
    try {
      const prefix = globalData?.getPrefix
        ? await globalData.getPrefix(message.threadID)
        : global?.GoatBot?.config?.prefix || global?.config?.PREFIX || "/";

      const info = {
        prefix,
        owner: "[_𝐒𝐇𝐈𝐅𝐀𝐓_]",
        botName: "[_𝐒𝐇𝐈𝐙𝐔𝐊𝐀_]",
      };

      const bgUrl = "https://i.imgur.com/kVfgQgx.jpeg";

      const buffer = await createPrefixCard(info, bgUrl);
      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      const file = path.join(dir, "prefix_card.png");
      fs.writeFileSync(file, buffer);

      return message.reply({ attachment: fs.createReadStream(file) });
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to generate prefix info card.");
    }
  },

  // Prefix ছাড়া কাজ করবে
  onChat: async function({ message, event, globalData, commands }) {
    const text = event.body?.trim().toLowerCase();
    if (text === "prefix") {
      const prefix = globalData?.getPrefix
        ? await globalData.getPrefix(message.threadID)
        : global?.GoatBot?.config?.prefix || global?.config?.PREFIX || "/";

      const info = {
        prefix,
        owner: "[_𝐒𝐇𝐈𝐅𝐀𝐓_]",
        botName: "[_𝐒𝐇𝐈𝐙𝐔𝐊𝐀_]",
      };

      const bgUrl = "https://i.imgur.com/kVfgQgx.jpeg";
      const buffer = await createPrefixCard(info, bgUrl);
      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      const file = path.join(dir, "prefix_card.png");
      fs.writeFileSync(file, buffer);

      return message.reply({ attachment: fs.createReadStream(file) });
    }
  }
};
