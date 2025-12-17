const { cmd } = require("../command");
const axios = require("axios");
const NodeCache = require("node-cache");

const API_KEY = "chama-free-api";
const PREVIEW_IMG = "https://i.ibb.co/nMYG1ng3/1765949607102.jpg";

const cache = new NodeCache({ stdTTL: 60 });
const activeSelections = new Map();

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
        { text: "Usage: .past <search query>\nEg: .past Grade 10 Maths 2023 Term 2" },
        { quoted: mek }
      );
    }

    try {
      const cacheKey = `past_${q}`;
      let data = cache.get(cacheKey);

      if (!data) {
        const res = await axios.get(
          `https://past-paper-api.vercel.app/api/pastpapers`,
          {
            params: { q, api_key: API_KEY },
            timeout: 15000,
          }
        );

        if (!res.data?.status || !res.data.results?.length) {
          throw new Error("No past papers found");
        }

        data = res.data.results;
        cache.set(cacheKey, data);
      }

      let msgText = `📚 *PAST PAPERS SEARCH*\n\n🔍 *${q}*\n\n`;

      data.forEach((p, i) => {
        msgText += `\`${i + 1}\` | 📘 ${p.title}\n`;
      });

      msgText += `\n*Reply or send number (1-${data.length})*\n`;

      const sent = await conn.sendMessage(
        from,
        {
          image: { url: PREVIEW_IMG },
          caption: msgText,
        },
        { quoted: mek }
      );

      activeSelections.set(from, {
        messageId: sent.key.id,
        results: data,
        time: Date.now(),
      });

      setTimeout(() => activeSelections.delete(from), 120000);

    } catch (err) {
      await conn.sendMessage(
        from,
        { text: `❌ Error: ${err.message}` },
        { quoted: mek }
      );
    }
  }
);

// 🔥 GLOBAL LISTENER
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
        { text: `❌ Download failed\n${paper.url}` },
        { quoted: msg }
      );
    }
  });
};
