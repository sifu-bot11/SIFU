const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "kakasi",
    aliases: ["sifu"],
    version: "1.0",
    author: "SHIFAT",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "",
      en: "add user in thread"
    },
    longDescription: {
      vi: "",
      en: "add any user to bot owner group chat"
    },
    category: "GroupMsg",
    guide: {
      en: "{pn} uchiha"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = "1969428260490804";
    try {
      // Check if the user is already in the group chat
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo.participantIDs;

      if (participants.includes(event.senderID)) {
        // English message for already-in-group
        api.sendMessage(
          "🍀 You're already in the group. If you can't see it, please check your Message Requests or Spam folder. 🍀",
          event.threadID
        );

        // Set ⚠ reaction for already added user
        api.setMessageReaction("⚠", event.messageID, "💌", api);
      } else {
        // If not, add the user to the group chat
        await api.addUserToGroup(event.senderID, threadID);

        // English message for successful add
        api.sendMessage(
          "🎊 You've been added to the group 『🍁  𝐊𝐀𝐊𝐀𝐒𝐇𝐈  🍁』 — Welcome! ✨",
          event.threadID
        );

        // Set 🍀 reaction for successfully added user
        api.setMessageReaction("🍀", event.messageID, "💌", api);
      }
    } catch (error) {
      // English message for failure
      api.sendMessage(
        "🙀 Failed to add you to the group chat. Please try again later or contact an admin.",
        event.threadID
      );

      // Set 💀 reaction for failed adding user
      api.setMessageReaction("💀", event.messageID, "👍", api);
    }
  }
}
