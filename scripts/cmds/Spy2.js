const axios = require("axios");

// Base API URL fetcher with fallback
const baseApiUrl = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
    if (base.data && base.data.api) return base.data.api;
    else return "https://diptoapi.onrender.com"; // fallback API
  } catch {
    return "https://diptoapi.onrender.com"; // fallback if JSON fails
  }
};

module.exports = {
  config: {
    name: "spy2",
    aliases: ["whoishe", "whoisshe", "whoami", "atake"],
    version: "1.1",
    role: 0,
    author: "dipto (fixed by shifat)",
    description: "Get user information and profile photo",
    category: "info",
    countDown: 10,
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions || {})[0];
      let uid;

      // detect uid from args or reply
      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid =
          event.type === "message_reply"
            ? event.messageReply.senderID
            : uid2 || uid1;
      }

      // ✅ API call with fallback & error handling
      const apiBase = await baseApiUrl();
      const babyApiUrl = `${apiBase}/baby?list=all`;

      let babyTeach = 0;
      try {
        const response = await axios.get(babyApiUrl);
        const dataa = response.data || { teacher: { teacherList: [] } };
        if (dataa?.teacher?.teacherList?.length) {
          babyTeach = dataa.teacher.teacherList.find((t) => t[uid])?.[uid] || 0;
        }
      } catch (err) {
        console.log("⚠️ baby API fetch failed:", err.message);
      }

      // user info section
      const userInfo = await api.getUserInfo(uid);
      const avatarUrl = await usersData.getAvatarUrl(uid);

      let genderText;
      switch (userInfo[uid].gender) {
        case 1:
          genderText = "𝙶𝚒𝚛𝚕 🙋🏻‍♀";
          break;
        case 2:
          genderText = "𝙱𝚘𝚢 🙋🏻‍♂";
          break;
        default:
          genderText = "𝙶𝚊𝚢 🤷🏻‍♂";
      }

      const money = (await usersData.get(uid)).money || 0;
      const allUser = await usersData.getAll();
      const rank =
        allUser.slice().sort((a, b) => b.exp - a.exp).findIndex((u) => u.userID === uid) + 1;
      const moneyRank =
        allUser.slice().sort((a, b) => b.money - a.money).findIndex((u) => u.userID === uid) + 1;

      const position = userInfo[uid].type;

      const userInformation = `
╭────[ 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 ]
├‣ 𝙽𝚊𝚖𝚎: ${userInfo[uid].name}
├‣ 𝙶𝚎𝚗𝚍𝚎𝚛: ${genderText}
├‣ 𝚄𝙸𝙳: ${uid}
├‣ 𝙲𝚕𝚊𝚜𝚜: ${position ? position.toUpperCase() : "𝙽𝚘𝚛𝚖𝚊𝚕 𝚄𝚜𝚎𝚛 🥺"}
├‣ 𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎: ${userInfo[uid].vanity || "𝙽𝚘𝚗𝚎"}
├‣ 𝙿𝚛𝚘𝚏𝚒𝚕𝚎 𝚄𝚁𝙻: ${userInfo[uid].profileUrl}
├‣ 𝙱𝚒𝚛𝚝𝚑𝚍𝚊𝚢: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "𝙿𝚛𝚒𝚟𝚊𝚝𝚎"}
├‣ 𝙽𝚒𝚌𝚔𝙽𝚊𝚖𝚎: ${userInfo[uid].alternateName || "𝙽𝚘𝚗𝚎"}
╰‣ 𝙵𝚛𝚒𝚎𝚗𝚍 𝚠𝚒𝚝𝚑 𝚋𝚘𝚝: ${userInfo[uid].isFriend ? "𝚈𝚎𝚜 ✅" : "𝙽𝚘 ❎"}

╞════𖠁[ 𝐔𝐒𝐄𝐑𝐒𝐓𝐀𝐓𝐒 ]𖠁════╡

╔═════✮❁•°♛°•❁✮═════╗
 𝙼𝚘𝚗𝚎𝚢: $${formatMoney(money)}
├‣ 𝚁𝚊𝚗𝚔: #${rank}/${allUser.length}
├‣ 𝙼𝚘𝚗𝚎𝚢 𝚁𝚊𝚗𝚔: #${moneyRank}/${allUser.length}
╰▻ 𝙱𝚊𝚋𝚢 𝚝𝚎𝚊𝚌𝚑: ${babyTeach || 0}
╚═════✮❁•°❀°•❁✮═════╝
`;

      await message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl),
      });

    } catch (err) {
      console.error("❌ spy2 command error:", err);
      message.reply("❌ An error occurred while processing the command. Please try again later.");
    }
  },
};

// Number format helper
function formatMoney(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
        }
