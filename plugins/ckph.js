const axios = require('axios');
const { cmd } = require("../command");
const config = require("../config");

const apilink = "https://darkyasiya-new-movie-api.vercel.app/";
const apikey = '';
const oce = '`';

function formatNumber(num) {
    return String(num).padStart(2, '0');
}

cmd({
    pattern: "ckph",
    alias: ["ph"],
    react: "🔞",
    desc: "Download Pornhub video",
    category: "download",
    use: ".ph < query >",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("Query need ?");

        const searchRes = (await axios.get(`${apilink}/api/other/pornhub/search?q=${q}`)).data;
        const response = searchRes?.data;

        if (!response || response.length === 0) return await reply("Result not found: " + q);

        let info = `*🔞 \`PORNHUB DOWNLOADER\` 🔞*\n\n`;
        for (let v = 0; v < response.length; v++) {
            info += `*${formatNumber(v + 1)} ||* ${response[v].title}\n`;
        }
        info += `\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentMsg = await conn.sendMessage(from, {
            text: info,
            contextInfo: {
                externalAdReply: {
                    title: "🔞CK PORNHUB DOWNLOADER🔞",
                    body: "👨🏻‍💻 ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ",
                    thumbnailUrl: config.LOGO,
                    mediaType: 1,
                    sourceUrl: q
                }
            }
        }, { quoted: ck });

        const messageID = sentMsg.key.id;

        const handler = async (messageUpdate) => {
            const mekInfo = messageUpdate?.messages?.[0];
            if (!mekInfo?.message) return;

            const messageText = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
            const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (!isReplyToSentMsg) return;

            conn.ev.off('messages.upsert', handler); // remove listener after one response

            try {
                let selectedIndex = parseInt(messageText.trim()) - 1;

                if (selectedIndex >= 0 && selectedIndex < response.length) {
                    const selectVid = response[selectedIndex];
                    await conn.sendMessage(from, { react: { text: '🔌', key: mekInfo.key } });

                    const videoRes = await axios.get(`${apilink}/api/other/pornhub/download?url=${selectVid.videoUrl}`);
                    const data = videoRes.data?.data;

                    if (!data || !data.videos || data.videos.length === 0) return reply(`*Download link not found. ❌*`);

                    let s_m_g = '';
                    for (let l = 0; l < data.videos.length; l++) {
                        s_m_g += `${formatNumber(l + 1)} | ❭❭◦ Download ${data.videos[l].quality.split("-")[0].trim()} Quality\n`;
                    }

                    let mg = `╭─────────────────────╮\n` +
                        `│ *🔞 \`CK PORN HUB DOWNLOADER\` 🔞* \n` +
                        `├─────────────────────┤\n` +
                        `│ 📜 ${oce}Title:${oce} *${data.title}*\n` +
                        `│\n` +
                        `│ 🗣️ ${oce}Input:${oce} *${q}*\n` +
                        `╰─────────────────────╯\n\n` +
                        `${s_m_g}\n\n` +
                        `> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                    const mass = await conn.sendMessage(from, {
                        image: { url: data.cover },
                        caption: mg
                    }, { quoted: ck });

                    const messageID2 = mass.key.id;

                    const handler2 = async (update2) => {
                        const replyMsg = update2?.messages?.[0];
                        if (!replyMsg?.message) return;

                        const msgTxt = replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text;
                        const isReplyToSecond = replyMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID2;

                        if (!isReplyToSecond) return;

                        conn.ev.off('messages.upsert', handler2); // remove second listener

                        try {
                            let selected = parseInt(msgTxt.trim()) - 1;
                            if (selected >= 0 && selected < data.videos.length) {
                                const selectedVideo = data.videos[selected];

                                await conn.sendMessage(from, {
                                    react: { text: '⬇️', key: replyMsg.key }
                                });

                                await conn.sendMessage(from, {
                                    video: { url: selectedVideo.url },
                                    mimetype: "video/mp4",
                                    caption: `*${data.title}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                                }, { quoted: ck });

                                await conn.sendMessage(from, {
                                    react: { text: '✅', key: replyMsg.key }
                                });

                            } else {
                                await conn.sendMessage(from, {
                                    text: `Invalid selection. Use 01 - ${data.videos.length}`,
                                    quoted: replyMsg
                                });
                            }
                        } catch (e) {
                            console.log(e);
                            await conn.sendMessage(from, { text: "Error !!" }, { quoted: replyMsg });
                        }
                    };

                    conn.ev.on('messages.upsert', handler2);

                } else {
                    return await conn.sendMessage(from, {
                        text: `Invalid selection. Use 01 - ${response.length}`,
                        quoted: ck
                    });
                }

            } catch (e) {
                console.log(e);
                await conn.sendMessage(from, { text: "Error !!" }, { quoted: mekInfo });
            }
        };

        conn.ev.on('messages.upsert', handler);

    } catch (e) {
        console.log(e);
        await reply("Error !!");
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
            displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ×͜×",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};
