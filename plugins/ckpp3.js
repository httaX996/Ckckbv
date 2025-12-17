const { cmd } = require("../command");
const axios = require('axios');
const NodeCache = require('node-cache');

const img = "https://i.ibb.co/jZBBk3j1/20251019-084548.jpg";

// Initialize cache (1-minute TTL)
const searchCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Wiki past paper downloader command
cmd(
  {
    pattern: "wiki",
    react: "📄",
    category: "education",
    desc: "Wiki Past Paper Downloader",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, pushname }) => {
    if (!q) {
      await conn.sendMessage(
        from,
        {
          text: "Usage: .wiki <search query>\nExample: .wiki North Western Province Grade 10 Maths Second Term Test Paper 2023",
        },
        { quoted: mek }
      );
      return;
    }

    try {
      // Step 1: Check cache for search results
      const cacheKey = `wiki_search_${q}`;
      let searchData = searchCache.get(cacheKey);

      if (!searchData) {
        const wikiApiUrl = `https://chathurawiki.netlify.app/?q=${encodeURIComponent(q)}`;
        let retries = 3;
        while (retries > 0) {
          try {
            const response = await axios.get(wikiApiUrl, { timeout: 10000 });
            searchData = response.data;
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw new Error("Failed to retrieve papers from the archive");
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        // Validate API response
        if (!searchData.status || !searchData.results || searchData.results.length === 0) {
          throw new Error("No papers found in the archive");
        }

        // Filter results to only include those with valid download links
        searchData.results = searchData.results.filter(
          (result) => result.downloadDetails && result.downloadDetails.download
        );

        if (searchData.results.length === 0) {
          throw new Error("No downloadable papers found");
        }

        searchCache.set(cacheKey, searchData);
      }

      // Step 2: Format search results with numbered list
      const results = searchData.results;
      const downloadOptions = results.map((result, index) => ({
        number: index + 1,
        type: "PDF Document",
        url: result.downloadDetails.download,
        title: result.downloadDetails.title,
      }));
      
      let searchInfo = `📚 \`CK PAST PAPERS DOWNLOADER\` 📚\n\n🔍  Search Results for "*${q}*"\n\n`;

downloadOptions.forEach((option) => {
  searchInfo += `\`${option.number}\` *|* ❭❭◦ *📘 ${option.title}*\n`;
});

searchInfo += `\n\n*ඔයා ඕනේ paper එකට අදාල අංකය මේ message එකට reply කරන්න.*\n\n> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`;

      const searchMessage = await conn.sendMessage(from, {
                        image: { url: img },
                        caption: searchinfo
                    }, { quoted: mek });

      const searchMessageKey = searchMessage.key;

      // Step 3: Track download options with a Map
      const downloadOptionsMap = new Map();
      downloadOptionsMap.set(searchMessageKey.id, { results, downloadOptions });

      // Step 4: Handle output selection with a reply listener
      const selectionHandler = async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.extendedTextMessage) return;

        const replyText = message.message.extendedTextMessage.text.trim();
        const repliedToId = message.message.extendedTextMessage.contextInfo.stanzaId;

        // Output selection
        if (downloadOptionsMap.has(repliedToId)) {
          const { downloadOptions } = downloadOptionsMap.get(repliedToId);
          const selectedOptionNumber = parseInt(replyText);
          const selectedOption = downloadOptions.find((option) => option.number === selectedOptionNumber);

          if (!selectedOption) {
            await conn.sendMessage(
              from,
              {
                text: `Invalid selection. Please choose a number (1-${downloadOptions.length}).`,
              },
              { quoted: message }
            );
            return;
          }

          // Step 5: Send selected paper as a PDF document
          try {
            await conn.sendMessage(
              from,
              {
                document: { url: selectedOption.url },
                mimetype: "application/pdf",
                fileName: `${selectedOption.title}.pdf`,
                caption: `📄 \`${selectedOption.title}\`\n\n> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*`,
              },
              { quoted: message }
            );

            await conn.sendMessage(from, { react: { text: "📄", key: message.key } });
          } catch (downloadError) {
            await conn.sendMessage(
              from,
              {
                text: `Download error: ${downloadError.message}\nDirect download: ${selectedOption.url}\nTry again`,
              },
              { quoted: message }
            );
          }
        }
      };

      // Register the persistent selection listener
      conn.ev.on("messages.upsert", selectionHandler);
    } catch (e) {
      console.error("Error:", e);
      await conn.sendMessage(
        from,
        {
          text: `Error: ${e.message || "Failed to access the paper archive"}\nTry again later`,
        },
        { quoted: mek }
      );
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
  }
);
