const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require("axios");

cmd({
    pattern: "song4",
    alias: "yt4",
    desc: "To download songs.",
    react: "🎵",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        q = q ? q : ''; // Ensure q is not undefined
        if (!q) return reply("*`Need YT_URL or Title`*");

        // Search for the song
        reply("*_🎵 Song found, uploading please wait..._*");
        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) {
            return reply("❌ No results found for \"" + q + "\".");
        }

        const data = search.videos[0];
        const url = data.url;

        // Prepare the description message
        let desc = `
┏「🐉𝐊𝐀𝐕𝐈 𝐌𝐃 𝐀𝐔𝐃𝐈𝐎🐉」
┃ 👨‍💻Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ
┃ 🤖 Bot Name: 𝐊𝐀𝐕𝐈 𝐌𝐃
┗━━━━━━━━━━━━━━━𖣔𖣔
┏━❮ 🩵𝐃𝐄𝐓𝐀𝐋𝐄𝐒🩵 ❯━
┃🤖 *Title:* ${data.title}
┃📑 *Duration:* ${data.timestamp}
┃🔖 *Views:* ${data.views}
┃📟 *Uploaded On:* ${data.ago}
┃👨‍💻 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ
┗━━━━━━━━━━━━━━𖣔𖣔
╭━━〔🔢 *Reply Number*〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃•1 | Download Audio 🎧
┃◈┃•2 | Download Document 📁
┃◈└───────────┈⊷
╰──────────────┈⊷
> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: desc,
            contextInfo: {
                mentionedJid: ['94760698006@s.whatsapp.net'],
                groupMentions: [],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417070951702@newsletter',
                    newsletterName: "🎬𝐌𝐎𝐕𝐈𝐄 𝐂𝐈𝐑𝐂𝐋𝐄🎬",
                    serverMessageId: 999
                }
            }
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        // Listen for user response
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;
            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const fromReply = mek.key.remoteJid;
            const senderReply = mek.key.participant || mek.key.remoteJid;

            // Check if the message is a reply to the previously sent message
            const isReplyToSentMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;

            if (isReplyToSentMsg) {
                if (messageType === '1' || messageType === '2' || messageType === '3') {
                    // React to the user's reply
                    await conn.sendMessage(fromReply, { react: { text: '⬇️', key: mek.key } });

                    // Use the new API for downloading
                    const apiUrl = "https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=" + encodeURIComponent(url);
                    const response = await axios.get(apiUrl);

                    if (!response.data.success) {
                        return reply("❌ Failed to fetch audio for \"" + q + "\".");
                    }

                    const { download_url: downloadUrl } = response.data.result;

                    // Send based on user choice
                    if (messageType === '1') { // Audio
                        await conn.sendMessage(fromReply, {
                            audio: { url: downloadUrl },
                            mimetype: "audio/mp4",
                            ptt: false,
                            contextInfo: {
                                externalAdReply: {
                                    title: data.title,
                                    body: data.videoId,
                                    mediaType: 1,
                                    sourceUrl: data.url,
                                    thumbnailUrl: "https://i.ibb.co/zwhqLSQ/20250406-120212.jpg",
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: mek });
                    } else if (messageType === '2') { // Document
                        await conn.sendMessage(fromReply, {
                            document: { url: downloadUrl },
                            mimetype: "audio/mp3",
                            fileName: `${data.title}.mp3`,
                            caption: "> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*"
                        }, { quoted: mek });
                    } else if (messageType === '3') { // Voice
                        await conn.sendMessage(fromReply, {
                            audio: { url: downloadUrl },
                            mimetype: "audio/mp4",
                            ptt: true,
                            contextInfo: {
                                externalAdReply: {
                                    title: data.title,
                                    body: data.videoId,
                                    mediaType: 1,
                                    sourceUrl: data.url,
                                    thumbnailUrl: "https://i.ibb.co/zwhqLSQ/20250406-120212.jpg",
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: mek });
                    }

                    await conn.sendMessage(fromReply, { react: { text: '⬆️', key: mek.key } });
                }
            }
        });

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred while processing your request.");
    }
});
cmd({
    pattern: "videeo",
    alias: "vid",
    desc: "To download MP4 video or document from YouTube by searching for video names.",
    react: "🎥",
    category: "video",
    use: ".video <video name>",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        q = q ? q : ''; // Ensure q is not undefined
        if (!q) return reply("*`Please provide a video name to search for.`*");

        // Search for the video
        reply("*_📹 Video found, uploading please wait..._*");
        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) {
            return reply("❌ No results found for \"" + q + "\".");
        }

        const data = search.videos[0];
        const url = data.url;

        // Prepare the description message
        let desc = `
┏「📹𝐊𝐀𝐕𝐈 𝐌𝐃 𝐕𝐈𝐃𝐄𝐎📹」
┃ 👨‍💻Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ
┃ 🤖 Bot Name: 𝐊𝐀𝐕𝐈 𝐌𝐃
┗━━━━━━━━━━━━━━━𖣔𖣔
┏━❮ 🩵𝐃𝐄𝐓𝐀𝐈𝐋𝐒🩵 ❯━
┃🤖 *Title:* ${data.title}
┃📑 *Duration:* ${data.timestamp}
┃🔖 *Views:* ${data.views}
┃📟 *Uploaded On:* ${data.ago}
┃👨‍💻 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ
┗━━━━━━━━━━━━━━𖣔𖣔
╭━━〔🔢 *Reply to Download*〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃•1 | Download Video (MP4) 🎥
┃◈┃•2 | Download Document 📁
┃◈└───────────┈⊷
╰──────────────┈⊷
> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: desc,
            contextInfo: {
                mentionedJid: ['94760698006@s.whatsapp.net'],
                groupMentions: [],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417070951702@newsletter',
                    newsletterName: "🎬𝐌𝐎𝐕𝐈𝐄 𝐂𝐈𝐑𝐂𝐋𝐄🎬",
                    serverMessageId: 999
                }
            }
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        // Listen for user response
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;
            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const fromReply = mek.key.remoteJid;
            const senderReply = mek.key.participant || mek.key.remoteJid;

            // Check if the message is a reply to the previously sent message
            const isReplyToSentMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;

            if (isReplyToSentMsg) {
                if (messageType === '1' || messageType === '2') {
                    // React to the user's reply
                    await conn.sendMessage(fromReply, { react: { text: '⬇️', key: mek.key } });

                    // Use the new API for downloading video
                    const apiUrl = "https://api.giftedtech.web.id/api/download/dlmp4?apikey=gifted&url=" + encodeURIComponent(url);
                    const response = await axios.get(apiUrl);

                    if (!response.data.success) {
                        return reply("❌ Failed to fetch video for \"" + q + "\".");
                    }

                    const { download_url: downloadUrl } = response.data.result;

                    // Send based on user choice
                    if (messageType === '1') { // Video (MP4)
                        await conn.sendMessage(fromReply, {
                            video: { url: downloadUrl },
                            mimetype: "video/mp4",
                            caption: data.title,
                            contextInfo: {
                                externalAdReply: {
                                    title: data.title,
                                    body: data.videoId,
                                    mediaType: 2,
                                    sourceUrl: data.url,
                                    thumbnailUrl: "https://raw.githubusercontent.com/LAKSIDUOFFICIAL/LAKSIDU-BOT/refs/heads/main/WhatsApp%20Image%202025-03-04%20at%206.22.42%20AM.jpeg",
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: mek });
                    } else if (messageType === '2') { // Document
                        await conn.sendMessage(fromReply, {
                            document: { url: downloadUrl },
                            mimetype: "video/mp4",
                            fileName: `${data.title}.mp4`,
                            caption: "> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*"
                        }, { quoted: mek });
                    }

                    await conn.sendMessage(fromReply, { react: { text: '⬆️', key: mek.key } });
                }
            }
        });

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred while processing your request.");
    }
});
