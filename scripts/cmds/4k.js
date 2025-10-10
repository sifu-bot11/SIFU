const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const xyz = "ArYANAHMEDRUDRO";

module.exports = {
  config: {
    name: "4k",
    version: "1.0.1",
    author: "SHIFAT",
    role: 0,
    description: "Enhance Photo - Image Generator (Goat Bot)",
    category: "image",
    guide: {
      en: "{pn} [reply to image or provide image URL]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, messageReply } = event;
    const tempImagePath = path.join(__dirname, "cache", `enhanced_${Date.now()}.jpg`);

    // ইনপুট থেকে image URL বের করা
    const imageUrl = messageReply?.attachments?.[0]?.url || args.join(" ");

    if (!imageUrl) {
      return message.reply("⚠️ Please reply to an image or provide an image URL.");
    }

    try {
      // প্রসেসিং মেসেজ পাঠানো
      const processingMsg = await message.reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭 𝐁𝐚𝐛𝐲...😘");

      // API কল
      const apiUrl = `https://aryan-xyz-upscale-api-phi.vercel.app/api/upscale-image?imageUrl=${encodeURIComponent(imageUrl)}&apikey=${xyz}`;
      const enhancementResponse = await axios.get(apiUrl);

      const enhancedImageUrl = enhancementResponse.data?.resultImageUrl;
      if (!enhancedImageUrl) {
        throw new Error("❌ Failed to get enhanced image URL.");
      }

      // ইমেজ ডাউনলোড
      const enhancedImage = (await axios.get(enhancedImageUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(tempImagePath, Buffer.from(enhancedImage, "binary"));

      // ইউজারকে পাঠানো
      await message.reply({
        body: "😚 𝐈𝐦𝐚𝐠𝐞 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!",
        attachment: fs.createReadStream(tempImagePath)
      });

      // প্রসেসিং মেসেজ ডিলিট
      await api.unsendMessage(processingMsg.messageID);

      // টেম্প ফাইল ডিলিট
      fs.unlinkSync(tempImagePath);

    } catch (error) {
      console.error(error);
      return message.reply("❌ Error while processing the image.");
    }
  }
};
