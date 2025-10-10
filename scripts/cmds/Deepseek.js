const axios = require("axios");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "deepseek",
    aliases: ["ds","ai","ai bby"],
    version: "2.0", // Updated version
    author: "SHIFAT",
    countDown: 15,
    role: 0,
    shortDescription: "Chat with DeepSeek AI (text or image)",
    longDescription: "Send a question or image to DeepSeek v3 API and receive a clean AI response.",
    category: "ai bby",
    guide: "{pn}deepseek <your question> or reply to an image.",
  },

  onStart: async function ({ api, event, args, message }) {
    const apikey = "66e0cfbb-62b8-4829-90c7-c78cacc72ae2";
    let query;
    let isImageQuery = false;

    const repliedMessage = event.messageReply;

    if (
      repliedMessage &&
      repliedMessage.attachments &&
      repliedMessage.attachments.length > 0 &&
      repliedMessage.attachments[0].type === "photo"
    ) {
      query = repliedMessage.attachments[0].url;
      isImageQuery = true;
      console.log(`[DEEPSEEK_DEBUG] onStart: Initial image query from reply: ${query}`);
    } else if (args.length > 0) {
      query = args.join(" ");
      console.log(`[DEEPSEEK_DEBUG] onStart: Initial text query from command: "${query}"`);
    } else {
      console.log("[DEEPSEEK_DEBUG] onStart: No query provided.");
      return message.reply("𝒃𝒐𝒍𝒐 𝒃𝒃𝒚 𝒌𝒊 𝒗𝒂𝒃𝒆 𝒉𝒆𝒍𝒑 𝒌𝒐𝒓𝒕𝒆 𝒑𝒔𝒓𝒊 𝒕𝒎𝒌.");
    }

    const url = `https://kaiz-apis.gleeze.com/api/deepseek-v3?ask=${encodeURIComponent(query)}&apikey=${apikey}`;
    console.log(`[DEEPSEEK_DEBUG] onStart: API URL: ${url}`);

    try {
      const res = await axios.get(url);
      const responseText = res.data?.response;
      if (!responseText) {
        console.error("[DEEPSEEK_DEBUG] onStart: No 'response' field in API data:", res.data);
        return message.reply("𝒔𝒐𝒓𝒓𝒚 𝒃𝒃𝒚 𝒂𝒌𝒕𝒖 𝒑𝒍𝒎 𝒉𝒐𝒚𝒆𝒄𝒉𝒆. 𝒂𝒃𝒓 𝒕𝒓𝒚 𝒌𝒐𝒓𝒐.");
      }

      const finalText = `🍁 𝑺𝑰𝒁𝑼𝑲𝑨 🍁\n\n${responseText}`;

      api.sendMessage({ body: finalText }, event.threadID, (err, info) => {
        if (err) {
          console.error("[DEEPSEEK_DEBUG] onStart: Error sending message:", err);
          return message.reply("𝒔𝒐𝒓𝒓𝒚 𝒃𝒃𝒚 𝒂𝒌𝒕𝒖 𝒑𝒍𝒎 𝒉𝒐𝒚𝒆𝒄𝒉𝒆. 𝒂𝒃𝒓 𝒕𝒓𝒚 𝒌𝒐𝒓𝒐.");
        }

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
        });
        console.log(`[DEEPSEEK_DEBUG] onStart: Response sent with 🍁 𝑺𝑰𝒁𝑼𝑲𝑨 🍁 header.`);
      });

    } catch (err) {
      console.error("DeepSeek API Error (onStart):", err.message);
      if (axios.isAxiosError(err) && err.response) {
        console.error("DeepSeek API Response Data (Error - onStart):", err.response.data);
      }
      return message.reply("𝒔𝒐𝒓𝒓𝒚 𝒃𝒃𝒚 𝒂𝒑𝒊 𝒕𝒆 𝒑𝒍𝒎 𝒉𝒐𝒊𝒄𝒉𝒆.");
    }
  },

  onReply: async function ({ api, event, message, Reply }) {
    console.log(`[DEEPSEEK_DEBUG] onReply: Triggered with body: "${event.body}"`);

    if (Reply.commandName !== this.config.name) return;
    if (event.senderID !== Reply.author)
      return message.reply("This conversation is only for the user who started it.");

    let newQuery;
    const repliedWithAttachment = event.attachments && event.attachments.length > 0 && event.attachments[0].type === "photo";

    if (repliedWithAttachment) {
      newQuery = event.attachments[0].url;
    } else if (event.body) {
      newQuery = event.body;
    } else {
      return message.reply("𝒃𝒐𝒍𝒐 𝒃𝒃𝒚 𝒌𝒊 𝒗𝒂𝒃𝒆 𝒉𝒆𝒍𝒑 𝒌𝒐𝒓𝒃𝒐 𝒕𝒎𝒌 ´･ᴗ･`.");
    }

    const apikey = "66e0cfbb-62b8-4829-90c7-c78cacc72ae2";
    const url = `https://kaiz-apis.gleeze.com/api/deepseek-v3?ask=${encodeURIComponent(newQuery)}&apikey=${apikey}`;

    try {
      const res = await axios.get(url);
      const responseText = res.data?.response;

      if (!responseText) {
        console.error("[DEEPSEEK_DEBUG] onReply: No 'response' field:", res.data);
        return message.reply(" 🐥 No response received from bby ai for your follow-up.");
      }

      const finalText = `🍁 𝑺𝑰𝒁𝑼𝑲𝑨 🍁\n\n${responseText}`;

      api.sendMessage({ body: finalText }, event.threadID, (err, info) => {
        if (err) {
          console.error("[DEEPSEEK_DEBUG] onReply: Error sending follow-up message:", err);
          return message.reply(" Failed to send follow-up response.");
        }

        global.GoatBot.onReply.delete(Reply.messageID);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
        });
        console.log(`[DEEPSEEK_DEBUG] onReply: Follow-up sent with 🍁 𝑺𝑰𝒁𝑼𝑲𝑨 🍁 header.`);
      });

    } catch (err) {
      console.error("DeepSeek API Error (onReply):", err.message);
      if (axios.isAxiosError(err) && err.response) {
        console.error("DeepSeek API Response Data (Error - onReply):", err.response.data);
      }
      return message.reply("😢 Failed to contact DeepSeek API for your follow-up.");
    }
  }
};

// --- Wrap module for no prefix ---
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
