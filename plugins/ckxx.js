const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');




cmd({
  pattern: "xvid",
  alias: ["xvideos", "xporn","xvideo"],
  desc: "Search and download adult videos from XVideos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("❌ Please enter a keyword. Example: .porn mia khalifa");

    await conn.sendMessage(from, {
      react: { text: '🔍', key: m.key }
    });

    // Search for video by keyword
    const searchRes = await fetch(`https://apis-keith.vercel.app/search/searchxvideos?q=${encodeURIComponent(q)}`);
    const searchData = await searchRes.json();

    if (!searchData.status || !searchData.result || !searchData.result[0]) {
      return reply("❌ No videos found for that keyword.");
    }

    const videoUrl = searchData.result[0].url;

    // Download using Keith's API
    const response = await fetch(`https://apis-keith.vercel.app/download/porn?url=${encodeURIComponent(videoUrl)}`);
    const data = await response.json();

    if (!data.status || !data.result) {
      return reply("⚠️ Failed to retrieve video. Please try again.");
    }

    const { videoInfo, downloads } = data.result;
    const { title, thumbnail, duration } = videoInfo;

    const caption = `*🔞 CK XVIDEO DOWNLOADER 🔞*\n\n`
      + `*🔖TITLE :* ${title}\n`
      + `*⏰DURATION :* ${Math.floor(duration / 60)} min ${duration % 60} sec\n\n`
      + `📹 *Download Options:*\n\n`
      + `1 -  *Low Quality*\n`
      + `2 -  *High Quality*\n`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: caption
    }, { quoted: ck });

    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, {
          react: { text: '⬇️', key: receivedMsg.key }
        });

        switch (receivedText) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url: downloads.lowQuality },
              caption: "📥 *Downloaded in Low Quality*"
            }, { quoted: ck });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: downloads.highQuality },
              caption: "📥 *Downloaded in High Quality*"
            }, { quoted: ck });
            break;

          case "3":
            await conn.sendMessage(senderID, {
              audio: { url: downloads.lowQuality },
              mimetype: "audio/mpeg"
            }, { quoted: receivedMsg });
            break;

          case "4":
            await conn.sendMessage(senderID, {
              document: { url: downloads.lowQuality },
              mimetype: "audio/mpeg",
              fileName: "XVideos_Audio.mp3",
              caption: "📥 *Audio Downloaded as Document*"
            }, { quoted: receivedMsg });
            break;

          case "5":
            await conn.sendMessage(senderID, {
              audio: { url: downloads.lowQuality },
              mimetype: "audio/mp4",
              ptt: true
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1, 2, 3, 4, or 5.");
        }
      }
    });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});

const ck = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ ×͜×",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};
