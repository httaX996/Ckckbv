const { cmd } = require('../command');
const os = require("os");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, Func, fetchJson } = require('../lib/sfunctions');
const axios = require('axios');

cmd({
    pattern: "fwdd",
    desc: "forward msgs",
    alias: ["fo"],
    category: "general",  // Changed to general to allow anyone to use
    use: '.forward < Jid address >',
    filename: __filename
},

async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {

    // Check if message and Jid address are provided
    if (!q || !m.quoted) {
        return reply("*Give me a message to forward ❌*");
    }

    // Preparing the message object
    let message = {
        key: mek.quoted?.fakeObj?.key,
        message: mek.quoted
    };

    // Handle documents with captions
    if (mek.quoted?.documentWithCaptionMessage?.message?.documentMessage) {
        let mime = mek.quoted.documentWithCaptionMessage.message.documentMessage.mimetype;
        const mimeType = require('mime-types');
        let ext = mimeType.extension(mime);
        
        mek.quoted.documentWithCaptionMessage.message.documentMessage.fileName = (p ? p : mek.quoted.documentWithCaptionMessage.message.documentMessage.caption) + "." + ext;
    }

    // Add contact message (ck) as quoted message
    let contactMessage = {
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

    // Combine the original message and the contact message (ck)
    message.message = {
        ...mek.quoted,
        ...contactMessage.message
    };

    try {
        // Forward the message to the specified Jid address
        await conn.forwardMessage(q, message, true);
        return reply(`*Message forwarded to:*\n\n${q}`);
    } catch (error) {
        console.error(error);
        return reply("*Error forwarding message. Please check the Jid address or the message format ❌*");
    }
});
