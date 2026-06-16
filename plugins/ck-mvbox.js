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

                // 2. Fetching from Info & Sources APIs
                const infoUrl = `https://movieapi.chethmina.workers.dev/api/info/${subjectId}`;
                const sourcesUrl = `https://movieapi.chethmina.workers.dev/api/sources/${subjectId}`;

                const [infoRes, sourcesRes] = await Promise.all([
                    axios.get(infoUrl),
                    axios.get(sourcesUrl)
                ]);

                const infoJson = typeof infoRes.data === 'string' ? JSON.parse(infoRes.data) : infoRes.data;
                const sourcesJson = typeof sourcesRes.data === 'string' ? JSON.parse(sourcesRes.data) : sourcesRes.data;

                const movieInfo = infoJson?.data?.subject; 
                
                // 🌟 වැදගත්: ඔයාගේ Worker එකේ තියෙන්නේ downloads කියන Array එකයි
                const movieSources = sourcesJson?.data?.downloads || sourcesJson?.data?.processedSources || [];

                if (!movieInfo) {
                    return reply("❌ Failed to fetch movie details.");
                }

                // 🌟 𝗢𝗥𝗜𝗚𝗜𝗡𝗔𝗟 𝗖𝗔𝗣𝗧𝗜𝗢𝗡 𝗗𝗘𝗦𝗜𝗚𝗡 (ඔයාගේ මුල්ම ලස්සන සිංහල Layout එක)
                let caption = `*🎬 MOVIE DETAILS 🎬*\n\n`;
                caption += `*🏷️ Title :* ${movieInfo.title || "N/A"}\n`;
                caption += `*📆 Release :* ${movieInfo.releaseDate || "N/A"}\n`;
                caption += `*⭐ Rating :* ${movieInfo.imdbRatingValue || "N/A"}\n`;
                caption += `*⏳ Duration :* ${convertDuration(movieInfo.duration)}\n`;
                caption += `*🌐 Country :* ${movieInfo.countryName || "N/A"}\n`;
                caption += `*🎭 Genres :* ${movieInfo.genre || "N/A"}\n\n`;
                caption += `*📥 DOWNLOAD LINKS 📥*\n\n`;

                movieSources.forEach((src, i) => {
                    // resolution හෝ quality කියන දෙකෙන් තියෙන එකක් තෝරා ගනී (undefinedp වීම වැළැක්වීමට)
                    const resQuality = src.resolution || src.quality || "Unknown";
                    caption += `*${i + 1} ||* ${resQuality}p (${convertToGB(src.size)})\n`;
                });

                caption += `\n*Reply With Number To Download Video* 📥\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

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
                        
                        // 🌟 Worker එකේ තියෙන Direct වීඩියෝ ලින්ක් එක (url හෝ directUrl)
                        const directDownloadUrl = selectedSource.url || selectedSource.directUrl || selectedSource.downloadUrl;

                        if (!directDownloadUrl) {
                            return reply("❌ Download link not found.");
                        }

                        // Downloading reaction
                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        const thumb = await createThumbnail(imageUrl);
                        
                        // සර්වර් එක Crash වෙන්නේ නැති වෙන්න Temporary ෆයිල් එකක් හදනවා
                        const tempFilePath = path.join(__dirname, `temp_${Date.now()}.mp4`);
                        const writer = fs.createWriteStream(tempFilePath);

                        try {
                            // 🌟 ඔයා දීපු 100% ක් සාර්ථක නිවැරදි Android Headers ටික කෙලින්ම මෙතනට දැම්මා!
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
                                    'User-Agent': 'okhttp/4.12.0', // 🎯 App එක විදිහටම රික්වෙස්ට් එක යනවා
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
                                
                                // බ්ලොක් එකක්ද කියලා පරික්ෂා කිරීම
                                if (stats.size < 5000) { 
                                    fs.unlinkSync(tempFilePath);
                                    return reply("❌ Access Denied: Video server rejected the download stream.");
                                }

                                const finalRes = selectedSource.resolution || selectedSource.quality || "Unknown";

                                // වීඩියෝ එක යද්දී වැටෙන මැසේජ් එක (Original Style)
                                let videoCaption = `*🎬 ${movieInfo.title} *\n\n`;
                                videoCaption += `*🎞️ Quality :* ${finalRes}p\n`;
                                videoCaption += `*📦 Size :* ${convertToGB(selectedSource.size)}\n\n`;
                                videoCaption += `> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

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

                                // වැඩේ ඉවර වුණාම සර්වර් එකෙන් Temp ෆයිල් එක මකනවා
                                fs.unlinkSync(tempFilePath);

                                // Success reaction
                                await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });
                            });

                            writer.on('error', (err) => {
                                console.log("Writer Error:", err.message);
                                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                                reply(`❌ File write error.`);
                            });

                        } catch (axiosErr) {
                            console.log("Axios Error:", axiosErr.message);
                            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                            reply(`❌ Connection Failed with MovieBox Server.`);
                        }

                    } catch (err) {
                        console.log("General Quality Listener Error:", err.message);
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
