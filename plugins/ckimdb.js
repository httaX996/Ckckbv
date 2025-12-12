const axios = require("axios");
const { cmd } = require('../command');

// User API Key
const OMDB_API = "9b4d57d2";

let imdbSessions = {};

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

        let results = data.Search;
        imdbSessions[m.sender] = results;

        let msg = `🎬 *Results for:* _${text}_\n\n`;

        results.forEach((mv, i) => {
            msg += `*${i + 1}.* ${mv.Title} (${mv.Year})\n`;
        });

        msg += `\n📌 *Reply a number to view full movie details.*`;

        return m.reply(msg);

    } catch (e) {
        console.log(e);
        return m.reply("⚠️ Error searching IMDB.");
    }
});

cmd({
    on: "text"
}, async (conn, m) => {

    let movies = imdbSessions[m.sender];
    if (!movies) return;

    let num = parseInt(m.text.trim());
    if (isNaN(num) || num < 1 || num > movies.length) return;

    let movie = movies[num - 1];
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
            {
                image: { url: data.Poster },
                caption: caption
            },
            { quoted: m }
        );

    } catch (e) {
        console.log(e);
        return m.reply("⚠️ Error loading movie details.");
    }
});
