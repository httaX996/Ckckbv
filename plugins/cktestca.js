const { cmd } = require('../command');
const axios = require('axios');
const sharp = require('sharp');
const config = require('../config');

// ==========================================
// 🛠️ SHARED CONFIGURATIONS & FUNCTIONS
// ==========================================

// Fake Quoted Message Object (Common)
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

// Thumbnail Generator Function (Common)
async function createThumbnail(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return await sharp(response.data)
            .resize(300, 300)
            .jpeg({ quality: 80 })
            .toBuffer();
    } catch (e) {
        console.log('Thumbnail Error:', e);
        return null;
    }
}


// ==========================================
// 1️⃣ Main .sinhala Command (SILENT TRIGGER)
// ==========================================
cmd({
    pattern: "sinhala",
    desc: "Select website to search movies",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, isCmd }) => {
    try {
        if (!q) {
            return reply("🎬 Please provide a movie name.\n\nExample:\n.sinhala ben 10");
        }

        let menuText = `CK SINHALA MOVIES SEARCH\n\n`;
        menuText += `1. cartoon.com site\n`;
        menuText += `2. pupil video\n\n`;
        menuText += `select you want website`;

        const sentMenuMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL },
            caption: menuText
        }, { quoted: ck });
        // Website එක තෝරාගන්නා තෙක් බලා සිටින Listener එක
        const siteSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message) return;

                const contextInfo = msg.message.extendedTextMessage?.contextInfo;
                if (contextInfo?.stanzaId !== sentMenuMsg.key.id) return;

                const userReply = (msg.message.extendedTextMessage?.text || msg.message.conversation || "").trim();

                if (userReply === '1' || userReply === '2') {
                    // Listener එක off කරනවා
                    conn.ev.off("messages.upsert", siteSelectionListener);

                    // තෝරගත්ත අංකය අනුව command pattern එක තීරණය කරනවා
                    const targetPattern = userReply === '1' ? 'cktoon1' : 'cktoon2';
                    
                    // බෝට් එකේ register වෙලා තියෙන command ලැයිස්තුවෙන් අදාල එක සොයාගන්නවා
                    const targetCmd = cmd.list.find(c => c.pattern === targetPattern);
                    
                    if (targetCmd) {
                        // 🛠️ බෝට් එකේ main handler එක රැවටීමට, background එකෙන් message object එක modify කරනවා
                        let modifiedMek = JSON.parse(JSON.stringify(mek)); // Object එක clone කර ගැනීම
                        
                        if (modifiedMek.message?.extendedTextMessage) {
                            modifiedMek.message.extendedTextMessage.text = `.${targetPattern} ${q}`;
                        } else if (modifiedMek.message?.conversation) {
                            modifiedMek.message.conversation = `.${targetPattern} ${q}`;
                        } else {
                            modifiedMek.message = { conversation: `.${targetPattern} ${q}` };
                        }

                        // Chat එකට කිසිම text එකක් send කරන්නේ නැතුව backend එකෙන්ම කෙලින්ම run කරවනවා
                        return await targetCmd.function(conn, modifiedMek, m, { 
                            from, 
                            q, 
                            reply, 
                            isCmd: true, 
                            body: `.${targetPattern} ${q}`, 
                            command: targetPattern 
                        });
                    } else {
                        return reply(`❌ ${targetPattern} command not found.`);
                    }
                } 
                else {
                    return reply("❌ Invalid selection. Please reply with 1 or 2.");
                }

            } catch (err) {
                console.log("Error in site selection:", err);
            }
        };

        conn.ev.on("messages.upsert", siteSelectionListener);
        // විනාඩි 2කින් automatic listener එක අයින් වෙන්න timeout එකක්
        setTimeout(() => { conn.ev.off("messages.upsert", siteSelectionListener); }, 120000);

    } catch (err) {
        console.log("Sinhala Command Error:", err);
        reply("❌ An error occurred.");
    }
});


