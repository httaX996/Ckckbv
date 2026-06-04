const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = '1c5502363449511f';

// Temporary storage
const searchSessions = new Map();
const downloadSessions = new Map();

cmd({
    pattern: "cineck",
    desc: "Search movies from CineSubz",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {

        if (!q) {
            return reply("🎬 Please provide a movie name.\n\nExample:\n.cine deadpool");
        }

        const api = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-search?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;

        const { data } = await axios.get(api);

        if (!data.status || !data.data.length) {
            return reply("❌ No movies found.");
        }

        let text = `🎬 *CINESUBZ SEARCH RESULTS*\n\n`;
        text += `🔎 Search : ${q}\n\n`;

        data.data.forEach((movie, index) => {
            text += `*${index + 1}.* ${movie.title}\n`;
        });

        text += `\n💡 Reply to this message with the movie number.`;

        const sent = await conn.sendMessage(
            from,
            { text },
            { quoted: mek }
        );

        searchSessions.set(sent.key.id, data.data);

    } catch (err) {
        console.log(err);
        reply("❌ Error while searching movie.");
    }
});

// Reply Handler
cmd({
    on: "text"
},
async (conn, mek, m, { from, body }) => {

    try {

        if (!mek.message?.extendedTextMessage?.contextInfo?.stanzaId) return;

        const repliedId =
            mek.message.extendedTextMessage.contextInfo.stanzaId;

        const number = parseInt(body);

        if (isNaN(number)) return;

        // ==========================
        // MOVIE SELECTION
        // ==========================
        if (searchSessions.has(repliedId)) {

            const movies = searchSessions.get(repliedId);

            if (number < 1 || number > movies.length) return;

            const selectedMovie = movies[number - 1];

            const infoApi =
                `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(selectedMovie.link)}&apikey=${API_KEY}`;

            const { data } = await axios.get(infoApi);

            if (!data.status) {
                return;
            }

            const movie = data.data;

            let caption = `🎬 *${movie.title}*\n\n`;
            caption += `📅 *Year:* ${movie.year || "N/A"}\n`;
            caption += `⭐ *Rating:* ${movie.rating || "N/A"}\n`;
            caption += `⏳ *Duration:* ${movie.duration || "N/A"}\n`;
            caption += `🎥 *Director:* ${movie.directors || "N/A"}\n\n`;

            caption += `📥 *Available Downloads*\n\n`;

            movie.downloads.forEach((dl, i) => {
                caption += `*${i + 1}.* ${dl.quality} - ${dl.size}\n`;
            });

            caption += `\n💡 Reply to this message with the quality number.`;

            const sent = await conn.sendMessage(
                from,
                {
                    image: { url: movie.image },
                    caption
                },
                { quoted: mek }
            );

            downloadSessions.set(sent.key.id, {
                title: movie.title,
                downloads: movie.downloads
            });

            return;
        }

        // ==========================
        // QUALITY SELECTION
        // ==========================
        if (downloadSessions.has(repliedId)) {

            const session = downloadSessions.get(repliedId);

            const downloads = session.downloads;

            if (number < 1 || number > downloads.length) return;

            const selected = downloads[number - 1];

            const dlApi =
                `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(selected.link)}&apikey=${API_KEY}`;

            const { data } = await axios.get(dlApi);

            if (!data.status) {
                return;
            }

            const movie = data.data;

            const directLink =
                movie.download.find(
                    x => x.name.toLowerCase() === "unknown"
                )?.url;

            if (!directLink) {
                return conn.sendMessage(
                    from,
                    {
                        text: "❌ Direct download link not found."
                    },
                    { quoted: mek }
                );
            }

            await conn.sendMessage(
                from,
                {
                    document: {
                        url: directLink
                    },
                    mimetype: "video/mp4",
                    fileName: session.title + ".mp4",
                    caption:
`🎬 *${session.title}*

🎞️ Quality : ${selected.quality}
📦 Size : ${movie.size}

✅ Downloaded via CineSubz`
                },
                { quoted: mek }
            );

            return;
        }

    } catch (err) {
        console.log(err);
    }
});
