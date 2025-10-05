const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

const tharuzz_footer = "> © Powerd by tharuzz ofc";

cmd(
    {
        pattern: "cxnxx",
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
            
            let list = "🔞 THARUZZ-MD XNXX VIDEO SEARCH RESULT\n\n";
            
            xnxxSearchapi.result.xvideos.forEach((xnxx, i) => {
      list += `*\`${i + 1}\` | | ${xnxx.title || "No title info"}*\n`;
    });
          
          const listMsg = await conn.sendMessage(from, { text: list + "\n🔢 *ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ᴀ ɴᴜᴍʙᴇʀ ᴄʜᴏᴏꜱᴇ ᴀ ʀᴇᴀᴜʟᴛ.*\n\n" + tharuzz_footer }, { quoted: mek });
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
                caption: `*🔞 \`XNXX VIDEO INFO\`*\n\n` +
                `*📌 \`Title:\` ${infoMap.title}*\n` + 
                `*⏰ \`Duration:\` ${infoMap.duration}*\n\n` +
                `*🔢 \`Reply below number:\`*\n\n` +
                `*1 | | Download video high quality*\n` +
                `*2 | | Download video low quality*\n\n` + tharuzz_footer
            }, { quoted:msg }
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
                      caption: `*🔞 Here is your xnxx high quality video.*\n\n> ${infoMap.title}`
                    }, {quoted: tMsg}
                )
            } else if (tText.trim() === "2") {
                await conn.sendMessage(
                    from, {
                        video: {url: downloadUrllow },
                        caption: `*🔞 Here is your xnxx low quality video.*\n\n> ${infoMap.title}`

                    }, {quoted: tMsg}
                )
            } else {
                await conn.sendMessage(from, { text: "❌ *`ɪɴᴠᴀʟɪᴅᴇ ɪɴᴘᴜᴛ. 1ꜰᴏʀ ᴠɪᴅᴇᴏ high quality ᴛʏᴘᴇ / 2 ꜰᴏʀ video low quality ᴛʏᴘᴇ`*" }, { quoted: tMsg });
            }
            });
          });
        } catch (e) {
            console.log(e);
            await reply("*❌ Error: " + e + "*")
        }
    }
);


*📲 `FOLLOW US` :* ~https://whatsapp.com/channel/0029Vb9LTRHInlqISdCfln45~

*📲 `FOLLOW US` :* ~https://whatsapp.com/channel/0029Vb9LTRHInlqISdCfln45~
