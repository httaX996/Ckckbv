const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

/* Language code map */
const LANG_MAP = {
    en: "English",
    ja: "Japanese",
    ko: "Korean",
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    de: "German",
    zh: "Chinese",
    ru: "Russian",
    si: "Sinhala"
};

/* Sinhala translate */
async function translateToSinhala(text) {
    try {
        const r = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`
        );
        return r.data.responseData.translatedText || text;
    } catch {
        return text;
    }
}

cmd({
    pattern: "imdb",
    desc: "Movie search with release date & language",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    if (!q) return reply("❗Movie name එක දෙන්න\nඋදා: `.movieinfo Avengers`");

    conn.movieSearch = conn.movieSearch || {};

    /* ================= SELECT STEP ================= */
    if (conn.movieSearch[from] && !isNaN(q)) {
        const index = parseInt(q) - 1;
        const movies = conn.movieSearch[from];

        if (!movies[index]) return reply("❌ වැරදි number එකක්.");

        const movie = movies[index];

        try {
            const details = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_KEY}&language=en-US`
            );

            let omdb = {};
            try {
                const o = await axios.get(
                    `http://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&apikey=${OMDB_KEY}`
                );
                omdb = o.data || {};
            } catch {}

            const poster = details.data.poster_path
                ? `https://image.tmdb.org/t/p/original${details.data.poster_path}`
                : "https://i.imgur.com/NOPOSTER.png";

            const rating =
                omdb.imdbRating && omdb.imdbRating !== "N/A"
                    ? omdb.imdbRating
                    : (details.data.vote_average
                        ? `${details.data.vote_average}/10 (TMDB)`
                        : "N/A");

            const runtime =
                omdb.Runtime && omdb.Runtime !== "N/A"
                    ? omdb.Runtime
                    : (details.data.runtime
                        ? `${details.data.runtime} min`
                        : "N/A");

            const genre =
                omdb.Genre && omdb.Genre !== "N/A"
                    ? omdb.Genre
                    : details.data.genres.map(g => g.name).join(", ");

            const releaseDate =
                details.data.release_date || "Upcoming";

            const languageCode =
                details.data.original_language || "N/A";

            const language =
                LANG_MAP[languageCode] || languageCode.toUpperCase();

            const plotEN =
                omdb.Plot && omdb.Plot !== "N/A"
                    ? omdb.Plot
                    : details.data.overview || "N/A";

            const plotSI = await translateToSinhala(plotEN);

            const caption =
`☣️ *Movie Name:* ${movie.title} (${releaseDate.slice(0,4) || "Upcoming"})

📅 *Release Date:* ${releaseDate}
🌐 *Language:* ${language}
⭐ *Rating:* ${rating}
🎭 *Genre:* ${genre}
🕒 *Runtime:* ${runtime}

🗣️ *කතා විස්තරය :*
${plotSI}

${config.MOVIE_FOOTER}`;

            await conn.sendMessage(from, {
                image: { url: poster },
                caption
            });

            delete conn.movieSearch[from];

        } catch (e) {
            console.error(e);
            reply("❌ Details ලබාගන්න බැරි වුණා.");
        }
        return;
    }

    /* ================= SEARCH STEP ================= */
    try {
        const multi = await axios.get(
            `https://api.themoviedb.org/3/search/multi`, {
                params: {
                    api_key: TMDB_KEY,
                    query: q,
                    include_adult: true
                }
            }
        );

        const multiMovies = multi.data.results
            .filter(x => x.media_type === "movie");

        const discover = await axios.get(
            `https://api.themoviedb.org/3/discover/movie`, {
                params: {
                    api_key: TMDB_KEY,
                    sort_by: "release_date.desc",
                    "release_date.gte": "2024-01-01",
                    "release_date.lte": "2026-12-31"
                }
            }
        );

        let results = [...multiMovies, ...discover.data.results];

        results = Array.from(
            new Map(results.map(m => [m.id, m])).values()
        );

        if (!results.length) return reply("😓 Movie එකක් හමු වුණේ නැහැ.");

        results.sort((a, b) =>
            new Date(b.release_date || 0) - new Date(a.release_date || 0)
        );

        conn.movieSearch[from] = results;

        let list = `🎬 *Movie List (Latest & Upcoming)*\n\n`;
        results.slice(0, 10).forEach((m, i) => {
            list += `*${i + 1}.* ${m.title} (${m.release_date?.slice(0,4) || "Upcoming"})\n`;
        });
        list += `\n📌 Number එක reply කරන්න`;

        reply(list);

    } catch (e) {
        console.error(e);
        reply("❌ Search error එකක්.");
    }
});
