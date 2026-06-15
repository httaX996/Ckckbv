const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');
const fs = require('fs');
const path = require('path');

async function createThumbnail(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return await sharp(response.data).resize(300, 300).jpeg({ quality: 80 }).toBuffer();
    } catch (e) {
        return null;
    }
}

function convertDuration(mins) {
    if (!mins) return "N/A";
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
}

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
        if (!q) return reply("📦 Please provide a movie name.\n\nExample:\n.mvbox avengers");

        const searchUrl = `https://apiv1.freehandyflix.online/api/search/${encodeURIComponent(q)}`;
        const { data: searchData } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const moviesList = searchData?.data?.items || [];
        if (!moviesList.length) return reply("❌ No movies found.");

        let text = `🎬 \`ＭＯＶＩＥＢＯＸ  ＳＥＡＲＣＨ\`\n\n🔎 Search: \`${q}\`\n\n`;
        moviesList.forEach((movie, index) => {
            text += `\`${index + 1}\` *|* ❭❭◦ *${movie.title}*\n`;
        });
        text += `\n💡 Reply with the movie number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentMsg = await conn.sendMessage(from, { image: { url: config.IMG_URL }, caption: text }, { quoted: ck });

        const movieSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message?.extendedTextMessage) return;

                const contextInfo = msg.message.extendedTextMessage.contextInfo;
                if (contextInfo?.stanzaId !== sentMsg.key.id) return;

                const selectedMovieIndex = parseInt(msg.message.extendedTextMessage.text.trim()) - 1;
                if (isNaN(selectedMovieIndex) || selectedMovieIndex < 0 || selectedMovieIndex >= moviesList.length) return;

                const selectedMovie = moviesList[selectedMovieIndex];
                await conn.sendMessage(from, { react: { text: "⏳", key: msg.key } });

                const infoUrl = `https://movieapi.chethmina.workers.dev/api/info/${selectedMovie.subjectId}`;
                const sourcesUrl = `https://movieapi.chethmina.workers.dev/api/sources/${selectedMovie.subjectId}`;

                const [infoRes, sourcesRes] = await Promise.all([axios.get(infoUrl), axios.get(sourcesUrl)]);
                const infoJson = typeof infoRes.data === 'string' ? JSON.parse(infoRes.data) : infoRes.data;
                const sourcesJson = typeof sourcesRes.data === 'string' ? JSON.parse(sourcesRes.data) : sourcesRes.data;

                const movieInfo = infoJson?.data?.subject; 
                const movieSources = sourcesJson?.data?.processedSources || [];
                if (!movieInfo) return reply("❌ Failed to fetch movie details.");

                let caption = `🎬 *${movieInfo.title || "N/A"}*\n\n📅 Date: ${movieInfo.releaseDate || "N/A"}\n⭐ IMDb: ${movieInfo.imdbRatingValue || "N/A"}\n⏳ Duration: ${convertDuration(movieInfo.duration)}\n\n📥 *𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗤𝗨𝗔𝗟𝗜𝗧𝗜𝗘𝗦*\n\n`;
                movieSources.forEach((src, i) => {
                    caption += `\`${i + 1}\` *|* ❭❭◦ *${src.quality}p* - ${convertToGB(src.size)}\n`;
                });
                caption += `\n💡 Reply with quality number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍＩＮＡ ＫＡＶＩＳＨＡＮ*`;

                const imageUrl = movieInfo.cover?.url || config.IMG_URL;
                const movieDetailsMessage = await conn.sendMessage(from, { image: { url: imageUrl }, caption }, { quoted: ck });

                const qualityListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message?.extendedTextMessage) return;

                        const contextInfo2 = msg2.message.extendedTextMessage.contextInfo;
                        if (contextInfo2?.stanzaId !== movieDetailsMessage.key.id) return;

                        const qualityIndex = parseInt(msg2.message.extendedTextMessage.text.trim()) - 1;
                        if (isNaN(qualityIndex) || qualityIndex < 0 || qualityIndex >= movieSources.length) return;

                        const selectedSource = movieSources[qualityIndex];
                        // 🌟 අපි හදපු Worker එකේ downloadUrl එක ගන්නවා
                        const workingDownloadUrl = selectedSource.downloadUrl;

                        if (!workingDownloadUrl) return reply("❌ Download link not found.");
                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        const thumb = await createThumbnail(imageUrl);
                        const tempFilePath = path.join(__dirname, `temp_${Date.now()}.mp4`);
                        const writer = fs.createWriteStream(tempFilePath);

                        try {
                            // 🌟 Axios එකෙන් 302 Redirect එක ඔටෝ Follow කරලා ඇත්තම වීඩියෝ එක ඩිස්ක් එකට ලියනවා
                            const responseStream = await axios({
                                method: 'get',
                                url: workingDownloadUrl,
                                responseType: 'stream',
                                timeout: 0,
                                maxRedirects: 5, // Redirects 5ක් වෙනකන් follow කරන්න දෙනවා
                                headers: {
                                    'User-Agent': 'okhttp/4.12.0',
                                    'Referer': 'https://fmoviesunblocked.net/',
                                    'Origin': 'https://fmoviesunblocked.net'
                                }
                            });

                            responseStream.data.pipe(writer);

                            writer.on('finish', async () => {
                                const stats = fs.statSync(tempFilePath);
                                if (stats.size < 5000) {
                                    fs.unlinkSync(tempFilePath);
                                    return reply("❌ Access Denied: Video server blocked the request.");
                                }

                                await conn.sendMessage(from, {
                                    document: fs.readFileSync(tempFilePath), 
                                    mimetype: "video/mp4",
                                    fileName: `${movieInfo.title} [${selectedSource.quality}p].mp4`,
                                    jpegThumbnail: thumb,
                                    caption: `🎬 *${movieInfo.title}*\n\n🎞️ \`Quality:\` *${selectedSource.quality}p*\n📦 \`Size:\` *${convertToGB(selectedSource.size)}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                                }, { quoted: ck });

                                fs.unlinkSync(tempFilePath);
                                await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });
                            });

                            writer.on('error', () => {
                                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                            });

                        } catch (e) {
                            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                            reply(`❌ Connection Failed: ${e.message}`);
                        }
                    } catch (err) { }
                };

                conn.ev.on("messages.upsert", qualityListener);
                setTimeout(() => conn.ev.off("messages.upsert", qualityListener), 600000);
            } catch (err) { }
        };

        conn.ev.on("messages.upsert", movieSelectionListener);
        setTimeout(() => conn.ev.off("messages.upsert", movieSelectionListener), 1200000);
    } catch (err) { reply("❌ Error searching movie."); }
});

const ck = { key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" }, message: { contactMessage: { displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ×͜×", vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nEND:VCARD` } } };
