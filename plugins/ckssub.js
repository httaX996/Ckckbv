const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config'); // config.IMG_URL ලබාගැනීම සඳහා config file එක require කරගන්න

// පරිශීලකයන්ගේ තේරීම් තාවකාලිකව මතක තබා ගැනීමට (Global Session Object)
if (!global.movieSession) {
    global.movieSession = {};
}

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
        const text = q ? q.trim() : "";

        // -------------------------------------------------------------
        // පියවර 1: චිත්‍රපට සෙවීම සහ Image එක සමඟ ලැයිස්තුව යැවීම
        // -------------------------------------------------------------
        if (text && isNaN(text)) {
            const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(text)}&apiKey=${API_KEY}`;
            const response = await axios.get(searchUrl);

            if (!response.data.status || !response.data.data || response.data.data.length === 0) {
                return reply("❌ සිනමාපටයක් හමු වූයේ නැත. නැවත උත්සාහ කරන්න.");
            }

            const movies = response.data.data;
            let responseText = "🎬 *SinhalaSub Movie Search Results* 🎬\n\n";
            
            // Session එක ආරම්භ කර දත්ත තැන්පත් කිරීම
            global.movieSession[from] = {
                step: "SELECT_MOVIE",
                moviesList: movies
            };

            movies.forEach((movie) => {
                responseText += `*${movie.No}.* ${movie.Title} (${movie.Year})\n🔹 Quality: ${movie.Quality}\n\n`;
            });

            responseText += "ℹ️ *ඉහත ලැයිස්තුවෙන් අවශ්‍ය චිත්‍රපටයේ අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.*";
            
            // config.IMG_URL එක භාවිතයෙන් Image එක සමඟ Caption එකක් ලෙස ලැයිස්තුව යැවීම
            return await conn.sendMessage(from, {
                image: { url: config.IMG_URL || "https://image.tmdb.org/t/p/w185/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg" }, // config එකේ නැත්නම් default එකක් වැඩ කරයි
                caption: responseText
            }, { quoted: mek });
        }

        // -------------------------------------------------------------
        // පියවර 2: පරිශීලකයා අංකයක් එවා ඇති විට (Session Handling)
        // -------------------------------------------------------------
        if (global.movieSession[from]) {
            const session = global.movieSession[from];

            // 2.1: චිත්‍රපට අංකය තේරීම
            if (session.step === "SELECT_MOVIE") {
                const selectedIndex = parseInt(text) - 1;
                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= session.moviesList.length) {
                    return reply("❌ වලංගු නොවන අංකයකි. කරුණාකර ලැයිස්තුවේ ඇති අංකයක් ලබාදෙන්න.");
                }

                const selectedMovie = session.moviesList[selectedIndex];
                await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

                // Movie Info API එක කැඳවීම
                const infoUrl = `${BASE_URL}/infodl?q=${encodeURIComponent(selectedMovie.Link)}&apiKey=${API_KEY}`;
                const infoResponse = await axios.get(infoUrl);

                if (!infoResponse.data.status || !infoResponse.data.data) {
                    return reply("❌ විස්තර ලබාගැනීමට නොහැකි විය.");
                }

                const movieData = infoResponse.data.data;
                
                // DLServer ලින්ක්ස් පමණක් Filter කිරීම
                const filteredLinks = movieData.downloadLinks.filter(dl => 
                    dl.server === "DLServer-01" || dl.server === "DLServer-02"
                );

                if (filteredLinks.length === 0) {
                    return reply("❌ මෙම චිත්‍රපටය සඳහා DLServer බාගත කිරීමේ සබැඳි නොමැත.");
                }

                // මීළඟ Quality තේරීමේ පියවරට Session එක යාවත්කාලීන කිරීම
                global.movieSession[from] = {
                    step: "SELECT_QUALITY",
                    links: filteredLinks,
                    title: movieData.title
                };

                // රූපවාහිනී විස්තර Caption එක සකස් කිරීම
                let caption = `🎬 *${movieData.title}*\n\n`;
                caption += `📅 *Year:* ${movieData.date || 'N/A'}\n`;
                caption += `⭐ *Rating:* ${movieData.rating || 'N/A'}\n`;
                caption += `🌍 *Country:* ${movieData.country || 'N/A'}\n\n`;
                caption += `📥 *Available Qualities:* \n`;

                filteredLinks.forEach((dl, index) => {
                    caption += `*${index + 1}.* 💾 ${dl.quality} (${dl.size}) [${dl.server}]\n`;
                });

                caption += `\nℹ️ *අවශ්‍ය Quality අංකය (e.g. 1) මෙම පණිවිඩයට Reply කරන්න.*`;

                const imageUrl = (movieData.images && movieData.images.length > 0) ? movieData.images[0] : selectedMovie.Img;
                
                return await conn.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: caption
                }, { quoted: mek });
            }

            // 2.2: Quality අංකය තේරූ පසු Document එක යැවීම
            else if (session.step === "SELECT_QUALITY") {
                const selectedIndex = parseInt(text) - 1;
                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= session.links.length) {
                    return reply("❌ වලංගු නොවන Quality අංකයකි.");
                }

                const selectedLinkObj = session.links[selectedIndex];
                await conn.sendMessage(from, { react: { text: "📥", key: mek.key } });

                // වීඩියෝව Document එකක් ලෙස ලබාදීම
                await conn.sendMessage(from, {
                    document: { url: selectedLinkObj.link },
                    mimetype: 'video/mp4',
                    fileName: `${session.title} - ${selectedLinkObj.quality}.mp4`,
                    caption: `🍿 *Title:* ${session.title}\n⚙️ *Quality:* ${selectedLinkObj.quality}\n\n*Downloaded via Bot*`
                }, { quoted: mek });

                // වැඩේ ඉවර නිසා Session එක Reset කිරීම
                delete global.movieSession[from];
                return;
            }
        }

        // කිසිදු Text එකක් නැතිව නිකන් .subck ගැහුවොත්
        if (!text) {
            return reply("Please provide a movie name! (ඇතුලත් කරන්න: .subck avatar)");
        }

    } catch (error) {
        console.error(error);
        reply("⚠️ දෝෂයක් සිදු විය! කරුණාකර නැවත උත්සාහ කරන්න.");
    }
});
