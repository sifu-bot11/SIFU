const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "nude",
    aliases: ["nangai"],
    version: "1.1",
    author: "SHIFAT",
    countDown: 5,
    role: 2,
    shortDescription: "Send random adult pic safely",
    longDescription: "Sends a random adult image with caching and rate-limit",
    category: "danger",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const cacheDir = path.join(__dirname, "cache_nude");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const links = [
"https://i.imgur.com/Kof1KXr.jpg",
"https://i.imgur.com/xIgnYGo.jpg",
"https://i.imgur.com/4cFgFZq.jpg",
"https://i.imgur.com/d8k4a6G.jpg",
"https://i.imgur.com/eraz44H.jpg",
"https://i.imgur.com/uSHLM8y.jpg",
"https://i.imgur.com/2iy9KnD.jpg",
"https://i.imgur.com/Aew0gjm.jpg",
"https://i.imgur.com/sxXm5cI.jpg",
"https://i.imgur.com/2or8urJ.jpg",
"https://i.imgur.com/cslJLNt.jpg",
"https://i.imgur.com/zQztjGM.jpg",
"https://i.imgur.com/dyluWmm.jpg",
"https://i.imgur.com/CgAc5ux.jpg",
"https://i.imgur.com/Z5ph1wc.jpg",
"https://i.imgur.com/0bRLqAR.jpg",
"https://i.imgur.com/x68KtYI.jpg",
"https://i.imgur.com/cAich41.jpg",
"https://i.imgur.com/BMcYATY.jpg",
"https://i.imgur.com/E9PYK7J.jpg",
"https://i.imgur.com/1oaM7ai.jpg",
"https://i.imgur.com/Urx9Ijl.jpg",
"https://i.imgur.com/QYGOZuK.jpg", 
"https://i.imgur.com/T5BPkRG.jpg",
"https://i.imgur.com/69MT3Wg.jpg",
"https://i.imgur.com/z6EtvVm.jpg",
"https://i.imgur.com/hf3KluZ.jpg",
"https://i.imgur.com/9XxaYI3.jpg",
"https://i.imgur.com/rCSoCaA.jpg",
"https://i.imgur.com/6olWIAr.jpg",
"https://i.imgur.com/AcKfCpt.jpg",
"https://i.imgur.com/OA6wMjp.jpg",
"https://i.imgur.com/WBUspj9.jpg",
"https://i.imgur.com/GBzR0aY.jpg",
"https://i.imgur.com/EefsUX3.jpg",
"https://i.imgur.com/kWqwF1K.jpg",
"https://i.imgur.com/tUee6NZ.jpg",
"https://i.imgur.com/NJSUN9k.jpg",
"https://i.imgur.com/GxPSGo9.jpg",
"https://i.imgur.com/junGPIa.jpg",
"https://i.imgur.com/fj0WV5S.jpg",
"https://i.imgur.com/trR1T6P.jpg",
"https://i.imgur.com/5GPy7MZ.jpg",
"https://i.imgur.com/kPpcoFe.jpg",
"https://i.imgur.com/DibHjLg.jpg",
"https://i.imgur.com/lzY1HP3.jpg",
"https://i.imgur.com/z7oHPeD.jpg",
"https://i.imgur.com/2kW0UrZ.jpg",
"https://i.imgur.com/2TJXTM8.jpg",
"https://i.imgur.com/hHkxDMt.jpg",
"https://i.imgur.com/H7vs8c6.jpg",
"https://i.imgur.com/jVSz5tX.jpg",
"https://i.imgur.com/vF32mr2.jpg",
"https://i.imgur.com/BoJDDpm.jpg",
"https://i.imgur.com/GbAkVR3.jpg",
"https://i.imgur.com/aMw2mEz.jpg",
"https://i.imgur.com/egPMyvA.jpg",
"https://i.imgur.com/OPZDGUY.jpg",
"https://i.imgur.com/dxbjwmx.jpg",
"https://i.imgur.com/FNQQETm.jpg",
"https://i.imgur.com/hT7bbZr.jpg",
"https://i.imgur.com/0Eg5ZN4.jpg",
"https://i.imgur.com/Qle3LJi.jpg",
"https://i.imgur.com/pzJq8ay.jpg",
"https://i.imgur.com/NyqSI83.jpg",
"https://i.imgur.com/p41qMvY.jpg",
"https://i.imgur.com/p7EiSkE.jpg",
"https://i.imgur.com/JYUOHUd.jpg",
"https://i.imgur.com/cWxtrc2.jpg",
"https://i.imgur.com/2pSSMtl.jpg",
"https://i.imgur.com/DAnirH8.jpg",
"https://i.imgur.com/8XyrCGu.jpg",
"https://i.imgur.com/I7rtkwT.jpg",
"https://i.imgur.com/55EbaeY.jpg",
"https://i.imgur.com/xRJSAmJ.jpg",
"https://i.imgur.com/kXA2fSX.jpg",
"https://i.imgur.com/dy1YlJs.jpg",
"https://i.imgur.com/0LlpoXG.jpg",
"https://i.imgur.com/Kof1KXr.jpg",
"https://i.imgur.com/xIgnYGo.jpg",
"https://i.imgur.com/4cFgFZq.jpg",
"https://i.imgur.com/d8k4a6G.jpg",
"https://i.imgur.com/eraz44H.jpg",
"https://i.imgur.com/uSHLM8y.jpg",
"https://i.imgur.com/2iy9KnD.jpg",
"https://i.imgur.com/Aew0gjm.jpg",
"https://i.imgur.com/sxXm5cI.jpg",
"https://i.imgur.com/2or8urJ.jpg",
"https://i.imgur.com/cslJLNt.jpg",
"https://i.imgur.com/zQztjGM.jpg",
"https://i.imgur.com/dyluWmm.jpg",
"https://i.imgur.com/CgAc5ux.jpg",
"https://i.imgur.com/Z5ph1wc.jpg",
"https://i.imgur.com/0bRLqAR.jpg",
"https://i.imgur.com/x68KtYI.jpg",
"https://i.imgur.com/cAich41.jpg",
"https://i.imgur.com/BMcYATY.jpg",
"https://i.imgur.com/E9PYK7J.jpg",
"https://i.imgur.com/1oaM7ai.jpg",
"https://i.imgur.com/Urx9Ijl.jpg",
"https://i.imgur.com/QYGOZuK.jpg",
    ];

    // Random pick
    let imgURL = links[Math.floor(Math.random() * links.length)];
    const fileName = path.basename(imgURL);
    const filePath = path.join(cacheDir, fileName);

    try {
      // যদি cache এ থাকে, local থেকে পাঠাবে
      if (!fs.existsSync(filePath)) {
        // 1-3 sec random delay to avoid rate-limit
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
        const res = await axios.get(imgURL, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));
      }

      message.send({
        body: '「 Sugar Mumma Ahh💦🥵 」',
        attachment: fs.createReadStream(filePath)
      });
    } catch (err) {
      console.error("[nude] Error:", err.message);
      message.send("⚠️ | Could not fetch the image. Try again later.");
    }
  }
};
