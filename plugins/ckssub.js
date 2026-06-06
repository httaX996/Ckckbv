const { cmd } = require("../command");
const puppeteer = require("puppeteer");

// Global states (Memory එකේ තියාගන්න)
if (!global.pendingSearch) global.pendingSearch = {};
if (!global.pendingQuality) global.pendingQuality = {};

// --- 🛠️ HELPER FUNCTIONS ---
function normalizeQuality(text) {
    if (!text) return null;
    text = text.toUpperCase();
    if (/1080|FHD/.test(text)) return "1080p";
    if (/720|HD/.test(text)) return "720p";
    if (/480|SD/.test(text)) return "480p";
    return text;
}

function getDirectPixeldrainUrl(url) {
    const match = url.match(/pixeldrain\.com\/u\/(\w+)/);
    if (!match) return null;
    return `https://pixeldrain.com/api/file/${match[1]}?download`;
}

async function searchMovies(query) {
    const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}&post_type=movies`;
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    try {
        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
        const results = await page.$$eval(".display-item .item-box", boxes =>
            boxes.slice(0, 10).map((box, index) => {
                const a = box.querySelector("a");
                const img = box.querySelector(".thumb");
                const lang = box.querySelector(".item-desc-giha .language")?.textContent || "";
                const quality = box.querySelector(".item-desc-giha .quality")?.textContent || "";
                return {
                    id: index + 1,
                    title: a?.title?.trim() || "",
                    movieUrl: a?.href || "",
                    thumb: img?.src || "",
                    language: lang.trim(),
                    quality: quality.trim(),
                };
            }).filter(m => m.title && m.movieUrl)
        );
        return results;
    } catch (e) { return []; } finally { await browser.close(); }
}

async function getMovieMetadata(url) {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        const metadata = await page.evaluate(() => {
            const getText = el => el?.textContent.trim() || "";
            const title = getText(document.querySelector(".info-details .details-title h3"));
            let language = "";
            document.querySelectorAll(".info-col p").forEach(p => {
                if (p.querySelector("strong")?.textContent.includes("Language:")) language = p.textContent.replace("Language:", "").trim();
            });
            const duration = getText(document.querySelector(".info-details .data-views[itemprop='duration']"));
            const imdb = getText(document.querySelector(".info-details .data-imdb"))?.replace("IMDb:", "").trim();
            const genres = Array.from(document.querySelectorAll(".details-genre a")).map(el => el.textContent.trim());
            const thumbnail = document.querySelector(".splash-bg img")?.src || "";
            return { title, language, duration, imdb, genres, thumbnail };
        });
        return metadata;
    } catch (e) { return null; } finally { await browser.close(); }
}

async function getPixeldrainLinks(movieUrl) {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    try {
        await page.goto(movieUrl, { waitUntil: "networkidle2", timeout: 30000 });
        const linksData = await page.$$eval(".link-pixeldrain tbody tr", rows =>
            rows.map(row => {
                const a = row.querySelector(".link-opt a");
                const quality = row.querySelector(".quality")?.textContent.trim() || "";
                const size = row.querySelector("td:nth-child(3) span")?.textContent.trim() || "";
                return { pageLink: a?.href || "", quality, size };
            })
        );
        const directLinks = [];
        for (const l of linksData) {
            const subPage = await browser.newPage();
            try {
                await subPage.goto(l.pageLink, { waitUntil: "networkidle2", timeout: 15000 });
                await new Promise(r => setTimeout(r, 2000));
                const finalUrl = await subPage.$eval(".wait-done a[href^='https://pixeldrain.com/']", el => el.href).catch(() => null);
                if (finalUrl) directLinks.push({ link: finalUrl, quality: normalizeQuality(l.quality), size: l.size });
            } catch (e) {} finally { await subPage.close(); }
        }
        return directLinks;
    } catch (e) { return []; } finally { await browser.close(); }
}

// --- 🎬 COMMAND: .MOVIE ---
cmd({
    pattern: "subck",
    alias: ["films", "sinhalasub"],
    react: "🎬",
    category: "download",
    filename: __filename
}, async (danuwa, mek, m, { from, q, sender, reply, isCmd }) => {
    
    // 1. සර්ච් කිරීම (Command එකෙන් එන වෙලාව)
    if (isCmd && q) {
        reply("*🔍 Searching for movies...*");
        const results = await searchMovies(q);
        if (!results.length) return reply("*❌ No movies found!*");

        global.pendingSearch[sender] = { results, timestamp: Date.now() };

        let text = "*🎬 CK MOVIE SEARCH:*\n\n";
        results.forEach((m, i) => { text += `*${i+1}.* ${m.title}\n   📊 ${m.quality} | 📝 ${m.language}\n`; });
        text += `\n*Reply with movie number (1-${results.length})*`;
        return reply(text);
    }

    // 2. අංකය Reply කරන එක Handle කිරීම
    const body = m.body || q; // q එකේ තමයි අංකය එන්නේ index.js එකෙන් pass කළොත්
    if (!isNaN(body)) {
        const num = parseInt(body) - 1;

        // --- පියවර 01: Movie එක තෝරාගැනීම ---
        if (global.pendingSearch[sender]) {
            const state = global.pendingSearch[sender];
            if (num >= 0 && num < state.results.length) {
                const selected = state.results[num];
                delete global.pendingSearch[sender];
                
                await danuwa.sendMessage(from, { react: { text: "⏳", key: m.key } });
                const meta = await getMovieMetadata(selected.movieUrl);
                if (!meta) return reply("*❌ Error fetching details.*");

                let msg = `*🎬 ${meta.title}*\n\n*⏱️ Duration:* ${meta.duration}\n*⭐ IMDb:* ${meta.imdb}\n*🎭 Genres:* ${meta.genres.join(", ")}\n\n*🔗 Fetching download links...*`;
                await danuwa.sendMessage(from, { image: { url: meta.thumbnail }, caption: msg }, { quoted: m });

                const links = await getPixeldrainLinks(selected.movieUrl);
                if (!links.length) return reply("*❌ No download links found (<2GB)!*");

                global.pendingQuality[sender] = { movie: { meta, links }, timestamp: Date.now() };

                let qMsg = "*📥 Select Quality (Max 2GB):*\n\n";
                links.forEach((d, i) => qMsg += `*${i+1}.* ${d.quality} - ${d.size}\n`);
                return reply(qMsg + `\n*Reply with quality number to download.*`);
            }
        }

        // --- පියවර 02: Quality එක තෝරාගැනීම ---
        if (global.pendingQuality[sender]) {
            const state = global.pendingQuality[sender];
            if (num >= 0 && num < state.movie.links.length) {
                const selectedLink = state.movie.links[num];
                const meta = state.movie.meta;
                delete global.pendingQuality[sender];

                reply(`*⬇️ Sending ${selectedLink.quality} as document...*`);
                try {
                    const directUrl = getDirectPixeldrainUrl(selectedLink.link);
                    await danuwa.sendMessage(from, {
                        document: { url: directUrl },
                        mimetype: "video/mp4",
                        fileName: `${meta.title} - ${selectedLink.quality}.mp4`.replace(/[^\w\s.-]/gi,''),
                        caption: `*🎬 ${meta.title}*\n*📊 Quality:* ${selectedLink.quality}\n\n*Enjoy!* 🍿`
                    }, { quoted: m });
                } catch (e) { reply("❌ Error: " + e.message); }
            }
        }
    }
});

// Clean up expired sessions (10 mins)
setInterval(() => {
    const now = Date.now();
    for (const s in global.pendingSearch) if (now - global.pendingSearch[s].timestamp > 600000) delete global.pendingSearch[s];
    for (const s in global.pendingQuality) if (now - global.pendingQuality[s].timestamp > 600000) delete global.pendingQuality[s];
}, 300000);
