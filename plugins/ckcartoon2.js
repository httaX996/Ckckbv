const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');

// Thumbnail Generate කිරීමේ Function එක
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
            return reply("🎬 Please provide a movie name.\n\nExample:\n.pupil deadpool");
        }

        // 1. Movie Search API Request
        const searchUrl = `https://ck-api-v1.vercel.app/movie/pupil/search?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl);

        // API response එක valid ද කියා බැලීම (result හෝ data array එකක් තිබේදැයි check කිරීම)
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

        // පළමු මැසේජ් එක යැවීම
        const sentMsg = await conn.sendMessage(
            from,
            {
                image: { url: config.IMG_URL || movie.image },
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
                if (!msg.message?.extendedTextMessage) return;
                if (msg.message.extendedTextMessage.contextInfo?.stanzaId !== sentMsg.key.id) return;

                const userReply = msg.message.extendedTextMessage.text.trim();
                const selectedMovieIndex = parseInt(userReply) - 1;

                if (selectedMovieIndex < 0 || selectedMovieIndex >= results.length) {
                    return reply("❌ Invalid movie number.");
                }

                const selectedMovie = results[selectedMovieIndex];

                // 2. Movie Info API Request
                const infoUrl = `https://ck-api-v1.vercel.app/movie/pupil/info?url=${encodeURIComponent(selectedMovie.link)}`;
                const infoResponse = await axios.get(infoUrl);
                
                const movieInfo = infoResponse.data.result || infoResponse.data.data || infoResponse.data;
                if (!movieInfo) {
                    return reply("❌ Failed to fetch movie details.");
                }

                // Drive_1 යටතේ ඇති Links ලබා ගැනීම
                const downloadLinks = movieInfo.drive_1 || [];

                let caption = `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n`;
                caption += `📥 \`AVAILABLE DOWNLOAD LINKS\`\n\n`;

                downloadLinks.forEach((dl, i) => {
                    caption += `\`${i + 1}\` *|* ❭❭◦ *${dl.name} - ${dl.size || "Unknown Size"}*\n`;
                });

                caption += `\n💡 Reply with the link number to download.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                const moviePoster = movieInfo.image || selectedMovie.image;

                // දෙවන මැසේජ් එක (Movie Poster + Download Links) යැවීම
                const movieDetailsMessage = await conn.sendMessage(
                    from,
                    {
                        image: { url: moviePoster },
                        caption: caption
                    },
                    { quoted: ck }
                );

                // -------------------------------------------------------------------
                // LISTENER 2: Quality/Link එක තෝරාගෙන Download කිරීම
                // -------------------------------------------------------------------
                const downloadListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message?.extendedTextMessage) return;
                        if (msg2.message.extendedTextMessage.contextInfo?.stanzaId !== movieDetailsMessage.key.id) return;

                        const downloadReply = msg2.message.extendedTextMessage.text.trim();
                        const linkIndex = parseInt(downloadReply) - 1;

                        if (linkIndex < 0 || linkIndex >= downloadLinks.length) {
                            return reply("❌ Invalid link number.");
                        }

                        const selectedLinkObj = downloadLinks[linkIndex];
                        
                        // අවසානයට &download=true එකතු කිරීම
                        const directDownloadLink = `${selectedLinkObj.link}&download=true`;

                        // Reaction එකක් දමමු (Downloading...)
                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        // Thumbnail එක සකසා ගැනීම
                        const thumb = await createThumbnail(moviePoster);

                        // File Extension එක අනුව Mimetype එක වෙන් කරගැනීම (e.g., .mkv, .mp4)
                        let mimetype = "video/mp4"; // default
                        if (selectedLinkObj.name.toLowerCase().endsWith('.mkv')) {
                            mimetype = "video/x-matroska";
                        } else if (selectedLinkObj.name.toLowerCase().endsWith('.zip')) {
                            mimetype = "application/zip";
                        }

                        // Document එකක් ලෙස යැවීම
                        await conn.sendMessage(
                            from,
                            {
                                document: { url: directDownloadLink },
                                mimetype: mimetype,
                                fileName: selectedLinkObj.name || `${movieInfo.title}.mp4`,
                                jpegThumbnail: thumb,
                                caption: `🎬 \`${movieInfo.title}\`\n\n📦 \`Size:\` *${selectedLinkObj.size}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                            },
                            { quoted: ck }
                        );

                        // Reaction එකක් දමමු (Done)
                        await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });

                    } catch (err) {
                        console.log(err);
                        reply("❌ Error while processing your download.");
                    }
                };

                // Quality Listener එක සක්‍රීය කිරීම (විනාඩි 2කින් අක්‍රීය වේ)
                conn.ev.on("messages.upsert", downloadListener);
                setTimeout(() => { conn.ev.off("messages.upsert", downloadListener); }, 120000);

            } catch (err) {
                console.log(err);
                reply("❌ Error while fetching movie details.");
            }
        };

        // Movie Selection Listener එක සක්‍රීය කිරීම (විනාඩි 2කින් අක්‍රීය වේ)
        conn.ev.on("messages.upsert", movieSelectionListener);
        setTimeout(() => { conn.ev.off("messages.upsert", movieSelectionListener); }, 120000);

    } catch (err) {
        console.log(err);
        reply("❌ Error while searching movie.");
    }
});

// Fake Quotation Context Object
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
