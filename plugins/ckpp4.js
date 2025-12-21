const { cmd } = require("../command");
const axios = require("axios");

// temporary memory (per chat)
const paperStore = {};

// 🔍 Search past papers
cmd({
    pattern: "ckpp4",
    desc: "Search past papers",
    category: "education",
    react: "📚",
}, async (conn, mek, m, { text, from, reply }) => {
    try {
        if (!text) {
            return reply("❌ *Keyword එකක් දාන්න*\n\nඋදාහරණ:\n.pp sinhala");
        }

        const apiUrl = `https://past-paper-api.vercel.app/api/pastpapers?q=${encodeURIComponent(text)}&api_key=chama-free-api`;
        const res = await axios.get(apiUrl);

        if (!res.data || !res.data.results || res.data.results.length === 0) {
            return reply("❌ Papers හමු නොවීය");
        }

        const papers = res.data.results;
        paperStore[from] = papers;

        let msg = `📚 *Past Papers List*\n🔍 Keyword: *${text}*\n\n`;

        papers.forEach((p, i) => {
            msg += `${i + 1}. ${p.title}\n`;
        });

        msg += `\n📝 *Paper අංකයට reply කරන්න*\nඋදා: 1`;

        await reply(msg);

    } catch (e) {
        console.error(e);
        reply("❌ Error එකක් ආවා");
    }
});

// 📥 Download selected paper
cmd({
    on: "text"
}, async (conn, mek, m, { body, from }) => {
    try {
        if (!m.quoted) return;
        if (!paperStore[from]) return;

        const index = parseInt(body.trim());
        if (isNaN(index)) return;

        const papers = paperStore[from];
        if (index < 1 || index > papers.length) return;

        const selected = papers[index - 1];

        const dlApi = `https://past-paper-api.vercel.app/api/download?url=${encodeURIComponent(selected.url)}&api_key=chama-free-api`;

        await conn.sendMessage(from, {
            document: { url: dlApi },
            mimetype: "application/pdf",
            fileName: `${selected.title}.pdf`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
    }
});
