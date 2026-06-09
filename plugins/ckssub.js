const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');

// පරිශීලකයාගේ පියවරයන් තාවකාලිකව මතක තබා ගැනීමට (Session Manager)
if (!global.cineck_sessions) {
    global.cineck_sessions = {};
}

const API_KEY = 'ea4d57a2a2db72e0bb3ba58f56b1ff9b';

// Thumbnail එක සෑදීමේ Function එක
async function createThumbnail(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return await sharp(response.data)
            .resize(300, 300)
            .jpeg({ quality: 80 })
            .toBuffer();
    } catch (e) {
        console.log('Thumbnail Error:', e);
        return null;
    }
}

// -------------------------------------------------------------------------
// 1. ප්‍රධාන සෙවුම් Command එක (.cineck <movie_name>)
// -------------------------------------------------------------------------
cmd({
    pattern: "subck",
    desc: "Search movies from CineSubz",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("🎬 Please provide a movie name.\n\nExample:\n.cineck deadpool");
        }

        const searchUrl = `https://apis.sadas.dev/api/v1/movie/cinesubz/search?q=${encodeURIComponent(q)}&apiKey=${API_KEY}`;
        const { data } = await axios.get(searchUrl);

        if (!data.status || !data.data || !data.data.length) {
            return reply("❌ No movies found.");
        }

        let text = `🎬 \`𝗖𝗞 𝗖𝗜𝗡𝗘𝗦𝗨𝗕𝗭 𝗦𝗘𝗔𝗥𝗖𝗛\`\n\n`;
        text += `*🔎 Search:* \`${q}\`\n\n`;

        data.data.forEach((movie, index) => {
            text += `\`${index + 1}\` *|* ❭❭◦ *${movie.title}*\n`;
        });

        text += `\n💡 Reply to this message with the movie number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentMsg = await conn.sendMessage(
            from,
            { image: { url: config.IMG_URL }, caption: text },
            { quoted: ck }
        );

        // පළමු පියවර සඳහා Session එක Save කිරීම
        global.cineck_sessions[sentMsg.key.id] = {
            type: 'movie_list',
            movies: data.data,
            timestamp: Date.now()
        };

    } catch (err) {
        console.log(err);
        reply("❌ Error while searching movie.");
    }
});

// -------------------------------------------------------------------------
// 2. අංක හරහා ලැබෙන පිළිතුරු (Replies) හැසිරවීම සඳහා පොදු Listener එක
// -------------------------------------------------------------------------
cmd({
    on: "text",
    filename: __filename
},
async (conn, mek, m, { from, body, reply }) => {
    try {
        // Reply කර ඇති පණිවිඩයේ Stanza ID එක ලබා ගැනීම
        const quotedId = m.quoted ? (m.quoted.id || (m.quoted.key && m.quoted.key.id)) : null;
        if (!quotedId || !global.cineck_sessions[quotedId]) return;

        const session = global.cineck_sessions[quotedId];
        
        // විනාඩි 2ක් (මිලිතත්පර 120000) ඉක්මවා ඇත්නම් Session එක Expire කිරීම
        if (Date.now() - session.timestamp > 120000) {
            delete global.cineck_sessions[quotedId];
            return reply("❌ Session expired. Please search again.");
        }

        const userReply = body ? body.trim() : "";
        const selectedIndex = parseInt(userReply) - 1;

        if (isNaN(selectedIndex) || selectedIndex < 0) return;

        // =================================================================
        // [පියවර A] චිත්‍රපට අංකය තෝරාගත් විට (Movie Details & Quality List)
        // =================================================================
        if (session.type === 'movie_list') {
            if (selectedIndex >= session.movies.length) return reply("❌ Invalid movie number.");

            const selectedMovie = session.movies[selectedIndex];
            await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

            const infoUrl = `https://apis.sadas.dev/api/v1/movie/cinesubz/info?q=${encodeURIComponent(selectedMovie.link)}&apiKey=${API_KEY}`;
            const infoResponse = await axios.get(infoUrl);

            if (!infoResponse.data.status) {
                return reply("❌ Failed to fetch movie details.");
            }

            const movie = infoResponse.data.data;

            let caption = `🎬 \`${movie.title}\`\n\n`;
            caption += `📅 \`YEAR:\` *${movie.year || "N/A"}*\n`;
            caption += `⭐ \`RATING:\` *${movie.imdb_rating || "N/A"}*\n`;
            caption += `💿 \`QUALITY:\` *${movie.quality || "N/A"}*\n`;
            caption += `🎭 \`CAST:\` ${movie.cast?.slice(0, 5).map(c => `*• ${c.name} (${c.role})*`).join('\n') || "N/A"}\n\n`;
            caption += `📥 \`ᴀᴠᴀɪʟᴀʙʟᴇ Qᴜᴀʟɪᴛɪᴇꜱ\`\n\n`;

            movie.download_links.forEach((dl, i) => {
                caption += `\`${i + 1}\` *|* ❭❭◦ *${dl.quality} • ${dl.size}*\n`;
            });

            caption += `\n> 💡 Reply to this message with the quality number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

            const movieDetailsMessage = await conn.sendMessage(
                from,
                { image: { url: movie.poster }, caption },
                { quoted: ck }
            );

            // ඊළඟ Quality තේරීමේ පියවර සඳහා නව Session එකක් නිර්මාණය කිරීම
            global.cineck_sessions[movieDetailsMessage.key.id] = {
                type: 'quality_list',
                movieData: movie,
                timestamp: Date.now()
            };

            // පරණ සෙවුම් ලැයිස්තුවේ session එක මතකයෙන් ඉවත් කිරීම
            delete global.cineck_sessions[quotedId];
        }
        
        // =================================================================
        // [පියවර B] Quality අංකය තෝරාගත් විට (Document Download)
        // =================================================================
        else if (session.type === 'quality_list') {
            const movie = session.movieData;

            if (selectedIndex >= movie.download_links.length) {
                return reply("❌ Invalid quality number.");
            }

            const selectedQuality = movie.download_links[selectedIndex];
            await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

            const downloadUrl = `https://apis.sadas.dev/api/v1/movie/cinesubz/dl?q=${encodeURIComponent(selectedQuality.final_link)}&apiKey=${API_KEY}`;
            const downloadResponse = await axios.get(downloadUrl);

            if (!downloadResponse.data.status) {
                return reply("❌ Download link not found.");
            }

            const links = downloadResponse.data.data?.links || [];

            // Telegram ලින්ක් නොවන සෘජු (Direct) mp4 ලින්ක් එක පෙරීම
            const directLink = links.find(link => !link.includes("t.me") && !link.includes("telegram"));

            if (!directLink) {
                return reply("❌ Direct download link not found.");
            }

            const thumb = await createThumbnail(movie.poster);

            await conn.sendMessage(
                from,
                {
                    document: { url: directLink },
                    mimetype: "video/mp4",
                    fileName: `${movie.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp4`,
                    jpegThumbnail: thumb,
                    caption: `🎬 \`${movie.title}\`\n\n🎞️ \`Quality:\` *${selectedQuality.quality}*\n📦 \`Size:\` *${selectedQuality.size}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                },
                { quoted: ck }
            );

            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

            // කාර්යය නිම වූ පසු Session එක සම්පූර්ණයෙන්ම මකා දැමීම
            delete global.cineck_sessions[quotedId];
        }

    } catch (err) {
        console.log(err);
        reply("❌ An error occurred while processing your request.");
    }
});

// Quoted (Fake) Message Object එක
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
