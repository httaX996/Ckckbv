const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

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

/* Helper function to send details */
async function sendMovieDetails(conn, from, item, quotedMessage) {
    try {
        const endpoint = item.type === "tv" ? "tv" : "movie";
        const details = await axios.get(
            `https://api.themoviedb.org/3/${endpoint}/${item.id}`, {
                params: { api_key: TMDB_KEY, language: "en-US" }
            }
        );

        let omdb = {};
        if (item.type === "movie") {
            try {
                const o = await axios.get(
                    `http://www.omdbapi.com/?t=${encodeURIComponent(item.title)}&apikey=${OMDB_KEY}`
                );
                omdb = o.data || {};
            } catch {}
        }

        const poster = details.data.poster_path
            ? `https://image.tmdb.org/t/p/original${details.data.poster_path}`
            : "https://i.imgur.com/NOPOSTER.png";

        const title = item.title;
        const releaseDate = item.type === "tv"
            ? details.data.first_air_date || "N/A"
            : details.data.release_date || "N/A";

        const language = LANG_MAP[details.data.original_language] ||
            details.data.original_language.toUpperCase();

        const rating = item.type === "movie"
            ? (omdb.imdbRating || `${details.data.vote_average}/10`)
            : `${details.data.vote_average}/10`;

        const runtime = item.type === "tv"
            ? `${details.data.number_of_seasons} Seasons`
            : (omdb.Runtime || `${details.data.runtime} min`);

        const genres = details.data.genres?.map(g => g.name).join(", ") || "N/A";
        const plotEN = details.data.overview || "N/A";
        const plotSI = await translateToSinhala(plotEN);

        const caption =
`🎬 \`${title}\`

📅 *RELEASED :* ${releaseDate}
🔊 *LANGUAGE :* ${language}
🌟 *RATING :* ${rating}
🎭 *GENRES :* ${genres}
⏰ *DURATION :* ${runtime}

🗣️ *STORY LINE :*
${plotSI}

> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*`;

        await conn.sendMessage(from, {
            image: { url: poster },
            caption
        }, { quoted: quotedMessage });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { text: "❌ Details load error" }, { quoted: quotedMessage });
    }
}

cmd({
    pattern: "movieinfo",
    desc: "Movie & TV Series info + number reply support",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    conn.movieSearch = conn.movieSearch || {};

    const replyText = (q || m.text || "").trim();

    // ================= QUOTED OR PLAIN NUMBER REPLY CHECK =================
    if (/^[0-9]+$/.test(replyText) && conn.movieSearch[from]) {
        const cache = conn.movieSearch[from];
        const quotedId = m.quoted?.key?.id;

        // Reply to list message OR fallback last search
        if (quotedId === cache.messageId || !quotedId) {
            const index = parseInt(replyText) - 1;
            const item = cache.results[index];
            if (!item) return reply("❌ වැරදි number එකක්.");
            return sendMovieDetails(conn, from, item, m); // pass current message as quoted
        }
    }

    // ================= SEARCH STEP =================
    if (!q) return reply("❗Movie / TV Series name එක දෙන්න");

    try {
        const [movieRes, tvRes] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/search/movie`, {
                params: { api_key: TMDB_KEY, query: q, page: 1 }
            }),
            axios.get(`https://api.themoviedb.org/3/search/tv`, {
                params: { api_key: TMDB_KEY, query: q, page: 1 }
            })
        ]);

        let movies = movieRes.data.results.map(m => ({
            id: m.id,
            title: m.title,
            date: m.release_date,
            type: "movie"
        }));

        let tvs = tvRes.data.results.map(t => ({
            id: t.id,
            title: t.name,
            date: t.first_air_date,
            type: "tv"
        }));

        let results = [...movies, ...tvs];

        if (!results.length) return reply("😓 Result එකක් නැහැ");

        results.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        // send list message
        const sentMsg = await conn.sendMessage(from, {
            text: (() => {
                let list = `🎬 *Movies & TV Series*\n\n`;
                results.slice(0, 10).forEach((r, i) => {
                    list += `*${i + 1}.* ${r.title} (${r.date?.slice(0,4) || "N/A"}) ${r.type === "tv" ? "📺" : "🎬"}\n`;
                });
                list += `\n📌 Reply with number to get details`;
                return list;
            })()
        });

        // cache results with messageId
        conn.movieSearch[from] = {
            messageId: sentMsg.key.id,
            results
        };

    } catch (e) {
        console.error(e);
        reply("❌ Search error");
    }

});
