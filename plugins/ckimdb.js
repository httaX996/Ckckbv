const axios = require("axios");
const { cmd } = require('../command');

let imdbSessions = {};  // User reply sessions

cmd({
    pattern: "imdb",
    desc: "Search movies on IMDB",
    react: "🎬",
    category: "search"
}, async (conn, m, { text }) => {

    if (!text) return m.reply("🎬 *Usage:* .imdb deadpool");

    try {
        const searchUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(searchUrl);

        if (!data || !data.results || data.results.length === 0)
            return m.reply("❌ No movies found!");

        let msg = `🎬 *IMDB Search Results for:* _${text}_\n\n`;

        let movies = data.results.slice(0, 20); // Top 20

        movies.forEach((movie, i) => {
            msg += `*${i + 1}.* ${movie.title} (${movie.year || "N/A"})\n`;
        });

        msg += `\n📌 *Reply a number (1–${movies.length}) to view details.*`;

        imdbSessions[m.sender] = movies;

        return m.reply(msg);

    } catch (e) {
        console.log(e);
        return m.reply("⚠️ Error fetching IMDB results.");
    }
});

// Message handler for number reply
cmd({
    on: "text"
}, async (conn, m) => {
    let movies = imdbSessions[m.sender];

    if (!movies) return;

    let num = parseInt(m.text.trim());
    if (isNaN(num) || num < 1 || num > movies.length) return;

    let movie = movies[num - 1];
    delete imdbSessions[m.sender]; // Clear session

    try {
        const detailUrl = `https://imdb.iamidiotareyoutoo.com/title/${movie.id}`;
        const { data } = await axios.get(detailUrl);

        let caption = `🎬 *${data.title}*\n\n`;
        caption += `📅 *Year:* ${data.year}\n`;
        caption += `⭐ *Rating:* ${data.rating}\n`;
        caption += `⏳ *Runtime:* ${data.runtime}\n`;
        caption += `🎭 *Genres:* ${data.genres?.join(", ")}\n\n`;
        caption += `📝 *Plot:*\n${data.plot}\n`;

        let poster = data.poster ?? movie.image;

        return conn.sendMessage(
            m.chat,
            {
                image: { url: poster },
                caption: caption
            },
            { quoted: m }
        );

    } catch (err) {
        console.log(err);
        return m.reply("⚠️ Error fetching movie details.");
    }
});
