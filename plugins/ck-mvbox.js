const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');
const fs = require('fs');
const path = require('path');

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

        // 1. Movie Search API (Freehandyflix)
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

        let text = `🎬 \`ＭＯＶＩＥＢＯＸ  ＳＥＡＲＣＨ\`\n\n`;
        text += `*🔎 Search:* \`${q}\`\n\n`;

        moviesList.forEach((movie, index) => {
            text += `\`${index + 1}\` *|* ❭❭◦ *${movie.title}*\n`;
        });

        text += `\n💡 Reply with the movie number. (Multi-reply enabled)\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇ🇹ʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

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

                // 🌟 Info එක Worker එකෙනුත්, Sources එක Vercel එකෙනුත් ගන්නවා
                const infoUrl = `https://movieapi.chethmina.workers.dev/api/info/${subjectId}`;
                const sourcesUrl = `https://moviebox-api-pi.vercel.app/api/sources/${subjectId}`;

                const [infoRes, sourcesRes] = await Promise.all([
                    axios.get(infoUrl),
                    axios.get(sourcesUrl)
                ]);

                const infoJson = typeof infoRes.data === 'string' ? JSON.parse(infoRes.data) : infoRes.data;
                const sourcesJson = typeof sourcesRes.data === 'string' ? JSON.parse(sourcesRes.data) : sourcesRes.data;

                // 🎯 𝗙𝗜𝗫𝗘𝗗: Worker එකේ data.subject තියෙන්නේ, Vercel එකේ downloads තියෙන්නේ
                const movieInfo = infoJson?.data?.subject || infoJson?.subject; 
                const movieSources = sourcesJson?.downloads || sourcesJson?.data?.downloads || [];

                if (!movieInfo) {
                    return reply("❌ Failed to fetch movie details from Worker API.");
                }
                
                if (!movieSources || !movieSources.length) {
                    return reply("❌ No download links available from Vercel API.");
                }

                // 🌟 ඔයාගේම Original ලස්සන සිංහල Layout එක
                let caption = `*🎬 MOVIE DETAILS 🎬*\n\n`;
                caption += `*🏷️ Title :* ${movieInfo.title || "N/A"}\n`;
                caption += `*📆 Release :* ${movieInfo.releaseDate || "N/A"}\n`;
                caption += `*⭐ Rating :* ${movieInfo.imdbRatingValue || "N/A"}\n`;
                caption += `*⏳ Duration :* ${convertDuration(movieInfo.duration)}\n`;
                caption += `*🌐 Country :* ${movieInfo.countryName || "N/A"}\n`;
                caption += `*🎭 Genres :* ${movieInfo.genre || "N/A"}\n\n`;
                caption += `*📥 DOWNLOAD LINKS 📥*\n\n`;

                movieSources.forEach((src, i) => {
                    const resQuality = src.resolution || "Unknown";
                    caption += `*${i + 1} ||* ${resQuality}p (${convertToGB(src.size)})\n`;
                });

                caption += `\n*Reply With Number To Download Video* 📥\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇ🇹ʜᴍɪɴᴀ ᴋᴀᴠɪส์ʜᴀɴ*`;

                const imageUrl = movieInfo.cover?.url || config.IMG_URL;

                const movieDetailsMessage = await conn.sendMessage(
                    from,
                    {
                        image: { url: imageUrl },
                        caption: caption
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
                        const directDownloadUrl = selectedSource.url;

                        if (!directDownloadUrl) {
                            return reply("❌ Download link not found in this quality.");
                        }

                        // Downloading reaction
                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        const thumb = await createThumbnail(imageUrl);
                        
                        // Storage Stream method
                        const tempFilePath = path.join(__dirname, `temp_${Date.now()}.mp4`);
                        const writer = fs.createWriteStream(tempFilePath);

                        try {
                            // 🌟 ඔයා දීපු 100% වැඩ කරන MovieBox App Headers
                            const responseStream = await axios({
                                method: 'get',
                                url: directDownloadUrl,
                                responseType: 'stream',
                                timeout: 0,
                                maxRedirects: 5,
                                headers: {
                                    'X-Client-Info': '{"timezone":"Africa/Nairobi"}',
                                    'Accept-Language': 'en-US,en;q=0.5',
                                    'Accept': 'application/json',
                                    'User-Agent': 'okhttp/4.12.0', // 🎯 Android App Spoofing
                                    'Referer': 'https://h5.aoneroom.com',
                                    'Host': 'h5.aoneroom.com',
                                    'Connection': 'keep-alive',
                                    'X-Forwarded-For': '1.1.1.1',
                                    'CF-Connecting-IP': '1.1.1.1',
                                    'X-Real-IP': '1.1.1.1'
                                }
                            });

                            responseStream.data.pipe(writer);

                            writer.on('finish', async () => {
                                const stats = fs.statSync(tempFilePath);
                                
                                // 0.2 KB Blocked HTML check
                                if (stats.size < 5000) { 
                                    fs.unlinkSync(tempFilePath);
                                    return reply("❌ Access Denied: MovieBox server rejected the stream request.");
                                }

                                const finalRes = selectedSource.resolution || "Unknown";

                                // වීඩියෝ එක යද්දී වැටෙන මැසේජ් එක (Original Style)
                                let videoCaption = `*🎬 ${movieInfo.title} *\n\n`;
                                videoCaption += `*🎞️ Quality :* ${finalRes}p\n`;
                                videoCaption += `*📦 Size :* ${convertToGB(selectedSource.size)}\n\n`;
                                videoCaption += `> 👨🏻‍💻 *ᴄʜᴇ🇹ʜᴍɪɴᴀ ᴋᴀᴠɪส์ʜᴀɴ*`;

                                await conn.sendMessage(
                                    from,
                                    {
                                        document: fs.readFileSync(tempFilePath), 
                                        mimetype: "video/mp4",
                                        fileName: `${movieInfo.title} [${finalRes}p].mp4`,
                                        jpegThumbnail: thumb,
                                        caption: videoCaption
                                    },
                                    { quoted: ck }
                                );

                                // Temp file එක මකා දැමීම
                                fs.unlinkSync(tempFilePath);

                                // Success reaction
                                await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });
                            });

                            writer.on('error', (err) => {
                                console.log("Writer Error:", err.message);
                                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                                reply(`❌ Local file system write error.`);
                            });

                        } catch (axiosErr) {
                            console.log("Axios Error:", axiosErr.message);
                            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                            reply(`❌ Connection Failed with MovieBox Video Server.`);
                        }

                    } catch (err) {
                        console.log("Quality Listener General Error:", err.message);
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
            displayName: "〴ᴄʜᴇ🇹ʜᴍɪɴᴀ ×͜×",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nEND:VCARD`
        }
    }
};

