const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

/* Language map */
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
    desc: "Movie search & details (final fixed)",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    if (!q) {
        return reply("❗Movie name එක දෙන්න\nඋදා: `.movieinfo Avengers`");
    }

    conn.movieSearch = conn.movieSearch || {};

    /* ================= SELECT STEP ================= */
    if (conn.movieSearch[from] && !isNaN(q)) {
        const index = parseInt(q) - 1;
        const movies = conn.movieSearch[from];

        if (!movies[index]) {
            return reply("❌ වැරදි number එකක්.");
        }

        const movie = movies[index];

        try {
            const detailsRes = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}`, {
                    params: {
                        api_key: TMDB_KEY,
                        language: "en-US"
                    }
                }
            );

            let omdb = {};
            try {
                const o = await axios.get(
                    `http://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&apikey=${OMDB_KEY}`
                );
                omdb = o.data || {};
            } catch {}

            const poster = detailsRes.data.poster_path
                ? `https://image.tmdb.org/t/p/original${detailsRes.data.poster_path}`
                : "https://i.imgur.com/NOPOSTER.png";

            const rating =
                omdb.imdbRating && omdb.imdbRating !== "N/A"
                    ? omdb.imdbRating
                    : (detailsRes.data.vote_average
                        ? `${detailsRes.data.vote_average}/10 (TMDB)`
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
                    : (detailsRes.data.genres?.map(g => g.name).join(", ") || "N/A");

            const releaseDate =
                detailsRes.data.release_date || "Upcoming";

            const langCode =
                detailsRes.data.original_language || "N/A";

            const language =
                LANG_MAP[langCode] || langCode.toUpperCase();

            const plotEN =
                omdb.Plot && omdb.Plot !== "N/A"
                    ? omdb.Plot
                    : detailsRes.data.overview || "N/A";

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

        } catch (err) {
            console.error(err);
            reply("❌ Movie details ලබාගන්න බැරි වුණා.");
        }
        return;
    }

    /* ================= SEARCH STEP (FINAL FIX) ================= */
    try {
        // search/movie page 1
        const page1 = await axios.get(
            `https://api.themoviedb.org/3/search/movie`, {
                params: {
                    api_key: TMDB_KEY,
                    query: q,
                    page: 1,
                    include_adult: true
                }
            }
        );

        // search/movie page 2
        const page2 = await axios.get(
            `https://api.themoviedb.org/3/search/movie`, {
                params: {
                    api_key: TMDB_KEY,
                    query: q,
                    page: 2,
                    include_adult: true
                }
            }
        );

        let results = [
            ...page1.data.results,
            ...page2.data.results
        ];

        // remove duplicates
        results = Array.from(
            new Map(results.map(m => [m.id, m])).values()
        );

        if (!results.length) {
            return reply("😓 Movie එකක් හමු වුණේ නැහැ.");
        }

        // sort by latest release (ONLY matched movies)
        results.sort((a, b) =>
            new Date(b.release_date || 0) - new Date(a.release_date || 0)
        );

        conn.movieSearch[from] = results;

        let list = `🎬 *Movie List*\n\n`;
        results.slice(0, 10).forEach((m, i) => {
            list += `*${i + 1}.* ${m.title} (${m.release_date?.slice(0,4) || "Upcoming"})\n`;
        });

        list += `\n📌 අවශ්‍ය movie එකේ number එක reply කරන්න`;

        reply(list);

    } catch (err) {
        console.error(err);
        reply("❌ Search error එකක්.");
    }
});
