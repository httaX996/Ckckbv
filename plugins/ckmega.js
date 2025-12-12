const { cmd } = require('../command');
const { File } = require('megajs');
const tharuzz_footer = "> © 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝚃𝙷𝙰𝚁𝚄𝚂𝙷𝙰-𝙼𝙳";

cmd({
    pattern: "megax",
    desc: "Download mwga files",
    react: "☁️",
    category: "download",
    use: '.mega < mega file link >',
    filename: __filename
}, async (conn, mek, m, {from, reply, q}) => {
    
    if (!q || !q.includes('mega.nz')) {
        await reply("Please enter mega file url !!")
    }
    try {
        await reply('☁️ start downloading mega file...')
        
        const file = File.fromURL(megaUrl);
        await file.loadAttributes();
        const fileName = file.name || 'mega';
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const buffer = await file.downloadBuffer();
        
        await conn.sendMessage(from, {
            document: buffer,
            caption: `*📥 \`MEGA file Download Successfull:\`*\n\n*📌 Name:* ${fileName}\n*📂 Size:* ${fileSizeMB} MB\n\n${tharuzz_footer}`,
            mimetype: 'application/octet-stream',
            fileName: fileName 
        }, {quoted: mek});

    } catch (e) {
        console.log("❌ Mega download Error: " + e);
        await reply("❌ Mega download Error: " + e);
    }
});
