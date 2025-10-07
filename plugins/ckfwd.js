const { cmd } = require('../command');

cmd({
    pattern: "ckfwd",
    desc: "Forwards any message (text, image, video, audio, etc.) to a specified JID.",
    react: "🔁",
    category: "main",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Ensure the user has provided a target JID (user or group)
        const targetJid = args[0];
        if (!targetJid) return reply("❌ Please provide the JID (user or group) to forward the message to.");

        // If the message is quoted, forward the quoted message; otherwise, forward the current message.
        const messageToForward = quoted ? quoted : m;

        // Handle different types of media
        if (messageToForward.message) {
            const messageType = Object.keys(messageToForward.message)[0]; // Check message type

            if (messageType === "imageMessage" || messageType === "videoMessage" || messageType === "audioMessage" || messageType === "documentMessage") {
                // For media types (image, video, audio, document), forward them
                await conn.sendMessage(targetJid, { [messageType]: messageToForward.message[messageType] }, { quoted: mek });
            } else if (messageType === "textMessage") {
                // For text, just forward the text
                await conn.sendMessage(targetJid, { text: messageToForward.message.text }, { quoted: mek });
            } else {
                // If the message is of any other type, forward it as-is
                await conn.sendMessage(targetJid, messageToForward, { quoted: mek });
            }
        }

        reply(`✅ Message forwarded to: ${targetJid}`);
    } catch (e) {
        console.error('Error forwarding message:', e);
        reply('❌ An error occurred while trying to forward the message.');
    }
});
