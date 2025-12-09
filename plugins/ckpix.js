// dependencies: axios, fs-extra, mime-types
// install: npm i axios fs-extra mime-types
const {cmd} = require('../command');
const {fetchJson} = require('../lib/functions')
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

const TMP_DIR = './tmp_pixeldrain'; // change if needed
fs.ensureDirSync(TMP_DIR);

cmd({
  pattern: 'pix',
  desc: 'Download pixeldrain file as document and send to chat. Usage: .pixeldrain <url_or_id>',
  category: 'download',
  react: '📥'
}, async (m, { conn, args, text }) => {
  try {
    const input = (text || args.join(' ') || (m.quoted && m.quoted.text) || '').trim();
    if (!input) return conn.sendMessage(m.chat, { text: 'කරුණාකර Pixeldrain link එකක් හෝ ID එකක් දාන්න. (ex: https://pixeldrain.com/u/qFQgYYD6)' }, { quoted: m });

    // extract id from possible forms:
    // https://pixeldrain.com/u/qFQgYYD6  OR  https://pixeldrain.com/qFQgYYD6  OR  qFQgYYD6
    const idMatch = input.match(/(?:pixeldrain\.com\/(?:u\/)?)?([A-Za-z0-9_-]{4,})/i);
    if (!idMatch) return conn.sendMessage(m.chat, { text: 'ID හඳුනාගත නොවීය. Link එක හරිද බලන්න.' }, { quoted: m });

    const fileId = idMatch[1];
    await conn.sendMessage(m.chat, { text: `file id: *${fileId}* — metadata ලබා ගන්නා අතර...` }, { quoted: m });

    // 1) get metadata
    const infoUrl = `https://pixeldrain.com/api/file/${encodeURIComponent(fileId)}`;
    let infoResp;
    try {
      infoResp = await axios.get(infoUrl, { timeout: 20000 });
    } catch (err) {
      // metadata fetch failed
      return conn.sendMessage(m.chat, { text: `metadata භාගය ලබාගැනීමට අසමත් විය: ${err.message}` }, { quoted: m });
    }
    const info = infoResp.data || {};
    const filename = info.name || `${fileId}`;
    const sizeBytes = info.size || null;

    // warn if very large
    if (sizeBytes && sizeBytes > 200 * 1024 * 1024) { // 200MB threshold - adjust as needed
      await conn.sendMessage(m.chat, { text: `ගොනුව විශාලයි (${Math.round(sizeBytes/1024/1024)} MB). ඔබට proceed කරන්න කැමතිද? (auto proceed in 5s)` }, { quoted: m });
      // not asking user to reply (to avoid blocking). proceed anyway after small pause.
    }

    // 2) download stream (try /download endpoint first)
    const downloadCandidates = [
      `https://pixeldrain.com/api/file/${encodeURIComponent(fileId)}/download`,
      `https://pixeldrain.com/api/file/${encodeURIComponent(fileId)}`
    ];

    const outPath = path.join(TMP_DIR, `${fileId}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g,'_')}`);
    let downloaded = false;
    for (const dlUrl of downloadCandidates) {
      try {
        const r = await axios.get(dlUrl, {
          responseType: 'stream',
          timeout: 0, // downloading might take long; set to 0 for no timeout
          headers: {
            // set a common browser user-agent to reduce chance of blocking
            'User-Agent': 'Mozilla/5.0 (WhatsApp-bot)'
          }
        });

        // stream to temp file
        const writer = fs.createWriteStream(outPath);
        await new Promise((resolve, reject) => {
          r.data.pipe(writer);
          let errored = false;
          writer.on('error', err => {
            errored = true;
            writer.close();
            reject(err);
          });
          writer.on('close', () => {
            if (!errored) resolve();
          });
        });

        downloaded = true;
        break;
      } catch (err) {
        // try next candidate
        // continue silently, but store last error to show if all fail
        console.error('download candidate failed:', dlUrl, err.message);
      }
    }

    if (!downloaded) {
      return conn.sendMessage(m.chat, { text: 'ගොනුව 다운로드 කිරීම අසමත් විය. Pixeldrain එකෙන් block වුවා නැද්ද බලන්න.' }, { quoted: m });
    }

    // 3) send as document
    const finalName = filename;
    const mimeType = mime.lookup(finalName) || 'application/octet-stream';
    await conn.sendMessage(m.chat, {
      document: fs.createReadStream(outPath),
      fileName: finalName,
      mimetype: mimeType,
      // caption: `From pixeldrain: ${finalName} (${sizeBytes ? Math.round(sizeBytes/1024/1024)+' MB' : 'size unknown'})`
    }, { quoted: m });

    // cleanup
    try { await fs.remove(outPath); } catch (e) { console.warn('cleanup failed', e.message); }

  } catch (err) {
    console.error(err);
    return conn.sendMessage(m.chat, { text: 'සේවාව පිරිනැමීමේදී දෝෂයක්. ' + (err.message || '') }, { quoted: m });
  }
});
