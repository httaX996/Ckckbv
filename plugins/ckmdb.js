const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

/* Sinhala Translation */
async function translateToSinhala(text) {
    try {
        const res = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`
        );
        return res.data.responseData.translatedText || text;
    } catch {
        return text;
    }
}

cmd({
    pattern: "imdb",
    desc: "Search movies & get full details",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    if (!q) {
        return reply("❗Movie name එක දෙන්න\nඋදා: `.movieinfo Avengers`");
    }

    conn.movieSearch = conn.movieSearch || {};

    /* ===============================
       STEP 2 – NUMBER SELECT
    ================================ */
    if (conn.movieSearch[from] && !isNaN(q)) {
        const index = parseInt(q) - 1;
        const movies = conn.movieSearch[from];

        if (!movies[index]) {
            return reply("❌ වැරදි number එකක්. නැවත try කරන්න.");
        }

        const movie = movies[index];

        try {
            const detailsRes = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_KEY}`
            );

            const poster = detailsRes.data.poster_path
                ? `https://image.tmdb.org/t/p/original${detailsRes.data.poster_path}`
                : "https://i.imgur.com/NOPOSTER.png";

            let omdb = {};
            try {
                const omdbRes = await axios.get(
                    `http://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&apikey=${OMDB_KEY}`
                );
                omdb = omdbRes.data || {};
            } catch {}

            const imdbRating =
                omdb.imdbRating && omdb.imdbRating !== "N/A"
                    ? omdb.imdbRating
                    : (detailsRes.data.vote_average
                        ? `${detailsRes.data.vote_average} / 10 (TMDB)`
                        : "N/A");

            const runtime =
                omdb.Runtime && omdb.Runtime !== "N/A"
                    ? omdb.Runtime
                    : (detailsRes.data.runtime
                        ? `${detailsRes.data.runtime} min`
                        : "N/A");

            const genre =
                omdb.Genre && omdb.Genre !== "N/A"
                    ? omdb.Genre
                    : detailsRes.data.genres?.map(g => g.name).join(", ") || "N/A";

            const englishPlot =
                (omdb.Plot && omdb.Plot !== "N/A")
                    ? omdb.Plot
                    : detailsRes.data.overview || "N/A";

            const sinhalaPlot = await translateToSinhala(englishPlot);

            const caption =
`☣️ *Movie Name:* ${movie.title} (${movie.release_date?.slice(0,4) || "Upcoming"})

⭐ *Rating:* ${imdbRating}
🎭 *Genre:* ${genre}
🕒 *Runtime:* ${runtime}

🗣️ *කතා විස්තරය :*
${sinhalaPlot}

${config.MOVIE_FOOTER}`;

            await conn.sendMessage(from, {
                image: { url: poster },
                caption
            });

            delete conn.movieSearch[from];

        } catch (e) {
            console.error(e);
            reply("❌ Movie details ගන්න බැරි වුණා.");
        }

        return;
    }

    /* ===============================
       STEP 1 – SEARCH & LIST
    ================================ */
    try {
        const page1 = await axios.get(
            `https://api.themoviedb.org/3/search/movie`, {
                params: {
                    api_key: TMDB_KEY,
                    query: q,
                    page: 1,
                    include_adult: true,
                    language: "en-US"
                }
            }
        );

        const page2 = await axios.get(
            `https://api.themoviedb.org/3/search/movie`, {
                params: {
                    api_key: TMDB_KEY,
                    query: q,
                    page: 2,
                    include_adult: true,
                    language: "en-US"
                }
            }
        );

        let results = [...page1.data.results, ...page2.data.results];

        if (!results.length) {
            return reply("😓 Movie එකක් හමු වුණේ නැහැ.");
        }

        /* Sort by latest release */
        results.sort((a, b) =>
            new Date(b.release_date || 0) - new Date(a.release_date || 0)
        );

        conn.movieSearch[from] = results;

        let list = `🎬 *Movie List (Latest First)*\n\n`;

        results.slice(0, 10).forEach((m, i) => {
            const year = m.release_date?.slice(0, 4) || "Upcoming";
            list += `*${i + 1}.* ${m.title} (${year})\n`;
        });

        list += `\n📌 අවශ්‍ය movie එකේ *number* එක reply කරන්න`;

        reply(list);

    } catch (e) {
        console.error(e);
        reply("❌ Search error එකක්.");
    }
});
