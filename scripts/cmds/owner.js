const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    author: "SHIFAT", // Converted By GoatBot V3
    role: 0,
    shortDescription: "Show Owner/Admin Info",
    longDescription: "Displays the owner/admin information with attached video.",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const ownerInfo = {
        name: '',
        gender: '',
        age: '',
        hobby: '',
        facebook: '',
        nick: ''
      };

      // --- ImgUr video link ---
      const videoUrl = 'https://i.imgur.com/lmk4jTK.mp4'; // এখানে তোর ইমগুর ভিডিও লিঙ্ক বসা
      
      // --- Temp folder ---
      const tmpFolderPath = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpFolderPath)) {
        fs.mkdirSync(tmpFolderPath);
      }

      // --- Download video from imgur ---
      const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');
      fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

      // --- Stylish Message ---
      const response = `
╭─────────────✦
│ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
│
│ ✧ 𝗡𝗮𝗺𝗲: 𝗦𝗛𝗜𝗙𝗔𝗧 
│ ✧ 𝗡𝗶𝗰𝗸: 𝗦𝗜𝗙𝗨
│ ✧ 𝗔𝗴𝗲: 18
│ ✧ 𝗛𝗼𝗯𝗯𝘆: ٩(˘◡˘)۶
│ ✧ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: @darkshifat
│
╰─────────────✦`;

      // --- Send message + video ---
      await api.sendMessage({
        body: response,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, event.messageID);

      // --- Reaction system ---
      if (event.body && event.body.toLowerCase().includes('owner')) {
        api.setMessageReaction('👑', event.messageID, (err) => {}, true);
      }

    } catch (error) {
      console.error('Error in owner command:', error);
      return api.sendMessage('❌ Something went wrong while fetching Owner info.', event.threadID);
    }
  },
};
