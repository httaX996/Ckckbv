const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = 'sadasggggg';

// Temporary memory store
const movieSearchStore = new Map();
const qualityStore = new Map();

cmd({
    pattern: "subck2",
    desc: "Search SinhalaSub movies",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {

        if (!q) {
            return reply("*Please provide a movie name.*");
        }

        const res = await axios.get(
            `https://apis.sadas.dev/api/v1/movie/sinhalasub/search?q=${encodeURIComponent(q)}&apiKey=${API_KEY}`
        );

        if (!res.data.status || !res.data.data.length) {
            return reply("*No movies found.*");
        }

        const movies = res.data.data;

        let text = `🎬 *Movie Search Results*\n\n`;

        movies.forEach((movie, i) => {
            text += `${i + 1}. ${movie.Title}\n`;
        });

        text += `\n_Reply with the movie number by replying to this message._`;

        const sent = await conn.sendMessage(
            from,
            { text },
            { quoted: mek }
        );

        movieSearchStore.set(sent.key.id, movies);

    } catch (e) {
        console.log(e);
        reply("*Error while searching movie.*");
    }
});

const movieSelectionListener = async (update) => {

    try {

        const msg = update.messages[0];

        if (!msg.message?.extendedTextMessage) return;

        if (
            msg.message.extendedTextMessage.contextInfo?.stanzaId !==
            sentMsg.key.id
        ) return;

        const selected =
            parseInt(
                msg.message.extendedTextMessage.text.trim()
            ) - 1;

        if (
            selected < 0 ||
            selected >= movies.length
        ) {
            return reply("❌ Invalid movie number.");
        }

        const movie = movies[selected];

        const infoUrl =
            `https://apis.sadas.dev/api/v1/movie/sinhalasub/infodl?q=${encodeURIComponent(movie.Link)}&apiKey=${API_KEY}`;

        const { data: info } =
            await axios.get(infoUrl);

        if (!info.status) {
            return reply("❌ Movie details not found.");
        }

        const details = info.data;

        const dlLinks =
            details.downloadLinks.filter(
                x => x.server === "DLServer-01"
            );

        let caption =
`🎬 *${details.title}*

📅 Year : ${details.date}
⭐ Rating : ${details.rating}
🌍 Country : ${details.country}

📥 *Available Qualities*

`;

        dlLinks.forEach((dl, i) => {
            caption +=
                `${i + 1}. ${dl.quality} - ${dl.size}\n`;
        });

        caption +=
            `\nReply with quality number.`;

        const qualityMsg =
            await conn.sendMessage(
                from,
                {
                    image: {
                        url: details.images[0]
                    },
                    caption
                },
                { quoted: ck }
            );

        const qualityListener = async (update2) => {

            try {

                const msg2 =
                    update2.messages[0];

                if (
                    !msg2.message?.extendedTextMessage
                ) return;

                if (
                    msg2.message
                    .extendedTextMessage
                    .contextInfo?.stanzaId !==
                    qualityMsg.key.id
                ) return;

                const qualityIndex =
                    parseInt(
                        msg2.message
                        .extendedTextMessage
                        .text.trim()
                    ) - 1;

                if (
                    qualityIndex < 0 ||
                    qualityIndex >= dlLinks.length
                ) {
                    return reply(
                        "❌ Invalid quality number."
                    );
                }

                const selectedQuality =
                    dlLinks[qualityIndex];

                await conn.sendMessage(
                    from,
                    {
                        document: {
                            url: selectedQuality.link
                        },
                        mimetype: "video/mp4",
                        fileName:
                            `${details.title}.mp4`,
                        caption:
`🎬 ${details.title}

📦 ${selectedQuality.size}
🎞️ ${selectedQuality.quality}`
                    },
                    { quoted: ck }
                );

            } catch (e) {
                console.log(e);
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

    } catch (e) {
        console.log(e);
    }

};
