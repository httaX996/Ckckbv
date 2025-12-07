const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "video",
    alias: ["ytvideo", "ytmp4"],
    react: "🎬",
    desc: "Download youtube videos with quality options.",
    category: "download",
    use: ".video <video name>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply('❌ Please give video name');

        const search = await fetchJson(`https://tharuzz-ofc-apis.vercel.app/api/search/ytsearch?query=${encodeURIComponent(q)}`);
        const res = search.result[0];

        if (!res) return reply("❌ No results found");

        const { title, url, image, thumbnail, timestamp, views } = res;

        const caption =
`🎬 \`CK VIDEO DOWNLOADER\` 🎬

🔖 \`TITLE:\` *${title}*
⏰ \`DURATION:\` *${timestamp}*
📆 \`UPLOAD ON:\` *${ago}*
👀 \`VIEWS:\` *${views}*

🔽 *Reply below number*
\`1\` *|* ❭❭◦ *360p*
\`2\` *|* ❭❭◦ *720p*
\`3\` *|* ❭❭◦ *1080p*

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const infoMsg = await conn.sendMessage(from, {
            image: { url: image || thumbnail },
            caption
        }, { quoted: ck });

        // filter replies only to this message
        const filter = (msg) =>
            msg.messages?.[0]?.message?.extendedTextMessage?.contextInfo?.stanzaId === infoMsg.key.id;

        const listener = async (msg) => {
            if (!filter(msg)) return;

            const userReply = msg.messages[0].message.extendedTextMessage.text.trim();
            let quality = null;

            if (userReply === '1') quality = '360';
            if (userReply === '2') quality = '720';
            if (userReply === '3') quality = '1080';

            if (!quality) return reply('❌ Invalid quality number.');

            conn.ev.off('messages.upsert', listener); // remove listener

            await conn.sendMessage(from, { react: { text: "📥", key: msg.messages[0].key } });

            const videoData = await fetchJson(
                `https://tharuzz-ofc-api-v3.vercel.app/api/ytdl/yt?url=${encodeURIComponent(url)}&format=${quality}`
            );

            const videoUrl = videoData.result.download;

            // send as video file
            await conn.sendMessage(from, {
                video: { url: videoUrl },
                caption: `🎬 *${title}*\n👾 *${quality}p*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
            }, { quoted: ck });
        };

        conn.ev.on("messages.upsert", listener);

    } catch (e) {
        console.log('Video Error:', e);
        reply('❌ Error: ' + e.message);
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
