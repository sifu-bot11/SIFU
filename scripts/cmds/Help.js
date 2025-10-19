const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands", "cmd"],
    version: "6.0",
    author: "𝐒𝐇𝐈𝐅𝐀𝐓",
    shortDescription: "Show all available commands in MIKASA style.",
    longDescription: "Displays a categorized command list with a rotating video (different every time).",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    // --- Category cleaner ---
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

    // --- Video list (add as many Imgur links as you want) ---
    const videoURLs = [
      "https://i.imgur.com/6Zzq3ET.mp4",
      "https://i.imgur.com/NW5AUqe.mp4",
      "https://i.imgur.com/xhFp4Rc.mp4",
      "https://i.imgur.com/vWigmIF.mp4",
      "https://i.imgur.com/V6Au0p4.mp4"
    ];

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const indexFile = path.join(cacheDir, "help_video_index.json");
    let index = 0;

    // load last used index
    if (fs.existsSync(indexFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(indexFile));
        index = (data.index + 1) % videoURLs.length;
      } catch {
        index = 0;
      }
    }

    // save new index
    fs.writeFileSync(indexFile, JSON.stringify({ index }));

    const videoURL = videoURLs[index];
    const videoPath = path.join(cacheDir, `help_video_${index}.mp4`);

    // download only if not cached
    if (!fs.existsSync(videoPath)) {
      try {
        await downloadFile(videoURL, videoPath);
      } catch (err) {
        console.error("Video download failed:", err);
        return message.reply("❌ Couldn't load help video.");
      }
    }

    // --- Specific command info ---
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
        `│ 𝗔𝘂𝘁𝗵𝗼𝗿: 𝐇𝐎𝐓𝐀𝐑𝐎\n` +
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

    // --- Full help list ---
    let msg = "╭──═══────═══❖❉\n│♥︎╣[ 𝐒𝐈𝐙𝐔𝐊𝐀 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓 ]╠♥︎\n╰───═══────═══❖❉\n\n\n";
    const sortedCategories = Object.keys(categories).sort();

    for (const cat of sortedCategories) {
      if (categories[cat].length === 0) continue;

      msg += `╭─══─✦♥︎╣[ ${cat} ]╠♥︎\n`;
      const commands = categories[cat].sort();
      for (let i = 0; i < commands.length; i += 2) {
        const cmd1 = commands[i];
        const cmd2 = commands[i + 1];
        msg += cmd2 ? `│ᰔᩚ${cmd1} ᰔᩚ${cmd2}\n` : `│ᰔᩚ${cmd1}\n`;
      }
      msg += `╰───═══────═══❖❉✦\n\n`;
    }

    const totalCommands = allCommands.size - 1;
    msg +=
      `╭─══─══─✦[ 𝐄𝐍𝐉𝐎𝐘 ]\n` +
      `│>𝗧𝗢𝗧𝗔𝗟 𝗖𝗠𝗗𝗦: [${totalCommands}].\n` +
      `│𝗧𝗬𝗣𝗘:[ ${prefix}help <command> ]\n` +
      `╰─══──════════──══──✦\n\n` +
      `╔════❖•ೋ° °ೋ•❖════╗\n` +
      `ᰔᩚ═════  𝐇𝐎𝐓𝐀𝐑𝐎  ═════ ᰔᩚ\n` +
      `╚════❖•ೋ° °ೋ•❖════╝`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(videoPath)
    });
  }
};

// --- Download Helper ---
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
