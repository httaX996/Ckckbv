const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp'); 
const fg = require("api-dylux"); 
const config = require('../config');

// 🖼️ Thumbnail සාදන ශ්‍රිතය
async function createThumbnail(url) {
    try {
        if (!url) return null;
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 5000 
        });
        return await sharp(response.data)
            .resize(300, 300)
            .jpeg({ quality: 60 })
            .toBuffer();
    } catch (e) {
        console.log('Thumbnail Error:', e.message);
        return null;
    }
}

cmd({
    pattern: "cartoon", 
    alias: ["gini", "ginisisila"], 
    react: "📑",
    category: "download",
    desc: "Search cartoons using Ginisisila Blogger Feed API",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const searchQuery = q ? q.trim() : "";
        if (!searchQuery) return reply("*Please provide a search query! (e.g., .cartoon soora pappa)*");

        // 💡 පියවර 1: Cloudflare Bypass කිරීම සඳහා සෘජුවම Blogger Feed API එක භාවිතා කිරීම
        const feedUrl = `https://ginisisilacartoon.net/feeds/posts/default?q=${encodeURIComponent(searchQuery)}&alt=json&max-results=15`;
        
        const response = await axios.get(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const feed = response.data?.feed;
        const entries = feed?.entry || [];

        if (entries.length === 0) {
            return reply(`❌ ප්‍රතිඵල කිසිවක් හමු වූයේ නැත: *${searchQuery}*\n\n💡 *Tip:* සිංහලෙන් හෝ නිවැරදි සිංග්ලිෂ් වචන භාවිතා කරන්න (e.g., ගාෆීල්ඩ්, සූර පප්පා, දඩිබිඩි, gapi)`);
        }

        let resultsList = [];

        // ලැබෙන JSON දත්ත අපට අවශ්‍ය පරිදි සකස් කර ගැනීම
        entries.forEach((entry) => {
            const title = entry.title?.$t;
            const postedTime = entry.published?.$t ? entry.published.$t.split('T')[0] : "Unknown";
            
            // Post Link එක සෙවීම
            const postLinkObj = entry.link?.find(l => l.rel === 'alternate');
            const episodeLink = postLinkObj ? postLinkObj.href : null;
            
            // Image/Poster URL එක සෙවීම
            const imageUrl = entry.media$thumbnail?.url || entry.gphoto$thumbnail?.url || null;

            if (title && episodeLink) {
                resultsList.push({
                    title: title,
                    postedTime: postedTime,
                    episodeLink: episodeLink,
                    imageUrl: imageUrl ? imageUrl.replace('/s72-c/', '/s320/') : null // Thumbnail එක පැහැදිලි මට්ටමකට විශාල කිරීම
                });
            }
        });

        // පියවර 2: සෙවුම් ප්‍රතිඵල ලැයිස්තුව යැවීම
        let listMessage = "📺 *Ginisisila Cartoon Search Results* 📺\n\n";
        resultsList.forEach((item, index) => {
            listMessage += `*${index + 1}.* ${item.title}\n🗓️ Date: ${item.postedTime}\n\n`;
        });
        listMessage += "ℹ️ *ඉහත ලැයිස්තුවෙන් අවශ්‍ය කොටසේ අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.*";

        const sentListMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL || `https://i.ibb.co/zHLW3WL/044e155205d4f11c.jpg` },
            caption: listMessage,
            contextInfo: { forwardingScore: 999, isForwarded: false }
        }, { quoted: mek });


        // 1 වන Listener එක: කාටූන් එක තේරීම
        const cartoonSelectionListener = async (update) => {
            const msg = update.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;
            if (msg.message.extendedTextMessage.contextInfo.stanzaId !== sentListMsg.key.id) return;

            const userReply = msg.message.extendedTextMessage.text.trim();
            const selectedIndex = parseInt(userReply) - 1;

            if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= resultsList.length) {
                await conn.sendMessage(from, { react: { text: '❌', key: msg.key } });
                return conn.sendMessage(from, { text: "❗ Invalid selection. Please choose a valid number from the list." }, { quoted: msg });
            }

            conn.ev.off("messages.upsert", cartoonSelectionListener);
            const selectedCartoon = resultsList[selectedIndex];
            await conn.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            try {
                // පියවර 3: තෝරාගත් පිටුව ඇතුලෙන් වීඩියෝ Iframe එක සෙවීම
                const episodePageResponse = await axios.get(selectedCartoon.episodeLink, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const $episodePage = cheerio.load(episodePageResponse.data);
                
                const iframeSrc = $episodePage("div#player-holder iframe").attr("src") || $episodePage("iframe").attr("src");

                if (!iframeSrc) {
                    return conn.sendMessage(from, { text: "❌ මෙම කොටස සඳහා වීඩියෝ ලින්ක් එකක් හමු වූයේ නැත." }, { quoted: msg });
                }

                // පියවර 4: විස්තර තහවුරු කිරීමේ පණිවිඩය
                let detailMessage = `🎬 *${selectedCartoon.title}*\n\n`;
                detailMessage += `📅 *Date:* ${selectedCartoon.postedTime}\n`;
                detailMessage += `🔗 *Page:* ${selectedCartoon.episodeLink}\n\n`;
                detailMessage += `📥 *බාගත කර ගැනීමට සූදානම් කිරීමට '1' ලෙස මෙම පණිවිඩයට Reply කරන්න.*`;

                const validImgUrl = selectedCartoon.imageUrl || config.IMG_URL;

                const detailSentMsg = await conn.sendMessage(from, {
                    image: { url: validImgUrl },
                    caption: detailMessage,
                    contextInfo: { forwardingScore: 999, isForwarded: false }
                }, { quoted: msg });


                // 2 වන Listener එක: බාගත කිරීම තහවුරු කිරීම
                const downloadListener = async (dlUpdate) => {
                    const dlMsg = dlUpdate.messages[0];
                    if (!dlMsg.message || !dlMsg.message.extendedTextMessage) return;
                    if (dlMsg.message.extendedTextMessage.contextInfo.stanzaId !== detailSentMsg.key.id) return;

                    const dlUserReply = dlMsg.message.extendedTextMessage.text.trim();

                    if (dlUserReply !== "1") {
                        await conn.sendMessage(from, { react: { text: '❌', key: dlMsg.key } });
                        return conn.sendMessage(from, { text: "❗ Invalid option. Reply with '1' to download." }, { quoted: dlMsg });
                    }

                    conn.ev.off("messages.upsert", downloadListener);
                    await conn.sendMessage(from, { react: { text: '📥', key: dlMsg.key } });

                    try {
                        // api-dylux (fg) මඟින් GDrive ලින්ක් එක ඩවුන්ලෝඩ් කිරීම
                        const gdriveData = await fg.GDriveDl(iframeSrc);

                        if (gdriveData && gdriveData.downloadUrl) {
                            const thumb = await createThumbnail(selectedCartoon.imageUrl);

                            // පියවර 5: වීඩියෝව Document එකක් ලෙස යැවීම
                            await conn.sendMessage(from, {
                                document: { url: gdriveData.downloadUrl },
                                mimetype: gdriveData.mimetype || "video/mp4",
                                fileName: `Ginisisila | ${selectedCartoon.title}.mp4`,
                                jpegThumbnail: thumb ? thumb : undefined,
                                caption: `🎬 \`${selectedCartoon.title}\`\n⚖️ Size: ${gdriveData.fileSize || 'Unknown'}\n\n> *© ⎝⧹ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚃𝙾𝙷𝙸𝙳_𝙼𝙳 ⧸⎠*`
                            }, { quoted: dlMsg });

                            await conn.sendMessage(from, { react: { text: '✅', key: dlMsg.key } });
                        } else {
                            await conn.sendMessage(from, { text: "❌ මෙම Google Drive ලින්ක් එක බාගත කිරීමට නොහැකි විය." }, { quoted: dlMsg });
                        }

                    } catch (err) {
                        console.error('Error sending document:', err);
                        await conn.sendMessage(from, { react: { text: '❌', key: dlMsg.key } });
                        return conn.sendMessage(from, { text: "❗ සන්නිවේදන දෝෂයකි. වීඩියෝව බාගත කිරීමට නොහැකි විය." }, { quoted: dlMsg });
                    }
                };

                conn.ev.on("messages.upsert", downloadListener);
                setTimeout(() => { conn.ev.off("messages.upsert", downloadListener); }, 60000); 

            } catch (scrapeError) {
                console.error(scrapeError);
                return conn.sendMessage(from, { text: "❌ මෙම පිටුවේ දත්ත කියවීමට නොහැකි විය." }, { quoted: msg });
            }
        };

        conn.ev.on("messages.upsert", cartoonSelectionListener);
        setTimeout(() => { conn.ev.off("messages.upsert", cartoonSelectionListener); }, 60000); 

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`❗ Error: ${e.message}`);
    }
});
