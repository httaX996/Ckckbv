const config = require('../config')
const { cmd, commands } = require('../command')
const getFBInfo = require("@xaviabot/fb-downloader");

// ==========================================
// 1. MAIN FACEBOOK DOWNLOAD COMMAND
// ==========================================
cmd({
    pattern: "fb",
    alias: ["fbdl"],
    use: '.fb <facebook-url>',
    react: "🧩",
    desc: "Download Facebook videos using interactive buttons",
    category: "Download",
    filename: __filename
},
async (conn, mek, m, { from, prefix, q, reply }) => {
    try {
        if (!q || !q.startsWith("https://")) {
            return await reply('🔎 *Please provide a valid Facebook video URL!*');
        }

        await conn.sendMessage(from, { react: { text: "💡", key: mek.key } });

        const result = await getFBInfo(q);
        if (!result || (!result.sd && !result.hd)) return reply("❌ Video not found or private!");

        const title = result.title || "Facebook Video";
        const wm = config.FOOTER || "👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ";

        let caption = `🧩 *𝗖𝗞 𝗙𝗕 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* 🧩\n\n` +
                      `*🔖 Title :* *${title}*\n` +
                      `*🔗 Url :* *${q}*`;

        // song එකේ වගේම buttonId එකට prefix එක සහ ඩේටා පාස් කරනවා
        const buttons = [
            {
                buttonId: `${prefix}fbsd ${result.sd}`,
                buttonText: { displayText: 'SD Quality 🪫' },
                type: 1
            },
            {
                buttonId: `${prefix}fbhd ${result.hd || result.sd}`, // HD නැත්නම් SD වැටෙන්න සේෆ්ටි එකක්
                buttonText: { displayText: 'HD Quality 🔋' },
                type: 1
            },
            {
                buttonId: `${prefix}fbaud ${result.sd}`,
                buttonText: { displayText: 'Audio Format 🎶' },
                type: 1
            }
        ];

        const buttonMessage = {
            image: { url: result.thumbnail || "https://placeholder.com" },
            caption: caption,
            footer: wm,
            buttons: buttons,
            headerType: 4
        };

        // ඔයාගේ song එකේ තියෙන බටන් මැසේජ් ෆන්ක්ෂන් එකමයි
        await conn.buttonMessage(from, buttonMessage, mek);

    } catch (e) {
        console.error(e);
        reply('❌ *An error occurred while fetching Facebook video.*');
    }
});

// ==========================================
// 2. SUB-COMMAND: SD VIDEO DOWNLOADER
// ==========================================
cmd({
    pattern: "fbsd",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return;
    try {
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        await conn.sendMessage(
            from,
            { 
                video: { url: q }, 
                caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*" 
            },
            { quoted: mek }
        );

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) {
        console.log(e);
        reply('❌ *Error sending SD Video.*');
    }
});

// ==========================================
// 3. SUB-COMMAND: HD VIDEO DOWNLOADER
// ==========================================
cmd({
    pattern: "fbhd",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return;
    try {
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        await conn.sendMessage(
            from,
            { 
                video: { url: q }, 
                caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*" 
            },
            { quoted: mek }
        );

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) {
        console.log(e);
        reply('❌ *Error sending HD Video.*');
    }
});

// ==========================================
// 4. SUB-COMMAND: AUDIO DOWNLOADER
// ==========================================
cmd({
    pattern: "fbaud",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return;
    try {
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        await conn.sendMessage(
            from,
            { 
                audio: { url: q }, 
                mimetype: 'audio/mpeg' 
            },
            { quoted: mek }
        );

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) {
        console.log(e);
        reply('❌ *Error sending Audio.*');
    }
});
