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

// මිනිත්තු ගණන පැය සහ මිනිත්තු වලට හැරවීම (e.g., 8940 -> 149h 0m)
function convertDuration(mins) {
    if (!mins) return "N/A";
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
}

// Bytes අගය GB වලට හරවා ගැනීම (දශමස්ථාන 2කට)
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

        // Movie Selection Listener (Expires වෙන්නේ නැහැ, ඕනෑම වාර ගණනක් reply කරන්න පුළුවන්)
        const movieSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message?.extendedTextMessage) return;

                if (msg.message.extendedTextMessage.contextInfo?.stanzaId !== sentMsg.key.id) return;
                if (msg.key.participant !== sender && msg.key.remoteJid !== sender) return; 

                const userReply = msg.message.extendedTextMessage.text.trim();
                const selectedMovieIndex = parseInt(userReply) - 1;

                if (selectedMovieIndex < 0 || selectedMovieIndex >= moviesList.length) {
                    return reply("❌ Invalid movie number. Please try again.");
                }

                const selectedMovie = moviesList[selectedMovieIndex];
                const subjectId = selectedMovie.subjectId; 

                await conn.sendMessage(from, { react: { text: "⏳", key: msg.key } });

                // 2. Fetching from 1st (Info) & 2nd (Sources) APIs
                const infoUrl = `https://movieapi.chethmina.workers.dev/api/info/${subjectId}`;
                const sourcesUrl = `https://movieapi.chethmina.workers.dev/api/sources/${subjectId}`;

                const [infoRes, sourcesRes] = await Promise.all([
                    axios.get(infoUrl),
                    axios.get(sourcesUrl)
                ]);

                // API ව්‍යුහයන් නිවැරදිව ලබා ගැනීම
                const movieInfo = infoRes.data?.data?.subject; 
                const movieSources = sourcesRes.data?.data?.processedSources || [];

                if (!movieInfo) {
                    return reply("❌ Failed to fetch movie details.");
                }

                // Details Text එක සකස් කිරීම (User ඉල්ලපු විදිහටම Emojis සමඟ)
                let caption = `🎬 *${movieInfo.title || "N/A"}*\n\n`;
                caption += `📅 *Release Date:* ${movieInfo.releaseDate || "N/A"}\n`;
                caption += `⭐ *IMDb Rating:* ${movieInfo.imdbRatingValue || "N/A"}\n`;
                caption += `⏳ *Duration:* ${convertDuration(movieInfo.duration)}\n`;
                caption += `🌍 *Country:* ${movieInfo.countryName || "N/A"}\n`;
                caption += `🎭 *Genre:* ${movieInfo.genre || "N/A"} \n\n`;
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

                // Quality Listener (Quality තෝරන එක)
                const qualityListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message?.extendedTextMessage) return;

                        if (msg2.message.extendedTextMessage.contextInfo?.stanzaId !== movieDetailsMessage.key.id) return;
                        if (msg2.key.participant !== sender && msg2.key.remoteJid !== sender) return;

                        const qualityReply = msg2.message.extendedTextMessage.text.trim();
                        const qualityIndex = parseInt(qualityReply) - 1;

                        if (qualityIndex < 0 || qualityIndex >= movieSources.length) {
                            return reply("❌ Invalid quality number.");
                        }

                        const selectedSource = movieSources[qualityIndex];

                        // Loading reaction
                        await conn.sendMessage(from, { react: { text: "⬇️", key: msg2.key } });

                        // Image එකෙන් Thumbnail එකක් සෑදීම
                        const thumb = await createThumbnail(imageUrl);

                        // Document එකක් විදිහට Direct Link එක යැවීම
                        await conn.sendMessage(
                            from,
                            {
                                document: { url: selectedSource.downloadUrl },
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
                        console.log(err);
                        reply("❌ Error while uploading the document.");
                    }
                };

                conn.ev.on("messages.upsert", qualityListener);

                // සර්වර් එක ආරක්ෂා කරගන්න විනාඩි 5කින් Quality listener එක අයින් කරනවා
                setTimeout(() => {
                    conn.ev.off("messages.upsert", qualityListener);
                }, 300000);

            } catch (err) {
                console.log(err);
                reply("❌ Error while processing movie info.");
            }
        };

        conn.ev.on("messages.upsert", movieSelectionListener);

        // විනාඩි 10කින් ප්‍රධාන movie listener එක අයින් කරනවා
        setTimeout(() => {
            conn.ev.off("messages.upsert", movieSelectionListener);
        }, 600000);

    } catch (err) {
        console.log("MovieBox Error Log:", err.message);
        reply("❌ Error while searching movie.");
    }

});

// Fake Quoted Context Template
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

