const { cmd } = require("../command");
const axios = require("axios");
const NodeCache = require("node-cache");

const API_KEY = "chama-free-api";
const PREVIEW_IMG = "https://i.ibb.co/nMYG1ng3/1765949607102.jpg";

const cache = new NodeCache({ stdTTL: 60 });
const activeSelections = new Map();

/* 🔧 QUERY NORMALIZER */
function normalizeQuery(q) {
  return q
    .replace(/\bo\/l\b/gi, "Ordinary Level")
    .replace(/\bol\b/gi, "Ordinary Level")
    .replace(/\ba\/l\b/gi, "Advanced Level")
    .replace(/\bal\b/gi, "Advanced Level")
    .replace(/\bmaths\b/gi, "Mathematics")
    .replace(/\bmath\b/gi, "Mathematics")
    .replace(/\bsci\b/gi, "Science")
    .trim();
}

/* 📄 COMMAND */
cmd(
  {
    pattern: "ckpp4",
    react: "📄",
    category: "education",
    desc: "Past Paper Downloader",
    filename: __filename,
  },
  async (conn, mek, m, { from, q }) => {
    if (!q) {
      return conn.sendMessage(
        from,
        { text: "Usage: .ckpp4 <query>\nEg: .ckpp4 o/l maths 2020" },
        { quoted: mek }
      );
    }

    try {
      const fixedQuery = normalizeQuery(q);
      const cacheKey = `pp_${fixedQuery}`;

      let results = cache.get(cacheKey);

      if (!results) {
        const res = await axios.get(
          "https://past-paper-api.vercel.app/api/pastpapers",
          {
            params: {
              q: fixedQuery,
              api_key: API_KEY,
            },
            timeout: 15000,
          }
        );

        if (!res.data?.status || !res.data.results?.length) {
          throw new Error("No past papers found");
        }

        results = res.data.results;
        cache.set(cacheKey, results);
      }

      let text = `📚 *CK PAST PAPERS*\n\n🔍 *${fixedQuery}*\n\n`;

      results.forEach((r, i) => {
        text += `\`${i + 1}\` | 📘 ${r.title}\n`;
      });

      text += `\n*Reply or send number (1-${results.length})*\n`;

      const sent = await conn.sendMessage(
        from,
        { image: { url: PREVIEW_IMG }, caption: text },
        { quoted: mek }
      );

      activeSelections.set(from, {
        results,
        time: Date.now(),
      });

      setTimeout(() => activeSelections.delete(from), 120000);

    } catch (e) {
      await conn.sendMessage(
        from,
        { text: `❌ Error: ${e.message}` },
        { quoted: mek }
      );
    }
  }
);

/* 🔥 GLOBAL LISTENER */
module.exports = async (conn) => {
  conn.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const from = msg.key.remoteJid;
    const ctx = activeSelections.get(from);
    if (!ctx) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    const index = parseInt(text.trim());
    if (isNaN(index)) return;

    const paper = ctx.results[index - 1];
    if (!paper) {
      return conn.sendMessage(
        from,
        { text: "❌ Invalid number" },
        { quoted: msg }
      );
    }

    activeSelections.delete(from);

    try {
      const dl = await axios.get(
        "https://past-paper-api.vercel.app/api/download",
        {
          params: {
            url: paper.url,
            api_key: API_KEY,
          },
          timeout: 15000,
        }
      );

      if (!dl.data?.download) {
        throw new Error("Download link error");
      }

      await conn.sendMessage(
        from,
        {
          document: { url: dl.data.download },
          mimetype: "application/pdf",
          fileName: `${paper.title}.pdf`,
          caption: `📄 ${paper.title}`,
        },
        { quoted: msg }
      );

      await conn.sendMessage(from, {
        react: { text: "📄", key: msg.key },
      });

    } catch (e) {
      await conn.sendMessage(
        from,
        { text: "❌ Download failed. Try again later." },
        { quoted: msg }
      );
    }
  });
};
