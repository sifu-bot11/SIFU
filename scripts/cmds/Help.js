const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands", "cmd"],
    version: "5.0",
    author: "𝐒𝐇𝐈𝐅𝐀𝐓",
    shortDescription: "Show all available commands in MIKASA style.",
    longDescription: "Displays a clean and premium-styled categorized list of commands with a video.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    const cleanCategoryName = (text) => {
      if (!text) return "OTHERS";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
    };

    for (const [name, cmd] of allCommands) {
      if (!cmd?.config || cmd.config.name === "help") continue;
      const cat = cleanCategoryName(cmd.config.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    // --- Video URLs ---
    const videoURLs = [
      "https://i.imgur.com/6Zzq3ET.mp4",
      "https://i.imgur.com/95iGAEJ.mp4"
    ];

    const randomVideoURL = videoURLs[Math.floor(Math.random() * videoURLs.length)];
    const videoFolder = path.join(__dirname, "cache");
    if (!fs.existsSync(videoFolder)) fs.mkdirSync(videoFolder, { recursive: true });
    const videoPath = path.join(videoFolder, "help_video.mp4");

    // Download only if not already downloaded
    if (!fs.existsSync(videoPath)) {
      try {
        await downloadFile(randomVideoURL, videoPath);
      } catch (error) {
        console.error("Failed to download video:", error);
        return message.reply("❌ Couldn't load the menu video. Please try again.");
      }
    }

    // --- If specific command is queried ---
    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find((c) => (c.config.aliases || []).includes(query));

      if (!cmd) {
        return message.reply(`❌ Command "${query}" not found.`);
      }

      const { name, version, author, guide, category, shortDescription, longDescription, aliases } = cmd.config;
      const desc = longDescription || shortDescription || "No description provided.";

      // --- Safe usage text ---
      const usage = (typeof guide === "string" ? guide : "{pn}{name}")
        .replace(/{pn}/g, prefix)
        .replace(/{name}/g, name);

      const replyMsg =
        `╭─ ✨ Command Details\n` +
        `│\n` +
        `│ 𝗡𝗮𝗺𝗲: ${name}\n` +
        `│ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${category || "Uncategorized"}\n` +
        `│ 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
        `│ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${version || "1.0"}\n` +
        `│ 𝗔𝘂𝘁𝗵𝗼𝗿: 𝐒𝐇𝐈𝐅𝐀𝐓\n` +
        `│\n` +
        `│ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${desc}\n` +
        `│ 𝗨𝘀𝗮𝗴𝗲: ${usage}\n` +
        `│\n` +
        `╰────────────➤`;

      return message.reply({
        body: replyMsg,
        attachment: fs.createReadStream(videoPath)
      });
    }

    // --- Full help menu ---
    let msg = "╭──═══────═══❖❉\n│♥︎╣[ 𝐒𝐈𝐙𝐔𝐊𝐀 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓 ]╠♥︎\n╰───═══────═══❖❉\n\n\n";
    const sortedCategories = Object.keys(categories).sort();

    for (const cat of sortedCategories) {
      if (categories[cat].length === 0) continue;

      msg += `╭─══─✦♥︎╣[ ${cat} ]╠♥︎\n`;
      const commands = categories[cat].sort();
      for (let i = 0; i < commands.length; i += 2) {
        const cmd1 = commands[i];
        const cmd2 = commands[i + 1];
        if (cmd2) {
          msg += `│ᰔᩚ${cmd1} ᰔᩚ${cmd2}\n`;
        } else {
          msg += `│ᰔᩚ${cmd1}\n`;
        }
      }
      msg += `╰───═══────═══❖❉✦\n\n`;
    }

    const totalCommands = allCommands.size - 1;
    msg +=
      `╭─══─══─✦[ 𝐄𝐍𝐉𝐎𝐘 ]\n` +
      `│>𝗧𝗢𝗧𝗔𝗟 𝗖𝗠𝗗𝗦: [${totalCommands}].\n` +
      `│𝗧𝗬𝗣𝗘𝖳:[ ${prefix}help <command> ]\n` +
      `╰─══──════════──══──✦\n\n` +
      `╔════❖•ೋ° °ೋ•❖════╗\n` +
      `ᰔᩚ═════  𝐒𝐇𝐈𝐅𝐀𝐓  ═════ ᰔᩚ\n` +
      `╚════❖•ೋ° °ೋ•❖════╝`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(videoPath)
    });
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
