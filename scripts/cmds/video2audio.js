const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

// Configure FFmpeg path if needed
ffmpeg.setFfmpegPath(ffmpeg.ffmpegPath || 'ffmpeg');

module.exports = {
  config: {
    name: "video2audio",
    aliases: ["v2a", "extractaudio", "videoaudio"],
    version: "1.0",
    author: "ZISAN",
    countDown: 10,
    role: 0,
    shortDescription: {
      vi: "Chuyển đổi video thành audio",
      en: "Convert video to audio"
    },
    longDescription: {
      vi: "Chuyển đổi video thành file audio (MP3) từ video được gửi hoặc link video",
      en: "Convert video to audio (MP3) from sent video or video link"
    },
    category: "media",
    guide: {
      vi: "{pn} [reply video] hoặc {pn} [video link]",
      en: "{pn} [reply video] or {pn} [video link]"
    }
  },

  langs: {
    vi: {
      noVideo: "❌ Vui lòng reply video hoặc gửi link video!",
      downloading: "⏳ Đang tải video...",
      converting: "🔄 Đang chuyển đổi video thành audio...",
      success: "✅ Chuyển đổi thành công!",
      error: "❌ Có lỗi xảy ra khi chuyển đổi video!",
      invalidUrl: "❌ Link video không hợp lệ!",
      tooLarge: "❌ Video quá lớn! Vui lòng gửi video nhỏ hơn 50MB.",
      processing: "⏳ Đang xử lý video..."
    },
    en: {
      noVideo: "❌ Please reply to a video or send a video link!",
      downloading: "⏳ Downloading video...",
      converting: "🔄 Converting video to audio...",
      success: "✅ Conversion successful!",
      error: "❌ An error occurred while converting video!",
      invalidUrl: "❌ Invalid video link!",
      tooLarge: "❌ Video too large! Please send a video smaller than 50MB.",
      processing: "⏳ Processing video..."
    }
  },

  onStart: async function ({ api, event, message, args, getLang }) {
    const { type, messageReply } = event;
    
    // Check if replying to a video
    if (messageReply && messageReply.attachments && messageReply.attachments[0] && messageReply.attachments[0].type === 'video') {
      return await this.processVideo(api, event, messageReply.attachments[0].url, getLang);
    }
    
    // Check if video link is provided
    if (args[0]) {
      const videoUrl = args[0];
      if (this.isValidVideoUrl(videoUrl)) {
        return await this.processVideo(api, event, videoUrl, getLang);
      } else {
        return message.reply(getLang("invalidUrl"));
      }
    }
    
    return message.reply(getLang("noVideo"));
  },

  onReply: async function ({ api, event, message, getLang }) {
    const { messageReply } = event;
    
    if (messageReply && messageReply.attachments && messageReply.attachments[0] && messageReply.attachments[0].type === 'video') {
      return await this.processVideo(api, event, messageReply.attachments[0].url, getLang);
    }
    
    return message.reply(getLang("noVideo"));
  },

  processVideo: async function (api, event, videoUrl, getLang) {
    const tempDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const inputPath = path.join(tempDir, `input_${timestamp}.mp4`);
    const outputPath = path.join(tempDir, `output_${timestamp}.mp3`);

    try {
      // Send processing message
      await api.sendMessage(getLang("processing"), event.threadID, event.messageID);

      // Download video
      await api.sendMessage(getLang("downloading"), event.threadID);
      const videoResponse = await axios.get(videoUrl, { 
        responseType: 'stream',
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024 // 50MB limit
      });

      // Check file size
      const contentLength = videoResponse.headers['content-length'];
      if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
        return api.sendMessage(getLang("tooLarge"), event.threadID, event.messageID);
      }

      // Save video to file
      const writer = fs.createWriteStream(inputPath);
      videoResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', () => {
          // Verify file was created and has content
          if (fs.existsSync(inputPath) && fs.statSync(inputPath).size > 0) {
            resolve();
          } else {
            reject(new Error('Failed to save video file'));
          }
        });
        writer.on('error', reject);
      });

      // Convert video to audio
      await api.sendMessage(getLang("converting"), event.threadID);

      await new Promise((resolve, reject) => {
        const conversionTimeout = setTimeout(() => {
          reject(new Error('Conversion timeout - video may be too long or corrupted'));
        }, 300000); // 5 minutes timeout

        ffmpeg(inputPath)
          .toFormat('mp3')
          .audioBitrate(128)
          .audioChannels(2)
          .audioFrequency(44100)
          .on('end', () => {
            clearTimeout(conversionTimeout);
            console.log('Conversion finished');
            // Verify output file was created and has content
            if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
              resolve();
            } else {
              reject(new Error('Failed to create audio file'));
            }
          })
          .on('error', (err) => {
            clearTimeout(conversionTimeout);
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .save(outputPath);
      });

      // Send the audio file
      await api.sendMessage({
        body: getLang("success"),
        attachment: fs.createReadStream(outputPath)
      }, event.threadID, event.messageID);

      // Clean up temporary files
      this.cleanup([inputPath, outputPath]);

    } catch (error) {
      console.error('Video to audio conversion error:', error);
      await api.sendMessage(getLang("error"), event.threadID, event.messageID);
      
      // Clean up on error
      this.cleanup([inputPath, outputPath]);
    }
  },

  isValidVideoUrl: function (url) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'];
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'tiktok.com', 'instagram.com'];
    
    // Check if URL contains video extensions
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check if URL is from known video hosts
    const isVideoHost = videoHosts.some(host => url.toLowerCase().includes(host));
    
    // Check if it's a direct video link (ends with video extension)
    const isDirectVideo = videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    
    return hasVideoExtension || isVideoHost || isDirectVideo;
  },

  cleanup: function (files) {
    files.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (error) {
          console.error('Error deleting file:', file, error);
        }
      }
    });
  }
};
