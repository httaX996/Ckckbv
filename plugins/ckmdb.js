const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

// Temporary in-memory storage
const movieSelections = {}; // { 'from': { results: [...], timestamp } }

async function translateToSinhala(text) {
    try {
        const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`);
        return res.data.responseData.translatedText || text;
    } catch {
        return text;
    }
}

cmd({
    pattern: "movieinfo",
    desc: "Get HD official movie poster with Sinhala details",
    category: "movie",
    react: "♻️",
    alias: ['info', 'in'],
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    // Check if user is replying with a number
    if (q && movieSelections[from]) {
        const index = parseInt(q) - 1;
        const selection = movieSelections[from].results?.[index];

        if (!selection) return reply("❌ වැරදි number එකක්. කරුණාකර listed number එකක් reply කරන්න.");

        try {
            // Movie details from TMDB
            const { data: details } = await axios.get(`https://api.themoviedb.org/3/movie/${selection.id}?api_key=${TMDB_KEY}`);
            const poster = details.poster_path ? `https://image.tmdb.org/t/p/original${details.poster_path}` : null;

            // OMDb Info
            const { data: omdb } = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(selection.title)}&apikey=${OMDB_KEY}`);

            const plot = omdb.Plot || details.overview || "N/A";
            const sinhalaPlot = await translateToSinhala(plot);

            const caption = `☣️ *Movie Name:* ${omdb.Title || details.title} (${omdb.Year || details.release_date?.slice(0,4)})\n` +
                            `⭐ *IMDb Rating:* ${omdb.imdbRating || "N/A"}\n` +
                            `🎭 *Genre:* ${omdb.Genre || "N/A"}\n` +
                            `🕒 *Runtime:* ${omdb.Runtime || "N/A"}\n\n` +
                            `🗣️ *Plot:* ${sinhalaPlot}\n\n` +
                            `${config.MOVIE_FOOTER}`;

            await conn.sendMessage(from, { image: { url: poster }, caption }, { quoted: m });

            // Clear selection
            delete movieSelections[from];

        } catch (err) {
            console.error(err);
            reply("❌ දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.");
        }

        return;
    }

    // If first query
    if (!q) return reply("❗කරුණාකර චිත්‍රපටයේ නම දෙන්න.\nඋදා: `.movieinfo Avengers`");

    try {
        // TMDB Search
        const { data: searchData } = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}`);
        if (!searchData.results.length) return reply("😓 චිත්‍රපටය සොයාගත නොහැකි විය.");

        // Store top 5 results
        const results = searchData.results.slice(0, 5);
        movieSelections[from] = { results, timestamp: Date.now() };

        // Build list message
        let listMsg = "📽️ *ඔබේ search එකට අදාල චිත්‍රපට මෙන්න:*\n";
        results.forEach((movie, i) => {
            const year = movie.release_date?.slice(0,4) || "N/A";
            listMsg += `${i+1}. ${movie.title} (${year})\n`;
        });
        listMsg += "\n🎯 ඉහත listed number එක reply කරන්න, details ලබාගැනීමට.";

        reply(listMsg);

    } catch (err) {
        console.error(err);
        reply("❌ දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.");
    }
});
