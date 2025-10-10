module.exports = {
  config: {
    name: "top",
    version: "1.1",
    author: "Shikaki + Modified by Tamim",
    category: "economy",
    shortDescription: {
      vi: "Xem 10 người giàu nhất",
      en: "View the top 10 richest people",
    },
    longDescription: {
      vi: "Xem danh sách 10 người giàu nhất trong nhóm",
      en: "View the list of the top 10 richest people in the group",
    },
    guide: {
      en: "{pn} 10\n{pn} 50\n{pn} 100",
    },
    role: 0,
  },

  onStart: async function ({ message, usersData, args }) {
    const allUserData = await usersData.getAll();

    const sortedUsers = allUserData
      .filter((user) => !isNaN(user.money))
      .sort((a, b) => b.money - a.money);

    const topCount = Math.min(parseInt(args[0]) || 10, sortedUsers.length);

    if (topCount === 0) {
      return message.reply("😶 No users found with valid money data.");
    }

    let msg = "🎀━━━━━━━━━〔 💸 𝐓𝐎𝐏 𝐑𝐈𝐂𝐇𝐄𝐒𝐓 💸 〕━━━━━━━━━🎀\n\n";

    sortedUsers.slice(0, topCount).forEach((user, index) => {
      const name = user.name || `User ID: ${user.userID || "Unknown"}`;
      const money = formatNumberWithFullForm(user.money);

      // Emoji for top 3
      let medal = "";
      if (index === 0) medal = "👑🥇";
      else if (index === 1) medal = "🥈";
      else if (index === 2) medal = "🥉";
      else medal = ` ${index + 1}.`;

      msg += `${medal} ${name}\n   └ 💰 $${money}\n`;
    });

    msg += "\n🎀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🎀";

    message.reply(msg);
  },
};

// Stylish number formatter
function formatNumberWithFullForm(number) {
  const fullForms = [
    "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion",
    "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion", "Undecillion",
    "Duodecillion", "Tredecillion", "Quattuordecillion", "Quindecillion", "Sexdecillion",
    "Septendecillion", "Octodecillion", "Novemdecillion", "Vigintillion", "Unvigintillion",
    "Duovigintillion", "Tresvigintillion", "Quattuorvigintillion", "Quinvigintillion",
    "Sesvigintillion", "Septemvigintillion", "Octovigintillion", "Novemvigintillion",
    "Trigintillion", "Untrigintillion", "Duotrigintillion", "Googol"
  ];

  let fullFormIndex = 0;
  while (number >= 1000 && fullFormIndex < fullForms.length - 1) {
    number /= 1000;
    fullFormIndex++;
  }

  return `${number} ${fullForms[fullFormIndex]}`.trim();
}
