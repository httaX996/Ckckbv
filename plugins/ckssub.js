const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const API_KEY = "sadasggggg";
const BASE_URL = "https://apis.sadas.dev/api/v1/movie/sinhalasub";

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
        let message = "🎬 *SinhalaSub Movie Search Results* 🎬\n\n";
        
        moviesList.forEach((movie, index) => {
            message += `*${index + 1}.* ${movie.Title} (${movie.Year})\n🔹 Quality: ${movie.Quality}\n\n`;
        });

        message += "ℹ️ *ඉහත ලැයිස්තුවෙන් අවශ්‍ය චිත්‍රපටයේ අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.*";

        // පියවර 2: config.IMG_URL එක සමඟ සෙවුම් ප්‍රතිඵල යැවීම
        const sentMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL || `https://i.ibb.co/zHLW3WL/044e155205d4f11c.jpg` },
            caption: message,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: false,
            }
        }, { quoted: mek });

        // චිත්‍රපට අංකය තෝරන තුරු බලා සිටීමේ Listener එක
        const movieSelectionListener = async (update) => {
            const msg = update.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            // පරිශීලකයා Reply කර ඇත්තේ අප යැවූ පණිවිඩයටමදැයි පරීක්ෂා කිරීම
            if (msg.message.extendedTextMessage.contextInfo.stanzaId !== sentMsg.key.id) return;

            const userReply = msg.message.extendedTextMessage.text.trim();
            const selectedMovieIndex = parseInt(userReply) - 1;

            if (isNaN(selectedMovieIndex) || selectedMovieIndex < 0 || selectedMovieIndex >= moviesList.length) {
                await conn.sendMessage(from, { react: { text: '❌', key: msg.key } });
                return conn.sendMessage(from, { text: "❗ Invalid selection. Please choose a valid number from the list." }, { quoted: msg });
            }

            // Listener එක ඉවත් කිරීම (Memory leak වැලැක්වීමට)
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

            // DLServer-01 සහ DLServer-02 ලින්ක්ස් පමණක් පෙරා ගැනීම (Filtering)
            const filteredLinks = movieData.downloadLinks.filter(dl => 
                dl.server === "DLServer-01" || dl.server === "DLServer-02"
            );

            if (filteredLinks.length === 0) {
                return conn.sendMessage(from, { text: "❌ මෙම චිත්‍රපටය සඳහා සෘජු (DLServer) බාගත කිරීමේ සබැඳි නොමැත." }, { quoted: msg });
            }

            // Caption එක සකස් කිරීම
            let movieMessage = `🎬 *${movieData.title}*\n\n`;
            movieMessage += `📅 *Year:* ${movieData.date || 'N/A'}\n`;
            movieMessage += `⭐ *Rating:* ${movieData.rating || 'N/A'}\n`;
            movieMessage += `🌍 *Country:* ${movieData.country || 'N/A'}\n\n`;
            movieMessage += `📥 *Available Qualities:* \n`;

            filteredLinks.forEach((dl, index) => {
                movieMessage += `*${index + 1}.* 💾 ${dl.quality} (${dl.size}) [${dl.server}]\n`;
            });

            movieMessage += `\nℹ️ *අවශ්‍ය Quality එකෙහි අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.*`;

            // චිත්‍රපටයේ මුල් රූපය (Image URL) ලබාගැනීම
            const imageUrl = (movieData.images && movieData.images.length > 0) ? movieData.images[0] : selectedMovie.Img;

            // පියවර 4: විස්තර සහ Quality ලැයිස්තුව රූපය සමඟ යැවීම
            const movieDetailsMessage = await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: movieMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: false,
                }
            }, { quoted: msg });

            // Quality එක තෝරන තුරු බලා සිටීමේ Listener එක
            const qualityListener = async (qualityUpdate) => {
                const qMsg = qualityUpdate.messages[0];
                if (!qMsg.message || !qMsg.message.extendedTextMessage) return;

                // නිවැරදි විස්තර පණිවිඩයටමද Reply කර ඇත්තේ කියා බැලීම
                if (qMsg.message.extendedTextMessage.contextInfo.stanzaId === movieDetailsMessage.key.id) {
                    
                    const qUserReply = qMsg.message.extendedTextMessage.text.trim();
                    const selectedQualityIndex = parseInt(qUserReply) - 1;

                    if (isNaN(selectedQualityIndex) || selectedQualityIndex < 0 || selectedQualityIndex >= filteredLinks.length) {
                        await conn.sendMessage(from, { react: { text: '❌', key: qMsg.key } });
                        return conn.sendMessage(from, { text: "❗ Invalid quality selection. Please choose a valid number." }, { quoted: qMsg });
                    }

                    // Listener එක ඉවත් කිරීම
                    conn.ev.off("messages.upsert", qualityListener);
                    
                    const selectedLinkObj = filteredLinks[selectedQualityIndex];
                    await conn.sendMessage(from, { react: { text: '📥', key: qMsg.key } });

                    try {
                        // පියවර 5: වීඩියෝව Document එකක් ලෙස WhatsApp වෙත යැවීම
                        await conn.sendMessage(from, {
                            document: { url: selectedLinkObj.link },
                            mimetype: 'video/mp4',
                            fileName: `${movieData.title} - ${selectedLinkObj.quality}.mp4`,
                            caption: `✨ *Here is your movie!* \n🍿 *Title:* ${movieData.title}\n⚙️ *Quality:* ${selectedLinkObj.quality}`
                        }, { quoted: qMsg });

                        await conn.sendMessage(from, { react: { text: '✅', key: qMsg.key } });

                    } catch (err) {
                        console.error('Error sending document:', err);
                        await conn.sendMessage(from, { react: { text: '❌', key: qMsg.key } });
                        return conn.sendMessage(from, { text: "❗ සන්නිවේදන දෝෂයකි. වීඩියෝව බාගත කිරීමට නොහැකි විය." }, { quoted: qMsg });
                    }
                }
            };

            // Quality Listener එක ලියාපදිංචි කිරීම
            conn.ev.on("messages.upsert", qualityListener);

            // තත්පර 60 කින් Quality Listener එක ඉවත් කිරීම
            setTimeout(() => {
                conn.ev.off("messages.upsert", qualityListener);
            }, 60000);
        };

        // Movie Selection Listener එක ලියාපදිංචි කිරීම
        conn.ev.on("messages.upsert", movieSelectionListener);

        // තත්පර 60 කින් Movie Selection Listener එක ඉවත් කිරීම
        setTimeout(() => {
            conn.ev.off("messages.upsert", movieSelectionListener);
        }, 60000);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`❗ Error: ${e.message}`);
    }
});
