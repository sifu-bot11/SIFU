const fs = require("fs");
const path = require("path");
const os = require("os");
const { createCanvas, loadImage } = require("canvas");

// Format time function
function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}𝐃 ${h}𝐇 ${m}𝐌 ${s}𝐒`;
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "upinfo"],
    version: "3.0",
    author: "SHIFAT",
    role: 0,
    shortDescription: "Show uptime info image same as design",
    longDescription: "Creates an uptime image identical to the sample style.",
    category: "system",
  },

  onStart: async ({ api, message, usersData, threadsData }) => {
    try {
      const uptime = process.uptime() * 1000;
      const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const cpuLoad = os.loadavg()[0].toFixed(2);
      const users = (await usersData.getAll()).length;
      const groups = (await threadsData.getAll()).length;

      // Background image (exact same as sample)
      const bgUrl = "https://i.imgur.com/MNRiBWc.jpeg";
      const bg = await loadImage(bgUrl);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      // Draw background unchanged
      ctx.drawImage(bg, 0, 0, bg.width, bg.height);

      // Set text style (exact same look)
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 8;

      // Title “SHIFAT”
      ctx.font = "bold 60px Arial";
      ctx.fillText("𝐒𝐇𝐈𝐅𝐀𝐓 ", bg.width / 2, 80);

      // Smaller info lines
      ctx.font = "bold 35px Arial";
      const lines = [
        `𝐔𝐏𝐓𝐈𝐌𝐄 : ${formatTime(uptime)}`,
        `𝐑𝐀𝐌 𝐔𝐒𝐄𝐀𝐆𝐄 : ${usedMem}𝐌𝐁`,
        `𝐂𝐏𝐔 𝐔𝐒𝐄𝐀𝐆𝐄 : ${cpuLoad}%`,
        `𝐔𝐒𝐄𝐑𝐒 : ${users}`,
        `𝐆𝐑𝐎𝐔𝐏𝐒 : ${groups}`,
      ];

      let y = 170;
      for (const line of lines) {
        ctx.fillText(line, bg.width / 2, y);
        y += 70;
      }

      // Save output
      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      const filePath = path.join(dir, "uptime_card.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return message.reply({
        attachment: fs.createReadStream(filePath),
      });

    } catch (e) {
      console.error(e);
      return message.reply("❌ Error generating uptime image.");
    }
  },
};
