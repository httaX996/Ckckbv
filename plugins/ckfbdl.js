const { cmd } = require("../command");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

// yt-dlp Video Downloader function
async function downloadFbVideo(url) {
  try {
    // yt-dlp command to fetch video information
    const { stdout, stderr } = await execPromise(`yt-dlp -j ${url}`);
    if (stderr) throw new Error(stderr);
    
    // Parse the JSON output of yt-dlp to extract video data
    const data = JSON.parse(stdout);
    
    return {
      title: data.title,
      thumbnail: data.thumbnail,
      sd: data.formats?.find(f => f.format_note === "144p")?.url, // SD quality
      hd: data.formats?.find(f => f.height === 720)?.url, // HD quality
      audio: data.formats?.find(f => f.acodec === "mp4a.40.2")?.url, // Audio (mp4a)
    };
  } catch (err) {
    console.log("Error fetching video:", err);
    throw new Error("Error downloading video.");
  }
}

// WhatsApp Bot Command Handler
cmd({
  pattern: "fb",
  alias: ["facebook"],
  react: "📥",
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, args, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return reply("🔗 *Please send a valid Facebook URL!*");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Fetch video data from yt-dlp
    const fbData = await downloadFbVideo(q);
    
    if (!fbData || !fbData.sd) {
      return reply("❌ Error fetching the video. Please try again.");
    }

    const caption = `📥 *Facebook Video Downloader* 🎬
🔖 *Title:* ${fbData.title}

1️⃣ SD Video
2️⃣ HD Video
3️⃣ Audio

👉 *Reply with 1 / 2 / 3 to download.*`;

    // Send video options
    const sentMsg = await conn.sendMessage(from, {
      image: { url: fbData.thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // Message listener to capture user's reply for download options
    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

        switch (receivedText) {
          case "1":
            // Send SD Video
            await conn.sendMessage(senderID, { video: { url: fbData.sd } }, { quoted: m });
            break;
          case "2":
            // Send HD Video
            await conn.sendMessage(senderID, { video: { url: fbData.hd } }, { quoted: m });
            break;
          case "3":
            // Send Audio (MP4A format)
            await conn.sendMessage(senderID, { audio: { url: fbData.audio }, mimetype: "audio/mp4" }, { quoted: m });
            break;
          default:
            reply("❌ Invalid option! Please reply with 1, 2, or 3.");
        }
      }
    });
    
  } catch (error) {
    console.error("Error:", error);
    reply("❌ Error fetching the video. Please try again.");
  }
});
