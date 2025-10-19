const {cmd , commands} = require('../command')
const fg = require('api-dylux')
const yts = require('yt-search')


cmd({
    pattern: "song",
    desc: "Download songs",
    react: "🎶",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!q) return reply("Please give me url or title")
const search = await yts(q)
const data = search.videos[0];
const url = data.url

let desc = `
🎧 \`CK SONG DOWNLOADER\` 🎧

\`🔖TITLE:\` *${data.title}*
\`⏰DURATION:\` *${data.timestamp}*
\`📆UPLOAD ON:\` *${data.ago}*
\`👀VIEWS:\` *${data.views}*
\`🧙🏻‍♂️AUTHOR:\` *${data.author.name}*
\`🔗LINK:\` *${data.url}*

*⬇️ꜱᴇʟᴇᴄᴛ ʏᴏᴜ ᴡᴏɴᴛ⬇️*

\`1\` *|* ❭❭◦ *Download Audio 🎧*
\`2\` *|* ❭❭◦ *Download Document 📁*

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
`
const vv = await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: ck });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();

            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === vv.key.id) {
                switch (selectedOption) {
                    case '1':
                        let down = await fg.yta(url);
                        let downloadUrl = down.dl_url;
                        await conn.sendMessage(from, { audio: { url:downloadUrl }, caption: '> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*', mimetype: 'audio/mpeg'},{ quoted: ck });
                        break;
                    case '2':               
                        // Send Document File
                        let downdoc = await fg.yta(url);
                        let downloaddocUrl = downdoc.dl_url;
                        await conn.sendMessage(from, { document: { url:downloaddocUrl }, caption: '> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*', mimetype: 'audio/mpeg', fileName:data.title + ".mp3"}, { quoted: ck });
                        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } })
                        break;
                     default:
                        reply("Invalid option. Please select a valid option🔴");
                }

            }
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply('An error occurred while processing your request.');
    }
});


//==========video-dl==========

cmd({
    pattern: "video",
    desc: "Download videos",
    react: "🎥",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!q) return reply("Please give me url or title")
const search = await yts(q)
const data = search.videos[0];
const url = data.url

let desc = `
🎥 \`CK VIDEO DOWNLOADER\` 🎥

\`🔖TITLE:\` *${data.title}*
\`⏰DURATION:\` *${data.timestamp}*
\`📆UPLOAD ON:\` *${data.ago}*
\`👀VIEWS:\` *${data.views}*
\`🧙🏻‍♂️AUTHOR:\` *${data.author.name}*
\`🔗LINK:\` *${data.url}*

*⬇️ꜱᴇʟᴇᴄᴛ ʏᴏᴜ ᴡᴏɴᴛ⬇️*

\`1\` *|* ❭❭◦ *Download Video 🎥*
\`2\` *|* ❭❭◦ *Download Document 📁*

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
`
const vv = await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: ck });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();

            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === vv.key.id) {
                switch (selectedOption) {
                        case '1':
                        let downvid = await fg.ytv(url);
                        let downloadvUrl = downvid.dl_url;
                        await conn.sendMessage(from, { video : { url:downloadvUrl }, caption: '> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*', mimetype: 'video/mp4'},{ quoted: ck });
                        break;
                    case '2':
                        let downviddoc = await fg.ytv(url);
                        let downloadvdocUrl = downviddoc.dl_url;
                        await conn.sendMessage(from, { document: { url:downloadvdocUrl }, caption: '> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*', mimetype: 'video/mp4', fileName:data.title + ".mp4" }, { quoted: ck });
                        break;
                    default:
                        reply("Invalid option. Please select a valid option🔴");
                }

            }
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply('An error occurred while processing your request.');
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
