const config = require('../config');
const fetch = require('node-fetch');
const fg = require('api-dylux');
const cheerio = require('cheerio');
const Jimp = require('jimp');
const { DBM } = require('postgres_dbm');
const { sizeFormatter} = require('human-readable');
const { cmd, commands } = require('../command');
const { Jimp } = require("jimp");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')


async function GDriveDl(url) {
    let id, res = { "error": true }
    if (!(url && url.match(/drive.google/i))) return res

    const formatSize = sizeFormatter({      
        std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`      
    })      

    try {      
        id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]      
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
        let data = await fetch(downloadUrl)      
        if (data.status !== 200) return data.statusText      
        
        return { 
            downloadUrl, 
            fileName, 
            fileSize: formatSize(sizeBytes), 
            mimetype: data.headers.get('content-type') 
        }      
    } catch (e) {      
        console.log(e)      
        return res      
    }
}

cmd({
    pattern: "jidm3",
    alias: ["nsgoogledrive","nsgdrive","nscyber_gd"],
    react: '📑',
    desc: "Download googledrive files.",
    category: "download",
    use: '.gdrive <googledrive link>',
    filename: __filename
}, async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    try {
        if (!q.includes(",")) return reply('Please give me googledrive url and jid Like this...!!\n.gdrive < jid >,< drive url>')
        
        var [jid,link,name] = q.split(",");
        let res = await fg.GDriveDl(link)

        var name = name ? `${name.replace(/enter/g,'\n').replace(/oname/g,res.fileName)}` : res.fileName

        // Load the thumbnail image using Jimp
        const thumbnailUrl = 'https://files.catbox.moe/8o4q88.jpg';
        const thumbnailBuffer = await fetch(thumbnailUrl).then(res => res.buffer());
        const thumbnail = await Jimp.read(thumbnailBuffer);

        // Resize the image to create a thumbnail
        thumbnail.resize(200, Jimp.AUTO); // Resize to width of 200px, maintaining aspect ratio

        // Convert the thumbnail to buffer (to send it in the message)
        const thumbnailBufferFinal = await thumbnail.getBufferAsync(Jimp.MIME_JPEG);

        reply(`\n*🎬CK CineMAX MOVIE DOWNLOADER🎬*

📃 File name:  ${"🎬CK CineMAX🎬\n"+name}
💈 File Size: ${res.fileSize}
🕹️ File type: ${res.mimetype}`)

        // Send the file with the thumbnail
        conn.sendMessage(jid, {
            document: { url: res.downloadUrl },
            fileName: "🎬CK CineMAX🎬\n" + name,
            mimetype: res.mimetype,
            caption: "🍿 " + name + " - සිංහල උපසිරැසි සමඟ",
            jpegThumbnail: thumbnailBufferFinal // Add thumbnail to the message
        }, { quoted: mek });

    } catch (e) {
        reply('Error..! Your Url is Private. Please Public It');
        l(e);
    }
});
