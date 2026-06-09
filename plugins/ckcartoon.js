const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp'); 
const fg = require("api-dylux"); 
const config = require('../config');
const qs = require('qs'); // POST Data Format කිරීම සඳහා (npm install qs හෝ bot එකේ දැනටමත් ඇති)

// 🖼️ Thumbnail සාදන ශ්‍රිතය
async function createThumbnail(url) {
    try {
        if (!url) return null;
        const validUrl = url.startsWith('http') ? url : 'https://ginisisilacartoon.net/' + url;
        
        const response = await axios.get(validUrl, {
            responseType: 'arraybuffer',
            timeout: 7000 
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
    desc: "Search and download cartoons from ginisisilacartoon.net",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const searchQuery = q ? q.trim() : "";
        if (!searchQuery) return reply("*Please provide a search query! (e.g., .cartoon gapi)*");

        // 💡 පියවර 1: වෙබ් අඩවියට POST Request එකක් මඟින් සෙවුම් දත්ත යැවීම
        const searchUrl = "https://ginisisilacartoon.net/search.php";
        const postData = qs.stringify({ 'q': searchQuery }); // සයිට් එක බලාපොරොත්තු වන Form Data එක

        const searchResponse = await axios.post(searchUrl, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://ginisisilacartoon.net/'
            }
        });
        
        const $searchPage = cheerio.load(searchResponse.data);
        let resultsList = [];

        // දත්ත ලබාගන්නා Selector එක (සයිට් එකේ නවතම ව්‍යුහයට අනුව)
        $searchPage("div.inner-video-cell, div.video-cell, .video-cell-fixed").each((index, element) => {
            const titleLinkEl = $searchPage(element).find("div.video-title > a");
            const title = titleLinkEl.attr('title') || titleLinkEl.text().trim();
            const postedTime = $searchPage(element).find("div.posted-time").text().trim() || "Unknown";
            const relativeLink = titleLinkEl.attr("href");
            let imageUrl = $searchPage(element).find("div.inner-video-thumb-wrapper img, div.video-thumb-wrapper img, img").attr('src');

            if (title && relativeLink) {
                resultsList.push({
                    'title': title,
                    'postedTime': postedTime,
                    'episodeLink': relativeLink.startsWith('http') ? relativeLink : 'https://ginisisilacartoon.net/' + relativeLink,
                    'imageUrl': imageUrl
                });
            }
        });

        // ලැයිස්තුව හිස් නම්
        if (resultsList.length === 0) {
            return reply(`❌ ප්‍රතිඵල කිසිවක් හමු වූයේ නැත: *${searchQuery}*\n\n💡 *මතක් කිරීම:* සයිට් එකේ සෙවීමට සිංහල හෝ සිංග්ලිෂ් වචන භාවිතා කරන්න.\n\n*Examples:* \n🔹 \`.cartoon gapi\`\n🔹 \`.cartoon ගාෆීල්ඩ්\`\n🔹 \`.cartoon soora pappa\``);
        }

        // පියවර 2: සෙවුම් ප්‍රතිඵල ලැයිස්තුව යැවීම
        let listMessage = "📺 *Ginisisila Cartoon Search Results* 📺\n\n";
        resultsList.slice(0, 15).forEach((item, index) => { // උපරිම ප්‍රතිඵල 15කට සීමා කර ඇත
            listMessage += `*${index + 1}.* ${item.title}\n🗓️ Posted: ${item.postedTime}\n\n`;
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

            // Listener එක Off කිරීම
            conn.ev.off("messages.upsert", cartoonSelectionListener);
            const selectedCartoon = resultsList[selectedIndex];
            await conn.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            try {
                // පියවර 3: Player (Iframe) එක සෙවීම
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
                detailMessage += `📅 *Posted:* ${selectedCartoon.postedTime}\n`;
                detailMessage += `🔗 *Page:* ${selectedCartoon.episodeLink}\n\n`;
                detailMessage += `📥 *බාගත කර ගැනීමට සූදානම් කිරීමට '1' ලෙස මෙම පණිවිඩයට Reply කරන්න.*`;

                const validImgUrl = selectedCartoon.imageUrl ? (selectedCartoon.imageUrl.startsWith('http') ? selectedCartoon.imageUrl : 'https://ginisisilacartoon.net/' + selectedCartoon.imageUrl) : config.IMG_URL;

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
                        // api-dylux හරහා GDrive Download දත්ත ලබා ගැනීම
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
