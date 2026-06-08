const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { fetchJson } = require("../lib/functions");
const { ytsearch, ytmp3 } = require('@dark-yasiya/yt-dl.js');
const axios = require("axios");

// YouTube MP4 වීඩියෝ බාගත කිරීමේ ශ්‍රිතය (Function)
async function ytmp4(videoUrl, videoFormat) {
  try {
    if (!videoUrl || !videoFormat) {
      throw new Error("url and format parameters are required.");
    }
    
    // උදාහරණ: '360p' යන්නෙන් 'p' ඉවත් කර අංකයක් බවට පත් කරයි (360)
    const formatQuality = parseInt(videoFormat.replace('p', ''), 10);
    const requestParams = {
      'button': 1,
      'start': 1,
      'end': 1,
      'format': formatQuality,
      'url': videoUrl
    };
    
    const requestHeaders = {
      'Accept': "*/*",
      'Accept-Encoding': "gzip, deflate, br",
      'Accept-Language': "en-GB,en-US;q=0.9,en;q=0.8",
      'Origin': "https://loader.to",
      'Referer': 'https://loader.to',
      'Sec-Ch-Ua': "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-Ua-Platform': "\"Android\"",
      'Sec-Fetch-Dest': "empty",
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': "cross-site",
      'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    };

    // loader.to API එක වෙත මුල් ඉල්ලීම යැවීම
    const downloadRequest = await axios.get('https://ab.cococococ.com/ajax/download.php', {
      'params': requestParams,
      'headers': requestHeaders
    });
    
    const downloadId = downloadRequest.data.id;

    // වීඩියෝව සකස් වන තෙක් (Progress) පරීක්ෂා කරන අභ්‍යන්තර ශ්‍රිතය
    const checkProgress = async () => {
      const progressParams = { 'id': downloadId };
      try {
        const progressResponse = await axios.get("https://p.oceansaver.in/ajax/progress.php", {
          'params': progressParams,
          'headers': requestHeaders
        });
        
        const { progress, download_url, text } = progressResponse.data;
        
        // සකස් කර අවසන් නම් ලින්ක් එක ලබා දෙයි, නැතහොත් තත්පර 1ක් රැඳී නැවත පරීක්ෂා කරයි
        return text === "Finished" ? download_url : (await new Promise(resolve => setTimeout(resolve, 1000)), checkProgress());
      } catch (error) {
        throw new Error("Error in progress check: " + error.message);
      }
    };
    
    return await checkProgress();
  } catch (error) {
    console.error("Error:", error);
    return { 'error': error.message };
  }
}

module.exports = { 'ytmp4': ytmp4 };

// YouTube Link එකෙන් ID එක පමණක් වෙන් කරගැනීම
function extractYouTubeId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// ඕනෑම YouTube ලින්ක් එකක් සම්මත ලින්ක් එකක් බවට පත් කිරීම
function convertYouTubeLink(url) {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return "https://www.youtube.com/watch?v=" + videoId;
  }
  return url;
}

// ==================== SONG / PLAY COMMAND ====================
cmd({
  'pattern': "tests",
  'alias': 'play',
  'desc': "To download songs.",
  'react': '🎵',
  'category': 'download',
  'filename': __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("Please give me a URL or title.");
    
    const searchUrl = convertYouTubeLink(q);
    const searchResult = await yts(searchUrl);
    const videoData = searchResult.videos[0];
    const videoLink = videoData.url;
    
    let captionText = `\n*CK MUSIC*\n❍ *ᴛɪᴛʟᴇ :* ${videoData.title}\n❍ *ᴅᴜʀᴀᴛɪᴏɴ :* ${videoData.timestamp}\n❍ *ᴠɪᴇᴡꜱ :* ${videoData.views}\n❍ *ᴜᴘʟᴏᴀᴅ ᴏɴ :* ${videoData.ago}\n*ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴛᴏ*\n*ᴅᴏᴡɴʟᴏᴀᴅ ꜰʀᴏᴍᴀᴛ*\n\n*ᴅᴏᴡɴʟᴏᴀᴅ ᴀᴜᴅɪᴏ 🎧*\n\n*1*     ┃  *ᴀᴜᴅɪᴏ*\n\n*ᴅᴏᴡɴʟᴏᴀᴅ ᴅᴏᴄᴜᴍᴇɴᴛ 📁*\n\n*2*     ┃  *ᴅᴏᴄᴜᴍᴇɴᴛ*\n\nCK BOT ✻\n`;
    
    // මෙනුව පරිශීලකයා වෙත යැවීම
    const sentMsg = await conn.sendMessage(from, {
      'image': { 'url': videoData.thumbnail },
      'caption': captionText
    }, { 'quoted': mek });

    const originalMsgId = sentMsg.key.id;

    // පරිශීලකයා පිළිතුරු (Reply) දෙන තෙක් බලා සිටීම
    conn.ev.on('messages.upsert', async messageUpdate => {
      const chatMessage = messageUpdate.messages[0];
      if (!chatMessage.message) return;
      
      const userReply = chatMessage.message.conversation || chatMessage.message.extendedTextMessage?.['text'];
      const remoteJid = chatMessage.key.remoteJid;
      const isReplyToBot = chatMessage.message.extendedTextMessage && chatMessage.message.extendedTextMessage.contextInfo.stanzaId === originalMsgId;
      
      if (isReplyToBot) {
        await conn.sendMessage(remoteJid, { 'react': { 'text': '⬇️', 'key': chatMessage.key } });
        
        // 1 තේරුවහොත් - Audio ලෙස යැවීම
        if (userReply === '1') {
          const audioData = await ytmp3(videoLink);
          await conn.sendMessage(remoteJid, { 'react': { 'text': '⬆️', 'key': chatMessage.key } });
          
          await conn.sendMessage(remoteJid, {
            'audio': { 'url': audioData.download.url },
            'mimetype': "audio/mpeg"
          }, { 'quoted': mek });
          
          await conn.sendMessage(remoteJid, { 'react': { 'text': '✅', 'key': chatMessage.key } });
          
        // 2 තේරුවහොත් - Document (.mp3) ලෙස යැවීම
        } else if (userReply === '2') {
          const audioData = await ytmp3(videoLink);
          await conn.sendMessage(remoteJid, { 'react': { 'text': '⬆️', 'key': chatMessage.key } });
          
          await conn.sendMessage(remoteJid, {
            'document': { 'url': audioData.download.url },
            'mimetype': "audio/mp3",
            'fileName': videoData.title + ".mp3",
            'caption': "\n*© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ck*\n "
          }, { 'quoted': mek });
          
          await conn.sendMessage(remoteJid, { 'react': { 'text': '✅', 'key': chatMessage.key } });
          await conn.sendMessage(remoteJid, { 'delete': sentMsg.key });
        }
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});

// ==================== VIDEO COMMAND ====================
cmd({
  'pattern': "testv",
  'desc': "To download videos.",
  'react': '🎥',
  'category': 'download',
  'filename': __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("Please give me a URL or title.");
    
    const searchUrl = convertYouTubeLink(q);
    const searchResult = await yts(searchUrl);
    const videoData = searchResult.videos[0];
    const videoLink = videoData.url;
    
    let captionText = `\n*CK VIDEO*\n ${videoData.title}\n❍ *ᴅᴜʀᴀᴛɪᴏɴ :* ${videoData.timestamp}\n❍ *ᴠɪᴇᴡꜱ :* ${videoData.views}\n❍ *ᴜᴘʟᴏᴀᴅ ᴏɴ :* ${videoData.ago}\n\n*ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴛᴏ*\n*ᴅᴏᴡɴʟᴏᴀᴅ ꜰʀᴏᴍᴀᴛ*\n\n*ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ 🎬*\n\n*1.1*     ┃  *360ᴘ*\n*1.2*     ┃  *480ᴘ*\n*1.3*     ┃  *720ᴘ*\n*1.4*     ┃  *1080ᴘ*\n\n*ᴅᴏᴡɴʟᴏᴀᴅ ᴅᴏᴄᴜᴍᴇɴᴛ 📁*\n\n*2.1*     ┃  *360ᴘ*\n*2.2*     ┃  *480ᴘ*\n*2.3*     ┃  *720ᴘ*\n*2.4*     ┃  *1080ᴘ*\n\n> CK BOT ✻\n`;
    
    const sentMsg = await conn.sendMessage(from, {
      'image': { 'url': videoData.thumbnail },
      'caption': captionText
    }, { 'quoted': mek });

    const originalMsgId = sentMsg.key.id;

    conn.ev.on("messages.upsert", async messageUpdate => {
      const chatMessage = messageUpdate.messages[0];
      if (!chatMessage.message) return;
      
      const userReply = chatMessage.message.conversation || chatMessage.message.extendedTextMessage?.['text'];
      const remoteJid = chatMessage.key.remoteJid;
      const isReplyToBot = chatMessage.message.extendedTextMessage && chatMessage.message.extendedTextMessage.contextInfo.stanzaId === originalMsgId;
      
      if (isReplyToBot) {
        await conn.sendMessage(remoteJid, { 'react': { 'text': '⬇️', 'key': chatMessage.key } });
        
        let downloadUrl = "";
        let isDocument = false;
        let quality = "";

        // පරිශීලකයා තෝරාගත් අංකය අනුව Quality එක සහ Type එක තීරණය කිරීම
        if (userReply === '1.1') { quality = '360p'; }
        else if (userReply === '1.2') { quality = '480'; }
        else if (userReply === '1.3') { quality = '720'; }
        else if (userReply === '1.4') { quality = '1080'; }
        else if (userReply === '2.1') { quality = '360'; isDocument = true; }
        else if (userReply === '2.2') { quality = '480'; isDocument = true; }
        else if (userReply === '2.3') { quality = '720'; isDocument = true; }
        else if (userReply === '2.4') { quality = '1080'; isDocument = true; }

        if (quality) {
          downloadUrl = await ytmp4('' + videoLink, quality);
          await conn.sendMessage(remoteJid, { 'delete': sentMsg.key });
          await conn.sendMessage(remoteJid, { 'react': { 'text': '⬆️', 'key': chatMessage.key } });

          if (!isDocument) {
            // Normal Video Format
            await conn.sendMessage(remoteJid, {
              'video': { 'url': downloadUrl },
              'caption': "\n*© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ck*\n"              
            }, { 'quoted': mek });
          } else {
            // Document Format (.mp4)
            await conn.sendMessage(remoteJid, {
              'document': { 'url': downloadUrl },
              'mimetype': "video/mp4",
              'fileName': videoData.title + ".mp4",
              'caption': "\n*© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ck*\n"
            }, { 'quoted': mek });
          }
          await conn.sendMessage(remoteJid, { 'react': { 'text': '✅', 'key': chatMessage.key } });
        }
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});

// ==================== YTA COMMAND ====================
cmd({
  'pattern': "testa",
  'alias': "ytmp3",
  'react': '⬇️',
  'dontAddCommandList': true,
  'filename': __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return await reply("*Need a YouTube URL!*");
    
    // පළමු උත්සාහය: Gifted Tech API භාවිතයෙන්
    const apiResponse = await fetchJson("https://api.giftedtech.my.id/api/download/ytaud?apikey=gifted&url=" + q);
    const audioUrl = apiResponse.result.download_url;
    
    await conn.sendMessage(from, {
      'audio': { 'url': audioUrl },
      'mimetype': "audio/mpeg"
    }, { 'quoted': mek });
    
  } catch (firstError) {
    console.log("First attempt failed:", firstError);
    try {
      // දෙවන උත්සාහය: dlyta ශ්‍රිතය (Backup) භාවිතයෙන්
      const backupAudio = await dlyta(q);
      await conn.sendMessage(from, {
        'audio': { 'url': backupAudio.dl_link },
        'mimetype': "audio/mpeg"
      }, { 'quoted': mek });
    } catch (secondError) {
      console.log("Second attempt failed:", secondError);
      await reply("*Failed to process the request. Please try again later!*");
    }
  }
});
