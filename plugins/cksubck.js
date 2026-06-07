const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');

const API_KEY = "sadasggggg";

const API_KEY = "sadasggggg";

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
        console.log(e);
        return null;
    }
}

const searchSessions = {};
const qualitySessions = {};

cmd({
    pattern: "subck",
    desc: "Search SinhalaSub movies",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("*Please provide a movie name.*\n\nExample:\n.cineck avatar");
        }

        const { data } = await axios.get(
            `https://apis.sadas.dev/api/v1/movie/sinhalasub/search?q=${encodeURIComponent(q)}&apiKey=${API_KEY}`
        );

        if (!data.status || !data.data.length) {
            return reply("*No movies found!*");
        }

        let text = `🎬 *Movie Search Results*\n\n`;

        data.data.forEach((movie, i) => {
            text += `${i + 1}. ${movie.Title}\n`;
        });

        text += `\n_Reply to this message with a number._`;

        const sent = await conn.sendMessage(
            from,
            { text },
            { quoted: ck }
        );

        searchSessions[sent.key.id] = data.data;

    } catch (err) {
        console.error(err);
        reply("*Error fetching movie results!*");
    }
});

cmd({
    on: "text"
},
async (conn, mek, m, { from, body }) => {

    try {

        const quoted =
            mek.message?.extendedTextMessage?.contextInfo?.stanzaId;

        if (!quoted) return;

        const number = parseInt(body);

        if (isNaN(number)) return;

        // MOVIE SELECTION
        if (searchSessions[quoted]) {

            const movies = searchSessions[quoted];

            if (number < 1 || number > movies.length) return;

            const selectedMovie = movies[number - 1];

            const { data } = await axios.get(
                `https://apis.sadas.dev/api/v1/movie/sinhalasub/infodl?q=${encodeURIComponent(selectedMovie.Link)}&apiKey=${API_KEY}`
            );

            if (!data.status || !data.data?.status) {
                return;
            }

            const info = data.data;
            const downloads = info.downloadLinks.filter(
    x => x.server === "DLServer-01"
);

            const image =
                info.images?.[0] ||
                selectedMovie.Img;

            const dlLinks = info.downloadLinks.filter(
                x => x.server === "DLServer-01"
            );

            if (!dlLinks.length) {
                return conn.sendMessage(
                    from,
                    { text: "No DLServer-01 links found." },
                    { quoted: mek }
                );
            }

            let caption =
`🎬 *${info.title}*

📅 Date : ${info.date}
⭐ Rating : ${info.rating}
🌍 Country : ${info.country}

📥 *Download Qualities*

`;

            downloads.forEach((item, index) => {
    caption += `${index + 1}. ${item.quality} - ${item.size}\n`;
});

            caption += `\n_Reply to this image with a quality number._`;

            const sent = await conn.sendMessage(
                from,
                {
                    image: { url: image },
                    caption
                },
                { quoted: ck }
            );

            qualitySessions[sent.key.id] = dlLinks;

            delete searchSessions[quoted];
        }

        // QUALITY SELECTION
        else if (qualitySessions[quoted]) {

            const links = qualitySessions[quoted];

            if (number < 1 || number > links.length) return;

            const selected = links[number - 1];

          const thumb = await createThumbnail(
    info.images?.[0]
);

            await conn.sendMessage(
    from,
    {
        document: {
            url: selected.link
        },
        mimetype: "video/mp4",
        fileName: `${info.title}.mp4`,
        jpegThumbnail: thumb,
        caption:
`🎬 ${info.title}

🎞️ Quality : ${selected.quality}
📦 Size : ${selected.size}`
    },
    { quoted: ck }
);

            delete qualitySessions[quoted];
        }

    } catch (err) {
        console.error(err);
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

