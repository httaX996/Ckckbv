
const {cmd} = require('../command');
const {fetchJson} = require('../lib/functions')

cmd({
    pattern: "song",
    alias: ["play", "ytsong"],
    react: "🎧",
    desc: "Search and download you tube songs.",
    category: "download",
    use: ".song <SONG NAME>",
    filename: __filename
}, async (conn, mek, m, {from, reply, q}) => {
  try {
    if (!q) {
      return await reply('❌ Please give me a song name')
    }
    
    const tharushaFetch = await fetchJson(`https://tharuzz-ofc-apis.vercel.app/api/search/ytsearch?query=` + encodeURIComponent(q));
    const tharushaRes = tharushaFetch.result[0];
    const {title, url, description, image, thumbnail, seconds, timestamp, ago, views} = tharushaRes;
    
    const tharushaMp3Fetch = await fetchJson(`https://tharuzz-ofc-api-v3.vercel.app/api/ytdl/yt?url=${encodeURIComponent(url)}&format=mp3`);
    const downloadUrl = tharushaMp3Fetch.result.download;
    
    let songInfoMsg = `🎶 \`CK SONG DOWNLOADER\` 🎶\n\n` +
    `🔖 \`TITLE:\` *${title}*\n` + 
    `⏰ \`DURATION:\` *${timestamp}*\n` +
    `📆 \`UPLOAD ON:\` *${ago}*\n` + 
    `👀 \`VIEWS:\` *${views}*\n\n` +
    `🔽 *Reply below number*\n\n` +
    `\`1\` *|* ❭❭◦ *Download Audio 🎧*\n` +
    `\`2\` *|* ❭❭◦ *Download Document 📁*\n\n` +
    `> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;
    
    const infoMsg = await conn.sendMessage(from, {
      image: {url: image || thumbnail},
      caption: songInfoMsg
    }, {quoted: ck});
    
    conn.ev.on("messages.upsert", async (msgUpdate) => {
      const mp3msg = msgUpdate.messages[0];
                if (!mp3msg.message || !mp3msg.message.extendedTextMessage) return;

      const selectedOption = mp3msg.message.extendedTextMessage.text.trim();
       
      if (mp3msg.message.extendedTextMessage.contextInfo &&
            mp3msg.message.extendedTextMessage.contextInfo.stanzaId === infoMsg.key.id) {
      await conn.sendMessage(from, { react: { text: "📥", key: mp3msg.key } });
      
      switch (selectedOption) {
        case '1':
          await conn.sendMessage(from, {
            audio: {url: downloadUrl},
            mimetype: 'audio/mpeg'
          }, {quoted: ck});
          break;
          
        case '2':
          await conn.sendMessage(from, {
             document: { url: downloadUrl },
             mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,     
            caption: `*📂 ᴛʜɪꜱ ɪꜱ ʏᴏᴜʀ ʏᴏᴜ ᴛᴜʙᴇ ꜱᴏɴɢ ᴅᴏᴄᴜᴍᴇɴᴛ ꜰɪʟᴇ*`
          }, {quoted: ck})
            break;
  
        default:
          await reply('❌ Inalid number please reply a valid number');
      }
    }});
  } catch (e) {
    console.log('❌ Error: ' + e);
    return await reply('❌ Error: ' + e.message);
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
