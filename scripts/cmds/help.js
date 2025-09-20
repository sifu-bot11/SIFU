module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "5.0",
    author: "GoatBot",
    shortDescription: "Show all available commands",
    longDescription: "Displays a beautiful categorized list of commands with modern design.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const categories = {};

    // Category mapping with proper names and emojis
    const categoryMap = {
      'box chat': 'BOX CHAT',
      'system': 'SYSTEM',
      'admin': 'ADMIN',
      'general': 'GENERAL',
      'image': 'IMAGE',
      'media': 'MEDIA',
      'game': 'GAME',
      'economy': 'ECONOMY',
      'tools': 'TOOLS',
      'utility': 'UTILITY',
      'fun': 'FUNNY',
      'info': 'INFORMATION',
      'config': 'CONFIG',
      'ai': 'AI',
      'love': 'LOVE',
      'anime': 'ANIME',
      'search': 'SEARCH',
      'study': 'STUDY',
      'health': 'HEALTH',
      'nsfw': 'NSFW',
      'edit-img': 'EDIT-IMG',
      'no prefix': 'NO PREFIX'
    };

    const cleanCategoryName = (text) => {
      if (!text) return "general";
      return text
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    for (const [name, cmd] of allCommands) {
      const cat = cleanCategoryName(cmd.config.category);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    // Single command detail
    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd =
        allCommands.get(query) ||
        [...allCommands.values()].find((c) => (c.config.aliases || []).includes(query));
      if (!cmd) return message.reply(`❌ Command "${query}" not found.`);

      const {
        name,
        version,
        author,
        guide,
        category,
        shortDescription,
        longDescription,
        aliases
      } = cmd.config;

      const desc =
        typeof longDescription === "string"
          ? longDescription
          : longDescription?.en || shortDescription?.en || shortDescription || "No description";

      const usage =
        typeof guide === "string"
          ? guide.replace(/{pn}/g, prefix)
          : guide?.en?.replace(/{pn}/g, prefix) || `${prefix}${name}`;

      return message.reply(
        `╭── NAME ────⭓\n│ ${name}\n├── INFO\n│ Description: ${desc}\n│ Other names: ${aliases?.length ? aliases.join(", ") : "None"}\n│ Version: ${version || "1.0"}\n│ Role: ${category || "Uncategorized"}\n│ Author: ${author || "Unknown"}\n├── Usage\n${usage}\n├── Notes\n│ The content inside <XXXXX> can be changed\n│ The content inside [a|b|c] is a or b or c\n╰──────⭔`
      );
    }

    // Format commands in rows of 3
    const formatCommands = (cmds) => {
      const sorted = cmds.sort();
      const rows = [];
      for (let i = 0; i < sorted.length; i += 3) {
        const row = sorted.slice(i, i + 3);
        const formattedRow = row.map(cmd => `✧${cmd}`).join(' ');
        rows.push(`│${formattedRow}`);
      }
      return rows.join('\n');
    };

    // Main command list with beautiful formatting
    let msg = '';

    // Define category order and their display names
    const categoryOrder = [
      { key: 'image', name: 'IMAGE' },
      { key: 'ai', name: 'AI' },
      { key: 'general', name: 'GENERAL' },
      { key: 'image', name: 'IMAGE GEN' },
      { key: 'game', name: 'GAME' },
      { key: 'admin', name: 'ADMIN' },
      { key: 'box chat', name: 'BOX CHAT' },
      { key: 'fun', name: 'FUNNY' },
      { key: 'utility', name: 'UTILITY' },
      { key: 'media', name: 'MEDIA' },
      { key: 'anime', name: 'ANIME' },
      { key: 'economy', name: 'ECONOMY' },
      { key: 'love', name: 'LOVE' },
      { key: 'tools', name: 'TOOLS' },
      { key: 'system', name: 'SYSTEM' },
      { key: 'study', name: 'STUDY' },
      { key: 'search', name: 'SEARCH' },
      { key: 'nsfw', name: 'NSFW' },
      { key: 'edit-img', name: 'EDIT-IMG' },
      { key: 'no prefix', name: 'NO PREFIX' },
      { key: 'health', name: 'HEALTH' },
      { key: 'info', name: 'INFORMATION' },
      { key: 'config', name: 'CONFIG' }
    ];

    // Build the message
    for (const categoryInfo of categoryOrder) {
      const categoryKey = categoryInfo.key;
      const categoryName = categoryInfo.name;
      
      if (categories[categoryKey] && categories[categoryKey].length > 0) {
        msg += `╭─────⭓ ${categoryName}\n`;
        msg += formatCommands(categories[categoryKey]);
        msg += `\n╰────────────⭓\n\n`;
      }
    }

    // Add footer
    const totalCommands = allCommands.size;
    msg += `╭─ [ YOUR SHIZUKA BOT]\n`;
    msg += `╰‣ Admin: ZISAN🎀\n`;
    msg += `╰‣ Total commands: ${totalCommands}\n`;
    msg += `╰‣ 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤\nhttps://www.facebook.com/dekisuki.hidetoshi.2025\n\n`;
    msg += `⭔Type ${prefix}help <command> to learn usage.`;

    return message.reply(msg);
  }
};
