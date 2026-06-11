const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// Fake Quoted Message Object
const ck = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "〴ᴄʜᴇᴛʜᴍɪɴᴀ ×͜×",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta\nORG:META AI;\nTEL;type=CELL;type=VOICE;waid=13135550002:+13135550002\nEND:VCARD`
        }
    }
};

cmd({
    pattern: "cartoon",
    desc: "Search and download cartoons",
    category: "download",
    react: "🧸",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("🧸 Please provide a cartoon name.\n\nExample:\n.cartoon ben 10");
        }

        // 1. Search Request
        const searchUrl = `https://ck-api-v1.vercel.app/movie/cartoon/search?q=${encodeURIComponent(q)}`;
        const { data: searchData } = await axios.get(searchUrl);

        if (!searchData.success || !searchData.results || !searchData.results.length) {
            return reply("❌ No cartoons found.");
        }

        let searchText = `🧸 \`𝗖𝗞 𝗖𝗔𝗥𝗧𝗢𝗢𝗡 𝗦𝗘𝗔Ｒ𝗖𝗛\`\n\n`;
        searchText += `*🔎 Search:* \`${q}\`\n\n`;

        searchData.results.forEach((cartoon, index) => {
            searchText += `\`${index + 1}\` *|* ❭❭◦ *${cartoon.title}*\n`;
        });

        searchText += `\n💡 Reply to this message with the cartoon number.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍිනා ᴋᴀᴠɪꜱʜᴀɴ*`;

        const sentSearchMsg = await conn.sendMessage(from, {
            image: { url: config.IMG_URL },
            caption: searchText
        }, { quoted: ck });

        // LISTENER 1: Cartoon එකක් තෝරාගැනීම ඇල්ලීමට
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

                const selectedCartoon = searchData.results[selectedIndex];
                
                // 🛠️ FIX: encodeURIComponent නොකර, Plain URL එක කෙලින්ම පාස් කරනවා ඔයා ඉල්ලපු විදියටම
                const infoUrl = `https://ck-api-v1.vercel.app/movie/cartoon/info?url=${selectedCartoon.url}`;
                const { data: infoResponse } = await axios.get(infoUrl);

                // සාමාන්‍යයෙන් ඔයාගේ API එකේ Response එක එන්නේ infoResponse.results ඇතුළේ හෝ කෙලින්ම infoResponse එකේ වෙන්න පුළුවන් නිසා safe check එකක් දානවා
                const cartoonInfo = infoResponse.results || infoResponse.data || infoResponse;

                if (!cartoonInfo || (!cartoonInfo.title && !cartoonInfo.success)) {
                    return reply("❌ Failed to fetch cartoon details from API.");
                }

                // ඔයා ඉල්ලපු විදියටම Caption Format එක
                let infoText = `TITLE: ${cartoonInfo.title || "N/A"}\n`;
                infoText += `YEAR: ${cartoonInfo.year || "N/A"}\n`;
                infoText += `IMDB: ${cartoonInfo.imdb_rating || "N/A"}\n`;
                infoText += `QUALITY: ${cartoonInfo.quality || "N/A"}\n\n`;
                infoText += `📥 Fetching download links... Please wait...`;

                // API එකෙන් එන image url එක පාවිච්චි කරලා මැසේජ් එක යැවීම
                await conn.sendMessage(from, {
                    image: { url: cartoonInfo.image || config.IMG_URL },
                    caption: infoText
                }, { quoted: ck });

                // 2. DL API Request (Links ඇද ගැනීමට)
                // info එකෙන් එන links ඇතුළේ පළමු url එක ගන්නවා, නැත්නම් safe-side එකට selectedCartoon.url එක දානවා
                let cartoonLink = selectedCartoon.url;
                if (cartoonInfo.links && cartoonInfo.links.length > 0) {
                    cartoonLink = cartoonInfo.links[0].url || cartoonInfo.links[0];
                } else if (cartoonInfo.url) {
                    cartoonLink = cartoonInfo.url;
                }
                
                // 🛠️ FIX: DL URL එකටත් Plain URL එක කෙලින්ම පාස් කරනවා
                const dlUrl = `https://ck-api-v1.vercel.app/movie/cartoon/dl?url=${cartoonLink}`;
                const { data: dlResponse } = await axios.get(dlUrl);

                const dlData = dlResponse.results || dlResponse.data || dlResponse;

                if (!dlData || !dlData.direct_links) {
                    return reply("❌ Download links not found for this cartoon.");
                }

                const directLinks = dlData.direct_links;

                let dlText = `🎬 \`${cartoonInfo.title || "Cartoon"}\`\n\n`;
                dlText += `📥 \`𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗘𝗣𝗜𝗦𝗢𝗗𝗘𝗦 / 𝗟𝗜𝗡𝗞𝗦\`\n\n`;

                // 1,2,3... විදියට direct_links ඇතුළේ තියෙන name එක send කරනවා
                directLinks.forEach((linkObj, index) => {
                    dlText += `\`${index + 1}\` *|* ❭❭◦ *${linkObj.name}*\n`;
                });

                dlText += `\n💡 Reply with the link/episode number to get the document.\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

                const sentLinksMsg = await conn.sendMessage(from, {
                    image: { url: cartoonInfo.image || config.IMG_URL },
                    caption: dlText
                }, { quoted: ck });

                // LISTENER 2: Episode එක තෝරාගැනීම ඇල්ලීමට
                const linkSelectionListener = async (update2) => {
                    try {
                        const msg2 = update2.messages[0];
                        if (!msg2.message?.extendedTextMessage) return;
                        if (msg2.message.extendedTextMessage.contextInfo?.stanzaId !== sentLinksMsg.key.id) return;

                        const linkReply = msg2.message.extendedTextMessage.text.trim();
                        const selectedLinkIndex = parseInt(linkReply) - 1;

                        if (isNaN(selectedLinkIndex) || selectedLinkIndex < 0 || selectedLinkIndex >= directLinks.length) {
                            return reply("❌ Invalid number. Please select a valid episode/link number.");
                        }

                        const finalSelectedLink = directLinks[selectedLinkIndex];

                        await conn.sendMessage(from, { react: { text: "📥", key: msg2.key } });

                        // Document එකක් විදියට file එක send කිරීම (finalSelectedLink.url එක පාවිච්චි කරලා)
                        await conn.sendMessage(from, {
                            document: { url: finalSelectedLink.url },
                            mimetype: "video/mp4",
                            fileName: `${cartoonInfo.title || "Cartoon"} - ${finalSelectedLink.name}.mp4`,
                            caption: `🎬 *${cartoonInfo.title || "Cartoon"}*\n📌 *Episode:* ${finalSelectedLink.name}\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`
                        }, { quoted: ck });

                        await conn.sendMessage(from, { react: { text: "✅", key: msg2.key } });

                    } catch (err) {
                        console.log("Error in link selection:", err);
                        reply("❌ Error while sending the document file.");
                    }
                };

                // Expire නොවෙන්න Register කිරීම
                conn.ev.on("messages.upsert", linkSelectionListener);

            } catch (err) {
                console.log("Error in cartoon selection:", err);
                reply("❌ Error while processing cartoon details. Please try again.");
            }
        };

        // Expire නොවෙන්න Register කිරීම
        conn.ev.on("messages.upsert", cartoonSelectionListener);

    } catch (err) {
        console.log("Global Error:", err);
        reply("❌ An error occurred while processing the request.");
    }
});
