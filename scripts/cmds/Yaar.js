module.exports.config = {
  name: "yaar",
  version: "1.0",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "Get Pair From Mention (Direct Image, GoatBot compatible)",
  commandCategory: "png",
  usages: "[@mention]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "jimp": ""
  }
};

module.exports.onStart = async function({ event, api }) {
  try {
    const axios = global.nodemodule["axios"];
    const jimp = global.nodemodule["jimp"];
    const { threadID, messageID, senderID } = event;

    const mention = Object.keys(event.mentions);
    if (!mention[0]) return api.sendMessage("আপনার ভাইকে মেনশন করুন 🐤", threadID, messageID);

    const one = senderID;
    const two = mention[0];

    // Base image from Imgur
    const baseImgURL = "https://i.imgur.com/2bY5bSV.jpg";
    const baseBuffer = (await axios.get(baseImgURL, { responseType: "arraybuffer" })).data;
    const baseImg = await jimp.read(baseBuffer);

    // Function to fetch circular avatar
    const getAvatar = async (id) => {
      const buffer = (await axios.get(
        `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      const img = await jimp.read(buffer);
      img.circle();
      return img;
    };

    const avatarOne = await getAvatar(one);
    const avatarTwo = await getAvatar(two);

    // Composite avatars
    baseImg.composite(avatarOne.resize(191, 191), 93, 111)
           .composite(avatarTwo.resize(190, 190), 434, 107);

    // Final buffer
    const finalBuffer = await baseImg.getBufferAsync(jimp.MIME_PNG);

    // Send directly from memory (no file)
    await api.sendMessage({
      body: "✧•❁𝐘𝐚𝐚𝐫❁•✧",
      attachment: finalBuffer
    }, threadID, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ | চিত্র তৈরি করতে সমস্যা হয়েছে।", event.threadID, event.messageID);
  }
};
