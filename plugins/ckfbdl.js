const { cmd } = require("../command");
const { fetchJson } = require('../lib/rfunctions');

cmd({
  pattern: "fb",
  alias: ["facebook"],
  react: "📥",
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return reply("🔗 *Please send a valid Facebook URL!*");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key }});

    // ✅ Working API
    const response = await fetchJson(`https://api.akuari.my.id/downloader/fb?link=${encodeURIComponent(q)}`);
    if (!response?.Videos) return reply("❌ Error fetching video (maybe it's private).");

    const fbData = {
      title: response.title,
      thumbnail: response.thumbnail,
      sd: response.Videos[0]?.url,
      hd: response.Videos[1]?.url,
    };

    const caption = `📥 *Facebook Downloader*
🔖 *Title:* ${fbData.title}

1️⃣ SD Video
2️⃣ HD Video
3️⃣ Audio (mp3)

👉 *Reply with 1 / 2 / 3 to download.*`;

    const sent = await conn.sendMessage(from, {
      image: { url: fbData.thumbnail },
      caption
    }, { quoted: ck });

    // 🎯 Reply Listener
    conn.ev.on("messages.upsert", async (msg) => {
      const r = msg.messages[0];
      if (!r.message) return;
      if (r.message.extendedTextMessage?.contextInfo?.stanzaId !== sent.key.id) return;

      const text = r.message.conversation || r.message.extendedTextMessage?.text;

      if (text === "1") {
        await conn.sendMessage(from, { video: { url: fbData.sd }}, { quoted: ck });
      } else if (text === "2") {
        await conn.sendMessage(from, { video: { url: fbData.hd }}, { quoted: ck });
      } else if (text === "3") {
        await conn.sendMessage(from, { audio: { url: fbData.sd }, mimetype: "audio/mpeg" }, { quoted: ck });
      } else {
        reply("❌ Invalid option!");
      }
    });

  } catch (e) {
    console.log(e);
    reply("❌ Error fetching the video. Try again.");
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
