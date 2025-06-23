
//=============================================
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const domain = `https://mr-manul-ofc-apis.vercel.app`;

// PTP Auto-Upload Command (Sinhala Only)
cmd({
    pattern: "ctiktok",
    alias: ["ptpautovideo"],
    desc: "ඕනෑම WhatsApp JID එකකට සෑම විනාඩි 2කට වරක් සිංහල PTP වීඩියෝ යවයි.",
    use: ".starttiktok <jid> | උදා: .starttiktok 94712345678@s.whatsapp.net",
    react: "🎶",
    category: "බාගත කිරීම",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply("*`මෙම විධානය හිමිකරුට පමණයි`*");

        if (!q) return reply("*`JID එකක් දෙන්න, උදා: .starttiktok 94712345678@s.whatsapp.net හෝ 120363349375266377@newsletter`*");

        const targetJid = q.trim();

        // JID එක වලංගු දැයි පරීක්ෂා කිරීම (සියලු ආකෘති සමඟ)
        const validFormats = ['@s.whatsapp.net', '@g.us', '@newsletter'];
        let isValid = false;

        for (let format of validFormats) {
            if (targetJid.includes(format)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            return reply("*`වලංගු JID එකක් නොවේ! WhatsApp JID එකක් භාවිතා කරන්න (උදා: 94712345678@s.whatsapp.net, @g.us හෝ @newsletter)`*");
        }

        reply(`විනාඩි 2කට වරක් සිංහල PTP වීඩියෝ යැවීම ආරම්භ වෙනවා JID එකට: ${targetJid}! 🎬\n> ㋛︎ ᴘᴏᴡᴇʀᴅ ʙʏ  ᴍʀ  ʟᴀᴋꜱɪᴅᴜ ᶜᵒᵈᵉʳ`);

        // සිංහල TikTok සඳහා විශේෂිත යතුරුපද
        const sinhalaKeywords = [
            "kuku_page",
            "sinhala boot song",
            "vadan",
            "sinhala boot vadan",
            "bike"
        ];

        // ස්වයංක්‍රීය යැවීමේ ක්‍රියාව
        const autoUploadPTP = async () => {
            try {
                // යතුරුපදයක් තෝරාගැනීම
                const randomKeyword = sinhalaKeywords[Math.floor(Math.random() * sinhalaKeywords.length)];
                const response = await fetchJson(`${domain}/random-tiktok?apikey=Manul-Official-Key-3467&query=${randomKeyword}`);
                const manul = response.data;
                const title = manul.title;
                const cover = manul.cover;
                const no_watermark = manul.no_watermark;

                const desc = `
🎀 *𝘒𝘈𝘝𝘐 𝘔𝘋 𝘚𝘛𝘈𝘛𝘜𝘚 𝘝𝘐𝘋𝘌𝘖* 🎀

𝙏𝗶𝘁𝗹𝗲 *➟*  _~${title}~_

┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`;

                await conn.sendMessage(targetJid, {
                    image: { url: cover },
                    caption: desc
                });

                await conn.sendMessage(targetJid, {
                    video: { url: no_watermark },
                    mimetype: "video/mp4",
                    caption: "> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*"
                });

                console.log(`ස්වයංක්‍රීයව සිංහල PTP වීඩියෝ යැව්වා: ${title} -> ${targetJid}`);
            } catch (e) {
                console.error('ස්වයංක්‍රීය යැවීමේ දෝෂය:', e);
            }
        };

        // සෑම විනාඩි 2කට වරක් යැවීම ආරම්භ කිරීම
        setInterval(autoUploadPTP, 2 * 60 * 1000); // 2 විනාඩි පරතරය

    } catch (e) {
        console.log(e);
        reply(`දෝෂයක්: ${e}`);
    }
});
