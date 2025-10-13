const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "tord",
    version: "1.1",
    author: "SHIFAT",
    countDown: 5,
    role: 0,
    shortDescription: "Play Truth or Dare game.",
    longDescription: "This command enables users to play Truth or Dare. They can choose 'truth' or 'dare' and get a random question or challenge.",
    category: "Game",
    guide: {
      en: "Use '{pn} truth' for a truth question or '{pn} dare' for a dare challenge."
    }
  },

  onStart: async function ({ api, args, message }) {

    const [arg1] = args;

    if (!arg1) {
      message.reply("Please specify 'truth' or 'dare' to play the game.");
      return;
    }

    // Helper function to safely read JSON or return default
    function readJSONSafe(fileName, defaultData) {
      const filePath = path.join(__dirname, 'assist_json', fileName);
      try {
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } else {
          return defaultData;
        }
      } catch (err) {
        return defaultData;
      }
    }

    const defaultTruths = [
      "What is your biggest fear?",
      "Who is your secret crush?",
      "Have you ever lied to your best friend?"
    ];

    const defaultDares = [
      "Do 20 push-ups.",
      "Sing a song loudly.",
      "Text your crush 'I like you'."
    ];

    if (arg1.toLowerCase() === 'truth') {
      const truthQuestions = readJSONSafe('TRUTHQN.json', defaultTruths);
      const randomQuestion = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
      message.reply(`📝 Truth: ${randomQuestion}`);
    } else if (arg1.toLowerCase() === 'dare') {
      const dareChallenges = readJSONSafe('DAREQN.json', defaultDares);
      const randomChallenge = dareChallenges[Math.floor(Math.random() * dareChallenges.length)];
      message.reply(`💪 Dare: ${randomChallenge}`);
    } else {
      message.reply("Invalid input. Use '/T&D truth' or '/T&D dare'.");
    }
  }
};