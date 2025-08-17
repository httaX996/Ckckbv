/* Please Give Credit 🙂❤️ ⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚 */

const { cmd, commands } = require('../command'); 
const { fetchJson } = require('../lib/functions'); 
const domain = `https://anju-md-api.vercel.app/`; 
const api_key = `FreeMovie`;

//============================================

cmd({ 
  pattern: "mv3", 
  alias: ["slsub", "mv"], 
  react: '🎬', 
  category: "download", 
  desc: "Search movies on HDHub and get download links", 
  filename: __filename }, async (conn, m, mek, { from, isMe, isOwner, q, reply }) => { try { if (!q || q.trim() === '') return await reply('Please provide a search query! (e.g., Deadpool)');

// Fetch search results from new API
    const manu = await fetchJson(`${domain}/api/hdhub?q=${q}&apikey=${api_key}`);
    const movieData = manu.data.data;

    if (!Array.isArray(movieData) || movieData.length === 0) {
        return await reply(`No results found for: ${q}`);
    }

    const searchResults = movieData.slice(0, 10);

    let resultsMessage = `🤍 *𝐂𝐊 𝐂𝐢𝐧𝐞𝐌𝐀𝐗 𝐌𝐎𝐕𝐈𝐄 𝐑𝐄𝐒𝐔𝐋𝐓𝐒* 🤍\n\n"${q}":\n\n`;
    searchResults.forEach((result, index) => {
        const title = result.title || 'No title available';
        const link = result.link || 'No link available';
        const thumbnail = result.thumbnail || 'https://via.placeholder.com/150';
        resultsMessage += `*${index + 1}.* ${title}\n🔗 Link: ${link}\n📸 Thumbnail: ${thumbnail}\n\n`;
    });

    const sentMsg = await conn.sendMessage(m.chat, {
        image: { url: searchResults[0].thumbnail },
        caption: `${resultsMessage}`
    }, { quoted: mek });

    const messageID = sentMsg.key.id;

    const handleSearchReply = async (replyMek, selectedNumber) => {
        const selectedMovie = searchResults[selectedNumber - 1];
        const response = await fetchJson(`${domain}/api/hdhub?url=${encodeURIComponent(selectedMovie.link)}&apikey=${api_key}`);
        
        try {
            const movieDetails = response.data;
            const downloadLinks = movieDetails.downloadLinks || [];

            if (downloadLinks.length === 0) {
                return await reply('No download links found.');
            }

            let downloadMessage = `🎥 *${movieDetails.title}*\n\n*Available Download Links:*\n`;
            downloadLinks.forEach((link, index) => {
                downloadMessage += `*${index + 1}.* ${link.quality} - ${link.size}\n🔗 Link: ${link.link}\n\n`;
            });

            const pixelDrainMsg = await conn.sendMessage(m.chat, {
                image: { url: selectedMovie.thumbnail },
                caption: `${downloadMessage}`
            }, { quoted: replyMek });

            const pixelDrainMessageID = pixelDrainMsg.key.id;

            const handleDownloadReply = async (pdReply, qualityNumber) => {
                const selectedLink = downloadLinks[qualityNumber - 1];
                const file = selectedLink.link;
                const fileResponse = await fetchJson(`${domain}/api/hdhub?dlLink=${encodeURIComponent(file)}&apikey=${api_key}`);
                const downloadLink = fileResponse.data.downloadLink;

                await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });

                await conn.sendMessage(from, {
                    document: {
                        url: downloadLink
                    },
                    mimetype: 'video/mp4',
                    fileName: `🎬CK CineMAX🎬 - ${movieDetails.title}.mp4`,
                    caption: `*🗂️ සිංහල උපසිරැසි නැතිව HDHub Source එකෙන්.*\n*🪄Quality :* ${selectedLink.quality}\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                }, { quoted: pdReply });

                await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
            };

            conn.ev.on('messages.upsert', async (pdUpdate) => {
                const pdReply = pdUpdate.messages[0];
                if (!pdReply.message) return;
                const pdMessageType = pdReply.message.conversation || pdReply.message.extendedTextMessage?.text;
                const isReplyToPixelDrainMsg = pdReply.message.extendedTextMessage && pdReply.message.extendedTextMessage.contextInfo.stanzaId === pixelDrainMessageID;

                if (isReplyToPixelDrainMsg) {
                    const qualityNumber = parseInt(pdMessageType.trim());
                    if (!isNaN(qualityNumber) && qualityNumber > 0 && qualityNumber <= downloadLinks.length) {
                        handleDownloadReply(pdReply, qualityNumber);
                    } else {
                        await reply('Invalid selection. Please reply with a valid number.');
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching movie details:', error);
            await reply('Sorry, something went wrong while fetching the movie details.');
        }
    };

    conn.ev.on('messages.upsert', async (messageUpdate) => {
        const replyMek = messageUpdate.messages[0];
        if (!replyMek.message) return;
        const messageType = replyMek.message.conversation || replyMek.message.extendedTextMessage?.text;
        const isReplyToSentMsg = replyMek.message.extendedTextMessage && replyMek.message.extendedTextMessage.contextInfo.stanzaId === messageID;

        if (isReplyToSentMsg) {
            const selectedNumber = parseInt(messageType.trim());
            if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= searchResults.length) {
                handleSearchReply(replyMek, selectedNumber);
            } else {
                await reply('Invalid selection. Please reply with a valid number.‼️');
            }
        }
    });

} catch (error) {
    console.error('Error in hdhub command:', error);
    await reply('Sorry, something went wrong. Please try again later.🙁');
}

});

//=============©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚

