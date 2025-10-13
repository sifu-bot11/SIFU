const axios = require("axios");

// Command configuration object
module.exports.config = {
    name: "bkash",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "SHIFAT",
    description: "Create a fake bKash transaction screenshot.",
    usePrefix: true,
    commandCategory: "fun",
    usages: "<number> - <transaction ID> - <amount>",
    cooldowns: 10,
};

// Main function to be executed when the command is called
// FIX: Changed "run" to "onStart"
module.exports.onStart = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const input = args.join(" ");

    // Check if the input format is correct
    if (!input.includes("-") || input.split("-").length < 3) {
        const usage = `❌ | ভুল ফরম্যাট!\n\nসঠিক ব্যবহার: ${global.config.PREFIX}${this.config.name} <নাম্বার> - <ট্রানজেকশন আইডি> - <টাকা>\n\nউদাহরণ: ${global.config.PREFIX}${this.config.name} 01700000000 - TXN12345 - 1000`;
        return api.sendMessage(usage, threadID, messageID);
    }

    // Split the input into three parts and remove any extra spaces
    const [number, transaction, amount] = input.split("-").map(item => item.trim());

    // Validate that all parts have content
    if (!number || !transaction || !amount) {
        return api.sendMessage("❌ | অনুগ্রহ করে নাম্বার, ট্রানজেকশন আইডি এবং টাকার পরিমাণ দিন।", threadID, messageID);
    }
    
    // Validate that the amount is a number
    if (isNaN(amount)) {
        return api.sendMessage(`❌ | টাকার পরিমাণ অবশ্যই একটি সংখ্যা হতে হবে।`, threadID, messageID);
    }

    // Inform the user that the image is being generated
    const processingMessage = await api.sendMessage("⏳ | আপনার ফেক বিকাশ স্ক্রিনশট তৈরি করা হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।", threadID);

    try {
        // API endpoint URL with encoded parameters
        const url = `https://masterapi.site/api/bkashf.php?number=${encodeURIComponent(number)}&transaction=${encodeURIComponent(transaction)}&amount=${encodeURIComponent(amount)}`;

        // Fetch the image from the API as a readable stream
        const response = await axios.get(url, { responseType: "stream" });

        // Prepare the message body and attachment
        const message = {
            body: `✅ | আপনার ফেক বিকাশ স্ক্রিনশট তৈরি!\n\n📱 মোবাইল নাম্বার: ${number}\n🧾 ট্রানজেকশন আইডি: ${transaction}\n💵 পরিমাণ: ৳${amount}`,
            attachment: response.data,
        };

        // Send the final message with the image
        await api.sendMessage(message, threadID, messageID);

    } catch (error) {
        // Log the error to the console for debugging
        console.error("bKash Fake Screenshot API Error:", error);
        api.sendMessage("❌ | একটি সমস্যা হয়েছে। API কাজ করছে না অথবা আপনার ইনপুট ভুল।", threadID, messageID);
    } finally {
        // Unsend the "processing" message
        if (processingMessage && processingMessage.messageID) {
            api.unsendMessage(processingMessage.messageID).catch(err => console.error("Failed to unsend message:", err));
        }
    }
};