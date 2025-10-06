// packages / local modules
const config = require("../config");
const axios = require("axios");
const cheerio = require("cheerio");
const { File } = require("megajs");
const { sizeFormatter } = require("human-readable");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  getsize,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require("../lib/functions");
const { cmd, commands } = require("../command");
const g_i_s = require('g-i-s');

// dynamic import wrapper for node-fetch (keeps original behavior)
const fetch = (...args) => import("node-fetch").then(({ default: fetchDefault }) => fetchDefault(...args));

const sharp = require('sharp');

// watermark from config
// let wm = config.FOOTER;

/**
 * resizeImage(bufferOrPath, width, height)
 * - Attempts to resize an image using sharp.
 * - If sharp fails, returns the original input unchanged.
 */
async function resizeImage(imageInput, width, height) {
  try {
    return await sharp(imageInput).resize(width, height).toBuffer();
  } catch (err) {
    console.error("Error resizing image:", err);
    // return original so the caller can continue without throwing
    return imageInput;
  }
}

/**
 * ytmp3(url)
 * - Calls an external API (p.oceansaver.in) to convert/download an MP3 from a YouTube-like URL.
 * - Returns the progress/result object from their API.
 * - Will throw on error (caller should catch).
 */
//async function ytmp3(url) {
 // try {
 //   const startRes = await axios.get("https://p.oceansaver.in/ajax/download.php?format=mp3&url=" + url);
 //   const progressRes = await axios.get("https://p.oceansaver.in/api/progress?id=" + startRes.data.id);
 //   return progressRes.data;
//  } catch (err) {
//    console.error("Error fetching data:", err);
//    throw err;
//  }
//}

/**
 * GDriveDl(gdriveUrl)
 * - Tries to extract a Google Drive file id and request a download link via
 *   drive.google.com's internal JSON response.
 * - Returns { error: true } on failure, or an object with downloadUrl, fileName, fileSize, mimetype.
 * - NOTE: uses fetch POST to drive.google.com/uc endpoint and expects a JSON-like response
 *   with a 4-character prefix that must be sliced off (the original code did `.slice(0x4)`).
 */
async function GDriveDl(gdriveUrl) {
  // default failure object
  let result = { error: true };

  // quick check: must contain "drive.google"
  if (!gdriveUrl || !gdriveUrl.match(/drive\.google/i)) {
    return result;
  }

  // sizeFormatter instance for human-readable sizes
  const formatSize = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (bytes, unit) => bytes + " " + unit + 'B'
  });

  try {
    // extract ID either from ?id=ID or /d/ID/
    const matchId = (gdriveUrl.match(/\/?id=(.+)/i) || gdriveUrl.match(/\/d\/(.*?)\//));
    const fileId = matchId ? matchId[1] : null;

    if (!fileId) {
      throw "ID Not Found";
    }

    // request a JSON-ish payload from drive
    const driveRes = await fetch("https://drive.google.com/uc?id=" + fileId + '&authuser=0&export=download', {
      method: "post",
      headers: {
        'accept-encoding': "gzip, deflate, br",
        'content-length': 0,
        'Content-Type': "application/x-www-form-urlencoded;charset=UTF-8",
        'origin': 'https://drive.google.com',
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
        // these x- headers are imitating Drive's client
        'x-client-data': "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
        'x-drive-first-party': "DriveWebUi",
        'x-json-requested': "true"
      }
    });

    // Drive sometimes prepends a few characters before the real JSON (original code sliced first 4 chars)
    const rawText = await driveRes.text();
    const jsonText = rawText.slice(4);
    const parsed = JSON.parse(jsonText);

    // destructure expected fields
    let { fileName, sizeBytes, downloadUrl } = parsed;

    if (!downloadUrl) {
      throw "Link Download Limit!";
    }

    // fetch the download URL headers to get content-type and confirm availability
    const dlResp = await fetch(downloadUrl);
    if (dlResp.status !== 200) {
      return dlResp.statusText;
    }

    return {
      downloadUrl: downloadUrl,
      fileName: fileName,
      fileSize: formatSize(sizeBytes),
      mimetype: dlResp.headers.get("content-type")
    };

  } catch (err) {
    console.log(err);
    return result;
  }
}

/**
 * Register CLI/command handler "gdrive"
 * - The `cmd` function is application-specific and registers a handler likely for a WhatsApp bot.
 * - Handler extracts an argument (URL), calls GDriveDl, replies with file info and attempts to send the file as a document.
 */
cmd({
  pattern: "ckgx",
  alias: ["googledrive'"],
  react: '🗃️',
  desc: "Download googledrive files.",
  category: "download",
  use: ".gdrive <googledrive link>",
  filename: __filename
}, async (client, message, connMsg, meta) => {
  try {
    // meta.q is the user-provided URL in original code
    if (!meta.q) {
      return await meta.reply("*Please give me googledrive url !!*");
    }

    const info = await GDriveDl(meta.q);

    const text = "*`🗃️ CK GDRIVE DOWNLODER 🗃️`*\n\n" +
      "*┌──────────────────*\n" +
      "*├ 🗃️ Name :* " + info.fileName + "\n" +
      "*├ ⏩ Type :* " + info.fileSize + "\n" +
      "*├ 📁 Size :* " + info.mimetype + "\n" +
      "*└──────────────────*";

    await meta.reply(text);

    // send document by URL (client.sendMessage specifics depend on bot framework)
    client.sendMessage(meta.from, {
      document: { url: info.downloadUrl },
      fileName: "🎬CK CineMAX🎬 " + info.fileName,
      caption: "*🎬 " + info.fileName + "*",
      mimetype: info.mimetype
    }, { quoted: message });

  } catch (err) {
    meta.reply("*Error !!*");
    console.log(err);
  }
});
