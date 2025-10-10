module.exports = {
 config: {
	 name: "gf",
	 version: "1.0",
	 author: "BaYjid",
	 countDown: 5,
	 role: 0,
	 shortDescription: "no prefix",
	 longDescription: "no prefix",
	 category: "no prefix",
 },

 onStart: async function(){}, 
 onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "gf") {
 return message.reply({
 body: " 𝔾𝔽 𝕂𝕆 ℂℍ𝕆ℝ 𝔸𝕁𝔸 1𝕍1 𝕂𝔸ℝ 𝕄𝔼ℝ𝔼 𝕊𝔸𝔸𝕋 😎",
 attachment: await global.utils.getStreamFromURL("https://i.imgur.com/HHq9Qi6.mp4")
 });
 }
 }
}
