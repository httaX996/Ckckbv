const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');
const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";
const OMDB_KEY = "76cb7f39";

// Sinhala translation function
async function translateToSinhala(text) {
    try {
        const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`);
        return res.data.responseData.translatedText || text;
    } catch {
        return text;
    }
}

// Main command
cmd({
    pattern: "imdb",
    desc: "Get movie list + select for details",
    category: "movie",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❗කරුණාකර චිත්‍රපටයේ නම දෙන්න.\nඋදා: `.movieinfo Avengers`");

    conn.movieSearch = conn.movieSearch || {};

    // Check if user reply number
    const userReplyNumber = parseInt(q);
    if (conn.movieSearch[from] && !isNaN(userReplyNumber)) {
        const movies = conn.movieSearch[from];
        const selectedIndex = userReplyNumber - 1;

        if (!movies[selectedIndex]) return reply("❌ වැරදි number එකක්. නැවත උත්සාහ කරන්න.");

        const movie = movies[selectedIndex];

        try {
            const detailsRes = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_KEY}`);
            const poster = `https://image.tmdb.org/t/p/original${detailsRes.data.poster_path}`;
            const omdbRes = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&apikey=${OMDB_KEY}`);
            const omdb = omdbRes.data;

            const englishPlot = omdb.Plot || detailsRes.data.overview || "N/A";
            const sinhalaPlot = await translateToSinhala(englishPlot);

            const caption = `🎬 \`${omdb.Title || movie.title}\`\n\n` +
                            `⭐ *IMDb :* ${omdb.imdbRating || "N/A"}\n` +
                            `📆 *RELEASED :* ${omdb.Released || "N/A"}` +
                            `🎭 *GENRES :* ${omdb.Genre || "N/A"}\n` +
                            `⏰ *RUN TIME :* ${omdb.Runtime || "N/A"}\n` +
                            `🔊 *LANGUAGE :* ${omdb.Language || "N/A"}\n\n` +
                            `🗣️ *PLOT :* ${sinhalaPlot}\n\n` +
                            `> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*`;

            await conn.sendMessage(from, {
                image: { url: poster },
                caption: caption }, {quoted: ck});

            delete conn.movieSearch[from];
        } catch (err) {
            console.error(err);
            reply("❌ දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.");
        }

        return;
    }

    // If not reply number → search movie
    try {
        const searchRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}`);
        const results = searchRes.data.results;

        if (!results.length) return reply("😓 චිත්‍රපටය සොයාගත නොහැකි විය.");

        // Save results
        conn.movieSearch[from] = results;

        let listMessage = `🎬 *ඔබ සොයන චිත්‍රපටය මෙන්න:* \n\n`;
        results.slice(0, 10).forEach((movie, i) => {
            const year = movie.release_date?.slice(0,4) || "N/A";
            listMessage += `*${i+1}.* ${movie.title} (${year})\n`;
        });
        listMessage += `\n✅ ඔබට අවශ්‍ය චිත්‍රපටය number එක reply කරන්න.`;

        reply(listMessage);
    } catch (err) {
        console.error(err);
        reply("❌ දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.");
    }
});

const ck = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ ×͜×",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};
