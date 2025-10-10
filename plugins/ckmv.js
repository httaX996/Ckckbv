const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "ckmvd",
    desc: "Fetch detailed information about a movie.",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, args }) => {
    try {
        // Properly extract the movie name from arguments
        const movieName = args.length > 0 ? args.join(' ') : m.text.replace(/^[\.\#\$\!]?movie\s?/i, '').trim();
        
        if (!movieName) {
            return reply("📽️ Please provide the name of the movie.\nExample: .movie Iron Man");
        }

        const apiUrl = `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.movie) {
            return reply("🚫 Movie not found. Please check the name and try again.");
        }

        const movie = response.data.movie;
        
        // Format the caption
        const dec = `
🎬 *${movie.title}* (${movie.year}) ${movie.rated || ''}

⭐ *𝙸𝙼𝙳𝙱:* ${movie.imdbRating || 'N/A'} | 🍅 *𝚁𝙾𝚃𝚃𝙾𝙽 𝚃𝙾𝙼𝙰𝚃𝙾𝙴𝚂:* ${movie.ratings.find(r => r.source === 'Rotten Tomatoes')?.value || 'N/A'} | 💰 *𝙱𝙾𝚇 𝙾𝙵𝙵𝙸𝙲𝙴:* ${movie.boxoffice || 'N/A'}

📅 *𝚁𝙴𝙻𝙴𝙰𝚂𝙴𝙳:* ${new Date(movie.released).toLocaleDateString()}
⏳ *𝚁𝚄𝙽𝚃𝙸𝙼𝙴:* ${movie.runtime}
🎭 *𝙶𝙴𝙽𝚁𝙴:* ${movie.genres}

📝 *𝙿𝙻𝙾𝚃:* ${movie.plot}

🎥 *𝙳𝙸𝚁𝙴𝙲𝚃𝙾𝚁:* ${movie.director}
✍️ *𝚆𝚁𝙸𝚃𝙾𝚁:* ${movie.writer}
🌟 *𝙰𝙲𝚃𝙾𝚁𝚂:* ${movie.actors}

🌍 *𝙲𝙾𝚄𝙽𝚃𝚁𝚈:* ${movie.country}
🗣️ *𝙻𝙰𝙽𝙶𝚄𝙰𝙶𝙴:* ${movie.languages}
🏆 *𝙰𝚆𝙰𝚁𝙳𝚂:* ${movie.awards || 'None'}

[View On IMDB](${movie.imdbUrl})
`;

        // Send message with the requested format
        await conn.sendMessage(
            from,
            {
                image: { 
                    url: movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://files.catbox.moe/m5drmn.png'
                },
                caption: dec },
            { quoted: ck }
        );

    } catch (e) {
        console.error('Movie command error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

const ck = { 
 key: { 
  remoteJid: 'status@broadcast', 
  participant: '0@s.whatsapp.net' 
   }, 
message:{ 
  newsletterAdminInviteMessage: { 
    newsletterJid: '120363401805872716@newsletter', //add your channel jid
    newsletterName: "CK BOT", //add your bot name
    caption: `〴ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ ×͜×`, 
    inviteExpiration: 0
  }
 }
 }

