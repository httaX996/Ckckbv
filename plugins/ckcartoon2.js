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

        const searchUrl = `https://ck-api-v1.vercel.app/movie/pupil/search?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl);

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
                image: { url: config.IMG_URL },
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

                // 2. Movie Info API Request
                const infoUrl = `https://ck-api-v1.vercel.app/movie/pupil/info?url=${encodeURIComponent(selectedMovie.link)}`;
                const infoResponse = await axios.get(infoUrl);
                
                // 🛠️ API එකෙන් එන දත්ත ටික ලොග් එකේ බලාගන්න (Debugging)
                console.log("=== API RESPONSE FOR INFO ===");
                console.log(JSON.stringify(infoResponse.data, null, 2));

                const movieInfo = infoResponse.data.result || infoResponse.data.data || infoResponse.data;
                if (!movieInfo) {
                    return reply("❌ Failed to fetch movie details from API.");
                }

                // API එකෙන් එන්න පුළුවන් විවිධ keys check කිරීම (`drive_1` හෝ `links` හෝ `download_links`)
                const downloadLinks = movieInfo.drive_1 || movieInfo.links || movieInfo.download_links || [];

                let caption = `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n`;
                caption += `📥 \`AVAILABLE DOWNLOAD LINKS\`\n\n`;

                if (downloadLinks.length === 0) {
                    caption += `❌ No links found in API Response.\n`;
                } else {
                    downloadLinks.forEach((dl, i) => {
                        caption += `\`${i + 1}\` *|* ❭❭◦ *${dl.name || dl.quality} - ${dl.size || "Unknown Size"}*\n`;
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

                // ලින්ක්ස් තිබුනොත් විතරක් ඊළඟ Listener එක වැඩ කරන්න සලස්වමු
                if (downloadLinks.length === 0) return;

                // -------------------------------------------------------------------
                // LISTENER 2: Quality/Link එක තෝරාගෙන Download කිරීම
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
                        
                        // ලින්ක් එක තිබෙන්නේ .link ද නැතහොත් .url ද කියා බැලීම
                        const rawLink = selectedLinkObj.link || selectedLinkObj.url;
                        if (!rawLink) return reply("❌ Download link not found in object.");

                        const directDownloadLink = `${rawLink}&download=true`;

                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        const thumb = await createThumbnail(moviePoster);

                        const fileName = selectedLinkObj.name || `${movieInfo.title || "Movie"}.mp4`;
                        let mimetype = "video/mp4";
                        if (fileName.toLowerCase().endsWith('.mkv')) {
                            mimetype = "video/x-matroska";
                        } else if (fileName.toLowerCase().endsWith('.zip')) {
                            mimetype = "application/zip";
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
                        reply("❌ Error while processing your download.");
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
