const { GoatWrapper } = require("fca-liane-utils");
 const { config } = global.GoatBot;
module.exports = {
  config: {
    name: "botinfo",
    aliases: ["info", "btinfo"],
    version: "2.5",
    author: "𝗦𝗛𝗜𝗙𝗔𝗧",
    role: 0,
    shortDescription: {
      en: "Vibey Bot info with Xass-BaYjid sauce."
    },
    longDescription: {
      en: "Displays bot stats with BaYjid coding & Xass swag."
    },
    category: "Info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      let threadInfo = await api.getThreadInfo(event.threadID);
      let threadMem = threadInfo.participantIDs.length;
      let gendernam = [], gendernu = [], nope = [];

      for (let z in threadInfo.userInfo) {
        let gender = threadInfo.userInfo[z].gender;
        let name = threadInfo.userInfo[z].name;
        if (gender == "MALE") gendernam.push(z + gender);
        else if (gender == "FEMALE") gendernu.push(gender);
        else nope.push(name);
      }

      let nam = gendernam.length;
      let nu = gendernu.length;
      let qtv = threadInfo.adminIDs.length;
      let sl = threadInfo.messageCount;
      let threadName = threadInfo.threadName;
      let id = threadInfo.threadID;

      const timeStart = Date.now();
      await api.sendMessage("𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐮𝐩 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐣𝐮𝐢𝐜𝐞...", event.threadID);
      const ping = Date.now() - timeStart;

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬`;

      const now = new Date();
      const localTime = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

      const statusPool = ["𝐎𝐧𝐥𝐢𝐧𝐞", "𝐕𝐢𝐛𝐢𝐧𝐠", "𝐒𝐭𝐚𝐛𝐥𝐞", "𝐑𝐞𝐥𝐨𝐚𝐝𝐞𝐝", "𝐂𝐨𝐨𝐤𝐢𝐧𝐠 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬", "𝐑𝐞𝐚𝐝𝐲 𝐟𝐨𝐫 𝐂𝐡𝐚𝐨𝐬"];
      const botStatus = statusPool[Math.floor(Math.random() * statusPool.length)];

      api.sendMessage(
`╭─ ᰔᩚ<𝐁𝐎𝐓 𝐈𝐍𝐅𝐎>ᰔᩚ ─╮
│ ᰔᩚ 𝐂𝐞𝐨: 𝐒𝐡𝐢𝐟𝐚𝐭
│ ᰔᩚ 𝐁𝐨𝐭: ᰔᩚ𝐒𝐢𝐳𝐮𝐤𝐚ᰔᩚ
│ ᰔᩚ 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: 𝐊𝐡𝐮𝐥𝐧𝐚
│ ᰔᩚ 𝐒𝐭𝐚𝐭𝐮𝐬: ${botStatus}
│ ᰔᩚ 𝐂𝐞𝐨 𝐅𝐛:@𝐝𝐚𝐫𝐤𝐬𝐡𝐢𝐟𝐚𝐭
├─ᰔᩚ│ᰔᩚ─ᰔᩚ│ᰔᩚ─ᰔᩚ│ᰔᩚ─╯
│ ᰔᩚ 𝐓𝐢𝐦𝐞: ${localTime}
│ ᰔᩚ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeString}
│ ᰔᩚ 𝐏𝐢𝐧𝐠: ${ping}𝐦𝐬
├─ᰔᩚ│ᰔᩚ─ᰔᩚ│ᰔᩚ─ᰔᩚ│ᰔᩚ─╮
│ ᰔᩚ 𝐆𝐫𝐨𝐮𝐩: ${threadName}
│ ᰔᩚ 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃: ${id}
│ ᰔᩚ 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${threadMem} (♂️${nam} / ♀️${nu})
│ ᰔᩚ 𝐀𝐝𝐦𝐢𝐧𝐬: ${qtv}
│ ᰔᩚ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${sl}
╰─ᰔᩚ│ᰔᩚ─ᰔᩚ│ᰔᩚ─ᰔᩚ│ᰔᩚ─╯`, event.threadID);

    } catch (error) {
      console.error(error);
      api.sendMessage("𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐭𝐫𝐢𝐩𝐩𝐞𝐝 𝐢𝐧 𝐭𝐡𝐞 𝐦𝐚𝐭𝐫𝐢𝐱. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.", event.threadID);
    }
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
