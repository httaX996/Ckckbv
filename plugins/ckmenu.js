const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

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
│ \`1\` *|* ❭❭◦ *YT Downloader ⬇️*
│ \`2\` *|* ❭❭◦ *18+ Downloader 🔞*
╰─────────────────────╯

> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
`;

        // Define All Menus with English, Emojis, and Decorative Fonts
        const menus = {
            menu1: `
*⚚━━━⬇️YT DOWNLOADER⬇️━━━⚚*

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

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: ai
 │ 🏷️ᴜsᴇ: prefix ai Hellow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: aiimg
 │ 🏷️ᴜsᴇ: prefix aiimg <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: img (sticker to img)
 │ 🏷️ᴜsᴇ: prefix img <>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: imagine3
 │ 🏷️ᴜsᴇ: prefix imagine3 <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: imagine4
 │ 🏷️ᴜsᴇ: prefix imagine4 <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: bind
 │ 🏷️ᴜsᴇ: prefix bind Hellow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: gpt
 │ 🏷️ᴜsᴇ: prefix gpt Hellow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: bing
 │ 🏷️ᴜsᴇ: prefix bing Hellow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: blackbox
 │ 🏷️ᴜsᴇ: prefix blackbox Hellow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: siri
 │ 🏷️ᴜsᴇ: prefix siri Hellow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: gemini
 │ 🏷️ᴜsᴇ: prefix gemini Hellow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: openai
 │ 🏷️ᴜsᴇ: prefix prefix openai Hellow
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu4: `
*❖━━━🔍 SEARCH MENU 🔍━━━❖*

*╭─「✨ KAVI MDMENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: vt2
 │ 🏷️ᴜsᴇ: prefix vt2 <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: version
 │ 🏷️ᴜsᴇ: prefix version
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: all
 │ 🏷️ᴜsᴇ: prefix all <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: imagine2
 │ 🏷️ᴜsᴇ: prefix imagine2 <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: photo
 │ 🏷️ᴜsᴇ: prefix photo <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: csong
 │ 🏷️ᴜsᴇ: prefix csong <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: csong2
 │ 🏷️ᴜsᴇ: prefix csong2 <name jid>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: wiki
 │ 🏷️ᴜsᴇ: prefix wiki <car>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: font
 │ 🏷️ᴜsᴇ: prefix font <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: cpt
 │ 🏷️ᴜsᴇ: prefix cpt <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: define
 │ 🏷️ᴜsᴇ: prefix define <car>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: sring
 │ 🏷️ᴜsᴇ: prefix sring <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: dog
 │ 🏷️ᴜsᴇ: prefix dog <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: githubstalk
 │ 🏷️ᴜsᴇ: prefix githubstalk <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: google
 │ 🏷️ᴜsᴇ: prefix google <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: hiru
 │ 🏷️ᴜsᴇ: prefix hiru
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: img
 │ 🏷️ᴜsᴇ: prefix img <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: rtik
 │ 🏷️ᴜsᴇ: prefix rtik <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: logo
 │ 🏷️ᴜsᴇ: prefix logo <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: movie
 │ 🏷️ᴜsᴇ: prefix movie <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: news
 │ 🏷️ᴜsᴇ: prefix news
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: npm
 │ 🏷️ᴜsᴇ: prefix npm <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: wallpaper
 │ 🏷️ᴜsᴇ: prefix wallapaper <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: quote
 │ 🏷️ᴜsᴇ: prefix quote <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: dj
 │ 🏷️ᴜsᴇ: prefix dj <song name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: sp
 │ 🏷️ᴜsᴇ: prefix sp <song name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tiktoksearch
 │ 🏷️ᴜsᴇ: prefix titoksearch <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: stt
 │ 🏷️ᴜsᴇ: prefix stt <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: yta
 │ 🏷️ᴜsᴇ: prefix yta <song or video name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: api
 │ 🏷️ᴜsᴇ: prefix api <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: yts
 │ 🏷️ᴜsᴇ: prefix yts <song or video name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tstalk 
 │ 🏷️ᴜsᴇ: prefix stalk <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: weather
 │ 🏷️ᴜsᴇ: prefix weather <city name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: derana
 │ 🏷️ᴜsᴇ : prefix derana
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: csong
 │ 🏷️ᴜsᴇ: prefix csong <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: epi
 │ 🏷️ᴜsᴇ: prefix epi <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: china
 │ 🏷️ᴜsᴇ: prefix china
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: japan
 │ 🏷️ᴜsᴇ: prefix japan
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: indonesia
 │ 🏷️ᴜsᴇ: prefix indonesia
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: vietnam
 │ 🏷️ᴜsᴇ: prefix vietnam
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: korea
 │ 🏷️ᴜsᴇ: prefix korea
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: malasiya
 │ 🏷️ᴜsᴇ: prefix malasiya
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: thailand
 │ 🏷️ᴜsᴇ: prefix thailand
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: asupan
 │ 🏷️ᴜsᴇ: prefix asupan
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: gore
 │ 🏷️ᴜsᴇ: prefix gore
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu5: `
*❖━━━📥 DOWNLOAD MENU 📥━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: song
 │ 🏷️ᴜsᴇ: prefix song <song name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: song2
 │ 🏷️ᴜsᴇ: prefix song2<song name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: song3
 │ 🏷️ᴜsᴇ: prefix song3 <song name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: song4
 │ 🏷️ᴜsᴇ: prefix song4 <name or link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: song5
 │ 🏷️ᴜsᴇ: prefix song5 <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: video
 │ 🏷️ᴜsᴇ: prefix video <name or link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: video2
 │ 🏷️ᴜsᴇ: prefix video2 <name or link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tt (tiktok)
 │ 🏷️ᴜsᴇ: prefix tt <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tt2 (tiktok2)
 │ 🏷️ᴜsᴇ: prefix tt2 <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: ig
 │ 🏷️ᴜsᴇ: prefix ig <link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: fb
 │ 🏷️ᴜsᴇ: prefix fb <link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: twitter
 │ 🏷️ᴜsᴇ: prefix twitter <link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: mfire
 │ 🏷️ᴜsᴇ: prefix mfire <link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: apk
 │ 🏷️ᴜsᴇ: prefix apk <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: gdrive
 │ 🏷️ᴜsᴇ: prefix gdrive <link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: fb
 │ 🏷️ᴜsᴇ: prefix fb <link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: fb2
 │ 🏷️ᴜsᴇ: prefix fb2 <fb link>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: logo
 │ 🏷️ᴜsᴇ: prefix logo <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: yts (youtube search)
 │ 🏷️ᴜsᴇ: prefix yts <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: wallpaper
 │ 🏷️ᴜsᴇ: prefix wallpaper <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: csong
 │ 🏷️ᴜsᴇ: prefix csong <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: csend
 │ 🏷️ᴜsᴇ: prefix csend <name jid>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: ring (ringtone)
 │ 🏷️ᴜsᴇ: prefix ring <name>
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu6: `
*❖━━━🗝️ MAIN MENU 🗝️━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: menu
 │ 🏷️ᴜsᴇ: prefix menu
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: alive
 │ 🏷️ᴜsᴇ: prefix alive
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: update
 │ 🏷️ᴜsᴇ: prefix update
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: version
 │ 🏷️ᴜsᴇ: prefix version
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: ping
 │ 🏷️ᴜsᴇ: prefix ping 
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: ping2
 │ 🏷️ᴜsᴇ: prefix ping2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: system
 │ 🏷️ᴜsᴇ: prefix system
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: about
 │ 🏷️ᴜsᴇ: prefix about
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: link (get links)
 │ 🏷️ᴜsᴇ: prefix link
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: pair
 │ 🏷️ᴜsᴇ: prefix pair <+9477XXXXXX>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: setting
 │ 🏷️ᴜsᴇ: prefix setting
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: owner
 │ 🏷️ᴜsᴇ: prefix owner
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: br
 │ 🏷️ᴜsᴇ: prefix br <message>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: shutdown
 │ 🏷️ᴜsᴇ: prefix shutdown
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu7: `
*❖━━━🔄 CONVERT MENU 🔄━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: sticker
 │ 🏷️ᴜsᴇ: prefix sticker reply message
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tts
 │ 🏷️ᴜsᴇ: prefix tts text
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: url
 │ 🏷️ᴜsᴇ: prefix url reply message
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: take
 │ 🏷️ᴜsᴇ: prefix take reply message
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: sticker
 │ 🏷️ᴜsᴇ: prefix sticker reply message
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: readmore
 │ 🏷️ᴜsᴇ: prefix readmore <message>
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu8: `
*❖━━━⚙️ OTHER MENU ⚙️━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ:cpp
 │ 🏷️ᴜsᴇ:prefix cpp
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: csong
 │ 🏷️ᴜsᴇ: prefix csong <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: csend
 │ 🏷️ᴜsᴇ: prefix csend <name jid>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: version
 │ 🏷️ᴜsᴇ: prefix version
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: attp
 │ 🏷️ᴜsᴇ: prefix attp <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: emix
 │ 🏷️ᴜsᴇ: prefix emix <emoji,emoji>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: del
 │ 🏷️ᴜsᴇ: prefix del <reply message>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: attp
 │ 🏷️ᴜsᴇ: prefix attp <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: br
 │ 🏷️ᴜsᴇ: prefix br <message>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: attp
 │ 🏷️ᴜsᴇ: prefix attp <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: setpp
 │ 🏷️ᴜsᴇ: prefix setpp
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: gpass
 │ 🏷️ᴜsᴇ: prefix gpass
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: timenow
 │ 🏷️ᴜsᴇ: prefix timenow
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: date
 │ 🏷️ᴜsᴇ: prefix date
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: attp
 │ 🏷️ᴜsᴇ: prefix attp <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: count
 │ 🏷️ᴜsᴇ: prefix count
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: calc
 │ 🏷️ᴜsᴇ: prefix calc <2+8>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: attp
 │ 🏷️ᴜsᴇ: prefix attp <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: pdf
 │ 🏷️ᴜsᴇ: prefix pdf <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: attp
 │ 🏷️ᴜsᴇ: prefix attp <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: msgall
 │ 🏷️ᴜsᴇ: prefix msgall
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: vcf
 │ 🏷️ᴜsᴇ: prefix vcf
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu9: `
*❖━━━🎨 LOGO MENU 🎨━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟐.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: logo
 │ 🏷️ᴜsᴇ: prefix logo <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: logo2
 │ 🏷️ᴜsᴇ: prefix attp <text>
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu10: `
*❖━━━🎉 FUN MENU 🎉━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: loli
 │ 🏷️ᴜsᴇ: prefix loli
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: waifu
 │ 🏷️ᴜsᴇ: prefix waifu
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: neko
 │ 🏷️ᴜsᴇ: prefix neko
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: megumin
 │ 🏷️ᴜsᴇ: prefix megumin
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: maid
 │ 🏷️ᴜsᴇ: prefix maid
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: awoo
 │ 🏷️ᴜsᴇ: prefix awoo
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: happly
 │ 🏷️ᴜsᴇ: prefix happly
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: heart
 │ 🏷️ᴜsᴇ: prefix heart
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: angry
 │ 🏷️ᴜsᴇ: prefix angry
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: sad
 │ 🏷️ᴜsᴇ: prefix sad
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: shy
 │ 🏷️ᴜsᴇ: prefix shy
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: moon
 │ 🏷️ᴜsᴇ: prefix moon
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: confused
 │ 🏷️ᴜsᴇ: prefix confused
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: hot
 │ 🏷️ᴜsᴇ: prefix hot
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: fact
 │ 🏷️ᴜsᴇ: prefix fact
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: fchek
 │ 🏷️ᴜsᴇ: prefix fchek
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: aura
 │ 🏷️ᴜsᴇ: prefix aura
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: roast
 │ 🏷️ᴜsᴇ: prefix roast
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: 8ball
 │ 🏷️ᴜsᴇ: prefix 8ball
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: compliment
 │ 🏷️ᴜsᴇ: prefix compliment
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: lovetest
 │ 🏷️ᴜsᴇ: prefix lovetest
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: emoji
 │ 🏷️ᴜsᴇ: prefix emoji
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: hack
 │ 🏷️ᴜsᴇ: prefix hack
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: cry
 │ 🏷️ᴜsᴇ: prefix cry
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: cuddle
 │ 🏷️ᴜsᴇ: prefix cuddle
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: bully
 │ 🏷️ᴜsᴇ: prefix bully
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: hug
 │ 🏷️ᴜsᴇ: prefix hug
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: lick
 │ 🏷️ᴜsᴇ: prefix lick
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: put
 │ 🏷️ᴜsᴇ: prefix put
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: smug
 │ 🏷️ᴜsᴇ: prefix smug 
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: bonk
 │ 🏷️ᴜsᴇ: prefix bonk
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: yeet
 │ 🏷️ᴜsᴇ: prefix yeet
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: blush
 │ 🏷️ᴜsᴇ: prefix blush
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: handhold
 │ 🏷️ᴜsᴇ: prefix handhold
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: highfive
 │ 🏷️ᴜsᴇ: prefix highfive
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: nom
 │ 🏷️ᴜsᴇ: prefix nom
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: wave
 │ 🏷️ᴜsᴇ: prefix wave
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: smile
 │ 🏷️ᴜsᴇ: prefix smile
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: wink
 │ 🏷️ᴜsᴇ: prefix wink
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: happy
 │ 🏷️ᴜsᴇ: prefix happy
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: glomp
 │ 🏷️ᴜsᴇ: prefix glomp
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: bite
 │ 🏷️ᴜsᴇ: prefix bite
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: poke
 │ 🏷️ᴜsᴇ: prefix poke
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: cringe
 │ 🏷️ᴜsᴇ: prefix cringe
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: dance
 │ 🏷️ᴜsᴇ: prefix dance
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: kill
 │ 🏷️ᴜsᴇ: prefix kill
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: slap
 │ 🏷️ᴜsᴇ: prefix slap
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: kiss
 │ 🏷️ᴜsᴇ: prefix kiss
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: ship
 │ 🏷️ᴜsᴇ: prefix ship
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: roll
 │ 🏷️ᴜsᴇ: prefix roll
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: coinflip
 │ 🏷️ᴜsᴇ: prefix coinflip
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: flip
 │ 🏷️ᴜsᴇ: prefix flip
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: pick
 │ 🏷️ᴜsᴇ: prefix pick
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: rate
 │ 🏷️ᴜsᴇ: prefix rate
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: countx
 │ 🏷️ᴜsᴇ: prefix countx
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: joke
 │ 🏷️ᴜsᴇ: prefix joke
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: flirt
 │ 🏷️ᴜsᴇ: prefix flirt
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: truth
 │ 🏷️ᴜsᴇ: prefix truth
 ╰────────────────────✵✵
 ╭────────✵✵
 │ ??ᴄᴏᴍᴍᴀɴᴅ: dave
 │ 🏷️ᴜsᴇ: prefix dave
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: pickup
 │ 🏷️ᴜsᴇ: prefix pickup
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: char
 │ 🏷️ᴜsᴇ: prefix char
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: repeat
 │ 🏷️ᴜsᴇ: prefix repeat
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`,

            menu11: `
*❖━━━👥 GROUP MENU 👥━━━❖*

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: autoai on
 │ 🏷️ᴜsᴇ: prefix autoai on
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: startwallpaper
 │ 🏷️ᴜsᴇ: prefix startwallpaper
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: stopwallpaper
 │ 🏷️ᴜsᴇ: prefix stopwallapaper
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: admins
 │ 🏷️ᴜsᴇ: prefix admins
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: groupdesc
 │ 🏷️ᴜsᴇ: prefix groupdesc
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: groupinfo
 │ 🏷️ᴜsᴇ: prefix groupinfo
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: grouplink
 │ 🏷️ᴜsᴇ: prefix grouplink
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: gname
 │ 🏷️ᴜsᴇ: prefix gname
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: setsubject
 │ 🏷️ᴜsᴇ: prefix setsubject
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tagall
 │ 🏷️ᴜsᴇ: prefix tagall
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: requests
 │ 🏷️ᴜsᴇ: prefix requests
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: accept
 │ 🏷️ᴜsᴇ: prefix accept
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ:reject
 │ 🏷️ᴜsᴇ: prefix reject
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: unlock
 │ 🏷️ᴜsᴇ: prefix unlock
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: lock
 │ 🏷️ᴜsᴇ: prefix lock
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: approve
 │ 🏷️ᴜsᴇ: prefix approve
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: poll
 │ 🏷️ᴜsᴇ: prefix poll
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: getpic
 │ 🏷️ᴜsᴇ: prefix getpic
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: add3
 │ 🏷️ᴜsᴇ: prefix add3 <9477XXXX>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ:appove
 │ 🏷️ᴜsᴇ: prefix appove
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: promote
 │ 🏷️ᴜsᴇ: prefix promote
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: demote
 │ 🏷️ᴜsᴇ: prefix demote
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: requests2
 │ 🏷️ᴜsᴇ: prefix requests2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tagall2
 │ 🏷️ᴜsᴇ: prefix tagall2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ:accept2
 │ 🏷️ᴜsᴇ: prefix accept2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: reject
 │ 🏷️ᴜsᴇ: prefix reject
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: leave2
 │ 🏷️ᴜsᴇ: prefix leave2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: invite
 │ 🏷️ᴜsᴇ: prefix invite
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: add
 │ 🏷️ᴜsᴇ: prefix add <9477XXX>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: end
 │ 🏷️ᴜsᴇ: prefix end
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: tagadmin2
 │ 🏷️ᴜsᴇ: prefix tagadmin2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: mute2
 │ 🏷️ᴜsᴇ: prefix mute2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: unmute2
 │ 🏷️ᴜsᴇ: prefix unmute2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: kick
 │ 🏷️ᴜsᴇ: prefix kick
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: setname 
 │ 🏷️ᴜsᴇ: prefix setname <name>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: setdesc2 
 │ 🏷️ᴜsᴇ: prefix setdesc2 <text>
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: opemtime2
 │ 🏷️ᴜsᴇ: prefix opentime2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: closetime
 │ 🏷️ᴜsᴇ: prefix closetime
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: join
 │ 🏷️ᴜsᴇ: prefix join
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: hidetag2
 │ 🏷️ᴜsᴇ: prefix hidetag2
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: kickall
 │ 🏷️ᴜsᴇ: prefix kickall
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: mute
 │ 🏷️ᴜsᴇ: prefix mute
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: unmute
 │ 🏷️ᴜsᴇ: prefix unmute
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: msgall
 │ 🏷️ᴜsᴇ: prefix msgall
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: vcf
 │ 🏷️ᴜsᴇ: prefix vcf
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
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

*╭─「✨ KAVI MD MENU LIST ✨」*
*│ 🔥 Runtime: ${runtime(process.uptime())}*
*│ 🔥 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB*
*│ 🔥 Platform: ${os.hostname()}*
*│ 🔥 Version: 𝟏.𝟎*
*│ 🔥 Owner: ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ*
*╰────────────*

 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: derana
 │ 🏷️ᴜsᴇ: prefix derana
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: hiru
 │ 🏷️ᴜsᴇ: prefix hiru
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ:sirasa
 │ 🏷️ᴜsᴇ: prefix sirasa
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: itn
 │ 🏷️ᴜsᴇ: prefix itn
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: lankadeepa
 │ 🏷️ᴜsᴇ: prefix lankadeepa
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: bbc
 │ 🏷️ᴜsᴇ: prefix bbc
 ╰────────────────────✵✵
 ╭────────✵✵
 │ 📚ᴄᴏᴍᴍᴀɴᴅ: siyatha
 │ 🏷️ᴜsᴇ: prefix siyatha
 ╰────────────────────✵✵

> *ᴘᴏᴡᴇʀᴅ ʙʏ  ᴋᴀᴠɪᴅᴜ ʀᴀꜱᴀɴɢᴀ : )*
`
        };



        // Send Main Menu Image and Caption
        const sentMsg = await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/h6t2am.jpg" },
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
                    '1': "https://files.catbox.moe/h6t2am.jpg",
                    '2': "https://files.catbox.moe/h6t2am.jpg",
                    '3': "https://files.catbox.moe/h6t2am.jpg",
                    '4': "https://files.catbox.moe/h6t2am.jpg",
                    '5': "https://files.catbox.moe/h6t2am.jpg",
                    '6': "https://files.catbox.moe/h6t2am.jpg",
                    '7': "https://files.catbox.moe/h6t2am.jpg",
                    '8': "https://files.catbox.moe/h6t2am.jpg",
                    '9': "https://files.catbox.moe/h6t2am.jpg",
                    '10': "https://files.catbox.moe/h6t2am.jpg",
                    '11': "https://files.catbox.moe/h6t2am.jpg",
                    '12': "https://files.catbox.moe/h6t2am.jpg",
                    '13': "https://files.catbox.moe/h6t2am.jpg"
                };

                const selectedMenu = `menu${messageType}`;
                if (menus[selectedMenu]) {
                    await conn.sendMessage(from, {
                        image: { url: menuImages[messageType] || "https://files.catbox.moe/h6t2am.jpg" },
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
