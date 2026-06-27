const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');

const ck = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
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

cmd({
    pattern: "pupil",
    desc: "Search movies from PupilVideo",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    try {
        if (!q) {
            return reply("🎬 Please provide a movie name.\n\nExample:\n.pupil tentigo");
        }

        // 1. Movie Search API Call
        const searchUrl = `https://ck-api-v1.vercel.app/movie/pupil/search?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const results = data.result || data.data || [];
        if (!results.length) {
            return reply("❌ No movies found.");
        }

        let text = `🎬 *PUPIL MOVIE SEARCH*\n\n`;
        text += `*🔎 Search:* \`${q}\`\n\n`;

        results.forEach((movie, index) => {
            text += `\`${index + 1}\` *|* ❭❭◦ *${movie.title}*\n`;
        });

        text += `\n💡 Reply to this message with the movie number.\n⏱️ This search expires in 10 minutes.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀัน*`;

        const sentMsg = await conn.sendMessage(
            from,
            {
                image: { url: config.IMG_URL || "https://i.ibb.co/689v0p7/movie-default.jpg" },
                caption: text
            },
            { quoted: ck }
        );

        // -------------------------------------------------------------------
        // LISTENER 1: Movie එක තෝරාගැනීම (Expire නොවී නැවත නැවත භාවිතා කළ හැක)
        // -------------------------------------------------------------------
        const movieSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message) return;

                const contextInfo = msg.message.extendedTextMessage?.contextInfo || msg.message.imageMessage?.contextInfo;
                if (contextInfo?.stanzaId !== sentMsg.key.id) return;

                const userReply = (msg.message.extendedTextMessage?.text || msg.message.conversation || "").trim();
                const selectedMovieIndex = parseInt(userReply) - 1;

                if (isNaN(selectedMovieIndex) || selectedMovieIndex < 0 || selectedMovieIndex >= results.length) {
                    return conn.sendMessage(from, { text: "❌ Invalid movie number." }, { quoted: msg });
                }

                const selectedMovie = results[selectedMovieIndex];

                // 2. Movie Info API Call
                const infoUrl = `https://ck-api-v1.vercel.app/movie/pupil/info?url=${encodeURIComponent(selectedMovie.link)}`;
                const infoResponse = await axios.get(infoUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                const apiResponse = infoResponse.data;
                const movieInfo = apiResponse.data || apiResponse.result || apiResponse;
                
                if (!movieInfo) {
                    return conn.sendMessage(from, { text: "❌ Failed to fetch movie details." }, { quoted: msg });
                }

                const directLinks = movieInfo.direct_links || [];
                const telegramLinks = movieInfo.telegram_links || [];
                
                const downloadLinks = [
                    ...directLinks.map(link => ({ ...link, type: 'Direct' })),
                    ...telegramLinks.map(link => ({ ...link, type: 'Telegram' }))
                ];

                let caption = `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n`;
                caption += `📥 \`AVAILABLE DOWNLOAD LINKS\`\n\n`;

                if (downloadLinks.length === 0) {
                    caption += `❌ No links found in API Response.\n`;
                } else {
                    downloadLinks.forEach((dl, i) => {
                        caption += `\`${i + 1}\` *|* ❭❭◦ *[${dl.type}] ${dl.quality} - ${dl.size || "Unknown Size"}*\n`;
                    });
                }

                caption += `\n💡 Reply with the link number to download.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪණා ᴋᴀᴠɪꜱʜᴀɴ*`;

                const moviePoster = movieInfo.image || selectedMovie.image || config.IMG_URL;

                const movieDetailsMessage = await conn.sendMessage(
                    from,
                    {
                        image: { url: moviePoster },
                        caption: caption
                    },
                    { quoted: ck }
                );

                // 🛠️ මෙතන තිබුණු conn.ev.off පේළිය ඉවත් කර ඇති නිසා මැසේජ් එක ලීස්න් කරන එක නතර වෙන්නේ නැත.

                if (downloadLinks.length === 0) return;

                // -------------------------------------------------------------------
                // LISTENER 2: Download කිරීම
                // -------------------------------------------------------------------
                const downloadListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message) return;

                        const contextInfo2 = msg2.message.extendedTextMessage?.contextInfo || msg2.message.imageMessage?.contextInfo;
                        if (contextInfo2?.stanzaId !== movieDetailsMessage.key.id) return;

                        const downloadReply = (msg2.message.extendedTextMessage?.text || msg2.message.conversation || "").trim();
                        const linkIndex = parseInt(downloadReply) - 1;

                        if (isNaN(linkIndex) || linkIndex < 0 || linkIndex >= downloadLinks.length) {
                            return conn.sendMessage(from, { text: "❌ Invalid link number." }, { quoted: msg2 });
                        }

                        const selectedLinkObj = downloadLinks[linkIndex];
                        let rawLink = selectedLinkObj.link || selectedLinkObj.direct_link || selectedLinkObj.url;
                        if (!rawLink) return conn.sendMessage(from, { text: "❌ Download link not found." }, { quoted: msg2 });

                        let finalDownloadLink = rawLink;

                        if (selectedLinkObj.type === 'Telegram') {
                            finalDownloadLink = `https://ck-tg-dl.vercel.app/download?link=${encodeURIComponent(rawLink)}`;
                        } else if (selectedLinkObj.type === 'Direct' && !finalDownloadLink.includes('&download=true')) {
                            finalDownloadLink = `${finalDownloadLink}&download=true`;
                        }

                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        const thumb = await createThumbnail(moviePoster);
                        const cleanTitle = (movieInfo.title || "Movie").replace(/[\\/:*?"<>|]/g, "");
                        const fileName = `${cleanTitle} - ${selectedLinkObj.quality}.mp4`;

                        await conn.sendMessage(
                            from,
                            {
                                document: { url: finalDownloadLink },
                                mimetype: "video/mp4",
                                fileName: fileName,
                                jpegThumbnail: thumb,
                                caption: `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n🎞️ \`Quality:\` *${selectedLinkObj.quality}*\n📦 \`Size:\` *${selectedLinkObj.size || "N/A"}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                            },
                            { quoted: ck }
                        );

                        await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });
                        conn.ev.off("messages.upsert", downloadListener);

                    } catch (err) {
                        console.log(err);
                        conn.sendMessage(from, { text: "❌ Error while downloading." }, { quoted: msg2 });
                    }
                };

                conn.ev.on("messages.upsert", downloadListener);
                setTimeout(() => { conn.ev.off("messages.upsert", downloadListener); }, 120000);

            } catch (err) {
                console.log(err);
                reply("❌ Error while fetching movie details.");
            }
        };

        conn.ev.on("messages.upsert", movieSelectionListener);
        
        // 🛠️ විනාඩි 10කින් (600000ms) පසු සෙවුම් මැසේජ් එක ලීස්න් කිරීම නතර කරයි
        setTimeout(() => { 
            conn.ev.off("messages.upsert", movieSelectionListener); 
        }, 600000);

    } catch (err) {
        console.log(err);
        reply("❌ Error while searching movie.");
    }
});