// ==========================================
// 2️⃣ cktoon1 Command (Cartoons.com)
// ==========================================
cmd({
    pattern: "cktoon1",
    desc: "Search and download cartoons",
    category: "download",
    react: "🧸",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🧸 Please provide a cartoon name.");

        const searchUrl = `https://ck-api-v1.vercel.app/movie/cartoon/search?q=${encodeURIComponent(q)}`;
        const { data: searchData } = await axios.get(searchUrl);

        if (!searchData.success || !searchData.results || !searchData.results.length) {
            return reply("❌ No cartoons found.");
        }

        let searchText = `🧸 \`𝗖𝗔𝗥𝗧𝗢𝗢𝗡𝗦.𝗖𝗢𝗠 𝗦𝗘𝗔𝗥𝗖𝗛\` 🧸\n\n`;
        searchText += `*🔎 Search:* \`${q}\`\n\n`;

        searchData.results.forEach((cartoon, index) => {
            searchText += `\`${index + 1}\` *|* ❭❭◦ *${cartoon.title}*\n`;
        });

        searchText += `\n💡 Reply to this message with the cartoon number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentSearchMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL },
            caption: searchText
        }, { quoted: ck });

        const cartoonSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message?.extendedTextMessage) return;
                if (msg.message.extendedTextMessage.contextInfo?.stanzaId !== sentSearchMsg.key.id) return;

                const userReply = msg.message.extendedTextMessage.text.trim();
                const selectedIndex = parseInt(userReply) - 1;

                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= searchData.results.length) {
                    return reply("❌ Invalid number. Please select a valid number from the list.");
                }

                conn.ev.off("messages.upsert", cartoonSelectionListener); 

                const selectedCartoon = searchData.results[selectedIndex];
                const infoUrl = `https://ck-api-v1.vercel.app/movie/cartoon/info?url=${selectedCartoon.url}`;
                const { data: infoResponse } = await axios.get(infoUrl);
                const cartoonInfo = infoResponse.results || infoResponse.data || infoResponse;

                if (!cartoonInfo) return reply("❌ Failed to fetch cartoon details from API.");

                let infoText = `\`${cartoonInfo.title || "N/A"}\`\n\n`;
                infoText += `📆 \`YEAR:\` *${cartoonInfo.year || "N/A"}*\n`;
                infoText += `⭐ \`IMDB:\` *${cartoonInfo.imdb_rating || "N/A"}*\n`;
                infoText += `💿 \`QUALITY:\` *${cartoonInfo.quality || "N/A"}*\n\n`;
                infoText += `> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠิꜱʜᴀɴ*`;

                await conn.sendMessage(from, {
                    image: { url: cartoonInfo.image || config.IMG_URL },
                    caption: infoText
                }, { quoted: ck });

                let cartoonLink = selectedCartoon.url;
                if (cartoonInfo.links && cartoonInfo.links.length > 0) {
                    cartoonLink = cartoonInfo.links[0].url || cartoonInfo.links[0];
                } else if (cartoonInfo.url) {
                    cartoonLink = cartoonInfo.url;
                }
                
                const dlUrl = `https://ck-api-v1.vercel.app/movie/cartoon/dl?url=${cartoonLink}`;
                const { data: dlResponse } = await axios.get(dlUrl);
                const dlData = dlResponse.results || dlResponse.data || dlResponse;

                if (!dlData || !dlData.direct_links) return reply("❌ Download links not found for this cartoon.");

                const directLinks = dlData.direct_links;
                let dlText = `🎬 \`${cartoonInfo.title || "Cartoon"}\`\n\n`;
                dlText += `📥 \`𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗟𝗜𝗡𝗞𝗦\`\n\n`;

                directLinks.forEach((linkObj, index) => {
                    dlText += `\`${index + 1}\` *|* ❭❭◦ *${linkObj.name}*\n`;
                });

                dlText += `\n💡 Reply with the link/episode number to get the document.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠิꜱʜᴀɴ*`;

                const sentLinksMsg = await conn.sendMessage(from, {
                    image: { url: cartoonInfo.image || config.IMG_URL },
                    caption: dlText
                }, { quoted: ck });

                const linkSelectionListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message?.extendedTextMessage) return;
                        if (msg2.message.extendedTextMessage.contextInfo?.stanzaId !== sentLinksMsg.key.id) return;

                        const linkReply = msg2.message.extendedTextMessage.text.trim();
                        const selectedLinkIndex = parseInt(linkReply) - 1;

                        if (isNaN(selectedLinkIndex) || selectedLinkIndex < 0 || selectedLinkIndex >= directLinks.length) {
                            return reply("❌ Invalid number.");
                        }

                        conn.ev.off("messages.upsert", linkSelectionListener);

                        const finalSelectedLink = directLinks[selectedLinkIndex];
                        const finalDownloadUrl = finalSelectedLink.url || finalSelectedLink.link;

                        if (!finalDownloadUrl) return reply("❌ Download URL not found.");

                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });
                        const thumb = cartoonInfo.image ? await createThumbnail(cartoonInfo.image) : null;

                        await conn.sendMessage(from, {
                            document: { url: finalDownloadUrl },
                            mimetype: "video/mp4",
                            fileName: `${finalSelectedLink.name}.mp4`,
                            jpegThumbnail: thumb,
                            caption: `🎬 \`${finalSelectedLink.name}\`\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠิꜱʜᴀɴ*`
                        }, { quoted: ck });

                        await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });

                    } catch (err) {
                        console.log(err);
                        reply("❌ Error while sending the file.");
                    }
                };

                conn.ev.on("messages.upsert", linkSelectionListener);
                setTimeout(() => { conn.ev.off("messages.upsert", linkSelectionListener); }, 120000);

            } catch (err) {
                console.log(err);
                reply("❌ Error while processing details.");
            }
        };

        conn.ev.on("messages.upsert", cartoonSelectionListener);
        setTimeout(() => { conn.ev.off("messages.upsert", cartoonSelectionListener); }, 120000);

    } catch (err) {
        console.log(err);
        reply("❌ An error occurred.");
    }
});


