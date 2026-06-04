const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = '1c5502363449511f';

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
            `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-search?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;

        const { data } = await axios.get(searchUrl);

        if (!data.status || !data.data || !data.data.length) {
            return reply("❌ No movies found.");
        }

        let text = `🎬 \`𝗖𝗞 𝗖𝗜𝗡𝗘𝗦𝗨𝗕𝗭 𝗦𝗘𝗔𝗥𝗖𝗛\`\n\n`;
        text += `🔎 Search: \`$\`{q}\n\n`;

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
                    `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(selectedMovie.link)}&apikey=${API_KEY}`;

                const infoResponse = await axios.get(infoUrl);

                if (!infoResponse.data.status) {
                    return reply("❌ Failed to fetch movie details.");
                }

                const movie = infoResponse.data.data;

                let caption = `🎬 \`${movie.title}\`\n\n`;
                caption += `📅 \`YEAR:\` *${movie.year || "N/A"}*\n`;
                caption += `⭐ \`RATING:\` *${movie.rating || "N/A"}*\n`;
                caption += `⏳ \`DURATION:\` *${movie.duration || "N/A"}*\n`;
                caption += `🎥 \`DIRECTOR:\` *${movie.directors || "N/A"}*\n`;
                caption += `🌍 \`COUNTRY:\` *${movie.country || "N/A"}*\n\n`;

                caption += `📥 \`ᴀᴠᴀɪʟᴀʙʟᴇ Qᴜᴀʟɪᴛɪᴇꜱ\`\n\n`;

                movie.downloads.forEach((dl, i) => {
                    caption += `\`${i + 1}\` *|* ❭❭◦ ${dl.quality} • ${dl.size}\n`;
                });

                caption +=
                    `\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                const movieDetailsMessage =
                    await conn.sendMessage(
                        from,
                        {
                            image: {
                                url: movie.image
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
                            qualityIndex >= movie.downloads.length
                        ) {
                            return reply("❌ Invalid quality number.");
                        }

                        const selectedQuality =
                            movie.downloads[qualityIndex];

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
                            `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(selectedQuality.link)}&apikey=${API_KEY}`;

                        const downloadResponse =
                            await axios.get(downloadUrl);

                        if (!downloadResponse.data.status) {
                            return reply("❌ Download link not found.");
                        }

                        const downloadData =
                            downloadResponse.data.data;

                        const directLink =
                            downloadData.download.find(
                                x =>
                                    x.name &&
                                    x.name.toLowerCase() === "unknown"
                            )?.url;

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
