const dewapi = require("dew-api");
const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "cksubz",
    alias: ["cs", "movie"],
    desc: "Download Cinesubz movies as document",
    category: "download",
    use: ".cinesubz <movie link>",
    react: "🎬"
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) {
            return reply("❌ Cinesubz movie link එකක් දෙන්න.\n\nඋදා:\n.cinesubz https://cinesubz.lk/movies/xxx/");
        }

        const url = args[0];

        if (!url.includes("cinesubz.lk")) {
            return reply("❌ Cinesubz link එකක් පමණක් දෙන්න.");
        }

        reply("⏳ Movie එක process කරමින්...");

        const data = await dewapi.movie.cinesubzdl(url);

        if (!data || !data.result || data.result.length === 0) {
            return reply("❌ Download links හමු නොවුණා.");
        }

        // Default එකට best quality එක ගන්නවා
        const dl = data.result[data.result.length - 1];

        const fileUrl = dl.url;
        const quality = dl.quality || "movie";
        const title = (data.title || "movie").replace(/[\\/:*?"<>|]/g, "");

        reply(`📥 Downloading: ${title} (${quality})`);

        // Download buffer
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data);

        const fileName = `${title}-${quality}.mp4`;

        await conn.sendMessage(from, {
            document: buffer,
            mimetype: "video/mp4",
            fileName: fileName
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("❌ Movie download එක අසාර්ථක විය.");
    }
});
