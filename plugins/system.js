const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');


cmd({
    pattern: "system",
    alias: ["status", "botinfo"],
    desc: "Check uptime, RAM usage, and more",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, reply
}) => {
    try {
        let status = `
🛡️ \`𝗖𝗞 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢\` 🛡️

\`HOST:\` *Digital Ocean*
\`UPTIME:\`  *${runtime(process.uptime())}*
\`RAM:\` *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB*
\`BOT NAME:\` *CK BOT*
\`OWNER:\` *Chethmina Kavishan*`;

        await conn.sendMessage(from, {
            text: status
        }, { quoted: ck });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
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
