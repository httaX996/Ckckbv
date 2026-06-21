const { getBuffer } = require("../lib/functions");
const axios = require("axios");
const sharp = require("sharp");
const fs = require('fs');
const path = require('path');
const { cmd } = require("../command");

// ⚠️ කලින් තිබ්බ const WebTorrent = require('webtorrent') එක මෙතනින් ඉවත් කර ඇත!

/* ================= MIME TYPE AUTO DETECT ================= */
function getMimeType(fileName, fallback) {
  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    mp4: "video/mp4", mkv: "video/x-matroska", avi: "video/x-msvideo", mov: "video/quicktime", webm: "video/webm",
    mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav",
    pdf: "application/pdf", zip: "application/zip", rar: "application/x-rar-compressed", "7z": "application/x-7z-compressed",
    apk: "application/vnd.android.package-archive",
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp"
  };
  return map[ext] || fallback || "application/octet-stream";
}

/* ================= THUMBNAIL FUNCTION ================= */
async function createThumbnail(imageUrl, width = 150, height = 150) {
  try {
    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    return await sharp(res.data).resize(width, height).jpeg({ quality: 60 }).toBuffer();
  } catch (e) {
    return null;
  }
}

/* ================= BYTES TO HUMAN READABLE SIZE ================= */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* ================= COMMAND ================= */
cmd({
  pattern: 'torrent',
  alias: ["magnet", "trdl", "leech"],
  react: '🧲',
  desc: "Download Torrent/Magnet links via WhatsApp",
  category: 'download',
  use: ".torrent <magnet url>",
  filename: __filename
},
async (m, match, msg, { from, q, reply }) => {
  try {
    if (!q) {
      return reply("*Please give me a Torrent Magnet URL...!*");
    }

    if (!q.startsWith('magnet:?')) {
        return reply("*Error..! Invalid Magnet URL.*");
    }

    const waitingMsg = await reply("⏳ *Fetching Torrent Meta-data... Please wait*");

    // Dynamic Import: webtorrent package එක crash නොවී මෙතනදී load කරගනී
    const { default: WebTorrent } = await import('webtorrent');
    const torrentClient = new WebTorrent();

    const downloadFolder = path.join(__dirname, '../media/downloads');
    if (!fs.existsSync(downloadFolder)){
        fs.mkdirSync(downloadFolder, { recursive: true });
    }

    torrentClient.add(q, { path: downloadFolder }, async (torrent) => {
        
        const largestFile = torrent.files.reduce((a, b) => a.length > b.length ? a : b);
        const mime = getMimeType(largestFile.name);
        const fileSizeFormatted = formatBytes(largestFile.length);

        const thumb = await createThumbnail("https://i.ibb.co/zd34Xnr/20251021-154215.jpg");

        reply(
          `🧲 \`CK TORRENT DOWNLOADER\` 🧲\n\n` +
          `📃 \`Torrent Name:\` *${torrent.name}*\n` +
          `🎬 \`Main File:\` *${largestFile.name}*\n` +
          `💈 \`File Size:\` *${fileSizeFormatted}*\n` +
          `🕹️ \`File type:\` *${mime}*\n\n` +
          `> ⚡ *Downloading from peers... Please stay online!*`
        );

        torrent.on('done', async () => {
            await reply(`✅ *"${largestFile.name}" Downloaded! Uploading to WhatsApp...*`);

            try {
                const filePath = path.join(downloadFolder, largestFile.path);

                await m.sendMessage(from, {
                  document: { url: filePath },
                  fileName: "🎬 CK CineMAX 🎬\n" + largestFile.name,
                  mimetype: mime,
                  jpegThumbnail: thumb,
                  caption: `🍿 \`${largestFile.name} - Torrent Leached\`\n\n> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*`
                }, { quoted: ck });

                setTimeout(() => {
                    if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
                    // Download එක ඉවර නිසා client එක destroy කරනවා memory ඉතුරු කරගන්න
                    torrentClient.destroy();
                }, 5000);

            } catch (error) {
                console.error(error);
                reply("*❌ Error uploading file.*");
                torrentClient.destroy();
            }
        });

        torrent.on('error', (err) => {
            console.error(err);
            reply("*❌ Torrent Download Error:* " + err.message);
            torrentClient.destroy();
        });
    });

  } catch (err) {
    console.error(err);
    reply("*Error..! Something went wrong*");
  }
});

/* ================= QUOTED CONTACT ================= */
const ck = {
  key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
  message: {
    contactMessage: {
      displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ×͜×",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nORG:META AI;\nTEL;type=CELL;type=VOICE;waid=13135550002:+13135550002\nEND:VCARD`
    }
  }
};
