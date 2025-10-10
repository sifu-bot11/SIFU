 const parseAmount = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const suffixes = {
    k: 1e3, m: 1e6, b: 1e9, t: 1e12,
    qt: 1e15, qd: 1e15, qi: 1e18, sx: 1e21,
    sp: 1e24, oc: 1e27, no: 1e30, dc: 1e33
  };
  let matched = Object.keys(suffixes).find(suf => str.endsWith(suf));
  let multiplier = matched ? suffixes[matched] : 1;
  if (matched) str = str.slice(0, -matched.length);
  let num = parseFloat(str);
  return isNaN(num) ? NaN : num * multiplier;
};

const emojis = ["💔","💖","❤️‍🩹","❤️‍🔥","♥️"];

module.exports = {
  config: {
    name: "bet",
    version: "2.1",
    author: "SAIF",
    shortDescription: { en: "One-click emoji bet with 45/55 chance" },
    longDescription: { en: "User gives amount, bot selects emoji, result is automatic." },
    category: "Game"
  },
  langs: {
    en: {
      invalid_amount: "⚠️ 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐨 𝐛𝐞𝐭.",
      not_enough_money: "💰 𝐲𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.",
      spin_message: "🤑 𝐬𝐩𝐢𝐧𝐧𝐢𝐧𝐠...",
      win_message: " 🥳𝐘𝐎𝐔 𝐖𝐎𝐍 $%1!",
      lose_message: "😌 𝐘𝐎𝐔 𝐋𝐎𝐒𝐓 $%1."
    }
  },

  onStart: async function({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    const amount = parseAmount(args[0]);
    if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalid_amount"));
    if (amount > userData.money) return message.reply(getLang("not_enough_money"));

    // Bot automatically select emoji
    const userEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Spinning animation simulation
    await message.reply(getLang("spin_message"));
    await new Promise(r => setTimeout(r, 1500));

    // Determine winning emoji (random)
    const winningEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const isWin = Math.random() < 0.45; // 45% chance win
    const winnings = isWin ? amount : -amount;

    // Update balance
    await usersData.set(senderID, { money: userData.money + winnings, data: userData.data });

    const resultMsg = `
✨ 𝑺𝑰𝒁𝑼𝑲𝑨 𝑩𝑬𝑻 𝑺𝒀𝑺𝑻𝑬𝑴 ✨
━━━━━━━━━━━━━━━━━━
🙆 𝐩𝐥𝐚𝐲𝐞𝐫: ${userData.name || "Unknown"}
💵 𝐛𝐞𝐭: ${args[0]} on ${userEmoji}
🍀 𝐰𝐢𝐧𝐧𝐢𝐧𝐠 𝐞𝐦𝐨𝐣𝐢: ${winningEmoji}

${isWin ? getLang("win_message", args[0]) : getLang("lose_message", args[0])}

🏦 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${userData.money + winnings}
━━━━━━━━━━━━━━━━━
`;
    return message.reply(resultMsg);
  }
};
