module.exports = {
  config: {
    name: "slot",
    version: "3.5",
    author: "SHIFAT",
    description: {
      role: 2,
      en: "Lucky Slot Machine (Goat Bot)",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "🤑 𝐄𝐍𝐓𝐄𝐑 𝐀 𝐕𝐀𝐋𝐈𝐃 𝐁𝐄𝐓 𝐀𝐌𝐎𝐔𝐍𝐓.!",
      not_enough_money: "💸 𝐘𝐎𝐔 𝐃𝐎𝐍’𝐓 𝐇𝐀𝐕𝐄 𝐄𝐍𝐎𝐔𝐆𝐇 𝐌𝐎𝐍𝐄𝐘.!",
      win_message: "😀 𝐘𝐎𝐔 𝐖𝐎𝐍 $%1!",
      lose_message: "😔 𝐘𝐎𝐔 𝐋𝐎𝐒𝐓 $%1!",
      jackpot_message: "💎 𝐉𝐀𝐂𝐊𝐏𝐎𝐓!!! 𝐘𝐎𝐔 𝐖𝐎𝐍 $%1 𝐖𝐈𝐓𝐇 𝐓𝐇𝐑𝐄𝐄 %2 𝐒𝐘𝐌𝐁𝐎𝐋𝐒!",
      spinning: "🎰 𝑺𝑷𝑰𝑵𝑰𝑵𝑮 𝑻𝑯𝑬 𝑺𝑰𝒁𝑼𝑲𝑨 𝑺𝑳𝑶𝑻 𝑺𝒀𝑺𝑻𝑬𝑴 🎀"
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // "Spinning..." মেসেজ
    await message.reply(getLang("spinning"));

    // Slots
    const slots = ["💚", "🧡", "❤️", "💜", "💙", "💛"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    // জেতা/হার হিসাব
    const winnings = calcWinnings(slot1, slot2, slot3, amount);

    // ব্যালান্স আপডেট
    const newBalance = userData.money + winnings;
    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data,
    });

    // আউটপুট
    const resultText = formatResult(slot1, slot2, slot3, winnings, getLang, amount, newBalance);
    return message.reply(resultText);
  },
};

// ======================
// LUCKY WIN LOGIC
// ======================
function calcWinnings(slot1, slot2, slot3, betAmount) {
  // Jackpot: ৩টা এক হলে সবসময় বড় পুরস্কার
  if (slot1 === slot2 && slot2 === slot3) {
    if (slot1 === "💛") return betAmount * 12; // বিশেষ প্রাইজ
    return betAmount * 8;
  }

  // ২টা মিললে 80% সম্ভাবনায় জিতবে
  if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
    if (Math.random() < 0.8) {
      return betAmount * 3;
    }
  }

  // Random extra win: 50% সম্ভাবনা
  if (Math.random() < 0.5) {
    return betAmount * 2;
  }

  // হার (কম হবে)
  return -betAmount;
}

function formatResult(slot1, slot2, slot3, winnings, getLang, betAmount, balance) {
  const slotLine = `✨✨𝐒𝐇𝐈𝐙𝐔𝐊𝐀 𝐒𝐋𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌✨✨\n═✦══════✦✦══════✦═\n\n🎰 [ ${slot1} | ${slot2} | ${slot3} ] 🎰\n`;

  let resultMsg;
  if (winnings > 0) {
    if (slot1 === slot2 && slot2 === slot3) {
      resultMsg = getLang("jackpot_message", winnings, slot1);
    } else {
      resultMsg = getLang("win_message", winnings);
    }
  } else {
    resultMsg = getLang("lose_message", -winnings);
  }

  return (
    `${slotLine}\n` +
    `💵 𝐵𝐸𝑇 𝐴𝑀𝑂𝑈𝑁𝑇: $${betAmount}\n` +
    `📌 𝑅𝐸𝑆𝑈𝐿𝑇: ${resultMsg}\n` +
    `💳 𝑌𝑂𝑈𝑅 𝐵𝐴𝐿𝐴𝑁𝐶𝐸: $${balance}\n` +
    `═✦══════✦✦══════✦═`
  );
}
