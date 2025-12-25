const { cmd } = require('../command');

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

cmd({
    pattern: "fwdd",
    alias: ["fo"],
    desc: "Forward message with custom quoted contact",
    category: "general",
    use: ".fwdd <jid>",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {

    try {
        // validations
        if (!q) return reply("❌ *JID එක දෙන්න*\n\nEg:\n.fwdd 1203xxxx@g.us");
        if (!m.quoted) return reply("❌ *Forward කරන්න message එක reply කරන්න*");

        // send message with ck as quoted
        await conn.sendMessage(
            q,
            m.quoted.message,
            { quoted: ck }
        );

        reply(`✅ *Message forwarded successfully*\n\n📍 To: ${q}`);
    } catch (err) {
        console.log(err);
        reply("❌ *Forward failed*");
    }
});
