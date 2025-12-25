const { getBuffer } = require("../lib/functions");
const fg = require("api-dylux");
const axios = require("axios");
const sharp = require("sharp");
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
  const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return sharp(res.data)
    .resize(width, height)
    .jpeg({ quality: 60 })
    .toBuffer();
}

/* ================= COMMAND ================= */

cmd({
  pattern: 'ckg',
  alias: ["googledrive", "gd", "cyber_gd"],
  react: '📑',
  desc: "Download Google Drive files",
  category: 'download',
  use: ".ckg <googledrive link>",
  filename: __filename
},
async (m, match, msg, { from, q, reply }) => {
  try {
    if (!q) {
      return reply("*Please give me Google Drive URL...!*");
    }

    const gdriveData = await fg.GDriveDl(q);

    if (!gdriveData || !gdriveData.downloadUrl) {
      return reply("*Error..! Your URL is Private or Invalid*");
    }

    // Auto mimetype detect
    const mime = getMimeType(
      gdriveData.fileName,
      gdriveData.mimetype
    );

    // Generate thumbnail once
    const thumb = await createThumbnail(
      "https://i.ibb.co/zd34Xnr/20251021-154215.jpg"
    );

    // Info message
    reply(
      `🎬 \`CK CineMAX DOWNLOADER\` 🎬\n\n` +
      `📃 \`File name:\` *${gdriveData.fileName}*\n` +
      `💈 \`File Size:\` *${gdriveData.fileSize}*\n` +
      `🕹️ \`File type:\` *${mime}*\n\n` +
      `> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
    );

    // Send file with thumbnail + auto mimetype
    await m.sendMessage(from, {
      document: { url: gdriveData.downloadUrl },
      fileName: "🎬 CK CineMAX 🎬\n" + gdriveData.fileName,
      mimetype: mime,
      jpegThumbnail: thumb,
      caption:
        `🍿 \`${gdriveData.fileName} - සිංහල උපසිරැසි සමඟ\`\n\n` +
        `> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*`
    }, { quoted: ck });

  } catch (err) {
    console.error(err);
    reply("*Error..! Something went wrong*");
  }
});

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
