const { cmd } = require('../command')
const { fetchJson } = require('../lib/functions')


cmd({
  pattern: 'song',
  alias: ['play', 'ytsong'],
  react: '🎧',
  desc: 'Search & download YouTube songs',
  category: 'download',
  use: '.song <name>',
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply('❌ Please give me a song name')

    // Search song
    const { result } = await fetchJson(
      `https://tharuzz-ofc-apis.vercel.app/api/search/ytsearch?query=${encodeURIComponent(q)}`
    )

    const song = result?.[0]
    if (!song) return reply('❌ No results found')

    const { title, url, image, thumbnail, timestamp, ago, views } = song

    // Get MP3 link
    const mp3 = await fetchJson(
      `https://tharuzz-ofc-api-v3.vercel.app/api/ytdl/yt?url=${encodeURIComponent(url)}&format=mp3`
    )

    const downloadUrl = mp3?.result?.download
    if (!downloadUrl) return reply('❌ Download link not found')

    const caption = `🎶 \`CK SONG DOWNLOADER\` 🎶

🔖 \`TITLE:\` *${title}*
⏰ \`DURATION:\` ${timestamp}*
📆 \`UPLOAD ON:\` *${ago}*
👀 \`VIEWS:\` *${views}*

🔽 *Reply with number:*
 \`1\` *|* ❭❭◦ *Audio Type 🎧*
 \`2\` *|* ❭❭◦ *Document Type 📁*`

    const infoMsg = await conn.sendMessage(from, {
      image: { url: image || thumbnail },
      caption
    }, { quoted: ck })

    // Listen only once
    const handler = async (msgUpdate) => {
      const msg = msgUpdate.messages?.[0]
      if (!msg?.message?.extendedTextMessage) return

      const text = msg.message.extendedTextMessage.text?.trim()
      const context = msg.message.extendedTextMessage.contextInfo

      if (!context || context.stanzaId !== infoMsg.key.id) return

      await conn.sendMessage(from, { react: { text: '📥', key: msg.key } })

      if (text === '1') {
        await conn.sendMessage(from, {
          audio: { url: downloadUrl },
          mimetype: 'audio/mpeg'
        }, { quoted: ck })

      } else if (text === '2') {
        await conn.sendMessage(from, {
          document: { url: downloadUrl },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          caption: `📂 Your YouTube song`
        }, { quoted: ck })

      } else {
        await reply('❌ Invalid number. Please reply 1 or 2')
      }

      conn.ev.off('messages.upsert', handler) // prevent memory leak
    }

    conn.ev.on('messages.upsert', handler)

  } catch (e) {
    console.log(e)
    reply('❌ Error: ' + e.message)
  }
})

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
