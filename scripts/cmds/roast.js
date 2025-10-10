global.roast2Interval = null;

module.exports = {
  config: {
    name: "roast",
    aliases: ["r", "chod"],
    version: "1.0",
    author: "BaYjid",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "FUCK FREE",
    },
    longDescription: {
      en: "Roasts the mentioned user line by line CarryMinati style, with emojis!",
    },
    category: "Fun",
    guide: {
      en: "{pn} @mention",
    },
  },

  onStart: async function ({ message, api, event }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length === 0)
      return message.reply("❌ Please mention someone to roast!");

    const targetID = mentions[0];
    const targetName = event.mentions[targetID];
    const tagText = `@${targetName}`;

    const roasts = [
      "Tera swag to second-hand lagta hai bhai, asli wale to kapdon ke saath attitude bhi dhote hain! 😎",
      "Tu itna cringe hai, agar cringe ka test hota toh tu gold medal le aata! 🏅",
      "Tu real life ka lag hai — ghiste reh jaa, kaam ka kuch nahi! 🐌",
      "Teri IQ se toh room temperature bhi zyada hot hota hai! 🔥",
      "Tu itna bekaar hai, Google bhi tera naam search karne se darte hai! 🧐",
      "Tere memes pe bas silence bajta hai... aur log bhi! 😶",
      "Tu dosti nahi, stress package hai — free home delivery wala! 📦",
      "Tu reel pe likes dhoondhta hai, real life mein koi yaad bhi nahi karta! 🕳️",
      "Tu selfie le raha hota hai, camera ‘nahiiii’ chillata hai! 📸",
      "Teri soch 144p mein hai, aur overconfidence 4K mein! 📉",
      "Tu acting kare, Oscar wapas mang le! 🎭",
      "Teri crush tujhe bhai kehkar world tour pe chali gayi! ✈️",
      "Tera dimaag calculator ka AC button hai — koi use hi nahi karta! 🧠",
      "Tu roast-worthy nahi, tu already burned lagta hai! 🔥",
      "Tu content nahi, content ka blooper reel hai! 🎬",
      "Tere liye Wi-Fi bhi slow ho jaata hai — shayad data bhi ignore karta hai! 📡",
      "Tu joke kare, log sote hai — stand-up comedy ka downfall tu hai! 💤",
      "Tu real life ka pop-up hai — annoying and unwanted! 🚫",
      "Tu video ka buffering hai — bas atka rehta hai! ⏳",
      "Tu dosti mein loyalty nahi, battery saver mode pe chalta hai! 🔋",
      "Tere jaise doston ke liye airplane mode best hai! ✈️",
      "Tu itna boring hai, mute button bhi tujhe ignore karta hai! 🔇",
      "Tere liye even autocorrect bolta hai — Bhai rehne de! 📝",
      "Tera logic itna weak hai, usse gym membership milni chahiye! 🏋️",
      "Tu itna average hai, even ‘meh’ bhi tujhe reject karta hai! 🙃",
      "Tera confidence bina processor ka phone hai — heat hi heat! 🌡️",
      "Tu bio mein ‘Attitude’ likhta hai, aur zindagi pending mein hai! ⌛",
      "Tera dimaag demo version mein atka hua hai! 💾",
      "Tu roast se dar nahi raha, tu toh roshni mein hi galat dikhta hai! 💡",
      "Tere jokes pe copyright ka case ho gaya, 'comedy ka insult' ke liye! ⚖️",
      "Tu real life ka glitch hai — sabko confuse karta hai! 🌀",
      "Tera vibe Bluetooth jaisa hai — connect kabhi hota hi nahi! 📶",
      "Tu itna lost hai, Google Maps bhi tujhe ‘404 Not Found’ bolta hai! 🗺️",
      "Tu smile karta hai, mirror crack ho jaata hai! 🪞",
      "Tu WhatsApp group ka silent member nahi — burden hai! 💀",
      "Teri thinking speed dial-up internet se bhi slow hai! 🐢",
      "Tera presence feel nahi hota — ghost bhi bolta hai ‘too invisible!’ 👻",
      "Tu calculator ka error hai — kaam ka kuch nahi! ❌",
      "Tera ego itna bada, brain ko space hi nahi milta! 🧱",
      "Tu kahani ka villain nahi, tu toh background noise hai! 🔊",
      "Tere profile pic dekh ke log ‘battery saver’ on kar lete hai! ⚡",
      " Tera Papa BaYjid.?!🦈",
    ];

    let index = 0;
    const threadID = event.threadID;

    function sendRoast() {
      if (index < roasts.length) {
        api.sendMessage(
          {
            body: `${tagText}, ${roasts[index]}`,
            mentions: [{ id: targetID, tag: tagText }],
          },
          threadID,
          (err, info) => {
            global.lastRoast2Msg = info?.messageID;
          },
        );
        index++;
      } else {
        clearInterval(global.roast2Interval);
        global.roast2Interval = null;
      }
    }

    global.roast2Interval = setInterval(sendRoast, 1800);

    message.reply(
      `🔥 Carry Style Roast started for ${targetName}!\nReply "stop" to any roast to cancel.`,
    );
  },

  onChat: async function ({ event, message }) {
    if (
      event.body?.toLowerCase() === "off" &&
      global.roast2Interval &&
      event.messageReply &&
      event.messageReply.messageID === global.lastRoast2Msg
    ) {
      clearInterval(global.roast2Interval);
      global.roast2Interval = null;
      return message.reply("🦈 Nikal chimkandi..🦈\nRoast cancelled!");
    }
  },
};
