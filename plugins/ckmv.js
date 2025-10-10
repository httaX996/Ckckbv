const axios = require('axios');
const { cmd } = require('../command');

const ckmv = "120363406383917495@g.us";
const cktv = "120363406383917495@g.us";

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
🎬 *${movie.title} (${movie.year}) - සිංහල උපසිරැසි සමඟ*

🌟 *IMDb :* ${movie.imdbRating || 'N/A'}  
💰 *BOX OFFICE :* ${movie.boxoffice || 'N/A'}
📅 *RELEASED :* ${new Date(movie.released).toLocaleDateString()}
⏰ *RUNTIME :* ${movie.runtime}
🎭 *GENRES :* ${movie.genres}
🌍 *COUNTRY :* ${movie.country}
🔊 *LANGUAGE :* ${movie.languages}

> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*
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

cmd({
    pattern: "ckmvdd",
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
🎬 *${movie.title} (${movie.year}) - සිංහල උපසිරැසි සමඟ*

🌟 *IMDb :* ${movie.imdbRating || 'N/A'}  
💰 *BOX OFFICE :* ${movie.boxoffice || 'N/A'}
📅 *RELEASED :* ${new Date(movie.released).toLocaleDateString()}
⏰ *RUNTIME :* ${movie.runtime}
🎭 *GENRES :* ${movie.genres}
🌍 *COUNTRY :* ${movie.country}
🔊 *LANGUAGE :* ${movie.languages}

> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*
`;

        // Send message with the requested format
        await conn.sendMessage(
            ckmv,
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

cmd({
    pattern: "ckmvd3",
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
🎬 *${movie.title} (${movie.year}) - සිංහල උපසිරැසි සමඟ*

🌟 *IMDb :* ${movie.imdbRating || 'N/A'}  
💰 *BOX OFFICE :* ${movie.boxoffice || 'N/A'}
📅 *RELEASED :* ${new Date(movie.released).toLocaleDateString()}
⏰ *RUNTIME :* ${movie.runtime}
🎭 *GENRES :* ${movie.genres}
🌍 *COUNTRY :* ${movie.country}
🔊 *LANGUAGE :* ${movie.languages}

> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*
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
