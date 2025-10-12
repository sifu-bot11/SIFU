const axios = require("axios");

module.exports = {
  config: {
    name: "Google",
    aliases: ["gl", "ggl", "googleai"],
    version: "1.0.2",
    author: "SHIFAT",
    countDown: 0,
    role: 0,
    category: "google",
    shortDescription: "Chat with AI or ask anything.",
    longDescription: "Ask anything to Google AI or reply to an image for AI description.",
    guide: "{pn} <message> | reply to a photo"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").trim();
    const encodedApi = "aHR0cHM6Ly9hcGlzLWtlaXRoLnZlcmNlbC5hcHAvYWkvZGVlcHNlZWtWMz9xPQ==";
    const apiUrl = Buffer.from(encodedApi, "base64").toString("utf-8");

    // যদি মেসেজ reply করা হয়
    if (event.type === "message_reply") {
      const reply = event.messageReply;
      const imageUrl = reply.attachments?.[0]?.url;

      if (!imageUrl) {
        return api.sendMessage("‼️ᴀsᴋ ᴍᴇ sᴏᴍᴇᴛʜɪɴɢ ᴏʀ ʀᴇᴘʟʏ ɪɴ ᴀ ᴘɪᴄᴛᴜʀᴇ sᴏ ɪ ᴄᴀɴ ᴀɴᴀʟʏᴢᴇ!!", event.threadID, event.messageID);
      }

      try {
        api.sendMessage("🧠 ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ... ᴛʜᴇ ᴘɪᴄᴛᴜʀᴇ ɪs ʙᴇɪɴɢ ᴀɴᴀʟʏᴢᴇᴅ 🌀", event.threadID, event.messageID);

        const res = await axios.post(`${apiUrl}${encodeURIComponent(input || "Describe this image.")}`, {
          image: imageUrl
        });

        const result = res.data.result || res.data.response || res.data.message || "🤔 কোনো রেসপন্স পাওয়া যায়নি।";
        api.sendMessage(result, event.threadID, event.messageID);
      } catch (err) {
        console.error("AI Image Error:", err.message);
        api.sendMessage(" 😩 error 😩 please try again later..!", event.threadID, event.messageID);
      }

      return;
    }

    // টেক্সট ইনপুটের জন্য
    if (!input) {
      return api.sendMessage(
        "💬ᴀsᴋ ᴍᴇ sᴏᴍᴇᴛʜɪɴɢ ᴏʀ ʀᴇᴘʟʏ ɪɴ ᴀ ᴘɪᴄᴛᴜʀᴇ sᴏ ɪ ᴄᴀɴ ᴀɴᴀʟʏᴢᴇ!",
        event.threadID,
        event.messageID
      );
    }

    try {
      api.sendMessage("✨ please w8....!", event.threadID, event.messageID);

      const res = await axios.get(`${apiUrl}${encodeURIComponent(input)}`);
      const result = res.data.result || res.data.response || res.data.message || "🤔 কোনো রেসপন্স পাওয়া যায়নি।";

      api.sendMessage(result, event.threadID, event.messageID);
    } catch (err) {
      console.error("AI Text Error:", err.message);
      api.sendMessage("⚠️ সার্ভারে সমস্যা হচ্ছে, পরে চেষ্টা করো!", event.threadID, event.messageID);
    }
  }
};
