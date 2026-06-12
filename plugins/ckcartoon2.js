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
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
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

                // 🛠️ මෙතන තමයි වැදගත්ම දේ: ලින්ක් එක සම්පූර්ණයෙන්ම encode කරනවා
                const encodedMovieLink = encodeURIComponent(selectedMovie.link);
                const infoUrl = `https://ck-api-v1.vercel.app/movie/pupil/info?url=${encodedMovieLink}`;

                // 2. Movie Info API Call (With Headers)
                const infoResponse = await axios.get(infoUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                
                // ලැබෙන Response එක ලොග් එකේ දමාගැනීම
                console.log("=== DETAIL API RESPONSE ===", JSON.stringify(infoResponse.data));

                // දත්ත වෙනස්ම විදිහකට ආවොත් fallback හැදීම
                const movieInfo = infoResponse.data?.result || infoResponse.data?.data || infoResponse.data;
                
                if (!movieInfo) {
                    return reply("❌ API එකෙන් දත්ත ලැබුණේ නැත.");
                }

                const downloadLinks = movieInfo.drive_1 || movieInfo.links || [];

                let caption = `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n`;
                caption += `📥 \`AVAILABLE DOWNLOAD LINKS\`\n\n`;

                if (!downloadLinks || downloadLinks.length === 0) {
                    caption += `❌ No links found inside drive_1.\n`;
                } else {
                    downloadLinks.forEach((dl, i) => {
                        caption += `\`${i + 1}\` *|* ❭❭◦ *${dl.name || "Link"} - ${dl.size || "N/A"}*\n`;
                    });
                }

                caption += `\n💡 Reply with the link number to download.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜ─ᴍɪɴᴀ*`;

                const moviePoster = movieInfo.image || selectedMovie.image || config.IMG_URL;

                const movieDetailsMessage = await conn.sendMessage(
                    from,
                    {
                        image: { url: moviePoster },
                        caption: caption
                    },
                    { quoted: ck }
                );

                if (!downloadLinks || downloadLinks.length === 0) return;

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
                        const rawLink = selectedLinkObj.link || selectedLinkObj.url;
                        
                        if (!rawLink) return reply("❌ Link property not found.");

                        // අගට &download=true එකතු කිරීම
                        const directDownloadLink = `${rawLink}&download=true`;

                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        const thumb = await createThumbnail(moviePoster);

                        const fileName = selectedLinkObj.name || `${movieInfo.title || "Movie"}.mp4`;
                        let mimetype = "video/mp4";
                        if (fileName.toLowerCase().endsWith('.mkv')) {
                            mimetype = "video/x-matroska";
                        }

                        await conn.sendMessage(
                            from,
                            {
                                document: { url: directDownloadLink },
                                mimetype: mimetype,
                                fileName: fileName,
                                jpegThumbnail: thumb,
                                caption: `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n🎞️ \`File:\` *${fileName}*\n📦 \`Size:\` *${selectedLinkObj.size || "N/A"}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
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
