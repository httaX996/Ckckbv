const { cmd } = require('../command');
const { File } = require('megajs');
const axios = require('axios');
const sharp = require('sharp');

// MIME TYPE DETECT
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

// THUMBNAIL CREATE
async function createThumbnail(url, w, h) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return await sharp(res.data).resize(w, h).toBuffer();
    } catch {
        return null;
    }
}

cmd({
    pattern: "megax",
    desc: "Download MEGA files",
    react: "☁️",
    category: "download",
    use: ".megax <mega link>,<custom name>",
    filename: __filename
},
async (conn, mek, m, { from, reply, q }) => {

    if (!q) return reply("❌ *MEGA link එකක් දාන්න*");

    // INPUT SPLIT
    const args = q.split(',');
    const megaUrl = args[0]?.trim();
    const customName = args[1]?.trim(); // optional

    if (!megaUrl || !megaUrl.includes("mega.nz")) {
        return reply("❌ *Valid MEGA link එකක් දාන්න*");
    }

    try {
        await reply("☁️ *MEGA download start වෙලා…*");

        const file = File.fromURL(megaUrl);
        await file.loadAttributes();

        const originalName = file.name || "mega_file";
        const ext = originalName.includes('.')
            ? '.' + originalName.split('.').pop()
            : '';

        // FINAL FILE NAME
        const finalName = customName
            ? `🎬CK CineMAX🎬 ${customName}${ext}`
            : `🎬CK CineMAX🎬 ${originalName}`;

        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        const isMp4 = ext.toLowerCase() === '.mp4';

        // SAFE STREAM DOWNLOAD
        const stream = file.download();
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);

        const thumb = await createThumbnail(
            "https://files.catbox.moe/8o4q88.jpg",
            150,
            150
        );

        // SEND MESSAGE
        if (isMp4) {
            // MP4 → VIDEO
            await conn.sendMessage(from, {
                video: buffer,
                mimetype: 'video/mp4',
                fileName: finalName,
                jpegThumbnail: thumb,
                caption:
`*📥 MEGA Download Completed*

*🎞 Video:* ${finalName}
*📂 Size:* ${sizeMB} MB

> © Powered by CK CineMAX`
            }, { quoted: mek });

        } else {
            // OTHER FILES → DOCUMENT
            await conn.sendMessage(from, {
                document: buffer,
                mimetype: getMimeType(finalName),
                fileName: finalName,
                jpegThumbnail: thumb,
                caption:
`*📥 MEGA Download Completed*

*📌 File:* ${finalName}
*📂 Size:* ${sizeMB} MB

> © Powered by CK CineMAX`
            }, { quoted: mek });
        }

    } catch (err) {
        console.error(err);
        reply("❌ *MEGA download error:* " + err.message);
    }
});
