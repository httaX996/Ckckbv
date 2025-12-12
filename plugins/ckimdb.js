const axios = require("axios");
const { cmd } = require('../command');

const OMDB_API = "9b4d57d2";
let imdbSessions = {};

// IMDB SEARCH COMMAND
cmd({
    pattern: "imdb",
    desc: "IMDB movie search",
    react: "🎬",
    category: "search"
}, async (conn, m, { args }) => {

    const text = args.join(" ");
    if (!text) return m.reply("🎬 *Usage:* .imdb movie name");

    try {
        const url = `https://www.omdbapi.com/?s=${encodeURIComponent(text)}&apikey=${OMDB_API}`;
        const { data } = await axios.get(url);

        if (!data.Search) return m.reply("❌ No movies found!");

        imdbSessions[m.sender] = data.Search;

        let msg = `🎬 *Results for:* _${text}_\n\n`;

        data.Search.forEach((mv, i) => {
            msg += `*${i + 1}.* ${mv.Title} (${mv.Year})\n`;
        });

        msg += `\n📌 *Reply a number to view full details.*`;

        return m.reply(msg);

    } catch (err) {
        console.log(err);
        return m.reply("⚠️ Error searching IMDB.");
    }
});


// ---------------------------------------------------------
// 🔥 UNIVERSAL WORKING REPLY LISTENER  (NOT inside cmd())
// ---------------------------------------------------------

global.imdb_reply_handler = async (conn, m) => {

    const movies = imdbSessions[m.sender];
    if (!movies) return;

    const num = parseInt(m.text?.trim());
    if (isNaN(num)) return;
    if (!movies[num - 1]) return;

    const movie = movies[num - 1];
    delete imdbSessions[m.sender];

    try {
        const url = `https://www.omdbapi.com/?i=${movie.imdbID}&plot=full&apikey=${OMDB_API}`;
        const { data } = await axios.get(url);

        let caption = `
🎬 *${data.Title}*
📅 Year: ${data.Year}
⭐ Rating: ${data.imdbRating}
⏳ Runtime: ${data.Runtime}
🎭 Genre: ${data.Genre}

📝 *Plot:*
${data.Plot}
        `;

        return conn.sendMessage(
            m.chat,
            { image: { url: data.Poster }, caption },
            { quoted: m }
        );

    } catch (err) {
        console.log(err);
        return m.reply("⚠️ Error loading details.");
    }
};


// ---------------------------------------------------------
// ATTACH LISTENER TO YOUR BASE  (This ALWAYS works)
// ---------------------------------------------------------

// If your base uses "events" or "message-upsert"
global.ev.on("messages.upsert", async (msg) => {
    try {
        const m = msg.messages[0];
        const conn = global.conn;
        if (!m.message) return;

        m.text = m.message.conversation ||
                 m.message.extendedTextMessage?.text ||
                 m.message?.ephemeralMessage?.message?.extendedTextMessage?.text;

        if (!m.text) return;

        await global.imdb_reply_handler(conn, m);

    } catch (e) {
        console.log("Reply handler error:", e);
    }
});
