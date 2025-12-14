const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

const MVJID = "120363298587511714@g.us"; // Movie Group
const TVJID = "120363319444098961@g.us"; // TV Group

// -------------------- GLOBAL CACHE --------------------
let movieCache = {};

// -------------------- LANGUAGE MAP --------------------
const LANG_MAP = {
    en: "English", ja: "Japanese", ko: "Korean", hi: "Hindi",
    ta: "Tamil", te: "Telugu", fr: "French", es: "Spanish",
    it: "Italian", de: "German", zh: "Chinese", ru: "Russian",
    si: "Sinhala"
};

// -------------------- TRANSLATE --------------------
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

// -------------------- SEARCH (MOVIE + TV) --------------------
cmd({
    pattern: "imdb",
    desc: "Search Movies & TV Series",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    if (!q) return reply("❗ Movie / TV Series name එක දෙන්න");

    try {
        const [movieRes, tvRes] = await Promise.all([
            axios.get("https://api.themoviedb.org/3/search/movie", {
                params: { api_key: TMDB_KEY, query: q }
            }),
            axios.get("https://api.themoviedb.org/3/search/tv", {
                params: { api_key: TMDB_KEY, query: q }
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

        // ✅ FIXED SORT (NEW TV SERIES NOW VISIBLE)
        results.sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return db - da;
        });

        let text = `🎬 *Movies & TV Series*\n\n`;
        results.slice(0, 10).forEach((r, i) => {
            text += `*${i + 1}.* ${r.title} (${r.date?.slice(0, 4) || "N/A"}) ${r.type === "tv" ? "📺" : "🎬"}\n`;
        });

        text += `\n📌 Reply number with:\n.imd <number>\n.mvd <number>\n.tvd <number>`;

        await conn.sendMessage(from, { text });

        movieCache[from] = results;

    } catch (e) {
        console.error(e);
        reply("❌ Search error");
    }
});

// -------------------- SEND DETAILS --------------------
async function sendDetails(conn, jid, item) {
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

    const language = LANG_MAP[details.data.original_language] || details.data.original_language.toUpperCase();
    const rating = item.type === "movie"
        ? (omdb.imdbRating || `${details.data.vote_average}/10`)
        : `${details.data.vote_average}/10`;

    const runtime = item.type === "tv"
        ? `${details.data.number_of_seasons} Seasons`
        : (omdb.Runtime || `${details.data.runtime} min`);

    const genres = details.data.genres?.map(g => g.name).join(", ") || "N/A";
    const plotSI = await translateToSinhala(details.data.overview || "N/A");

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

    await conn.sendMessage(jid, {
        image: { url: poster },
        caption: caption }, { quoted: ck });
    }


// -------------------- DM DETAILS --------------------
cmd({
    pattern: "imd",
    desc: "Send details to chat",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    const num = parseInt(q);
    if (!num) return reply("❗ Number එකක් දෙන්න");

    const list = movieCache[from];
    if (!list) return reply("❌ Search first");

    const item = list[num - 1];
    if (!item) return reply("❌ Invalid number");

    await sendDetails(conn, from, item);
});

// -------------------- MOVIE GROUP --------------------
cmd({
    pattern: "mvd",
    desc: "Send movie to Movie Group",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    const num = parseInt(q);
    if (!num) return reply("❗ Number එකක් දෙන්න");

    const list = movieCache[from];
    if (!list) return reply("❌ Search first");

    const item = list[num - 1];
    if (!item || item.type !== "movie") return reply("❌ Movie only");

    await sendDetails(conn, MVJID, item);
});

// -------------------- TV GROUP --------------------
cmd({
    pattern: "tvd",
    desc: "Send TV series to TV Group",
    category: "movie",
    react: "📺",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

    const num = parseInt(q);
    if (!num) return reply("❗ Number එකක් දෙන්න");

    const list = movieCache[from];
    if (!list) return reply("❌ Search first");

    const item = list[num - 1];
    if (!item || item.type !== "tv") return reply("❌ TV only");

    await sendDetails(conn, TVJID, item);
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
