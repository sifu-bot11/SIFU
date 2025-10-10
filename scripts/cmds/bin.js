const fs = require("fs-extra");

module.exports = {
  config: {
    name: "join",
    aliases: ["joingroup", "allbox"],
    version: "3.1",
    author: "SHIFAT",
    countDown: 5,
    role: 2, // ✅ Only bot admins can use this command
    shortDescription: "Show bot groups & join one",
    longDescription: "List all group chats the bot is in and let you join any by reply.",
    category: "admin", // changed to admin category
    guide: "{p}join",
  },

  onStart: async function ({ api, event }) {
    try {
      const groupList = await api.getThreadList(20, null, ["INBOX"]); // show 20 recent groups
      const filteredList = groupList.filter(
        (g) => g.isGroup && g.threadName !== null
      );

      if (filteredList.length === 0)
        return api.sendMessage("❌ No group chats found.", event.threadID);

      let msg = "📋 𝗚𝗿𝗼𝘂𝗽 𝗟𝗶𝘀𝘁 𝗧𝗵𝗮𝘁 𝗕𝗼𝘁 𝗜𝘀 𝗜𝗻:\n━━━━━━━━━━━━━━━━━━━\n";

      filteredList.forEach((group, i) => {
        msg += `🔹 ${i + 1}. ${group.threadName}\n🆔 TID: ${group.threadID}\n👥 Members: ${group.participantIDs.length}\n━━━━━━━━━━━━━━━\n`;
      });

      msg += "\n💬 Reply with the group number you want to join.";

      const sent = await api.sendMessage(msg, event.threadID);
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        groupList: filteredList,
      });
    } catch (err) {
      console.error("Error fetching group list:", err);
      api.sendMessage("⚠️ Error while fetching group list.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    try {
      const { author, groupList } = Reply;

      if (event.senderID !== author)
        return api.sendMessage("❌ You can't use this reply.", event.threadID);

      const index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= groupList.length)
        return api.sendMessage("⚠️ Invalid number. Try again.", event.threadID);

      const group = groupList[index];
      const info = await api.getThreadInfo(group.threadID);

      if (info.participantIDs.includes(event.senderID))
        return api.sendMessage(
          `✅ You are already in "${group.threadName}".`,
          event.threadID
        );

      if (info.participantIDs.length >= 250)
        return api.sendMessage(
          `❌ Group "${group.threadName}" is full (250 members).`,
          event.threadID
        );

      await api.addUserToGroup(event.senderID, group.threadID);
      api.sendMessage(
        `🎉 You have been added to "${group.threadName}" successfully!`,
        event.threadID
      );
    } catch (err) {
      console.error("Error adding user to group:", err);
      api.sendMessage(
        "⚠️ Failed to join the selected group.\nMake sure the bot has permission.",
        event.threadID
      );
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  },
};
