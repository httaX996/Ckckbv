const { cmd } = require("../command");
const scraper = require("../lib/scraperd");
const axios = require("axios");
const { fetchJson, getBuffer } = require("../lib/functions");
const yts = require("yt-search");
const cheerio = require("cheerio");

/* ─── Instagram Video Downloader ─── */
cmd({
  pattern: "ckig",
  desc: "Download Instagram videos.",
  category: "download",
  react: '📩',
  filename: __filename
}, async (client, msg, m, {
  args, reply
}) => {
  try {
    if (!args[0]) return reply("⚠️ Please provide a valid Instagram link.");

    await m.react('📥');
    let response;

    try {
      response = await igdl(args[0]);
    } catch (error) {
      return reply("❌ Error obtaining data.");
    }

    const videos = response.data;
    if (!videos || videos.length === 0) {
      return reply("⚠️ No results found.");
    }

    let video = videos.find(v => v.resolution === "720p (HD)") || videos.find(v => v.resolution === "360p (SD)");
    if (!video) return reply("⚠️ No downloadable video found.");

    await m.react('⚡');
    try {
      await client.sendMessage(m.chat, {
        video: { url: video.url },
        caption: "◆─〈 𝐐𝐔𝐄𝐄𝐍 𝐇𝐄𝐒𝐇𝐈 𝐌𝐃 𝐕2 〉─◆",
        fileName: "ig.mp4",
        mimetype: "video/mp4"
      }, { quoted: m });
    } catch (error) {
      await m.react('❌');
      return reply("❌ Error downloading video.");
    }
  } catch (error) {
    console.error(error);
    reply(String(error));
  }
});

/* ─── Direct Link Uploader ─── */
cmd({
  pattern: 'ckdl',
  alias: ["dlurl"],
  desc: "Direct link uploader",
  category: "download",
  use: ".dl <link>",
  react: '📥',
  filename: __filename
}, async (client, msg, m, {
  args, q, reply
}) => {
  try {
    if (!q) return reply("❗ Please provide a link!");

    const isValidUrl = (url) => {
      try { new URL(url); return true; }
      catch { return false; }
    };

    if (!isValidUrl(q)) return reply("❌ Invalid URL format! Please check the link.");

    const response = await axios.get(q, { responseType: "arraybuffer", timeout: 15000 });
    const mime = require("mime-types");
    const fileType = response.headers["content-type"] || "application/octet-stream";
    const fileExt = mime.extension(fileType) || "unknown";
    const fileSize = response.headers["content-length"] || 0;

    if (fileSize > 8589934592) return reply("❗ File is too large to upload (limit: 10MB).");

    const fileName = `File.${fileExt}`;

    await client.sendMessage(msg.from, {
      document: { url: q },
      caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*",
      mimetype: fileType,
      fileName
    }, { quoted: msg });
  } catch (error) {
    console.error(error);
    reply("❌ Error: " + error.message);
  }
});

/* ─── APK Downloader ─── */
cmd({
  pattern: "ckapk",
  desc: "Download APK from Aptoide",
  use: ".apk <app_name>",
  react: '📥',
  category: "download",
  filename: __filename
}, async (client, msg, m, {
  q, reply
}) => {
  const appName = q.trim();
  if (!appName) return reply("Please provide an app name");

  reply(`_Downloading ${appName}_`);
  try {
    const result = await scraper.aptoideDl(appName);
    const apkBuffer = await getBuffer(result.link);

    if (!apkBuffer || !result.appname) {
      return await client.sendMessage(msg.from, {
        react: { text: '❌', key: msg.key }
      });
    }

    await client.sendMessage(msg.from, {
      document: apkBuffer,
      caption: "*𝐐𝐔𝐄𝐄𝐍 𝐇𝐄𝐒𝐇𝐈 𝐌𝐃 𝐕2 💚*",
      mimetype: "application/vnd.android.package-archive",
      filename: `${result.appname}.apk`
    }, { quoted: msg });

    await client.sendMessage(msg.from, {
      react: { text: '✅', key: msg.key }
    });
    reply("*_Download Success_*");
  } catch (error) {
    console.error(error);
    await client.sendMessage(msg.from, {
      react: { text: '❌', key: msg.key }
    });
    reply("Error: " + error.message);
  }
});

/* ─── YouTube Song Downloader ─── */
cmd({
  pattern: "cksong",
  desc: "Download audio from YouTube by keywords",
  category: "music",
  use: ".song <song name>",
  react: '🎶',
  filename: __filename
}, async (client, msg, m, {
  args, reply
}) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("*Please provide a song name or keywords.*");

    reply("*🎧 Searching for the song...*");
    const searchResult = await yts(query);
    if (!searchResult.videos || searchResult.videos.length === 0) {
      return reply(`❌ No results found for "${query}".`);
    }

    const video = searchResult.videos[0];
    const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${video.url}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success) return reply(`❌ Failed to fetch audio for "${query}".`);

    const { title, download_url } = response.data.result;
    await client.sendMessage(msg.from, {
      audio: { url: download_url },
      mimetype: "audio/mp4",
      ptt: false
    }, { quoted: msg });

    reply(`✅ *${title}* has been downloaded successfully!`);
  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while processing your request.");
  }
});

/* ─── YouTube Video Downloader ─── */
cmd({
  pattern: "ckvideo",
  desc: "Download video from YouTube by keywords",
  category: "video",
  use: ".video <video name>",
  react: '🎥',
  filename: __filename
}, async (client, msg, m, {
  args, reply
}) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("*Please provide a video name or keywords.*");

    reply("*🎬 Searching for the video...*");
    const searchResult = await yts(query);
    if (!searchResult.videos || searchResult.videos.length === 0) {
      return reply(`❌ No results found for "${query}".`);
    }

    const video = searchResult.videos[0];
    const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp4?url=${video.url}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success) return reply(`❌ Failed to fetch video for "${query}".`);

    const { title, download_url } = response.data.result;
    await client.sendMessage(msg.from, {
      video: { url: download_url },
      mimetype: "video/mp4",
      caption: `✅ *${title}* has been downloaded successfully!`
    }, { quoted: msg });
  } catch (error) {
    console.error(error);
    reply("❌ An error occurred while processing your request.");
  }
});

/* ─── Random Wallpaper Downloader ─── */
cmd({
  pattern: "ckwallpaper",
  alias: ["wallpaperdownload"],
  desc: "Download a random wallpaper",
  category: "download",
  use: ".wallpaper",
  react: "🖼️",
  filename: __filename
}, async (client, msg, m, {
  reply
}) => {
  try {
    const { data: html } = await axios.get("https://unsplash.com/s/photos/wallpaper");
    const $ = cheerio.load(html);
    const wallpapers = [];

    $("figure img").each((i, el) => {
      const src = $(el).attr("src");
      if (src) wallpapers.push(src);
    });

    if (wallpapers.length === 0) return reply("No wallpapers found!");

    const randomImage = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    await client.sendMessage(msg.from, {
      image: { url: randomImage },
      caption: "Here is your wallpaper!"
    }, { quoted: msg });
  } catch (error) {
    console.error(error);
    reply("An error occurred while downloading the wallpaper. Please try again later.");
  }
});