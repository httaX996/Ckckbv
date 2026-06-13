const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');

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

        text += `\n💡 Reply to this message with the movie number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentMsg = await conn.sendMessage(
            from,
            {
                image: { url: config.IMG_URL || "https://i.ibb.co/689v0p7/movie-default.jpg" },
                caption: text
            },
            { quoted: ck }
        );

        // -------------------------------------------------------------------
        // LISTENER 1: Movie එක තෝරාගැනීම
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
                    return reply("❌ Invalid movie number.");
                }

                const selectedMovie = results[selectedMovieIndex];

                // 2. Movie Info API Call
                const infoUrl = `https://ck-api-v1.vercel.app/movie/pupil/info?url=${encodeURIComponent(selectedMovie.link)}`;
                const infoResponse = await axios.get(infoUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                const apiResponse = infoResponse.data;
                
                // 🛠️ ඔයා එවපු අලුත් JSON එකට අනුව data Object එක ඇතුලට යනවා
                const movieInfo = apiResponse.data || apiResponse.result || apiResponse;
                if (!movieInfo) {
                    return reply("❌ Failed to fetch movie details.");
                }

                // 🛠️ අලුත් JSON එකේ තියෙන්නේ `downloads` කියන array එකයි
                const downloadLinks = movieInfo.downloads || [];

                let caption = `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n`;
                caption += `📥 \`AVAILABLE DOWNLOAD LINKS\`\n\n`;

                if (downloadLinks.length === 0) {
                    caption += `❌ No links found in API Response.\n`;
                } else {
                    downloadLinks.forEach((dl, i) => {
                        // 🛠️ JSON එකේ තියෙන quality සහ size ලබා ගැනීම
                        caption += `\`${i + 1}\` *|* ❭❭◦ *${dl.quality} - ${dl.size || "Unknown Size"}*\n`;
                    });
                }

                caption += `\n💡 Reply with the link number to download.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                const moviePoster = movieInfo.image || selectedMovie.image || config.IMG_URL;

                const movieDetailsMessage = await conn.sendMessage(
                    from,
                    {
                        image: { url: moviePoster },
                        caption: caption
                    },
                    { quoted: ck }
                );

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
                            return reply("❌ Invalid link number.");
                        }

                        const selectedLinkObj = downloadLinks[linkIndex];
                        
                        // 🛠️ අලුත් JSON එකට අනුව ලින්ක් එක ගන්නේ `direct_link` වලින්
                        let rawLink = selectedLinkObj.direct_link || selectedLinkObj.link || selectedLinkObj.url;
                        if (!rawLink) return reply("❌ Download link not found.");

                        // ඔයාගේ API එකේ දැනටමත් &download=true තියෙන නිසා, නැවත එකතු නොවී තිබේ නම් පමණක් එකතු කරයි
                        let directDownloadLink = rawLink;
                        if (!directDownloadLink.includes('&download=true')) {
                            directDownloadLink = `${directDownloadLink}&download=true`;
                        }

                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        const thumb = await createThumbnail(moviePoster);

                        // File name එක විදියට movie title එක සහ quality එක සකසමු
                        const cleanTitle = (movieInfo.title || "Movie").replace(/[\\/:*?"<>|]/g, ""); // වැරදි අකුරු අයින් කරන්න
                        const fileName = `${cleanTitle} - ${selectedLinkObj.quality}.mp4`;
                        
                        let mimetype = "video/mp4";

                        await conn.sendMessage(
                            from,
                            {
                                document: { url: directDownloadLink },
                                mimetype: mimetype,
                                fileName: fileName,
                                jpegThumbnail: thumb,
                                caption: `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n🎞️ \`Quality:\` *${selectedLinkObj.quality}*\n📦 \`Size:\` *${selectedLinkObj.size || "N/A"}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                            },
                            { quoted: ck }
                        );

                        await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });

                    } catch (err) {
                        console.log(err);
                        reply("❌ Error while downloading.");
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
        setTimeout(() => { conn.ev.off("messages.upsert", movieSelectionListener); }, 120000);

    } catch (err) {
        console.log(err);
        reply("❌ Error while searching movie.");
    }
});

const ck = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: {
        contactMessage: {
            displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ×͜×",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nORG:META AI;\nTEL;type=CELL;type=VOICE;waid=13135550002:+13135550002\nEND:VCARD`
        }
    }
};
