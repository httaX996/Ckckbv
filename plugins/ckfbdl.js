const { cmd, commands } = require('../commands');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "ckfb",
    alias: ["facebook"],
    use: '.fb <facebook url>',
    react: "🏮",
    desc: 'Download videos from Facebook',
    category: "download",
    filename: __filename
}, async (conn, m, mek, { from, prefix, q, reply }) => {
    try {
        if (!q || !q.includes('facebook.com')) {
            return await reply('*❌ Please enter a valid Facebook URL!*');
        }

        const apiURL = `https://apis.prexzyvilla.site/download/facebook?url=${encodeURIComponent(q)}`;
        console.log('🌐 FB API URL:', apiURL);

        let sadas;
        try {
            const res = await axios.get(apiURL, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Accept": "application/json",
                    "Referer": "https://www.facebook.com/"
                }
            });
            sadas = res.data;
            console.log('📦 API DATA:', JSON.stringify(sadas, null, 2));
        } catch (err) {
            console.error("❌ AXIOS ERROR:", err.response?.data || err.message);
            return reply('*⚠️ Failed to fetch data from Facebook API. Check console for details.*');
        }

        if (!sadas.status || !sadas.data) {
            return reply('*❌ No downloadable data found. Try another video.*');
        }

        const data = sadas.data;
        const hdUrl = data.hd;
        const sdUrl = data.sd;
        let thumb = data.thumbnail;

        // ✅ Use fallback or proxy for thumbnail
        if (!thumb || !thumb.startsWith('http')) {
            thumb = 'https://i.imgur.com/qNQv8Ru.jpeg';
        } else {
            thumb = `https://images.weserv.nl/?url=${encodeURIComponent(thumb.replace(/^https?:\/\//, ''))}`;
        }

        const duration = 'Unknown'; // Not available in new API
        const title = data.title || 'Facebook video';

        const caption = `*🏮 VISPER FB DOWNLOADER 🏮*
         *┌──────────────────*
         *├ 🐼 Title:* ${title}
         *├ ⏱️ Duration:* ${duration}
         *├ 🔗 Url:* ${q}
         *└──────────────────*
		 ${config.FOOTER}`;

        const buttons = [];

        if (hdUrl) {
            buttons.push({
                buttonId: prefix + 'downfb ' + hdUrl,
                buttonText: { displayText: '*HD Quality*' },
                type: 1
            });
        }

        if (sdUrl) {
            buttons.push({
                buttonId: prefix + 'downfb ' + sdUrl,
                buttonText: { displayText: '*SD Quality*' },
                type: 1
            });
        }

        if (buttons.length === 0) {
            return reply('*❌ No video formats found.*');
        }

        const buttonMessage = {
            image: { url: thumb },
            caption: caption,
            footer: config.FOOTER,
            buttons: buttons,
            headerType: 4
        };




            await conn.buttonMessage(from, buttonMessage, mek);


    } catch (e) {
        console.error('❌ Unexpected Error:', e);
        return reply('*⚠️ An unexpected error occurred. Try again later.*');
    }
});




cmd({
  pattern: "downfb",
  react: "🎥",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q || !q.includes('fbcdn')) return await reply('*❌ Invalid Facebook CDN video URL!*');

    reply('⏳ *Downloading Facebook video...*');

 const response = await axios.get(q, {
  responseType: 'arraybuffer',
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "*/*",
    "Accept-Encoding": "identity",
    "Referer": "https://fdown.net/",
    "Origin": "https://fdown.net"
  }
});


    const videoBuffer = Buffer.from(response.data, 'binary');

    await conn.sendMessage(from, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: '✅ *Facebook video downloaded successfully!*'
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

  } catch (error) {
    console.log("❌ Facebook video download error:", error);
    reply('*❌ Failed to download. The video might be geo-blocked or expired.*');
  }
});
