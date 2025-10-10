const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "fuckyou",
    aliases: ["fucku", "fuck u","fu** u"],
    version: "1.0",
    author: "SHIFAT",
    shortDescription: "Shows a frog-themed message with video.",
    longDescription: "Displays a custom message with a frog emoji and video attachment.",
    category: "roast",
    guide: "{pn}fuckyou"
  },

  onStart: async function ({ message }) {
    try {
      // --- Custom message ---
      const msg = `FUCK YOU TOO MC💀💀`;

      // --- Video from Imgur ---
      const videoURL = "https://i.imgur.com/Rz188Xx.mp4";
      const videoFolder = path.join(__dirname, "cache");
      if (!fs.existsSync(videoFolder)) fs.mkdirSync(videoFolder, { recursive: true });
      const videoPath = path.join(videoFolder, "frog_video.mp4");

      if (!fs.existsSync(videoPath)) {
        await downloadFile(videoURL, videoPath);
      }

      return message.reply({
        body: msg,
        attachment: fs.createReadStream(videoPath)
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ An error occurred!");
    }
  }
};

// --- Download helper ---
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to download '${url}' (${res.statusCode})`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// --- Wrap module for no prefix ---
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
