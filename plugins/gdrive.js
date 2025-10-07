const config = require('../config')
const fetch = require('node-fetch')
const fg = require('api-dylux');
const cheerio = require('cheerio')
const { DBM } = require('postgres_dbm')
const { sizeFormatter} = require('human-readable');;
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')



async function GDriveDl(url) {
    let id, res = { "error": true }
    if (!(url && url.match(/drive\.google/i))) return res

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
        return { downloadUrl, fileName, fileSize: formatSize(sizeBytes), mimetype: data.headers.get('content-type') }
    } catch (e) {
        console.log(e)
        return res
    }
}


cmd({
    pattern: "gdrive",
    alias: ["googledrive'"],
    react: '📑',
    desc: "Download googledrive files.",
    category: "download",
    use: '.gdrive <googledrive link>',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
  if (!q) return await  reply('*Please give me googledrive url !!*')   
let res = await GDriveDl(q)
		let txt = `*[ Downloading file ]*\n\n`
		txt += `*Name :* ${res.fileName}\n`
		txt += `*Size :* ${res.fileSize}\n`
		txt += `*Type :* ${res.mimetype}`	
        await reply(txt)
conn.sendMessage(config.JID, { document: { url: res.downloadUrl }, fileName: res.fileName, mimetype: res.mimetype }, { quoted: mek })
} catch (e) {
reply('*Error !!*')
console.log(e)
//reply(${e})
}
})


cmd({
    pattern: "ckgg",
    alias: ["nsgoogledrive","nsgdrive","nscyber_gd"],
    react: '📑',
    desc: "Download googledrive files.",
    category: "download",
    use: '.gdrive <googledrive link>',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
  if (!q.includes(",")) return reply('*Please give me googledrive url and jid Like this...!!*\n.gdrive < jid >,< drive url>')   
  var [jid,link,name] = q.split(",");
 let res = await fg.GDriveDl(link)
  var name = name ? `${name.replace(/enter/g,'\n').replace(/oname/g,res.fileName)}` : res.fileName
reply(`\n*🎬CK CineMAX MOVIE DOWNLOADER🎬*

*📃 File name:*  ${"🎬CK CineMAX🎬\n"+name}
*💈 File Size:* ${res.fileSize}
*🕹️ File type:* ${res.mimetype}

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`)		
conn.sendMessage(jid, { document: { url: res.downloadUrl }, fileName: "🎬CK CineMAX🎬\n"+name, mimetype: res.mimetype , caption : "*🎬 "+name+"*\n*🪄 සිංහල උපසිරැසි එක් කර ඇත.*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*"})
} catch (e) {
reply('*Error..! Your Url is Private. Please Public It*')
l(e)
}
})


cmd({
    pattern: "moviekv",
    react: "✔️",
    desc: "Movie Searcher",
    category: "movie",
    use: '.activate_18+',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, chat, body, isCmd, command, mentionByTag, db_pool, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
if ( !isDev ) return reply('⚠️ ⚠️ *Contact owner to Active your number To Premium user*')
if ( !m.quoted ) return reply('*ℹ .mkv jid & Halo (2024) TV Series E3*')
if ( !q ) return 
const data = q.split(" & ")[0] 
const datas = q.split(" & ")[1] 
      

 await conn.sendMessage(data, { document : { url : m.quoted.msg  } ,caption: `\n${datas}\n\n> *🎬 VAJIRA-MD 🎬*`  ,mimetype: "video/mkv" , fileName: `🎬 MOVIE DOWNLOADER 🎬\n${datas}.mkv` } )
		} catch (e) {
reply('❗ Error' + e )
l(e)
}
})					    



cmd({
    pattern: "jts",
    react: "✔️",
    alias: ["jidtvsm"],
    desc: "Movie Searcher",
    category: "extra",
    use: '.activate_18+',
    dontAddCommandList : true ,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag, db_pool, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
if ( !q ) return reply('Add a item')
if ( !isDev ) return reply('⚠️ ⚠️ *Contact owner to Active your number To Premium user*')
	const db_pool = new DBM({
    db: config.DATABASE_URL
})

const pjid = await db_pool.get(senderNumber + "UPJID")

	await conn.sendMessage(pjid, { quoted: mek } )
		} catch (e) {
reply(e)
l(e)
}
})



cmd({
    pattern: "myjid",
    react: "✔️",
    alias: ["mygpjid"],
    desc: "Movie Searcher",
    category: "extra",
    use: '.activate_18+',
    dontAddCommandList : true ,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag, db_pool, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
 if ( !q ) return reply('Add a item')
if ( !isDev ) return reply('⚠️ ⚠️ *Contact owner to Active your number To Premium user*')
	const db_pool = new DBM({
    db: config.DATABASE_URL
})

const ddll  = await db_pool.get(`${senderNumber}UPJID`)
if ( q == ddll ) return reply('ℹ️ *Already Saved the jid on Database*')
await db_pool.insert( senderNumber + "UPJID" , q ) 
	return reply('✔️ *Successfully saved your Sending group Jid Adress*')
		} catch (e) {
await db_pool.insert( senderNumber + "UPJID"  , q ) 
return reply('✔️ *Successfully saved your Sending group Jid Adress*')
}
})		
