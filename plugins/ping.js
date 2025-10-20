const config = require('../config');
const { cmd, commands } = require('../command');

// ⚡ PING COMMAND
cmd({
    pattern: "ping",
    alias: ["speed", "p"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        const startTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay

        const endTime = Date.now();
        const ping = endTime - startTime;

        // Send the ping result
        await conn.sendMessage(from, {
            text: `*CK BOT SPEED ➟ ${ping}ms*`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401805872716@newsletter',
                    newsletterName: 'CK BOT',
                    serverMessageId: 143
                }
            },
            externalAdReply: {
                title: "CK BOT",
                body: "> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*",
                thumbnailUrl: "https://raw.githubusercontent.com/LAKSIDUOFFICIAL/LAKSIDU-BOT/refs/heads/main/Screenshot_20250208-114759_Photo%20Editor.jpg",
                sourceUrl: "https://github.com/laksidunimsara1/QUEEN-HASHI-MD",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }, { quoted: ck }); 

    } catch (e) {
        console.error(e);
        reply(`An error occurred: ${e.message}`);
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
