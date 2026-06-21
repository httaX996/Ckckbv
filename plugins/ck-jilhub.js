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

// Global active results listeners map to clean memory efficiently
let activeResultsListeners = new Map();

// Dynamic video selection logic shared by both commands
async function handleVideoSelection(conn, from, results, sentListMsg) {
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
            
            if (!targetUrl) return conn.sendMessage(from, { text: "❌ Target video URL not found in list." });

            const infoUrl = `https://ck-api-v1.vercel.app/xxx/jilhub?type=info&url=${encodeURIComponent(targetUrl)}`;

            await conn.sendMessage(from, { react: { text: "🔍", key: msgVid.key } });
            const infoResponse = await axios.get(infoUrl);
            
            const resData = infoResponse.data;
            const videoInfo = resData?.data || resData?.results || resData;

            if (!videoInfo || !videoInfo.download_link) {
                return conn.sendMessage(from, { text: "❌ Failed to fetch video download details from Info API." });
            }

            let caption = `🎬 \`${videoInfo.title || selectedVideo.title || "JilHub Video"}\`\n\n`;
            caption += `⏱️ \`DURATION:\` *${videoInfo.duration || "N/A"}*\n`;
            caption += `👁️ \`VIEWS:\` *${videoInfo.views || "N/A"}*\n`;
            caption += `📤 \`SUBMITTED:\` *${videoInfo.submitted || "N/A"}*\n\n`;
            caption += `> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

            const videoPoster = videoInfo.image || config.IMG_URL;

            await conn.sendMessage(from, {
                image: { url: videoPoster },
                caption: caption
            }, { quoted: ck });

            await conn.sendMessage(from, { text: "📥 *Your video is downloading... Please wait!*" });

            const thumb = await createThumbnail(videoPoster);

            await conn.sendMessage(from, {
                video: { url: videoInfo.download_link },
                mimetype: "video/mp4",
                jpegThumbnail: thumb,
                caption: `🎬 \`${videoInfo.title || selectedVideo.title || "Video"}\`\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
            }, { quoted: ck });

            await conn.sendMessage(from, { react: { text: "⚽", key: msgVid.key } });

        } catch (err) {
            console.log("Error in video selection:", err);
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
}


// ==========================================
// 🎬 1️⃣ MAIN .JILHUB COMMAND (CATEGORY)
// ==========================================
cmd({
    pattern: "jilhub",
    desc: "Browse videos from JilHub by category",
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
        menuText += `> 👨🏻‍💻 ᴍᴀඩᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentMenuMsg = await conn.sendMessage(from, { 
            image: { url: config.IMG_URL }, 
            caption: menuText 
        }, { quoted: ck });

        const types = {
            '1': { api: 'latest', name: 'LATEST' },
            '2': { api: 'top-rated', name: 'TOP RATED' },
            '3': { api: 'popular', name: 'POPULAR' },
            '4': { api: 'slporn', name: 'SRI LANKAN' }
        };

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
                
                let results = Array.isArray(data) ? data : (data.data || data.results || []);

                if (!results || results.length === 0) {
                    await conn.sendMessage(from, { react: { text: "❌", key: msg.key } });
                    return reply(`❌ No videos found inside JILHUB ${selected.name}.`);
                }

                let listText = `🔥 \`JILHUB ${selected.name}\` 🔥\n\n`;
                results.forEach((vid, index) => {
                    listText += `\`${index + 1}\` *|* ❭❭◦ *${vid.title || "No Title"}*\n`;
                    listText += `📅 _Uploaded:_ ${vid.uploadedOn || "N/A"}  👁️ _Views:_ ${vid.views || "N/A"}\n\n`;
                });
                listText += `💡 වීඩියෝ එක ලබා ගැනීමට අදාළ අංකය මෙම message එකට reply කරන්න.\n\n`;
                listText += `> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                const sentListMsg = await conn.sendMessage(from, {
                    image: { url: config.IMG_URL },
                    caption: listText
                }, { quoted: ck });

                await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });

                // Handle nesting using the global logic
                await handleVideoSelection(conn, from, results, sentListMsg);

            } catch (err) {
                console.log("Error in category switching:", err);
                reply("❌ Error while fetching category data.");
            }
        };

        conn.ev.on("messages.upsert", catSelectionListener);

        setTimeout(() => {
            conn.ev.off("messages.upsert", catSelectionListener);
        }, 600000);

    } catch (err) {
        console.log("Jilhub Main Error:", err);
        reply("❌ An error occurred while starting JilHub.");
    }
});


// ==========================================
// 🔍 2️⃣ NEW .SEARCHJIL COMMAND (TEXT SEARCH)
// ==========================================
cmd({
    pattern: "searchjil",
    desc: "Search videos on JilHub by text query",
    category: "download",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("❌ Please provide a search query!\n\nExample:\n.searchjil srilankan");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const searchUrl = `https://ck-api-v1.vercel.app/xxx/jilhub?type=search&q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl);

        // Screenshot එකේ විදියට data array එක extract කිරීම
        let results = data.data || data.results || (Array.isArray(data) ? data : []);

        if (!results || results.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ No videos found for search query: "${q}"`);
        }

        let searchListText = `🔍 \`JILHUB SEARCH RESULTS\` 🔍\n\n`;
        searchListText += `*🔎 Query:* \`${q}\`\n\n`;
        
        results.forEach((vid, index) => {
            searchListText += `\`${index + 1}\` *|* ❭❭◦ *${vid.title || "No Title"}*\n`;
            searchListText += `📅 _Uploaded:_ ${vid.uploadedOn || "N/A"}  👁️ _Views:_ ${vid.views || "N/A"}\n\n`;
        });
        
        searchListText += `💡 වීඩියෝ එක ලබා ගැනීමට අදාළ අංකය මෙම message එකට reply කරන්න.\n\n`;
        searchListText += `> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪ<b>ꜱ</b>ʜᴀัน*`;

        const sentSearchListMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL },
            caption: searchListText
        }, { quoted: ck });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // වීඩියෝ එක select කරලා download කරන nested logic එක ක්‍රියාත්මක කිරීම (10 min expiry)
        await handleVideoSelection(conn, from, results, sentSearchListMsg);

    } catch (err) {
        console.log("SearchJil Error:", err);
        reply("❌ An error occurred while searching JilHub.");
    }
});

