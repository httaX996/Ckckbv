const axios = require("axios");
const { cmd } = require("../command");

const API_KEY = "dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK";

cmd({
    pattern: "^[0-9]+$",
    desc: "Select movie / quality",
    category: "movie",
    filename: __filename
},
async (conn, mek, m, { from, body, reply }) => {
    try {
        // Movie selection
        if (global.cinesubzSearch[from]) {
            const index = parseInt(body) - 1;
            const movie = global.cinesubzSearch[from][index];
            if (!movie) return reply("❌ Invalid movie number");

            const url = `https://api.srihub.store/movie/cinesubzdl?apikey=${API_KEY}&url=${encodeURIComponent.notice(movie.url)}`;
            const { data } = await axios.get(url);

            let text = `🎬 *${data.result.title}*\n`;
            text += `⭐ IMDB: ${data.result.imdb}\n`;
            text += `🗓 Year: ${data.result.year}\n\n`;
            text += `📥 *Available Qualities*\n\n`;

            data.result.dl_links.forEach((q, i) => {
                text += `${i + 1}. ${q.quality} (${q.size})\n`;
            });

            text += `\n🎥 Quality number එක reply කරන්න`;

            global.cinesubzQuality[from] = data.result.dl_links;
            delete global.cinesubzSearch[from];

            return reply(text);
        }

        // Quality selection
        if (global.cinesubzQuality[from]) {
            const qIndex = parseInt(body) - 1;
            const quality = global.cinesubzQuality[from][qIndex];
            if (!quality) return reply("❌ Invalid quality number");

            await conn.sendMessage(from, {
                document: { url: quality.link },
                mimetype: "video/mp4",
                fileName: `🎬 ${quality.quality}.mp4`
            }, { quoted: mek });

            delete global.cinesubzQuality[from];
        }

    } catch (e) {
        console.log(e);
        reply("❌ Download error");
    }
});
