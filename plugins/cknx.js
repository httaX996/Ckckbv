const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

const c_footer = "> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*";

cmd(
    {
        pattern: "xnxx",
        alias: ["xvdl", "xvideo"],
        use: ".xnxx <xnxx video name>",
        react: "🤤",
        desc: "Search and download xnxx.com 18+ videos.",
        category: "download",
        filename: __filename
    }, async (conn, mek, m, {q, from, reply}) => {
        
        const react = async (msgKey, emoji) => {
    try {
      await conn.sendMessage(from, {
        react: {
          text: emoji,
          key: msgKey
        }
      });
    } catch (e) {
      console.error("Reaction error:", e.message);
    }
  };
        try {
            
            if (!q) {
                await reply("Please enter xnxx.com video name !!")
            }
            
            const xnxxSearchapi = await fetchJson(`https://tharuzz-ofc-api-v2.vercel.app/api/search/xvsearch?query=${q}`);
            
            if (!xnxxSearchapi.result.xvideos) {
                await reply("No result found you enter xnxx video name :(")
            }
            
            let list = "\`🔞CK XNXX VIDEO SEARCH RESULT🔞\`\n\n";
            
            xnxxSearchapi.result.xvideos.forEach((xnxx, i) => {
      list += `\`${i + 1}\` *|* ❭❭◦ *${xnxx.title || "No title info"}*\n`;
    });
          
          const listMsg = await conn.sendMessage(from, { 
              image: { url: "https://files.catbox.moe/h6t2am.jpg"},
              caption: list + "\n🔢 *ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ᴀ ɴᴜᴍʙᴇʀ ᴄʜᴏᴏꜱᴇ ᴀ ʀᴇꜱᴜʟᴛ.*\n\n" + c_footer }, { quoted: ck });
          const listMsgId = listMsg.key.id;
          
          conn.ev.on("messages.upsert", async (update) => {
              
              const msg = update?.messages?.[0];
              if (!msg?.message) return;

              const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
              const isReplyToList = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId === listMsgId;
              if (!isReplyToList) return;
              
              const index = parseInt(text.trim()) - 1;
              if (isNaN(index) || index < 0 || index >= xnxxSearchapi.result.xvideos.length) return reply("❌ *`ɪɴᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ ᴘʟᴇᴀꜱᴇ ᴇɴᴛᴇʀ ᴠᴀʟɪᴅ  ɴᴜᴍʙᴇʀ.`*");
              await react(msg.key, '✅');
              
              const chosen = xnxxSearchapi.result.xvideos[index];
              
              const xnxxDownloadapi = await fetchJson(`https://tharuzz-ofc-api-v2.vercel.app/api/download/xvdl?url=${chosen.link}`);
              
              const infoMap = xnxxDownloadapi?.result;
              
              const downloadUrllow = xnxxDownloadapi?.result?.dl_Links?.lowquality;
              
              const downloadUrlhigh = xnxxDownloadapi?.result?.dl_Links?.highquality;
              
              const askType = await conn.sendMessage(
            from,{
                image: {url: infoMap.thumbnail },
                caption: `*🔞 \`CK XNXX DOWNLOADER\`*\n\n` +
                `*📌 \`Title:\` ${infoMap.title}*\n` + 
                `*⏰ \`Duration:\` ${infoMap.duration}*\n\n` +
                `*🔢 \`Reply below number:\`*\n\n` +
                `*1 |* ❭❭◦ Download video high quality\n` +
                `*2 |* ❭❭◦ Download video low quality\n\n` + c_footer
            }, { quoted: ck }
        );
            
            const typeMsgId = askType.key.id; 
            
            conn.ev.on("messages.upsert", async (tUpdate) => {
                
                const tMsg = tUpdate?.messages?.[0];
            if (!tMsg?.message) return;

            const tText = tMsg.message?.conversation || tMsg.message?.extendedTextMessage?.text;
            const isReplyToType = tMsg?.message?.extendedTextMessage?.contextInfo?.stanzaId === typeMsgId;
            if (!isReplyToType) return;
       
            await react(tMsg.key, tText.trim() === "1" ? '🎥' : tText.trim() === "2" ? '🎥' : '❓');
            
            if (tText.trim() === "1") {
                await conn.sendMessage(
                    from,
                    {
                      video: {url: downloadUrlhigh },
                      caption: `*🔞 ${infoMap.title}*\n*🌟Qᴜᴀʟɪᴛʏ :* HIGH🔋\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                    }, {quoted: ck}
                )
            } else if (tText.trim() === "2") {
                await conn.sendMessage(
                    from, {
                        video: {url: downloadUrllow },
                        caption: `*🔞 ${infoMap.title}*\n*🌟Qᴜᴀʟɪᴛʏ :* LOW🪫\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`

                    }, {quoted: ck}
                )
            } else {
                await conn.sendMessage(from, { text: "❌ *`ɪɴᴠᴀʟɪᴅᴇ ɪɴᴘᴜᴛ. 1ꜰᴏʀ ᴠɪᴅᴇᴏ high quality ᴛʏᴘᴇ / 2 ꜰᴏʀ video low quality ᴛʏᴘᴇ`*" }, { quoted: ck });
            }
            });
          });
        } catch (e) {
            console.log(e);
            await reply("*❌ Error: " + e + "*")
        }
    }
);

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
