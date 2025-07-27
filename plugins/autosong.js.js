const { cmd, commands } = require('../command');
const yts = require('yt-search');
const { fetchJson } = require('../lib/functions');
const ddownr = require('denethdev-ytmp3');

// Function to extract the video ID from youtu.be or YouTube links
function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Function to convert any YouTube URL to a full YouTube watch URL
function convertYouTubeLink(q) {
    const videoId = extractYouTubeId(q);
    if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return q;
}

// Function to get a random Sinhala song
async function getRandomSong() {
    const sinhalaKeywords = ['Desawana Music', 'SGM Tunes', 'DILU Beats song', 'Kovizz Audio', 'Roo Tunes', 'Unity Band'];
    const randomKeyword = sinhalaKeywords[Math.floor(Math.random() * sinhalaKeywords.length)];
    const search = await yts(randomKeyword);
    const videos = search.videos;
    return videos[Math.floor(Math.random() * videos.length)]; // Select a random song
}

cmd({
    pattern: "song",
    alias: "play",
    desc: "ගීත බාගත කිරීම සඳහා.",
    react: "🎵",
    category: "බාගත කිරීම",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        q = convertYouTubeLink(q);
        if (!q) return reply("*`YT_URL හෝ මාතෘකාව අවශ්‍ය`*");

        reply("*_🎵 ගීත හමුවූ අතර, බාගත කිරීම ආරම්භ වෙමින් පවතී..._*");
        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) {
            return reply("❌ \"" + q + "\" සඳහා ප්‍රතිඵල නොමැත.");
        }

        const data = search.videos[0];
        const url = data.url;

        let desc = `
┏「✨𝐊𝐀𝐕𝐈 𝐌𝐃 𝐀𝐔𝐃𝐈𝐎✨」
┃ 👨‍💻Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ
┃ 🤖 Bot Name: 𝐊𝐀𝐕𝐈 - 𝐌𝐃
┗━━━━━━━━━━━━━━━𖣔𖣔
┏━❮ 💜𝐃𝐄𝐓𝐀𝐋𝐄𝐒💜 ❯━
┃🤖 *මාතෘකාව:* ${data.title}
┃📑 *කාලය:* ${data.timestamp}
┃🔖 *බැලීම්:* ${data.views}
┃📟 *උඩුගත කළ දින:* ${data.ago}
┃👨‍💻 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ
┗━━━━━━━━━━━━━━𖣔𖣔
╭━━〔🔢 *පිළිතුරු අංකය*〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃•1 | ඔස්සේ බාගත කරන්න 🎧
┃◈┃•2 | ලිපිගොනුව බාගත කරන්න 📁
┃◈┃•3 | හඬ බාගත කරන්න 🎤
┃◈└───────────┈⊷
╰──────────────┈⊷
> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`;
        let info = `
> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: desc,
            contextInfo: {
                mentionedJid: ['94762858448@s.whatsapp.net'],
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

        conn.ev.on('messages.upsert', async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;
            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;

            const isReplyToSentMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;

            if (isReplyToSentMsg) {
                if (messageType === '1' || messageType === '2' || messageType === '3') {
                    await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });

                    const result = await ddownr.download(url, 'mp3'); // Download in mp3 format
                    const downloadLink = result.downloadUrl;

                    if (messageType === '1') { // Audio
                        await conn.sendMessage(from, {
                            audio: { url: downloadLink },
                            mimetype: "audio/mpeg",
                            contextInfo: {
                                externalAdReply: {
                                    title: data.title,
                                    body: data.videoId,
                                    mediaType: 1,
                                    sourceUrl: data.url,
                                    thumbnailUrl: data.thumbnail,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: mek });
                    } else if (messageType === '2') { // Document
                        await conn.sendMessage(from, {
                            document: { url: downloadLink },
                            mimetype: "audio/mp3",
                            fileName: `${data.title}.mp3`,
                            caption: info
                        }, { quoted: mek });
                    } else if (messageType === '3') { // Voice
                        await conn.sendMessage(from, {
                            audio: { url: downloadLink },
                            mimetype: "audio/mpeg",
                            ptt: true,
                            contextInfo: {
                                externalAdReply: {
                                    title: data.title,
                                    body: data.videoId,
                                    mediaType: 1,
                                    sourceUrl: data.url,
                                    thumbnailUrl: data.thumbnail,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: mek });
                    }

                    await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                }
            }
        });
    } catch (e) {
        console.log(e);
        reply("❌ ඔබගේ ඉල්ලීම පරිචාලනය කිරීමේදී දෝෂයක් ඇති විය.");
    }
});

// Auto Song Command for JID
cmd({
    pattern: "startsong",
    alias: "autosong",
    desc: "JID එකකට සෑම 15 විනාඩි 1කට වරක් සිංහල ගීත ස්වයංක්‍රීයව යැවීම ආරම්භ කිරීම.",
    category: "බාගත කිරීම",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply("*`මෙම විධානය හිමිකරුට පමණයි`*");

        if (!q) return reply("*`JID එකක් දෙන්න, උදා: .startsong 94727163302@s.whatsapp.net`*");

        const targetJid = q.trim();

        // Check if JID is valid
        if (!targetJid.includes('@s.whatsapp.net') && !targetJid.includes('@g.us') && !targetJid.includes('@newsletter')) {
            return reply("*`Invalid JID format. Use a valid WhatsApp JID (e.g., @1234567890@s.whatsapp.net, @1234567890@g.us, or 120363349375266377@newsletter)`*");
        }

        reply(`සෑම 15 විනාඩි 1කට වරක් සිංහල ගීත යැවීම ආරම්භ වෙනවා JID එකට: ${targetJid}! 🎵\n> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*`);

        // Auto-upload function for JID
        const autoUploadSong = async () => {
            try {
                const data = await getRandomSong();
                const url = data.url;

                let desc = `
*━━━━━━ ❬❬ 🎶අධිමාත්‍රා ׀ ＳＯＮＧＳ🎶❭❭ ━━━━━━*

*▣ 🔖ᴛɪᴛʟᴇ :* ${data.title}
*▣ ⏰ᴅᴜʀᴀᴛɪᴏɴ :* ${data.timestamp}
*▣ 👀ᴠɪᴇᴡꜱ :* ${data.views}
*▣ 📆ᴜᴘʟᴏᴀᴅ ᴏɴ :* ${data.ago}
*▣ 🎞️ᴀᴜᴛʜᴏʀ :* ${data.author.name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> *මේ වගේ ලස්සන සිංදු අහන්න මෙන්න මෙහාට එන්න ලස්සන ළමයෝ 💗✨*
> *🪀 https://whatsapp.com/channel/0029VbBDRNsId7nROU89Sy0A*
`;

                await conn.sendMessage(targetJid, {
                    image: { url: data.thumbnail },
                    caption: desc
                });

                const result = await ddownr.download(url, 'mp3');
                const downloadLink = result.downloadUrl;

                await conn.sendMessage(targetJid, {
                    audio: { url: downloadLink },
                    mimetype: "audio/mpeg",
                    ptt: true }, { quoted: null });

                console.log(`Auto-uploaded song to JID: ${data.title} -> ${targetJid}`);
            } catch (e) {
                console.error('Auto-upload error:', e);
            }
        };

        // Start auto-upload every 15 minutes
        setInterval(autoUploadSong, 30 * 60 * 1000); // 15 minutes interval

    } catch (e) {
        console.log(e);
        reply(`දෝෂයක්: ${e}`);
    }
});
