const axios = require("axios");
const { cmd } = require('../command');

// PUT YOUR OMDb API KEY HERE
const OMDB_API = "76e25b2c";

let imdbSessions = {};

cmd({
    pattern: "imdb",
    desc: "Search movies on IMDB",
    react: "🎬",
    category: "search"
}, async (conn, m, { text }) => {

    if (!text) return m.reply("🎬 *Usage:* .imdb deadpool");

    try {
        const url = `https://www.omdbapi.com/?s=${encodeURIComponent(text)}&apikey=${OMDB_API}`;
        const { data } = await axios.get(url);

        if (!data.Search) return m.reply("❌ No movies found!");

        let movies = data.Search;
        imdbSessions[m.sender] = movies;

        let msg = `🎬 *IMDB Results for:* _${text}_\n\n`;

        movies.forEach((mv, i) => {
            msg += `*${i + 1}.* ${mv.Title} (${mv.Year})\n`;
        });

        msg += `\n📌 *Reply a number to get movie details.*`;

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

        let caption = `🎬 *${data.Title}*\n\n`;
        caption += `📅 *Year:* ${data.Year}\n`;
        caption += `⭐ *Rating:* ${data.imdbRating}\n`;
        caption += `⏳ *Runtime:* ${data.Runtime}\n`;
        caption += `🎭 *Genre:* ${data.Genre}\n\n`;
        caption += `📝 *Plot:*\n${data.Plot}\n`;

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
        return m.reply("⚠️ Error loading details.");
    }
});
