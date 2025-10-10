// alldl.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

const settingsPath = path.join(cacheDir, "alldl_settings.json");
let settings = {
  isEnabled: true,
  ownerIDs: ["100078859776449"], // <-- তোমার owner ID এখানে রাখো
  platformLimitMB: 25,           // Messenger/File limit (MB). পরিবর্তন করতে পারো
  autoUploadLarge: true,         // বড় ফাইল হলে auto-upload to transfer.sh
  cookieFile: ""                 // optional path to cookies.txt if needed for yt-dlp
};

try {
  if (fs.existsSync(settingsPath)) {
    const s = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    settings = Object.assign(settings, s);
  } else {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
  }
} catch (e) {
  console.error("[alldl] settings load error:", e.message);
}

function saveSettings() {
  try { fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8"); }
  catch (e) { console.error("[alldl] settings save error:", e.message); }
}

const PLATFORM_FILE_LIMIT_BYTES = settings.platformLimitMB * 1024 * 1024;
const LOCAL_YTDLP = path.join(cacheDir, "yt-dlp");
const YTDLP_RELEASE_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

// ensure yt-dlp binary exists (download if needed)
async function ensureYtDlpBinary() {
  try {
    if (fs.existsSync(LOCAL_YTDLP)) {
      try { fs.chmodSync(LOCAL_YTDLP, 0o755); } catch {}
      return LOCAL_YTDLP;
    }

    const writer = fs.createWriteStream(LOCAL_YTDLP, { mode: 0o755 });
    const res = await axios({
      url: YTDLP_RELEASE_URL,
      method: "GET",
      responseType: "stream",
      timeout: 30000
    });

    await new Promise((resolve, reject) => {
      res.data.pipe(writer);
      let error = null;
      writer.on("error", err => { error = err; writer.close(); reject(err); });
      writer.on("close", () => { if (!error) resolve(); });
    });

    try { fs.chmodSync(LOCAL_YTDLP, 0o755); } catch {}
    return LOCAL_YTDLP;
  } catch (err) {
    console.warn("[alldl] Could not download yt-dlp binary:", err.message);
    try { if (fs.existsSync(LOCAL_YTDLP)) fs.unlinkSync(LOCAL_YTDLP); } catch {}
    return null;
  }
}

// run yt-dlp to download; returns downloaded file path or null
function runYtDlp(binaryPath, url, outDir, cookieFile) {
  try {
    const outTemplate = path.join(outDir, 'ydl_%(id)s.%(ext)s');
    const args = [
      "-f", "bestvideo+bestaudio/best",
      "-o", outTemplate,
      "--no-playlist",
      "--restrict-filenames",
      "--merge-output-format", "mp4",
      url
    ];
    if (cookieFile && fs.existsSync(cookieFile)) {
      args.unshift("--cookies", cookieFile);
    }

    const r = spawnSync(binaryPath, args, { encoding: "utf-8", timeout: 240000 });
    if (r.error) {
      console.error("[alldl] yt-dlp spawn error:", r.error.message);
      return null;
    }

    // find newest file in outDir
    const files = fs.readdirSync(outDir)
      .map(f => ({ f, t: fs.statSync(path.join(outDir, f)).mtimeMs }))
      .sort((a,b) => b.t - a.t);

    if (!files.length) return null;
    return path.join(outDir, files[0].f);
  } catch (e) {
    console.error("[alldl] runYtDlp error:", e.message);
    return null;
  }
}

// try public APIs to get direct media link or metadata
async function tryApis(url) {
  const apis = [
    `https://api.akuari.my.id/downloader/all?link=${encodeURIComponent(url)}`,
    `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`,
    `https://api.sssapi.net/downloader?url=${encodeURIComponent(url)}`
  ];

  for (const apiUrl of apis) {
    try {
      const res = await axios.get(apiUrl, { timeout: 10000 });
      const data = res.data;
      if (!data) continue;
      if (data?.url) return { url: data.url, title: data.title || null };
      if (data?.video?.noWatermark) return { url: data.video.noWatermark, title: data.title || null };
      if (data?.links?.hd || data?.links?.sd) return { url: data.links.hd || data.links.sd, title: data.title || null };
      if (data?.result?.url) return { url: data.result.url, title: data.result.description || null };
      if (Array.isArray(data)) {
        const entry = data.find(x => x?.url || x?.video);
        if (entry) {
          if (entry.url) return { url: entry.url, title: entry.title || null };
          if (entry.video?.noWatermark) return { url: entry.video.noWatermark, title: entry.title || null };
        }
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// upload file to transfer.sh and return url (or null)
async function uploadToTransfer(filePath) {
  try {
    const filename = path.basename(filePath);
    const stat = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);
    const url = `https://transfer.sh/${encodeURIComponent(filename)}`;
    const res = await axios.put(url, stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": stat.size
      },
      maxBodyLength: Infinity,
      timeout: 120000
    });
    if (res && res.data) return res.data.trim();
    return null;
  } catch (e) {
    console.error("[alldl] transfer.sh upload failed:", e.message);
    return null;
  }
}

// optionally follow redirects to final url
async function followRedirect(url) {
  try {
    const res = await axios.get(url, { maxRedirects: 5, timeout: 8000, validateStatus: s => s < 400 });
    if (res.request && res.request.res && res.request.res.responseUrl) return res.request.res.responseUrl;
    return url;
  } catch (e) {
    return url;
  }
}

module.exports = {
  config: {
    name: "alldl",
    version: "4.0",
    author: "SHIFAT + GPT",
    role: 0,
    shortDescription: "Robust auto downloader (APIs + yt-dlp + transfer.sh)",
    longDescription: "Tries public APIs, falls back to yt-dlp (auto-downloads binary), auto-uploads big files to transfer.sh.",
    category: "media",
    guide: "{p}alldl on/off/status | send link to auto-download"
  },

  onStart: async function ({ message, args, event }) {
    if (["on", "off", "status", "setlimit", "autoupload"].includes(args[0])) {
      if (!settings.ownerIDs.includes(event.senderID)) return message.reply("⚠️ | Only the bot owner can toggle/manage this feature.");

      if (args[0] === "on") { settings.isEnabled = true; saveSettings(); return message.reply("✅ | Auto downloader ENABLED."); }
      if (args[0] === "off") { settings.isEnabled = false; saveSettings(); return message.reply("❌ | Auto downloader DISABLED."); }
      if (args[0] === "status") {
        return message.reply(`🔄 | Status: ${settings.isEnabled ? "ENABLED ✅" : "DISABLED ❌"}\nLimit: ${settings.platformLimitMB}MB\nAutoUploadLarge: ${settings.autoUploadLarge}\nCookieFile: ${settings.cookieFile || "none"}`);
      }
      if (args[0] === "setlimit") {
        const n = parseInt(args[1]);
        if (!n || n <= 0) return message.reply("Usage: alldl setlimit <MB>");
        settings.platformLimitMB = n; saveSettings();
        return message.reply(`✅ | Platform file limit set to ${n} MB`);
      }
      if (args[0] === "autoupload") {
        const v = args[1] === "on" ? true : (args[1] === "off" ? false : null);
        if (v === null) return message.reply("Usage: alldl autoupload on|off");
        settings.autoUploadLarge = v; saveSettings();
        return message.reply(`✅ | AutoUploadLarge set to ${v}`);
      }
    }

    message.reply("Use 'alldl on/off/status' or send a supported video link.");
  },

  onChat: async function ({ api, event }) {
    try {
      if (!settings.isEnabled) return;
      const text = event.body || (event.messageReply && event.messageReply.body);
      if (!text) return;

      const match = text.match(/(?:^|\s)(https?:\/\/[^\s]+)/i);
      if (!match) return;
      let url = match[1].trim();

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // follow possible redirect
      url = await followRedirect(url);

      // 1) try public APIs
      const apiResult = await tryApis(url);
      if (apiResult && apiResult.url) {
        try {
          const tmpPath = path.join(cacheDir, `media_api_${Date.now()}.mp4`);
          const r = await axios.get(apiResult.url, { responseType: "arraybuffer", timeout: 30000, maxContentLength: Infinity });
          fs.writeFileSync(tmpPath, Buffer.from(r.data, "binary"));
          const stats = fs.statSync(tmpPath);
          if (stats.size <= PLATFORM_FILE_LIMIT_BYTES) {
            await new Promise(res => api.sendMessage({ body: `✅ Downloaded!\n📄 Title: ${apiResult.title || "Downloaded Video"}`, attachment: fs.createReadStream(tmpPath) }, event.threadID, () => { try { fs.unlinkSync(tmpPath); } catch {} res(); }, event.messageID));
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            return;
          } else {
            // file too big
            if (settings.autoUploadLarge) {
              const upUrl = await uploadToTransfer(tmpPath);
              try { fs.unlinkSync(tmpPath); } catch {}
              if (upUrl) {
                api.setMessageReaction("✅", event.messageID, () => {}, true);
                return api.sendMessage(`✅ File too big but uploaded: ${upUrl}`, event.threadID, event.messageID);
              } else {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return api.sendMessage(`⚠️ File is ${Math.round(stats.size/1024/1024)}MB — exceeds ${settings.platformLimitMB}MB and upload failed.`, event.threadID, event.messageID);
              }
            } else {
              try { fs.unlinkSync(tmpPath); } catch {}
              api.setMessageReaction("❌", event.messageID, () => {}, true);
              return api.sendMessage(`⚠️ File is ${Math.round(stats.size/1024/1024)}MB — exceeds ${settings.platformLimitMB}MB. Enable auto-upload or increase limit.`, event.threadID, event.messageID);
            }
          }
        } catch (e) {
          console.warn("[alldl] API direct download failed:", e.message);
          // fallthrough to yt-dlp
        }
      }

      // 2) yt-dlp path (ensure or download binary)
      const binaryPath = await ensureYtDlpBinary();
      if (!binaryPath) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("⚠️ | Could not get a downloadable link from APIs and yt-dlp binary could not be retrieved. Ensure server has outgoing access or install yt-dlp manually.", event.threadID, event.messageID);
      }

      // run yt-dlp
      const cookieFile = settings.cookieFile && fs.existsSync(settings.cookieFile) ? settings.cookieFile : null;
      const outFile = runYtDlp(binaryPath, url, cacheDir, cookieFile);
      if (!outFile) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("⚠️ | yt-dlp failed to download the video. It might be private, blocked, or require login/cookies.", event.threadID, event.messageID);
      }

      const stats = fs.statSync(outFile);
      if (stats.size <= PLATFORM_FILE_LIMIT_BYTES) {
        api.sendMessage({ body: `✅ Downloaded via yt-dlp\n📄 File: ${path.basename(outFile)}`, attachment: fs.createReadStream(outFile) }, event.threadID, () => {
          try { fs.unlinkSync(outFile); } catch (e) {}
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        }, event.messageID);
        return;
      } else {
        // too big -> upload if enabled
        if (settings.autoUploadLarge) {
          const upUrl = await uploadToTransfer(outFile);
          try { fs.unlinkSync(outFile); } catch (e) {}
          if (upUrl) {
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            return api.sendMessage(`✅ Downloaded & uploaded: ${upUrl}`, event.threadID, event.messageID);
          } else {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return api.sendMessage(`⚠️ Downloaded but upload failed. File size: ${Math.round(stats.size/1024/1024)}MB`, event.threadID, event.messageID);
          }
        } else {
          try { fs.unlinkSync(outFile); } catch (e) {}
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return api.sendMessage(`⚠️ Downloaded file is ${Math.round(stats.size/1024/1024)}MB which exceeds the platform limit (${settings.platformLimitMB}MB). Enable autoUploadLarge or increase limit.`, event.threadID, event.messageID);
        }
      }

    } catch (err) {
      console.error("[alldl] Unexpected error:", err);
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch {}
      api.sendMessage("❌ | An unexpected error occurred while processing the link.", event.threadID, event.messageID);
    }
  }
};
