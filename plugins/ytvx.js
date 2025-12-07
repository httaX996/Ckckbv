const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
  pattern: "ytvx",
  alias: ["ytvideo", "ytmp4"],
  react: "🎬",
  desc: "Download YouTube video with quality selection",
  category: "download",
  use: ".video <name or url>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("❌ Please provide video name or url");

    // 🔍 Search video
    const search = await fetchJson(
      `https://tharuzz-ofc-apis.vercel.app/api/search/ytsearch?query=${encodeURIComponent(q)}`
    );

    if (!search.result || !search.result[0]) {
      return reply("❌ No results found");
    }

    const video = search.result[0];
    const { title, url, thumbnail, timestamp, views } = video;

    // 📋 Send quality menu
    const menu =
      `🎬 *VIDEO DOWNLOADER*\n\n` +
      `📌 Title: ${title}\n` +
      `⏱ Duration: ${timestamp}\n` +
      `👀 Views: ${views}\n\n` +
      `Reply with quality number:\n\n` +
      `1 - 144p\n` +
      `2 - 360p\n` +
      `3 - 720p\n\n` +
      `Reply to this message with the number`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: menu
    }, { quoted: mek });

    // ✅ One-time listener (memory leak නැතිව)
    const handler = async (update) => {
      try {
        const msg = update.messages?.[0];
        if (!msg?.message?.extendedTextMessage) return;

        const ctx = msg.message.extendedTextMessage.contextInfo;
        if (!ctx || ctx.stanzaId !== sentMsg.key.id) return;

        const choice = msg.message.extendedTextMessage.text.trim();

        let quality;
        if (choice === "1") quality = "144";
        else if (choice === "2") quality = "360";
        else if (choice === "3") quality = "720";
        else {
          await reply("❌ Invalid option! Reply 1 / 2 / 3");
          return;
        }

        await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

        // 🎥 Get download url
        const videoApi = await fetchJson(
          `https://tharuzz-ofc-api-v3.vercel.app/api/ytdl/yt?url=${encodeURIComponent(url)}&format=${quality}`
        );

        const dl = videoApi.result?.download;
        if (!dl) return reply("❌ Download link not found");

        // 📤 Send video
        await conn.sendMessage(from, {
          video: { url: dl },
          caption: `🎬 ${title}\n📺 Quality: ${quality}p`
        }, { quoted: msg });

        conn.ev.off("messages.upsert", handler);

      } catch (err) {
        console.log(err);
        await reply("❌ Error: " + err.message);
        conn.ev.off("messages.upsert", handler);
      }
    };

    conn.ev.on("messages.upsert", handler);

    // ⏳ Auto remove listener after 1 minute
    setTimeout(() => {
      conn.ev.off("messages.upsert", handler);
    }, 60000);

  } catch (e) {
    console.log(e);
    return reply("❌ Error: " + e.message);
  }
});
