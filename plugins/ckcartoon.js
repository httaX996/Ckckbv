const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp'); // Image thumbnail එක සෑදීම සඳහා
const fg = require("api-dylux"); // නව Google Drive Downloader පැකේජය
const config = require('../config');

// 🖼️ කාටූන් පෝස්ටරය කුඩා කර Thumbnail (Buffer) එකක් සාදන ශ්‍රිතය
async function createThumbnail(url) {
    try {
        if (!url) return null;
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        return await sharp(response.data)
            .resize(300, 300)
            .jpeg({ quality: 60 })
            .toBuffer();

    } catch (e) {
        console.log('Thumbnail Error:', e);
        return null;
    }
}

cmd({
    pattern: "cartoon",
    react: "📑",
    category: "download",
    desc: "Search and download cartoons from ginisisilacartoon.net",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        const searchQuery = q ? q.trim() : "";
        if (!searchQuery) return reply("*Please provide a search query! (e.g., Garfield)*");

        // පියවර 1: වෙබ් අඩවියෙන් සෙවීම
        const searchUrl = "https://ginisisilacartoon.net/search.php?q=" + encodeURIComponent(searchQuery);
        const searchResponse = await axios.get(searchUrl);
        const $searchPage = cheerio.load(searchResponse.data);
        let resultsList = [];

        $searchPage("div.inner-video-cell").each((index, element) => {
            const title = $searchPage(element).find("div.video-title > a").attr('title');
            const postedTime = $searchPage(element).find("div.posted-time").text().trim();
            const relativeLink = $searchPage(element).find("div.video-title > a").attr("href");
            const imageUrl = $searchPage(element).find("div.inner-video-thumb-wrapper img").attr('src');

            if (title && relativeLink) {
                resultsList.push({
                    'title': title,
                    'postedTime': postedTime,
                    'episodeLink': 'https://ginisisilacartoon.net/' + relativeLink,
                    'imageUrl': imageUrl
                });
            }
        });

        if (resultsList.length === 0) {
            return reply("❌ ප්‍රතිඵල කිසිවක් හමු වූයේ නැත: " + searchQuery);
        }

        // පියවර 2: සෙවුම් ප්‍රතිඵල ලැයිස්තුව යැවීම
        let listMessage = "📺 *Ginisisila Cartoon Search Results* 📺\n\n";
        resultsList.forEach((item, index) => {
            listMessage += `*${index + 1}.* ${item.title}\n🗓️ Posted: ${item.postedTime}\n\n`;
        });
        listMessage += "ℹ️ *ඉහත ලැයිස්තුවෙන් අවශ්‍ය කොටසේ අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.*";

        const sentListMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL || `https://i.ibb.co/zHLW3WL/044e155205d4f11c.jpg` },
            caption: listMessage,
            contextInfo: { forwardingScore: 999, isForwarded: false }
        }, { quoted: mek });


        // 1 වන Listener එක: කාටූන් එක තේරීම (Cartoon Selection Listener)
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

            // වලංගු අංකයක් නම් පළමු Listener එක නවත්වනවා
            conn.ev.off("messages.upsert", cartoonSelectionListener);
            const selectedCartoon = resultsList[selectedIndex];
            await conn.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            try {
                // පියවර 3: තෝරාගත් කාටූන් පිටුවට ගොස් Player (Iframe) එක සෙවීම
                const episodePageResponse = await axios.get(selectedCartoon.episodeLink);
                const $episodePage = cheerio.load(episodePageResponse.data);
                const iframeSrc = $episodePage("div#player-holder iframe").attr("src");

                if (!iframeSrc) {
                    return conn.sendMessage(from, { text: "❌ මෙම කොටස සඳහා වීඩියෝ ලින්ක් එකක් හමු වූයේ නැත." }, { quoted: msg });
                }

                // පියවර 4: විස්තර තහවුරු කිරීමේ පණිවිඩය (Confirmation & Quality screen)
                let detailMessage = `🎬 *${selectedCartoon.title}*\n\n`;
                detailMessage += `📅 *Posted:* ${selectedCartoon.postedTime}\n`;
                detailMessage += `🔗 *Page:* ${selectedCartoon.episodeLink}\n\n`;
                detailMessage += `📥 *බාගත කර ගැනීමට සූදානම් කිරීමට '1' ලෙස මෙම පණිවිඩයට Reply කරන්න.*`;

                const detailSentMsg = await conn.sendMessage(from, {
                    image: { url: selectedCartoon.imageUrl || config.IMG_URL },
                    caption: detailMessage,
                    contextInfo: { forwardingScore: 999, isForwarded: false }
                }, { quoted: msg });


                // 2 වන Listener එක: බාගත කිරීම තහවුරු කිරීම (Download Trigger Listener)
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
                        // 🛠️ api-dylux හරහා සෘජු Google Drive Download දත්ත ලබා ගැනීම
                        const gdriveData = await fg.GDriveDl(iframeSrc);

                        if (gdriveData && gdriveData.downloadUrl) {
                            // 🌟 පෝස්ටරය ඇසුරෙන් Thumbnail Buffer එක සෑදීම
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
                            await conn.sendMessage(from, { text: "❌ මෙම Google Drive ලින්ක් එක බාගත කිරීමට නොහැකි විය. (Private හෝ Invalid විය හැක)" }, { quoted: dlMsg });
                        }

                    } catch (err) {
                        console.error('Error fetching/sending document:', err);
                        await conn.sendMessage(from, { react: { text: '❌', key: dlMsg.key } });
                        return conn.sendMessage(from, { text: "❗ සන්නිවේදන දෝෂයකි. වීඩියෝව බාගත කිරීමට නොහැකි විය." }, { quoted: dlMsg });
                    }
                };

                conn.ev.on("messages.upsert", downloadListener);
                setTimeout(() => { conn.ev.off("messages.upsert", downloadListener); }, 60000); // Timeout වෙනුවෙන් විනාඩියක්

            } catch (scrapeError) {
                console.error(scrapeError);
                return conn.sendMessage(from, { text: "❌ මෙම පිටුවේ දත්ත කියවීමට නොහැකි විය." }, { quoted: msg });
            }
        };

        conn.ev.on("messages.upsert", cartoonSelectionListener);
        setTimeout(() => { conn.ev.off("messages.upsert", cartoonSelectionListener); }, 60000); // Timeout වෙනුවෙන් විනාඩියක්

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`❗ Error: ${e.message}`);
    }
});
