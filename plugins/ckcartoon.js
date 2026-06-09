const { getBuffer } = require("../lib/functions");
const fg = require("api-dylux");
const axios = require("axios");
const sharp = require("sharp");
const cheerio = require("cheerio");
const { cmd } = require("../command");

/* ================= MIME TYPE AUTO DETECT ================= */

function getMimeType(fileName, fallback) {
  const ext = fileName.split('.').pop().toLowerCase();

  const map = {
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    webm: "video/webm",

    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",

    pdf: "application/pdf",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",

    apk: "application/vnd.android.package-archive",

    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp"
  };

  return map[ext] || fallback || "application/octet-stream";
}

/* ================= THUMBNAIL FUNCTION ================= */

async function createThumbnail(imageUrl, width = 150, height = 150) {
  try {
    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    return await sharp(res.data)
      .resize(width, height)
      .jpeg({ quality: 60 })
      .toBuffer();
  } catch (e) {
    return null; // Thumbnail එක සෑදීමේදී දෝෂයක් ආවොත් skip කිරීමට
  }
}

/* ================= QUOTED CONTACT ================= */

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

/* ================= MAIN COMMAND ================= */

cmd({
  'pattern': "cartoon",
  'react': '📑',
  'category': 'download',
  'desc': "Search and download from ginisisilacartoon.net",
  'filename': __filename
}, async (bot, message, quotedMessage, { from, q: searchQuery, isDev, reply }) => {
  try {
    if (!searchQuery) {
      return await reply("*Please provide a search query! (e.g., Garfield)*");
    }

    const searchUrl = "https://ginisisilacartoon.net/search.php?q=" + encodeURIComponent(searchQuery);
    const searchResponse = await axios.get(searchUrl);
    const $search = cheerio.load(searchResponse.data);
    let resultsList = [];

    // වෙබ් අඩවියෙන් තොරතුරු සූරා ගැනීම (Scraping)
    $search("div.inner-video-cell").each((index, element) => {
      const title = $search(element).find("div.video-title > a").attr('title');
      const postedTime = $search(element).find("div.posted-time").text().trim();
      const href = $search(element).find("div.video-title > a").attr("href");
      const imageUrl = $search(element).find("div.inner-video-thumb-wrapper img").attr('src');

      if (title && href) {
        resultsList.push({
          'title': title,
          'postedTime': postedTime,
          'episodeLink': 'https://ginisisilacartoon.net/' + href,
          'imageUrl': imageUrl
        });
      }
    });

    if (resultsList.length === 0) {
      return await reply("No results found for: " + searchQuery);
    }

    // සෙවුම් ප්‍රතිඵල ලැයිස්තුව සකස් කිරීම
    let responseText = "📺 Search Results for *" + searchQuery + ":*\n\n";
    resultsList.forEach((item, index) => {
      responseText += '*' + (index + 1) + ".* " + item.title + "\n🗓️ Posted: " + item.postedTime + "\n🔗 Link: " + item.episodeLink + "\n\n";
    });

    // ප්‍රතිඵල ලැයිස්තුව යැවීම
    const sentMessage = await bot.sendMessage(from, {
      'text': responseText
    }, {
      quoted: ck
    });
    
    const originalMessageId = sentMessage.key.id;

    // පරිශීලකයා අංකයක් මඟින් දෙන පිළිතුර (Reply) හසුරුවන කොටස
    bot.ev.on("messages.upsert", async chatUpdate => {
      const incomingMessage = chatUpdate.messages[0];
      if (!incomingMessage.message) return;

      const userText = incomingMessage.message.conversation || incomingMessage.message.extendedTextMessage?.["text"];
      const remoteJid = incomingMessage.key.remoteJid;
      const isReplyToBot = incomingMessage.message.extendedTextMessage && incomingMessage.message.extendedTextMessage.contextInfo.stanzaId === originalMessageId;

      if (isReplyToBot) {
        const selectedIndex = parseInt(userText.trim());

        if (!isNaN(selectedIndex) && selectedIndex > 0 && selectedIndex <= resultsList.length) {
          const selectedEpisode = resultsList[selectedIndex - 1];
          
          const captionText = "*🪄 ɴᴀᴍᴇ:-* " + selectedEpisode.title + "\n⏳ *ᴅᴀᴛᴇ:-* " + selectedEpisode.postedTime + "\n📎 *ᴇᴘɪꜱᴏᴅᴇ ʟɪɴᴋ*:- " + selectedEpisode.episodeLink + "\n\n☘ *We are uploading the Movie/Episode you requested.*";
          
          // මුලින්ම පෝස්ටරය සහ විස්තර යැවීම
          await bot.sendMessage(remoteJid, {
            'image': { url: selectedEpisode.imageUrl },
            'caption': captionText
          }, {
            quoted: ck
          });

          // අදාළ පිටුවට ගොස් iframe (Google Drive Link) එක සෙවීම
          const episodePageResponse = await axios.get(selectedEpisode.episodeLink);
          const $episodePage = cheerio.load(episodePageResponse.data);
          const iframeSrc = $episodePage("div#player-holder iframe").attr("src");

          if (iframeSrc) {
            try {
              // පැරණි API එක වෙනුවට api-dylux හි GDriveDl භාවිත කිරීම
              const gdriveData = await fg.GDriveDl(iframeSrc);

              if (!gdriveData || !gdriveData.downloadUrl) {
                return await bot.sendMessage(remoteJid, { 'text': "*Error..! Google Drive link is Private or Invalid.*" }, { 'quoted': incomingMessage });
              }

              // Auto mimetype detect කිරීම
              const mime = getMimeType(gdriveData.fileName, gdriveData.mimetype);

              // Thumbnail එකක් සෑදීම
              const thumb = await createThumbnail("https://i.ibb.co/zd34Xnr/20251021-154215.jpg");

              // වීඩියෝව Document එකක් ලෙස පරිශීලකයාට යැවීම
              await bot.sendMessage(remoteJid, {
                'document': { url: gdriveData.downloadUrl },
                'mimetype': mime,
                'fileName': "🎬 CK CineMAX 🎬\n" + gdriveData.fileName,
                'jpegThumbnail': thumb,
                'caption': `🍿 \`${gdriveData.fileName} - සිංහල උපසිරැසි සමඟ\`\n\n` + `> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*`
              }, {
                quoted: ck
              });

            } catch (apiError) {
              console.error("Error fetching the download link:", apiError);
              await bot.sendMessage(remoteJid, { 'text': "An error occurred while trying to download from Google Drive." }, { 'quoted': incomingMessage });
            }
          } else {
            await bot.sendMessage(remoteJid, { 'text': "No downloadable link found for this episode." }, { 'quoted': incomingMessage });
          }
        } else {
          // පරිශීලකයා වැරදි අංකයක් එවා ඇත්නම් එය නොසලකා හැරීමට හෝ දැනුම් දීමට හැකිය
        }
      }
    });
  } catch (globalError) {
    console.error(globalError);
    reply("*Error occurred while scraping!*");
  }
});
