const config = require('../config');
const fetch = require('node-fetch');
const fg = require('api-dylux');
const sharp = require('sharp');
const axios = require('axios');
const { sizeFormatter } = require('human-readable');
const { cmd, commands } = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions');

// Google Drive download function
async function GDriveDl(url) {
    let id, res = { "error": true };

    // Check if the URL is a valid Google Drive URL
    if (!(url && url.match(/drive\.google/i))) return res;

    // Formatter for file size
    const formatSize = sizeFormatter({
        std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`
    });

    try {
        // Extract the file ID from the URL
        id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
        if (!id) throw 'ID Not Found';

        // Fetch file info from Google Drive
        res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
            method: 'POST',
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
        });

        // Check if the request was successful
        if (res.status !== 200) {
            throw `Failed to fetch file details. Status Code: ${res.status}`;
        }

        // Parse the JSON response
        const text = await res.text();
        let { fileName, sizeBytes, downloadUrl } = JSON.parse(text.slice(4));

        if (!downloadUrl) throw 'Link Download Limit!';

        // Fetch the actual file
        let data = await fetch(downloadUrl);
        if (data.status !== 200) throw `Failed to download file. Status Code: ${data.status}`;

        // Return file details
        return { 
            downloadUrl, 
            fileName, 
            fileSize: formatSize(sizeBytes), 
            mimetype: data.headers.get('content-type') 
        };
    } catch (e) {
        console.error(e);  // Log error to console
        return res;        // Return default error object
    }
}

// Thumbnail resize function
async function createThumbnail(imageUrl, width, height) {
  try {
    // Image buffer retrieval
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Resize the image to the given width and height
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(width, height)
      .toBuffer();

    return thumbnailBuffer;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
}

// Function to send document with thumbnail
async function sendDocumentWithThumbnail(conn, from, documentUrl, caption) {
  try {
    const thumbnailUrl = 'https://files.catbox.moe/8o4q88.jpg';  // Default thumbnail URL

    // Generate thumbnail
    const thumbnailBuffer = await createThumbnail(thumbnailUrl, 150, 150);

    // Send document with thumbnail
    await conn.sendMessage(from, {
      document: { url: documentUrl },
      fileName: "🎬CK CineMAX🎬\nMovie File",
      mimetype: 'application/pdf',
      jpegThumbnail: thumbnailBuffer,  // Thumbnail image
      caption: caption
    });
  } catch (error) {
    console.error('Error sending document with thumbnail:', error);
  }
}

// Command to handle Google Drive file download
cmd({
    pattern: "jidm3",
    alias: ["nsgoogledrive", "nsgdrive", "nscyber_gd"],
    react: '📑',
    desc: "Download Google Drive files.",
    category: "download",
    use: '.gdrive <googledrive link>',
    filename: __filename
},
async(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q.includes(",")) return reply('*Please provide Google Drive URL and JID like this...!!*\n.gdrive <jid>,<drive url>');
        
        var [jid, link, name] = q.split(",");
        let res = await GDriveDl(link);  // Call the function to get file info from Google Drive
        
        // Handle file name if provided or default to the one from Drive
        var fileName = name ? `${name.replace(/enter/g, '\n').replace(/oname/g, res.fileName)}` : res.fileName;

        reply(`\n*🎬CK CineMAX MOVIE DOWNLOADER🎬*

        *📃 File name:*  ${"🎬CK CineMAX🎬\n" + fileName}
        *💈 File Size:* ${res.fileSize}
        *🕹️ File type:* ${res.mimetype}`);

        // Send the file with thumbnail to the provided JID
        await conn.sendMessage(jid, {
            document: { url: res.downloadUrl },
            fileName: "🎬CK CineMAX🎬\n" + fileName,
            mimetype: res.mimetype,
            jpegThumbnail: await createThumbnail('https://files.catbox.moe/8o4q88.jpg', 150, 150),  // Add thumbnail here
            caption: "🍿 `" + fileName + " - Sinhala Subtitles`\n\n> ⚡Powered by *CK CineMAX*"
        }, { quoted: mek });
    } catch (e) {
        reply('*Error..! Your URL is Private. Please Public It*');
        console.error(e);
    }
});
