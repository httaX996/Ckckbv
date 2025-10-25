const { cmd } = require("../command");
const { fetchJson } = require('../lib/rfunctions');
const domain = `https://fbdown.net`;

cmd({ 
  pattern: "fb",
  react: "📥",
  alias: ["facebook"], 
  desc: "Download Facebook videos", 
  category: "download",
  filename: __filename 
}, async (conn, m, store, { from, quoted, args, q, reply }) => { 
  try { 
    if (!q || !q.startsWith("https://")) { 
      return conn.sendMessage(from, { text: "Need URL" }, { quoted: m }); 
    }

    await conn.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    });

    // Use the fbdown.net API to fetch Facebook video data
    const response = await fetchJson(`https://fbdown.net/api/download?url=${encodeURIComponent(q)}`);
    
    if (!response.success) {
      return reply("❌ Error fetching the video. Please try again.");
    }

    const fbData = response.data;

    const caption = `🧩 \`𝗖𝗞 𝗙𝗕 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\` 🧩

🔖 \`TITLE:\` *${fbData.title}*
📒 \`DESCRIPTION:\` *${fbData.description}*

*⬇️ꜱᴇʟᴇᴄᴛ ʏᴏᴜ ᴡᴏɴᴛ⬇️*

\`1\` *|* ❭❭◦ *SD Quality ⭐*
\`2\` *|* ❭❭◦ *HD Quality 🌟*

\`3\` *|* ❭❭◦ *Audio (SD) 🎧*
\`4\` *|* ❭❭◦ *Document (MP3) 📄*
\`5\` *|* ❭❭◦ *Voice Note (PTT) 🎤*

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: fbData.thumbnail },
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
              video: { url: fbData.sd },
              caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*"
            }, { quoted: ck });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: fbData.hd },
              caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*"
            }, { quoted: ck });
            break;

          case "3":
            await conn.sendMessage(senderID, {
              audio: { url: fbData.sd },
              mimetype: "audio/mpeg"
            }, { quoted: ck });
            break;

          case "4":
            await conn.sendMessage(senderID, {
              document: { url: fbData.sd },
              mimetype: "audio/mpeg",
              fileName: "Facebook_Audio.mp3",
              caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*"
            }, { quoted: ck });
            break;

          case "5":
            await conn.sendMessage(senderID, {
              audio: { url: fbData.sd },
              mimetype: "audio/mp4",
              ptt: true
            }, { quoted: ck });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1, 2, 3, 4, or 5.");
        }
      }
    });

  } catch (error) { 
    console.error("Error:", error); 
    reply("❌ Error fetching the video. Please try again."); 
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
