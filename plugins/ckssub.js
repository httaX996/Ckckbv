const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp'); // sharp library එක require කරගන්න
const config = require('../config');

const API_KEY = "sadasggggg";
const BASE_URL = "https://apis.sadas.dev/api/v1/movie/sinhalasub";

// 🖼️ පෝස්ටරය කුඩා කර Thumbnail එකක් සාදන ශ්‍රිතය
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

cmd({
    pattern: "subck",
    desc: "Search for a movie and get details and download options.",
    category: "movie",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const input = q ? q.trim() : "";
        if (!input) return reply("Please provide a movie name to search. (ඇතුලත් කරන්න: .subck avatar)");
        
        // පියවර 1: API එකෙන් සිනමාපට සෙවීම
        const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(input)}&apiKey=${API_KEY}`;
        const response = await axios.get(searchUrl);

        if (!response.data.status || !response.data.data || response.data.data.length === 0) {
            return reply("❌ සිනමාපටයක් හමු වූයේ නැත. නැවත උත්සාහ කරන්න.");
        }

        const moviesList = response.data.data;
        let message = "🎬 \`𝗖𝗞 𝗦𝗜𝗡𝗛𝗔𝗟𝗔𝗦𝗨𝗕 𝗦𝗘𝗔𝗥𝗖𝗛\` 🎬\n\n";
        
        moviesList.forEach((movie, index) => {
            message += `\`${index + 1}\` *|* ❭❭◦ ${movie.Title} (${movie.Year})\n`;
        });

        message += "ℹ️ *ඉහත ලැයිස්තුවෙන් අවශ්‍ය චිත්‍රපටයේ අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.*\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*";

        // පියවර 2: සෙවුම් ප්‍රතිඵල යැවීම
        const sentMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL || `https://i.ibb.co/zHLW3WL/044e155205d4f11c.jpg` },
            caption: message
        }, { quoted: ck });

        // Movie Selection Listener
        const movieSelectionListener = async (update) => {
            const msg = update.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;
            if (msg.message.extendedTextMessage.contextInfo.stanzaId !== sentMsg.key.id) return;

            const userReply = msg.message.extendedTextMessage.text.trim();
            const selectedMovieIndex = parseInt(userReply) - 1;

            if (isNaN(selectedMovieIndex) || selectedMovieIndex < 0 || selectedMovieIndex >= moviesList.length) {
                await conn.sendMessage(from, { react: { text: '❌', key: msg.key } });
                return conn.sendMessage(from, { text: "❗ Invalid selection. Please choose a valid number from the list." }, { quoted: msg });
            }

            conn.ev.off("messages.upsert", movieSelectionListener);
            const selectedMovie = moviesList[selectedMovieIndex];
            await conn.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            // පියවර 3: තෝරාගත් චිත්‍රපටයේ විස්තර Fetch කිරීම
            const infoUrl = `${BASE_URL}/infodl?q=${encodeURIComponent(selectedMovie.Link)}&apiKey=${API_KEY}`;
            const infoResponse = await axios.get(infoUrl);

            if (!infoResponse.data.status || !infoResponse.data.data) {
                return conn.sendMessage(from, { text: "❌ විස්තර ලබාගැනීමට නොහැකි විය." }, { quoted: msg });
            }

            const movieData = infoResponse.data.data;
            const filteredLinks = movieData.downloadLinks.filter(dl => 
                dl.server === "DLServer-01" || dl.server === "DLServer-02"
            );

            if (filteredLinks.length === 0) {
                return conn.sendMessage(from, { text: "❌ මෙම චිත්‍රපටය සඳහා සෘජු (DLServer) බාගත කිරීමේ සබැඳි නොමැත." }, { quoted: msg });
            }

            let movieMessage = `🎬 \`${movieData.title}\`\n\n`;
            movieMessage += `📅 \`YEAR:\` *${movieData.date || 'N/A'}*\n`;
            movieMessage += `⭐ \`RATING:\` *${movieData.rating || 'N/A'}*\n`;
            movieMessage += `🌍 \`COUNTRY:\` *${movieData.country || 'N/A'}*\n\n`;
            movieMessage += `📥 \`ᴀᴠᴀɪʟᴀʙʟᴇ Qᴜᴀʟɪᴛɪᴇꜱ\`\n\n`;

            filteredLinks.forEach((dl, index) => {
                movieMessage += `\`${index + 1}\` *${dl.quality} (${dl.size})*\n*[${dl.server}]*\n`;
            });

            movieMessage += `\nℹ️ *අවශ්‍ය Quality එකෙහි අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ**`;

            // චිත්‍රපටයේ මුල් රූපය (Image URL) ලබාගැනීම
            const imageUrl = (movieData.images && movieData.images.length > 0) ? movieData.images[0] : selectedMovie.Img;

            // පියවර 4: විස්තර සහ Quality ලැයිස්තුව යැවීම
            const movieDetailsMessage = await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: movieMessage
            }, { quoted: ck });

            // Quality Listener
            const qualityListener = async (qualityUpdate) => {
                const qMsg = qualityUpdate.messages[0];
                if (!qMsg.message || !qMsg.message.extendedTextMessage) return;

                if (qMsg.message.extendedTextMessage.contextInfo.stanzaId === movieDetailsMessage.key.id) {
                    
                    const qUserReply = qMsg.message.extendedTextMessage.text.trim();
                    const selectedQualityIndex = parseInt(qUserReply) - 1;

                    if (isNaN(selectedQualityIndex) || selectedQualityIndex < 0 || selectedQualityIndex >= filteredLinks.length) {
                        await conn.sendMessage(from, { react: { text: '❌', key: qMsg.key } });
                        return conn.sendMessage(from, { text: "❗ Invalid quality selection. Please choose a valid number." }, { quoted: qMsg });
                    }

                    conn.ev.off("messages.upsert", qualityListener);
                    const selectedLinkObj = filteredLinks[selectedQualityIndex];
                    
                    await conn.sendMessage(from, { react: { text: '📥', key: qMsg.key } });

                    try {
                        // 🌟 චිත්‍රපටයේ Poster එක ඇසුරෙන් Thumbnail Buffer එක සෑදීම
                        const thumb = await createThumbnail(imageUrl);

                        // ਪියවර 5: වීඩියෝව Document එකක් ලෙස බ්ලොක් නොවී යාමට headers සහ thumbnail සහිතව යැවීම
                        await conn.sendMessage(from, {
                            document: { 
                                url: selectedLinkObj.link
                            },
                            mimetype: 'video/mp4',
                            fileName: `${movieData.title} - ${selectedLinkObj.quality}.mp4`,
                            jpegThumbnail: thumb ? thumb.toString('base64') : undefined, // 👈 Thumbnail එක මෙතනින් Base64 කරලා ඇඩ් වෙනවා
                            caption: `🎬 \`${movieData.title}\`\n\n🎞️ \`Quality:\` *${selectedLinkObj.quality}*\n📦 \`Size:\` *${selectedLinkObj.size}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                        }, { quoted: ck });

                        await conn.sendMessage(from, { react: { text: '✅', key: qMsg.key } });

                    } catch (err) {
                        console.error('Error sending document:', err);
                        await conn.sendMessage(from, { react: { text: '❌', key: qMsg.key } });
                        return conn.sendMessage(from, { text: "❗ සන්නිවේදන දෝෂයකි. වීඩියෝව බාගත කිරීමට නොහැකි විය." }, { quoted: qMsg });
                    }
                }
            };

            conn.ev.on("messages.upsert", qualityListener);
            setTimeout(() => { conn.ev.off("messages.upsert", qualityListener); }, 60000);
        };

        conn.ev.on("messages.upsert", movieSelectionListener);
        setTimeout(() => { conn.ev.off("messages.upsert", movieSelectionListener); }, 60000);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`❗ Error: ${e.message}`);
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
