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
        }, { quoted: Supunwa }); // 🔁 mek → Supunwa

    } catch (e) {
        console.error(e);
        reply(`An error occurred: ${e.message}`);
    }
});

const botname = "𝙲𝙷𝙴𝚃𝙷𝙼𝙸𝙽𝙰"; //add your name
 const ownername = "×_×"; // add your name
 const Supunwa = { 
 key: { 
  remoteJid: 'status@broadcast', 
  participant: '0@s.whatsapp.net' 
   }, 
message:{ 
  newsletterAdminInviteMessage: { 
    newsletterJid: '120363401805872716@newsletter', //add your channel jid
    newsletterName: "CK BOT", //add your bot name
    caption: botname + ` 𝙺𝙰𝚅𝙸𝚂𝙷𝙰𝙽 ` + ownername, 
    inviteExpiration: 0
  }
 }
}
