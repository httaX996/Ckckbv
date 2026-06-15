const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');

// Thumbnail එක හදාගන්න function එක
async function createThumbnail(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        return await sharp(response.data)
            .resize(300, 300)
            .jpeg({ quality: 80 })
            .toBuffer();

    } catch (e) {
        console.log('Thumbnail Error:', e);
        return null;
    }
}

// මිනිත්තු ගණන පැය සහ මිනිත්තු වලට හැරවීම
function convertDuration(mins) {
    if (!mins) return "N/A";
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
}

// Bytes අගය GB වලට හරවා ගැනීම
function convertToGB(bytes) {
    if (!bytes) return "N/A";
    const sizeInGB = parseFloat(bytes) / (1024 * 1024 * 1024);
    if (isNaN(sizeInGB)) return bytes;
    return `${sizeInGB.toFixed(2)} GB`;
}

cmd({
    pattern: "mvbox",
    desc: "Search movies from MovieBox API",
    category: "movie",
    react: "📦",
    filename: __filename
},
async (conn, mek, m, { from, sender, q, reply }) => {

    try {

        if (!q) {
            return reply("📦 Please provide a movie name.\n\nExample:\n.mvbox avengers");
        }

        // 1. Movie Search API
        const searchUrl = `https://apiv1.freehandyflix.online/api/search/${encodeURIComponent(q)}`;
        const { data: searchData } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const moviesList = searchData?.data?.items || [];

        if (!moviesList || !moviesList.length) {
            return reply("❌ No movies found.");
        }

        let text = `🎬 \`𝗠𝗢𝗩𝗜𝗘𝗕𝗢𝗫 𝗦𝗘𝗔𝗥𝗖𝗛\`\n\n`;
        text += `*🔎 Search:* \`${q}\`\n\n`;

        moviesList.forEach((movie, index) => {
            text += `\`${index + 1}\` *|* ❭❭◦ *${movie.title}*\n`;
        });

        text += `\n💡 Reply with the movie number. (Multi-reply enabled)\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentMsg = await conn.sendMessage(
            from,
            {
                image: { url: config.IMG_URL },
                caption: text
            },
            { quoted: ck }
        );

        // Movie Selection Listener
        const movieSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message?.extendedTextMessage) return;

                const contextInfo = msg.message.extendedTextMessage.contextInfo;
                if (contextInfo?.stanzaId !== sentMsg.key.id) return;

                const userReply = msg.message.extendedTextMessage.text.trim();
                const selectedMovieIndex = parseInt(userReply) - 1;

                if (isNaN(selectedMovieIndex) || selectedMovieIndex < 0 || selectedMovieIndex >= moviesList.length) {
                    return; 
                }

                const selectedMovie = moviesList[selectedMovieIndex];
                const subjectId = selectedMovie.subjectId; 

                // Loading Reaction
                await conn.sendMessage(from, { react: { text: "⏳", key: msg.key } });

                // 2. Fetching from 1st (Info) & 2nd (Sources) APIs
                const infoUrl = `https://movieapi.chethmina.workers.dev/api/info/${subjectId}`;
                const sourcesUrl = `https://movieapi.chethmina.workers.dev/api/sources/${subjectId}`;

                const [infoRes, sourcesRes] = await Promise.all([
                    axios.get(infoUrl),
                    axios.get(sourcesUrl)
                ]);

                const infoJson = typeof infoRes.data === 'string' ? JSON.parse(infoRes.data) : infoRes.data;
                const sourcesJson = typeof sourcesRes.data === 'string' ? JSON.parse(sourcesRes.data) : sourcesRes.data;

                const movieInfo = infoJson?.data?.subject; 
                const movieSources = sourcesJson?.data?.processedSources || [];

                if (!movieInfo) {
                    return reply("❌ Failed to fetch movie details.");
                }

                let caption = `🎬 *${movieInfo.title || "N/A"}*\n\n`;
                caption += `📅 *Release Date:* ${movieInfo.releaseDate || "N/A"}\n`;
                caption += `⭐ *IMDb Rating:* ${movieInfo.imdbRatingValue || "N/A"}\n`;
                caption += `⏳ *Duration:* ${convertDuration(movieInfo.duration)}\n`;
                caption += `🌍 *Country:* ${movieInfo.countryName || "N/A"}\n`;
                caption += `🎭 *Genre:* ${movieInfo.genre || "N/A"}\n\n`;
                caption += `📥 *𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗤𝗨𝗔𝗟𝗜𝗧𝗜𝗘𝗦*\n\n`;

                movieSources.forEach((src, i) => {
                    caption += `\`${i + 1}\` *|* ❭❭◦ *${src.quality}p* - ${convertToGB(src.size)}\n`;
                });

                caption += `\n💡 Reply with the quality number to download.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                const imageUrl = movieInfo.cover?.url || config.IMG_URL;

                const movieDetailsMessage = await conn.sendMessage(
                    from,
                    {
                        image: { url: imageUrl },
                        caption
                    },
                    { quoted: ck }
                );

                // Quality Listener
                const qualityListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message?.extendedTextMessage) return;

                        const contextInfo2 = msg2.message.extendedTextMessage.contextInfo;
                        if (contextInfo2?.stanzaId !== movieDetailsMessage.key.id) return;

                        const qualityReply = msg2.message.extendedTextMessage.text.trim();
                        const qualityIndex = parseInt(qualityReply) - 1;

                        if (isNaN(qualityIndex) || qualityIndex < 0 || qualityIndex >= movieSources.length) {
                            return;
                        }

                        const selectedSource = movieSources[qualityIndex];
                        
                        // 🌟 FIX: Worker එකේ ලින්ක් එක වෙනුවට, ඔරිජිනල්ම වීඩියෝ ලින්ක් එක (directUrl) කෙලින්ම ගන්නවා!
                        const finalDownloadUrl = selectedSource.directUrl || selectedSource.downloadUrl;

                        if (!finalDownloadUrl) {
                            return reply("❌ Video link not found.");
                        }

                        // Downloading reaction
                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        // බොට් රන් වෙන සර්වර් එක ඇතුළට සම්පූර්ණ ෆයිල් එකම බෆර් එකක් විදිහට බානවා (ටෙලිග්‍රෑම් එක වගේම)
                        const downloadResponse = await axios.get(finalDownloadUrl, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                'Accept': '*/*'
                            },
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity
                        });

                        const thumb = await createThumbnail(imageUrl);

                        // බාගත්ත පිරිසිදු දත්ත (Buffer) එක කෙලින්ම WhatsApp එකට දෙනවා
                        await conn.sendMessage(
                            from,
                            {
                                document: Buffer.from(downloadResponse.data), 
                                mimetype: "video/mp4",
                                fileName: `${movieInfo.title} [${selectedSource.quality}p].mp4`,
                                jpegThumbnail: thumb,
                                caption: `🎬 *${movieInfo.title}*\n\n🎞️ \`Quality:\` *${selectedSource.quality}p*\n📦 \`Size:\` *${convertToGB(selectedSource.size)}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                            },
                            { quoted: ck }
                        );

                        // Success reaction
                        await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });

                    } catch (err) {
                        console.log("Download Error Log:", err.message);
                        reply(`❌ Download Failed: ${err.message}`);
                    }
                };

                conn.ev.on("messages.upsert", qualityListener);

                setTimeout(() => {
                    conn.ev.off("messages.upsert", qualityListener);
                }, 600000);

            } catch (err) {
                console.log(err);
                reply("❌ Error while processing movie info.");
            }
        };

        conn.ev.on("messages.upsert", movieSelectionListener);

        setTimeout(() => {
            conn.ev.off("messages.upsert", movieSelectionListener);
        }, 1200000);

    } catch (err) {
        console.log("MovieBox Error Log:", err.message);
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
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};
