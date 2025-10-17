const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const DIG = require("discord-image-generation");

module.exports = {
  config: {
    name: "gay",
    version: "2.2",
    author: "SHIFAT",
    countDown: 5,
    role: 0,
    shortDescription: "Find who's gay 😆",
    longDescription: "Applies a rainbow gay filter to the mentioned or replied user's avatar",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to a message\n\nYou must mention someone or reply to their message."
    }
  },

  onStart: async function ({ api, event, usersData, message }) {
    try {
      let targetID;

      // 1️⃣ Check for mention
      const mentions = Object.keys(event.mentions || {});
      if (mentions.length > 0) {
        targetID = mentions[0];
      }

      // 2️⃣ Check if message is a reply
      if (!targetID && event.messageReply && event.messageReply.senderID) {
        targetID = event.messageReply.senderID;
      }

      // 3️⃣ If no target, send error
      if (!targetID) {
        return message.reply("❌ You must mention someone or reply to their message!");
      }

      // 🏳️‍🌈 Apply gay filter
      const userInfo = await api.getUserInfo([targetID]);
      const user = userInfo[targetID];
      const avatarUrl = await usersData.getAvatarUrl(targetID);

      const imagePath = await applyGayFilter(avatarUrl);

      const attachment = fs.createReadStream(imagePath);
      message.reply({
        body: `🏳️‍🌈 Look! I found a gay: ${user.name} 😜`,
        attachment
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ Something went wrong 😅");
    }
  }
};

// 🏳️‍🌈 Function to apply gay filter
async function applyGayFilter(avatarUrl) {
  const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
  const image = Buffer.from(response.data, "binary");

  const gayFilter = new DIG.Gay();
  const filteredImage = await gayFilter.getImage(image);

  const outputDir = path.join(__dirname, "cache");
  fs.ensureDirSync(outputDir);
  const outputFile = path.join(outputDir, `gay_${Date.now()}.png`);
  fs.writeFileSync(outputFile, filteredImage);

  return outputFile;
}
