const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    author: "SHIFAT",
    countDown: 5,
    role: 2,
    category: "fun",
    shortDescription: {
      en: "Generates a 'hacking' image with the user's profile picture.",
    },
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = text.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ args, usersData, threadsData, api, event }) {
    const tmpDir = path.join(__dirname, "tmp");
    fs.ensureDirSync(tmpDir);

    const pathImg = path.join(tmpDir, "background.png");
    const pathAvt = path.join(tmpDir, "Avtmot.png");

    // --- FIX: define mentionID properly ---
    const mentionID = (event.mentions && Object.keys(event.mentions)[0]) || event.senderID;

    try {
      // get user name
      const userInfo = await api.getUserInfo(mentionID);
      const name = userInfo && userInfo[mentionID] ? userInfo[mentionID].name : "Unknown";

      // thread info (if you need it)
      // const ThreadInfo = await api.getThreadInfo(event.threadID);

      const backgrounds = ["https://i.imgur.com/LPbxS8w.jpeg"];
      const rd = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // download avatar
      const avatarRes = await axios.get(
        `https://graph.facebook.com/${mentionID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(pathAvt, Buffer.from(avatarRes.data, "binary"));

      // download background
      const bgRes = await axios.get(rd, { responseType: "arraybuffer" });
      fs.writeFileSync(pathImg, Buffer.from(bgRes.data, "binary"));

      // create canvas
      const baseImage = await loadImage(pathImg);
      const baseAvt = await loadImage(pathAvt);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // draw background
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // text settings
      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";

      // wrap text and draw line-by-line (canvas doesn't handle '\n' natively)
      const lines = await this.wrapText(ctx, name, 1160) || [name];
      const startX = 200;
      let startY = 497;
      const lineHeight = 28; // adjust as needed
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], startX, startY + i * lineHeight);
      }

      // draw avatar (no clipping; you can add circular clip if you want)
      ctx.drawImage(baseAvt, 83, 437, 100, 101);

      // write output
      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      // send message and clean up
      return api.sendMessage(
        {
          body: "𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙃𝙖𝙘𝙠𝙚𝙙 𝙏𝙝𝙞𝙨 𝙐𝙨𝙚𝙧!",
          attachment: fs.createReadStream(pathImg),
        },
        event.threadID,
        () => {
          try {
            if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
            if (fs.existsSync(pathAvt)) fs.unlinkSync(pathAvt);
          } catch (e) {}
        },
        event.messageID
      );
    } catch (error) {
      // cleanup on error
      try {
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
        if (fs.existsSync(pathAvt)) fs.unlinkSync(pathAvt);
      } catch (e) {}

      console.error("Error in hack command:", error);
      return api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
  },
};
