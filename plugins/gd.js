const config = require('../config')
const fetch = require('node-fetch')
const fg = require('api-dylux')
const cheerio = require('cheerio')
const { DBM } = require('postgres_dbm')
const { sizeFormatter } = require('human-readable')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')
const Jimp = require('jimp');  // Add jimp here

async function GDriveDl(url) {
  let id, res = { "error": true }
  if (!(url && url.match(/drive.google/i))) return res

  const formatSize = sizeFormatter({
    std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`
  })

  try {
    id = (url.match(/(?:drive\.google\.com\/.*?id=|\/d\/)(.*?)(?:[\/?&])/i) || url.match(/\/d\/(.*?)(?:[\/?&])/))[1]
    if (!id) throw 'ID Not Found'
    res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
      method: 'post',
      headers: {
        'accept-encoding': 'gzip, deflate, br',
        'content-length': 0,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'origin': 'https://drive.google.com',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
        'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
        'x-drive-first-party': 'DriveWebUi',
        'x-json-requested': 'true'
      }
    })

    let { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4))
    if (!downloadUrl) throw 'Link Download Limit!'

    // Fetch and resize image using Jimp
    const imageBuffer = await fetch('https://files.catbox.moe/8o4q88.jpg').then(res => res.buffer())
    const image = await Jimp.read(imageBuffer)
    await image.resize(150, 150); // Resize to thumbnail size (150x150)

    // Save resized image buffer
    const thumbnailBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)

    let data = await fetch(downloadUrl)
    if (data.status !== 200) return data.statusText

    return { 
      downloadUrl, 
      fileName, 
      fileSize: formatSize(sizeBytes), 
      mimetype: data.headers.get('content-type'),
      thumbnail: thumbnailBuffer // Include resized thumbnail buffer
    }
  } catch (e) {
    console.log(e)
    return res
  }
}


cmd({
pattern: "jidm",
alias: ["nsgoogledrive","nsgdrive","nscyber_gd"],
react: '📑',
desc: "Download googledrive files.",
category: "download",
use: '.gdrive <googledrive link>',
filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try {
if (!q.includes(",")) return reply('Please give me googledrive url and jid Like this...!!\n.gdrive < jid >,< drive url>')
var [jid,link,name] = q.split(",");
let res = await fg.GDriveDl(link)
var name = name ? `${name.replace(/enter/g,'\n').replace(/oname/g,res.fileName)}` : res.fileName;

// image URL
const imageUrl = "https://files.catbox.moe/8o4q88.jpg";

let thumbnailBuffer;

// resize image to thumbnail
await Jimp.read(imageUrl)
    .then(image => {
        return image.resize(300, Jimp.AUTO) // size 300px width, auto height
                    .getBufferAsync(Jimp.MIME_JPEG);
    })
    .then(buffer => {
        thumbnailBuffer = buffer;
    })
    .catch(err => {
        console.log('Error resizing image:', err);
        thumbnailBuffer = null; // fallback if error
    });

// now, send message with thumbnail
conn.sendMessage(jid, { 
    document: { url: res.downloadUrl },
    fileName: "🎬CK CineMAX🎬\n"+name,
    mimetype: res.mimetype,
    caption: "🍿 "+name+" - සිංහල උපසිරැසි සමඟ",
    thumbnail: thumbnailBuffer // thumbnail attach
}, { quoted: mek });
} catch (e) {
    reply('Error..! Your Url is Private. Please Public It');
    console.log(e);
}
})
