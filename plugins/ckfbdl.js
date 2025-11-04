const { cmd, commands } = require('../lib/scommand');
const { fetchJson } = require('../lib/sfunctions');

// ✅ Define your custom footer here
const FOOTER = "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*";

// ✅ Fix: Define desc1
const desc1 = 'Download Facebook videos in SD/HD quality or as Audio/Document';

// ✅ FB URL Validator
function fbreg(url) {
  return /facebook\.com|fb\.watch/.test(url);
}

const urlneed2 = '🧩 *Please provide a valid Facebook video link.*';

cmd({
  pattern: "fb",
  react: '📥',
  alias: ["fbdl"],
  desc: desc1,
  category: "download",
  use: '.fb <Fb video link>',
  filename: __filename
},
async(conn, mek, m, { from, prefix, q, reply }) => {
  try {
    if (!fbreg(q)) return await reply(urlneed2);
    const result = await fetchJson(`https://suhas-api-x.vercel.app/download/fbdown?url=${q}`);

    let dat = `📥 \`CK FB DOWNLOADER\` 📥

➤ *𝚅𝙸𝙳𝙴𝙾 𝚄𝚁𝙻 :* ${q}`;

    var sections = [
      {
        title: "𝐒𝙳 𝐓𝚈𝙿𝙴 🪫",
        rows: [
          { title: "    1.1", rowId: prefix + 'fbsd ' + q, description: ' 🪫 `SD` 𝐐𝚄𝙰𝙻𝙸𝚃𝚈 𝐕𝙸𝙳𝙴𝙾' },
          { title: "    1.2", rowId: prefix + 'fbsdd ' + q, description: ' 📂 `SD` 𝐐𝚄𝙰𝙻𝙸𝚃𝚈 𝐃𝙾𝙲𝚄𝙼𝙴𝙽𝚃' },
        ]
      },
      {
        title: "𝐇𝙳 𝐓𝚈𝙿𝙴 🔋",
        rows: [
          { title: "    2.1", rowId: prefix + 'fbhd ' + q, description: ' 🔋 `HD` 𝐐𝚄𝙰𝙻𝙸𝚃𝚈 𝐕𝙸𝙳𝙴𝙾' },
          { title: "    2.2", rowId: prefix + 'fbhdd ' + q, description: ' 📂 `HD` 𝐐𝚄𝙰𝙻𝙸𝚃𝚈 𝐃𝙾𝙲𝚄𝙼𝙴𝙽𝚃' },
        ]
      },
      {
        title: "𝐕𝙾𝙸𝙲𝙴 𝐓𝚈𝙿𝙴 🎶",
        rows: [
          { title: "    3.1", rowId: prefix + 'fba ' + q, description: ' 🎶 𝐀𝚄𝙳𝙸𝙾 𝐅𝙸𝙻𝙴' },
          { title: "    3.2", rowId: prefix + 'fbd ' + q, description: ' 📂 𝐃𝙾𝙲𝚄𝙼𝙴𝙽𝚃 𝐅𝙸𝙻𝙴' }
        ]
      }
    ];

    const listMessage = {
      image: { url: result.result.thumb },
      caption: dat,
      footer: FOOTER, // ✅ Directly using the defined footer
      title: '',
      buttonText: '*🔢 Reply Below Number*',
      sections
    };

    return await conn.replyList(from, listMessage, { quoted: ck });

  } catch (e) {
    reply('*ERROR !!*');
    console.log(e);
  }
});


cmd({
    pattern: "fbsd",
    react: "⬇",    
    filename: __filename
},

async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try {
  const result = await fetchJson(`https://suhas-api-x.vercel.app/download/fbdown?url=${q}`)

  // Send reactions and the video
  await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });
  await conn.sendMessage(from, { video: { url: result.result.sd }, mimetype: "video/mp4", caption: `> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*` }, { quoted: ck });
  await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

}catch(e){
await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } })
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})


cmd({
    pattern: "fbsdd",
    react: "⬇",    
    filename: __filename
},

async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

 

 // let data = await fetchJson(`${baseUrl}/api/fdown?url=${q}`)
const result = await fetchJson(`https://suhas-api-x.vercel.app/download/fbdown?url=${q}`)


	
await conn.sendMessage(from, { react: { text: '⬆', key: mek.key }})
await conn.sendMessage(from, { document: { url: result.result.sd }, mimetype: "video/mp4", fileName: `FaceBookDL.mp4`, caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*" }, { quoted: ck })	
await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})
}catch(e){
await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } })
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})


cmd({
    pattern: "fbhd",
    react: "⬇",    
    filename: __filename
},

async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
  
if (!q.includes('https://')) return await reply(msr.not_fo)

 // let data = await fetchJson(`${baseUrl}/api/fdown?url=${q}`)
const result = await fetchJson(`https://suhas-api-x.vercel.app/download/fbdown?url=${q}`)

await conn.sendMessage(from, { react: { text: '⬆', key: mek.key }})
await conn.sendMessage(from, { video: { url: result.result.hd }, mimetype: "video/mp4", caption: `> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*` }, { quoted: ck })  	
await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})
}catch(e){
await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } })
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})


cmd({
    pattern: "fbhdd",
    react: "⬇",    
    filename: __filename
},

async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
  
if (!q.includes('https://')) return await reply(msr.not_fo)

 // let data = await fetchJson(`${baseUrl}/api/fdown?url=${q}`)
const result = await fetchJson(`https://suhas-api-x.vercel.app/download/fbdown?url=${q}`)

await conn.sendMessage(from, { react: { text: '⬆', key: mek.key }})  
await conn.sendMessage(from, { document: { url: result.result.hd }, mimetype: "video/mp4", fileName: `FaceBookDL.mp4`, caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*" }, { quoted: ck }); 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})
}catch(e){
await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } })
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})


					    
cmd({
    pattern: "fba",
    react: "⬇",    
    filename: __filename
},

async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
  

if (!q.includes('https://')) return await reply(msr.not_fo)

//let data = await fetchJson(`${baseUrl}/api/fdown?url=${q}`)
const result = await fetchJson(`https://suhas-api-x.vercel.app/download/fbdown?url=${q}`)

	
await conn.sendMessage(from, { react: { text: '⬆', key: mek.key }})
await conn.sendMessage(from, { audio: { url: result.result.hd }, mimetype: "audio/mpeg" }, { quoted: mek })
await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})
}catch(e){
await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } })
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})


cmd({
    pattern: "fbd",
    react: "⬇",    
    filename: __filename
},

async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
  

if (!q.includes('https://')) return await reply(msr.not_fo)

//let data = await fetchJson(`${baseUrl}/api/fdown?url=${q}`)
const result = await fetchJson(`https://suhas-api-x.vercel.app/download/fbdown?url=${q}`)


	
await conn.sendMessage(from, { react: { text: '⬆', key: mek.key }})
await conn.sendMessage(from, { document: { url: result.result.hd }, mimetype: "audio/mpeg", fileName: `Fbdl.mp3`, caption: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*" }, { quoted: ck }); 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key }})
}catch(e){
await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } })
console.log(e)
reply(`Error !!\n\n*${e}*`)
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
