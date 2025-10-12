const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "brotherforever",
    aliases: ["bf", "broforever"],
    version: "1.1", // Updated version
    author: "SHIFAT", // credit change korle se akta gay 😂 
    countDown: 5,
    role: 0,
    shortDescription: "Brother Forever DP generator",
    longDescription: "Generate a Brother Forever style DP with two mentions",
    category: "fun",
    guide: "{p}brotherforever @mention1 @mention2"
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);
    // Check for exactly two mentions
    if (mention.length !== 2) {
      // If only one mention, use the sender as the first person
      if (mention.length === 1) {
        const one = event.senderID;
        const two = mention[0];
        try {
          const path = await createBrotherForeverDP(one, two);
          return message.reply({
            body: "♥︎╣[ 𝑩𝑹𝑶𝑻𝑯𝑬𝑹 𝑭𝑶𝑹𝑬𝑽𝑬𝑹 ]╠♥︎ ",
            attachment: fs.createReadStream(path)
          });
        } catch (error) {
          console.error("Error creating DP:", error);
          return message.reply("An error occurred while creating the image. Please try again.");
        }
      }
      return message.reply(" ･_･ ছবিতে রাখার জন্য দুইজনকে মেনশন করুন ");
    }

    const one = mention[0];
    const two = mention[1];
    try {
      const path = await createBrotherForeverDP(one, two);
      message.reply({
        body: "♥︎╣[ 𝑩𝑹𝑶𝑻𝑯𝑬𝑹 𝑭𝑶𝑹𝑬𝑽𝑬𝑹 ]╠♥︎",
        attachment: fs.createReadStream(path)
      });
    } catch (error) {
      console.error("Error creating DP:", error);
      message.reply("ছবিটি তৈরি করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  }
};

async function createBrotherForeverDP(one, two) {
  try {
    // Background image from the template
    const bg = await jimp.read("https://i.imgur.com/tqIopCK.jpeg");

    // First profile picture
    const avOneUrl = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avOne = await jimp.read(avOneUrl);
    avOne.circle();

    // Second profile picture
    const avTwoUrl = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avTwo = await jimp.read(avTwoUrl);
    avTwo.circle();

    // Resize background and composite the profile pictures with corrected size and position
    bg.resize(1365, 768)
      // Corrected size and position for the left profile picture
      .composite(avOne.resize(356, 355), 170, 207)
      // Corrected size and position for the right profile picture
      .composite(avTwo.resize(355, 354), 807, 200);

    const output = "brotherforever.png";
    await bg.writeAsync(output);
    return output;
  } catch (error) {
    // This will catch errors if a user's profile picture is unavailable
    console.error("Jimp processing error:", error);
    throw new Error("Could not process one of the profile pictures.");
  }
            }
