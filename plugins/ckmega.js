const { cmd } = require('../command');
const { File } = require('megajs');
const axios = require('axios');
const sharp = require('sharp');    

// Auto mimetype detect
function getMimeType(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();

    const types = {
        mp4: 'video/mp4',
        mkv: 'video/x-matroska',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
        zip: 'application/zip',
        pdf: 'application/pdf',
        apk: 'application/vnd.android.package-archive',
        mp3: 'audio/mpeg'
    };

    return types[ext] || 'application/octet-stream';
}

// Thumbnail
async function createThumbnail(imageUrl, width, height) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return await sharp(Buffer.from(response.data))
            .resize(width, height)
            .toBuffer();
    } catch {
        return null;
    }
}

cmd({
    pattern: "megax",
    desc: "Download mega files",
    react: "☁️",
    category: "download",
    use: '.megax <mega file link>',
    filename: __filename
}, 
async (conn, mek, m, { from, reply, q }) => {

    if (!q || !q.includes("mega.nz")) {
        return reply("❌ *Please enter a valid MEGA URL!*");
    }

    try {
        await reply("☁️ *Starting MEGA download…*");

        const megaUrl = q.trim();
        const file = File.fromURL(megaUrl);

        await file.loadAttributes();

        const fileName = file.name || "mega_file";
        const finalFileName = `🎬CK CineMAX🎬 ${fileName}`;   // <-- BRAND ADDED HERE
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const buffer = await file.downloadBuffer();

        const mimetype = getMimeType(fileName); // AUTO MIME

        const thumbnailUrl = "https://files.catbox.moe/8o4q88.jpg";
        const thumb = await createThumbnail(thumbnailUrl, 150, 150);

        await conn.sendMessage(from, {
            document: buffer,
            mimetype: mimetype,
            fileName: finalFileName,     // <-- BRAND NAME APPLIED
            jpegThumbnail: thumb,
            caption: `*📥 MEGA Download Successful*\n\n` +
                     `*📌 Name:* ${finalFileName}\n` +
                     `*📂 Size:* ${fileSizeMB} MB\n` +
                     `*🎞 Type:* ${mimetype}\n\n` +
                     `> © Powered by CK CineMAX`
        }, { quoted: mek });

    } catch (e) {
        await reply("❌ *Mega download failed:* " + e);
    }
});
