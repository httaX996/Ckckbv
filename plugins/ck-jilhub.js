const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');

// ==========================================
// 🛠️ SHARED CONFIGURATIONS & FUNCTIONS
// ==========================================

const ck = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ×͜×",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nORG:META AI;\nTEL;type=CELL;type=VOICE;waid=13135550002:+13135550002\nEND:VCARD`
        }
    }
};

async function createThumbnail(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return await sharp(response.data)
            .resize(300, 300)
            .jpeg({ quality: 80 })
            .toBuffer();
    } catch (e) {
        console.log('Thumbnail Error:', e);
        return null;
    }
}

// ==========================================
// 🎬 MAIN .JILHUB COMMAND (10-MIN TIMEOUT)
// ==========================================
cmd({
    pattern: "jilhub",
    desc: "Search and download videos from JilHub",
    category: "download",
    react: "🔞",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        let menuText = `💋 \`𝗖𝗞 𝗝𝗜𝗟𝗛𝗨𝗕 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\` 💋\n\n`;
        menuText += `\`1\` *|* ❭❭◦ *Latest*\n`;
        menuText += `\`2\` *|* ❭❭◦ *Top Rated*\n`;
        menuText += `\`3\` *|* ❭❭◦ *Popular*\n`;
        menuText += `\`4\` *|* ❭❭◦ *Sri Lankan*\n\n`;
        menuText += `💡 ඔයාට අවශ්‍ය category එකට අදාල අංකය මෙම message එකට reply කරන්න.\n\n`;
        menuText += `> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentMenuMsg = await conn.sendMessage(from, { 
            image: { url: config.IMG_URL }, 
            caption: menuText 
        }, { quoted: ck });

        // Category mapping
        const types = {
            '1': { api: 'latest', name: 'LATEST' },
            '2': { api: 'top-rated', name: 'TOP RATED' },
            '3': { api: 'popular', name: 'POPULAR' },
            '4': { api: 'slporn', name: 'SRI LANKAN' }
        };

        let activeResultsListeners = new Map();

        // 1️⃣ පළමු මට්ටමේ Listener එක: Category තෝරාගැනීම
        const catSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message) return;

                const contextInfo = msg.message.extendedTextMessage?.contextInfo;
                if (contextInfo?.stanzaId !== sentMenuMsg.key.id) return;

                const userReply = (msg.message.extendedTextMessage?.text || msg.message.conversation || "").trim();

                if (!types[userReply]) return; 

                const selected = types[userReply];
                const searchUrl = `https://ck-api-v1.vercel.app/xxx/jilhub?type=${selected.api}`;
                
                await conn.sendMessage(from, { react: { text: "⏳", key: msg.key } });
                
                const { data } = await axios.get(searchUrl);
                
                // 🔄 [FIX] API Response එක ඇතුලේ තියෙන Array එක හරියටම අල්ලගන්න හැදූ Smart Filter එක
                let results = [];
                if (Array.isArray(data)) {
                    results = data;
                } else if (data && Array.isArray(data.results)) {
                    results = data.results;
                } else if (data && Array.isArray(data.data)) {
                    results = data.data;
                } else if (data && typeof data === 'object') {
                    // වෙනත් key එකක හරි array එකක් තියෙනවද බලන්න check කරනවා
                    const keys = Object.keys(data);
                    for (let key of keys) {
                        if (Array.isArray(data[key])) {
                            results = data[key];
                            break;
                        }
                    }
                }

                if (!results || results.length === 0) {
                    await conn.sendMessage(from, { react: { text: "❌", key: msg.key } });
                    return reply(`❌ No videos found or API response format changed inside JILHUB ${selected.name}.`);
                }

                let listText = `🔥 \`JILHUB ${selected.name}\` 🔥\n\n`;
                results.forEach((vid, index) => {
                    listText += `\`${index + 1}\` *|* ❭❭◦ *${vid.title || "No Title"}*\n`;
                    listText += `📅 _Uploaded:_ ${vid.uploadedOn || "N/A"}  👁️ _Views:_ ${vid.views || "N/A"}\n\n`;
                });
                listText += `💡 වීඩියෝ එක ලබා ගැනීමට අදාළ අංකය මෙම message එකට reply කරන්න.\n\n`;
                listText += `> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪ<b>ꜱ</b>ʜᴀɴ*`;

                const sentListMsg = await conn.sendMessage(from, {
                    image: { url: config.IMG_URL },
                    caption: listText
                }, { quoted: ck });

                await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });

                // 2️⃣ දෙවැනි මට්ටමේ Listener එක: Video එක තෝරාගැනීම
                const videoSelectionListener = async (updateVid) => {
                    try {
                        const msgVid = updateVid.messages[0];
                        if (!msgVid.message) return;

                        const contextInfoVid = msgVid.message.extendedTextMessage?.contextInfo;
                        if (contextInfoVid?.stanzaId !== sentListMsg.key.id) return;

                        const userReplyVid = (msgVid.message.extendedTextMessage?.text || msgVid.message.conversation || "").trim();
                        const selectedIdx = parseInt(userReplyVid) - 1;

                        if (isNaN(selectedIdx) || selectedIdx < 0 || selectedIdx >= results.length) {
                            return; 
                        }

                        const selectedVideo = results[selectedIdx];
                        const targetUrl = selectedVideo.url || selectedVideo.link || selectedVideo.href;
                        
                        if (!targetUrl) return reply("❌ Target video URL not found in list.");

                        const infoUrl = `https://ck-api-v1.vercel.app/xxx/jilhub?type=info&url=${encodeURIComponent(targetUrl)}`;

                        await conn.sendMessage(from, { react: { text: "🔍", key: msgVid.key } });
                        const infoResponse = await axios.get(infoUrl);
                        
                        // Response data එක extract කිරීම
                        const resData = infoResponse.data;
                        const videoInfo = resData?.data || resData?.results || resData;

                        if (!videoInfo || !videoInfo.download_link) {
                            return reply("❌ Failed to fetch video download details from Info API.");
                        }

                        let caption = `🎬 \`${videoInfo.title || selectedVideo.title || "JilHub Video"}\`\n\n`;
                        caption += `⏱️ \`DURATION:\` *${videoInfo.duration || "N/A"}*\n`;
                        caption += `👁️ \`VIEWS:\` *${videoInfo.views || "N/A"}*\n`;
                        caption += `📤 \`SUBMITTED:\` *${videoInfo.submitted || "N/A"}*\n\n`;
                        caption += `> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                        const videoPoster = videoInfo.image || config.IMG_URL;

                        // Info & Poster
                        await conn.sendMessage(from, {
                            image: { url: videoPoster },
                            caption: caption
                        }, { quoted: ck });

                        // Status msg
                        await reply("📥 *Your video is downloading... Please wait!*");

                        const thumb = await createThumbnail(videoPoster);

                        // 🎬 වීඩියෝ එකක් විදිහට කෙලින්ම සෙන්ඩ් කිරීම (Streamable video message)
                        await conn.sendMessage(from, {
                            video: { url: videoInfo.download_link },
                            mimetype: "video/mp4",
                            jpegThumbnail: thumb,
                            caption: `🎬 \`${videoInfo.title || selectedVideo.title || "Video"}\`\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                        }, { quoted: ck });

                        await conn.sendMessage(from, { react: { text: "⚽", key: msgVid.key } });

                    } catch (err) {
                        console.log("Error in video selection:", err);
                        reply("❌ Error while fetching/sending the video.");
                    }
                };

                if (activeResultsListeners.has(sentListMsg.key.id)) {
                    conn.ev.off("messages.upsert", activeResultsListeners.get(sentListMsg.key.id));
                }

                conn.ev.on("messages.upsert", videoSelectionListener);
                activeResultsListeners.set(sentListMsg.key.id, videoSelectionListener);

                setTimeout(() => {
                    conn.ev.off("messages.upsert", videoSelectionListener);
                    activeResultsListeners.delete(sentListMsg.key.id);
                }, 600000);

            } catch (err) {
                console.log("Error in category switching:", err);
                reply("❌ Error while fetching category data.");
            }
        };

        conn.ev.on("messages.upsert", catSelectionListener);

        setTimeout(() => {
            conn.ev.off("messages.upsert", catSelectionListener);
            for (let [msgId, listenerFunc] of activeResultsListeners.entries()) {
                conn.ev.off("messages.upsert", listenerFunc);
            }
            activeResultsListeners.clear();
        }, 600000);

    } catch (err) {
        console.log("Jilhub Main Error:", err);
        reply("❌ An error occurred while starting JilHub.");
    }
});

