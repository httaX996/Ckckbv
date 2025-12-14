const axios = require("axios");
const { cmd } = require("../command");

const API_KEY = "dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK";

cmd({
    pattern: "ckcz",
    desc: "Search movies from Cinesubz",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args.length) {
            return reply("🎬 *Usage:*\n.cinesubz Ne Zha");
        }

        const query = args.join(" ");
        const url = `https://api.srihub.store/movie/cinesubz?apikey=${API_KEY}&_attach=1&q=${encodeURIComponent(query)}`;

        const { data } = await axios.get(url);
        if (!data.status || data.result.length === 0) {
            return reply("❌ Movie හමුවුණේ නෑ");
        }

        let text = `🎬 *Cinesubz Search Results*\n\n`;
        data.result.forEach((m, i) => {
            text += `${i + 1}. ${m.title}\n`;
        });

        text += `\n📥 Movie number එක reply කරන්න`;

        global.cinesubzSearch[from] = data.result;

        reply(text);

    } catch (e) {
        console.log(e);
        reply("❌ Search error");
    }
});
