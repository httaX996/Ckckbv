const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "menu",
    alias: ["oskdk", "hwhw", "thhl"],
    desc: "commands panel",
    react: "🫢",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Main Menu Caption with English and Emojis
        const cap = `
*🫧 Hey*  \`${pushname}\` *!  ${new Date().getHours() < 12 ? 'Good Morning 🌄' : 'Good Evening 🌙' } How are you? 🫧*


*╭───── ❖ SYSTEM INFO ❖ ─────╮*
*│*  🍭 \`Bot Name:\` *CHETHMINA MD*
*│*  🔖 \`Version:\` *1.O V*
*│*  📟 \`Platform:\` *VPS*
*│*  👨‍💻 \`Owner:\` *Chethmina Kavishan*
*│*  📆 \`Runtime:\` *${runtime(process.uptime())}* 
*│*  📊 \`RAM Usage:\` *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*╰────────────────────────╯*

╭─── *_✨MENU OPTIONS ✨_*───╮
│ 💡 *Reply with a number to explore!*
│ *─────────────────────*
│ \`1\` *|* ❭❭◦ *MEDIA DOWNLOADER ⬇️*
│ *─────────────────────*
│ \`2\` *|* ❭❭◦ *18+ DOWNLOADER 🔞*
╰─────────────────────╯

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
`;

        // Define All Menus with English, Emojis, and Decorative Fonts
        const menus = {
            menu1: `
*⚚━━━⬇️MEDIA DOWNLOADER⬇️━━━⚚*

*╭────────────────────────╮*
*│* 
*│*  🍭 \`Bot Name:\` *CHETHMINA MD*
*│*  🔖 \`Version:\` *1.0 V*
*│*  📟 \`Platform:\` *VPS*
*│*  👨‍💻 \`Owner:\` *Chethmina Kavishan*
*│*  📆 \`Runtime:\` *${runtime(process.uptime())}* 
*│*  📊 \`RAM Usage:\` *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│* 
*╰────────────────────────╯*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: \`.song\`
 │ 🏷️ᴜsᴇ: .song Lelena
 ╰────────────────────✵✵

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: \`.video\`
 │ 🏷️ᴜsᴇ: .video Lelena
 ╰────────────────────✵✵
 
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: \`.fb\`
 │ 🏷️ᴜsᴇ: .fb link
 ╰────────────────────✵✵


> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
`,
 
            menu2: `
*⚚━━━🔞 18+ DOWNLOADER 🔞━━━⚚*

*╭────────────────────────╮*
*│* 
*│*  🍭 \`Bot Name:\` *CHETHMINA MD*
*│*  🔖 \`Version:\` *1.0 V*
*│*  📟 \`Platform:\` *VPS*
*│*  👨‍💻 \`Owner:\` *Chethmina Kavishan*
*│*  📆 \`Runtime:\` *${runtime(process.uptime())}* 
*│*  📊 \`RAM Usage:\` *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│* 
*╰────────────────────────╯*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: \`.xnxx\`
 │ 🏷️ᴜsᴇ: .xnxx mia khalifa
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: \`.ckph\`
 │ 🏷️ᴜsᴇ: .ckph mia khalifa
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: \`.xvid\`
 │ 🏷️ᴜsᴇ: .xvid mia khalifa 
 ╰────────────────────✵✵


> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
`,


            menu3: `
*❖━━━🧠 AI MENU 🧠━━━❖*
`,

            menu4: `
*❖━━━🔍 SEARCH MENU 🔍━━━❖*
`,

            menu5: `
*❖━━━📥 DOWNLOAD MENU 📥━━━❖*
`,

            menu6: `
*❖━━━🗝️ MAIN MENU 🗝️━━━❖*
`,

            menu7: `
*❖━━━🔄 CONVERT MENU 🔄━━━❖*

`,

            menu8: `
*❖━━━⚙️ OTHER MENU ⚙️━━━❖*
`,

            menu9: `
*❖━━━🎨 LOGO MENU 🎨━━━❖*
`,

            menu10: `
*❖━━━🎉 FUN MENU 🎉━━━❖*
`,

            menu11: `
gduhikkfjvjgi
`,

            menu12: `
*❖━━━⏰ AUTO MENU ⏰━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: autoai
 │ 🏷️ᴜsᴇ: prefix autoai on
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: autoai 
 │ 🏷️ᴜsᴇ: prefix autoai off
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ:startnews
 │ 🏷️ᴜsᴇ: prefix startnews
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: stopnews
 │ 🏷️ᴜsᴇ: prefix stopnews
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: starttiktok
 │ 🏷️ᴜsᴇ: prefix starttiktok
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: startsong
 │ 🏷️ᴜsᴇ: prefix startsong
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: startwallpaper
 │ 🏷️ᴜsᴇ: prefix startwallpaper
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: stopwallpaper
 │ 🏷️ᴜsᴇ: prefix stopwallpaper
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu13: `
*❖━━━📰 NEWS MENU 📰━━━❖*
`,

            menu99: `
*⚚━━━⬇️MY MENU⬇️━━━⚚*

*╭────────────────────────╮*
*│* 
*│*  🍭 \`Bot Name:\` *CHETHMINA MD*
*│*  🔖 \`Version:\` *1.0 V*
*│*  📟 \`Platform:\` *VPS*
*│*  👨‍💻 \`Owner:\` *Chethmina Kavishan*
*│*  📆 \`Runtime:\` *${runtime(process.uptime())}* 
*│*  📊 \`RAM Usage:\` *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│* 
*╰────────────────────────╯*

.ckg - Gdrive Downloader
.jidm - Movie Group Gdrive
.gjid - Normal Gdrive jid
.ckgx - Gdrive Downloader
.ckmvd - Movies Details 
.ckmvdd - Movie Group M Details 
.cktvd - TV Series Group M Details
.csong - Channel song

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
`,
        };



        // Send Main Menu Image and Caption
        const sentMsg = await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg" },
            caption: cap
            }, { quoted: ck });

        const messageID = sentMsg.key.id;

        // Handle Menu Selection
        conn.ev.on('messages.upsert', async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;

            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;

            const isReplyToSentMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;
            if (isReplyToSentMsg) {
                const menuImages = {
                    '1': "https://graph.org/file/2fb6e685f72b2755603f6-bd07f6a5500ed5bcb7.jpg",
                    '2': "https://graph.org/file/2fb6e685f72b2755603f6-bd07f6a5500ed5bcb7.jpg",
                    '3': "https://graph.org/file/2fb6e685f72b2755603f6-bd07f6a5500ed5bcb7.jpg",
                    '4': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '5': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '6': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '7': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '8': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '9': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '10': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '11': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '12': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '13': "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg",
                    '99': "https://graph.org/file/2fb6e685f72b2755603f6-bd07f6a5500ed5bcb7.jpg"
                };

                const selectedMenu = `menu${messageType}`;
                if (menus[selectedMenu]) {
                    await conn.sendMessage(from, {
                        image: { url: menuImages[messageType] || "https://graph.org/file/2fb6e685f72b2755603f6-bd07f6a5500ed5bcb7.jpg" },
                        caption: menus[selectedMenu]
                         }, { quoted: ck });
                } else {
                    await conn.sendMessage(from, {
                        text: "*❌ Invalid Option!*\nPlease reply with a number between 1 and 13.",
                        contextInfo: {
                            mentionedJid: [sender]
                        }
                    }, { quoted: mek });
                }
            }
        });

    } catch (e) {
        console.error("Error:", e);
        reply(`*Oops! Something went wrong:*\n${e.message || e}`);
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
