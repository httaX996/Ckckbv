const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');

const API_KEY = '1c5502363449511f';

async function createThumbnail(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        return await sharp(response.data)
            .resize(300, 300)
            .jpeg({ quality: 80 })
            .toBuffer();

    } catch (e) {
        console.log('Thumbnail Error:', e);
        return null;
    }
}

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
            return reply(
                "🎬 Please provide a movie name.\n\nExample:\n.cine deadpool"
            );
        }

        const searchUrl =
            `https://apis.sadas.dev/api/v1/movie/cinesubz/search?q=${encodeURIComponent(q)}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;

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
            {
                image: { url: `https://i.ibb.co/fd7v5197/6xs-BKLp911.jpg` },
                caption: text
            },
            { quoted: ck }
        );

        const movieSelectionListener = async (update) => {

            try {

                const msg = update.messages[0];

                if (!msg.message?.extendedTextMessage) return;

                if (
                    msg.message.extendedTextMessage.contextInfo?.stanzaId !==
                    sentMsg.key.id
                ) return;

                const userReply =
                    msg.message.extendedTextMessage.text.trim();

                const selectedMovieIndex =
                    parseInt(userReply) - 1;

                if (
                    selectedMovieIndex < 0 ||
                    selectedMovieIndex >= data.data.length
                ) {
                    return reply("❌ Invalid movie number.");
                }

                const selectedMovie =
                    data.data[selectedMovieIndex];

                const infoUrl =
                    `https://apis.sadas.dev/api/v1/movie/cinesubz/info?q=${encodeURIComponent(selectedMovie.link)}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b`;

                const infoResponse = await axios.get(infoUrl);

                if (!infoResponse.data.status) {
                    return reply("❌ Failed to fetch movie details.");
                }

                const movie = infoResponse.data.data;

                let caption = `🎬 \`${movie.title}\`\n\n`;
                caption += `📅 \`YEAR:\` *${movie.year || "N/A"}*\n`;
                caption += `⭐ \`RATING:\` *${movie.imdb_rating || "N/A"}*\n`;
                caption += `💿 \`QUALITY:\` *${movie.quality || "N/A"}*\n`;
                caption += `🎭 \`CAST:\` *${movie.cast?.slice(0, 5).map(c => `• ${c.name} (${c.role})`).join('\n') || "N/A"}*\n`;

                caption += `📥 \`ᴀᴠᴀɪʟᴀʙʟᴇ Qᴜᴀʟɪᴛɪᴇꜱ\`\n\n`;

                movie.download_links.forEach((dl, i) => {
                    caption += `\`${i + 1}\` *|* ❭❭◦ *${dl.quality} • ${dl.size}*\n`;
                });

                caption +=
                    `\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                const movieDetailsMessage =
                    await conn.sendMessage(
                        from,
                        {
                            image: {
                                url: movie.poster
                            },
                            caption
                        },
                        { quoted: ck }
                    );

                const qualityListener = async (update2) => {

                    try {

                        const msg2 = update2.messages[0];

                        if (!msg2.message?.extendedTextMessage) return;

                        if (
                            msg2.message.extendedTextMessage.contextInfo?.stanzaId !==
                            movieDetailsMessage.key.id
                        ) return;

                        const qualityReply =
                            msg2.message.extendedTextMessage.text.trim();

                        const qualityIndex =
                            parseInt(qualityReply) - 1;

                        if (
                            qualityIndex < 0 ||
                            qualityIndex >= movie.download_links.length
                        ) {
                            return reply("❌ Invalid quality number.");
                        }

                        const selectedQuality =
                            movie.download_links[qualityIndex];
                        
                        const thumb = await createThumbnail(movie.poster);

                        await conn.sendMessage(
                            from,
                            {
                                react: {
                                    text: "⬇️",
                                    key: msg2.key
                                }
                            }
                        );

                        const downloadUrl =
                            `https://apis.sadas.dev/api/v1/movie/cinesubz/dl?q=${encodeURIComponent(selectedQuality.final_link)}&apiKey=ea4d57a2a2db72e0bb3ba58f56b1ff9b}`;

                        const downloadResponse =
                            await axios.get(downloadUrl);

                        if (!downloadResponse.data.status) {
                            return reply("❌ Download link not found.");
                        }

                        const downloadData =
                            downloadResponse.data.data;

                        const directLink = downloadResponse.data.links.find(link =>
                              link.includes('.mp4') &&
                              !link.includes('pixeldrain') &&
                              !link.includes('t.me')
                              );

                        if (!directLink) {
                            return reply(
                                "❌ Direct download link not found."
                            );
                        }

                        await conn.sendMessage(
                            from,
                            {
                                document: {
                                    url: directLink
                                },
                                mimetype: "video/mp4",
                                fileName: `${movie.title}.mp4`,
                                jpegThumbnail: thumb,
                                caption:
`🎬 \`${movie.title}\`

🎞️ \`Quality:\` *${selectedQuality.quality}*
📦 \`Size:\` *${selectedQuality.size}*

> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                            },
                            { quoted: ck }
                        );

                        await conn.sendMessage(
                            from,
                            {
                                react: {
                                    text: "✅",
                                    key: msg2.key
                                }
                            }
                        );

                    } catch (err) {
                        console.log(err);
                        reply("❌ Error while downloading.");
                    }

                };

                conn.ev.on(
                    "messages.upsert",
                    qualityListener
                );

                setTimeout(() => {
                    conn.ev.off(
                        "messages.upsert",
                        qualityListener
                    );
                }, 120000);

            } catch (err) {
                console.log(err);
                reply("❌ Error while fetching movie details.");
            }

        };

        conn.ev.on(
            "messages.upsert",
            movieSelectionListener
        );

        setTimeout(() => {
            conn.ev.off(
                "messages.upsert",
                movieSelectionListener
            );
        }, 120000);

    } catch (err) {
        console.log(err);
        reply("❌ Error while searching movie.");
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