// ==========================================
// 3️⃣ cktoon2 Command (PupilVideo)
// ==========================================
cmd({
    pattern: "cktoon2",
    desc: "Search movies from PupilVideo",
    category: "movie",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎬 Please provide a movie name.");

        const searchUrl = `https://ck-api-v1.vercel.app/movie/pupil/search?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

        const results = data.result || data.data || [];
        if (!results.length) return reply("❌ No movies found.");

        let text = `🎬 \`𝗣𝗨𝗣𝗜𝗟 𝗩𝗜𝗗𝗘𝗢 𝗦𝗘𝗔𝗥𝗖𝗛\` 🎬\n\n`;
        text += `*🔎 Search:* \`${q}\`\n\n`;

        results.forEach((movie, index) => {
            text += `\`${index + 1}\` *|* ❭❭◦ *${movie.title}*\n`;
        });

        text += `\n💡 Reply to this message with the movie number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠิꜱʜᴀɴ*`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL || "https://i.ibb.co/689v0p7/movie-default.jpg" },
            caption: text
        }, { quoted: ck });

        const movieSelectionListener = async (update) => {
            try {
                const msg = update.messages[0];
                if (!msg.message) return;

                const contextInfo = msg.message.extendedTextMessage?.contextInfo || msg.message.imageMessage?.contextInfo;
                if (contextInfo?.stanzaId !== sentMsg.key.id) return;

                const userReply = (msg.message.extendedTextMessage?.text || msg.message.conversation || "").trim();
                const selectedMovieIndex = parseInt(userReply) - 1;

                if (isNaN(selectedMovieIndex) || selectedMovieIndex < 0 || selectedMovieIndex >= results.length) {
                    return reply("❌ Invalid movie number.");
                }

                conn.ev.off("messages.upsert", movieSelectionListener);

                const selectedMovie = results[selectedMovieIndex];
                const infoUrl = `https://ck-api-v1.vercel.app/movie/pupil/info?url=${encodeURIComponent(selectedMovie.link)}`;
                const infoResponse = await axios.get(infoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                
                const apiResponse = infoResponse.data;
                const movieInfo = apiResponse.data || apiResponse.result || apiResponse;
                if (!movieInfo) return reply("❌ Failed to fetch movie details.");

                const downloadLinks = movieInfo.downloads || [];
                let caption = `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n`;
                caption += `📥 \`𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗟𝗜NK𝗦\`\n\n`;

                if (downloadLinks.length === 0) {
                    caption += `❌ No links found in API Response.\n`;
                } else {
                    downloadLinks.forEach((dl, i) => {
                        caption += `\`${i + 1}\` *|* ❭❭◦ *${dl.quality} - ${dl.size || "Unknown Size"}*\n`;
                    });
                }

                caption += `\n💡 Reply with the link number to download.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠิꜱʜᴀɴ*`;
                const moviePoster = movieInfo.image || selectedMovie.image || config.IMG_URL;

                const movieDetailsMessage = await conn.sendMessage(from, {
                    image: { url: moviePoster },
                    caption: caption
                }, { quoted: ck });

                if (downloadLinks.length === 0) return;

                const downloadListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message) return;

                        const contextInfo2 = msg2.message.extendedTextMessage?.contextInfo || msg2.message.imageMessage?.contextInfo;
                        if (contextInfo2?.stanzaId !== movieDetailsMessage.key.id) return;

                        const downloadReply = (msg2.message.extendedTextMessage?.text || msg2.message.conversation || "").trim();
                        const linkIndex = parseInt(downloadReply) - 1;

                        if (isNaN(linkIndex) || linkIndex < 0 || linkIndex >= downloadLinks.length) {
                            return reply("❌ Invalid link number.");
                        }

                        conn.ev.off("messages.upsert", downloadListener);

                        const selectedLinkObj = downloadLinks[linkIndex];
                        let rawLink = selectedLinkObj.direct_link || selectedLinkObj.link || selectedLinkObj.url;
                        if (!rawLink) return reply("❌ Download link not found.");

                        let directDownloadLink = rawLink;
                        if (!directDownloadLink.includes('&download=true')) {
                            directDownloadLink = `${directDownloadLink}&download=true`;
                        }

                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });
                        const thumb = await createThumbnail(moviePoster);

                        const cleanTitle = (movieInfo.title || "Movie").replace(/[\\/:*?"<>|]/g, "");
                        const fileName = `${cleanTitle} - ${selectedLinkObj.quality}.mp4`;

                        await conn.sendMessage(from, {
                            document: { url: directDownloadLink },
                            mimetype: "video/mp4",
                            fileName: fileName,
                            jpegThumbnail: thumb,
                            caption: `🎬 \`${movieInfo.title || selectedMovie.title}\`\n\n🎞️ \`Quality:\` *${selectedLinkObj.quality}*\n📦 \`Size:\` *${selectedLinkObj.size || "N/A"}*\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠิꜱʜᴀɴ*`
                        }, { quoted: ck });

                        await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });

                    } catch (err) {
                        console.log(err);
                        reply("❌ Error while downloading.");
                    }
                };

                conn.ev.on("messages.upsert", downloadListener);
                setTimeout(() => { conn.ev.off("messages.upsert", downloadListener); }, 120000);

            } catch (err) {
                console.log(err);
                reply("❌ Error while fetching movie details.");
            }
        };

        conn.ev.on("messages.upsert", movieSelectionListener);
        setTimeout(() => { conn.ev.off("messages.upsert", movieSelectionListener); }, 120000);

    } catch (err) {
        console.log(err);
        reply("❌ Error while searching movie.");
    }
});

