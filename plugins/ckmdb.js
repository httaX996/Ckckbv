const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const TMDB_KEY = "6284396e268fba60f0203b8b4b361ffe";

const MVJID = "120363298587511714@g.us"; // movie group
const TVJID = "120363319444098961@g.us"; // tv group

const LANG_MAP = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  ja: "Japanese",
  ko: "Korean",
  si: "Sinhala"
};

// Sinhala Translate
async function translateToSinhala(text) {
  try {
    const res = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`
    );
    return res.data.responseData.translatedText || text;
  } catch {
    return text;
  }
}

// ================= SEARCH LIST =================
cmd({
  pattern: "movieinfo",
  alias: ["movie", "mv"],
  category: "movie",
  desc: "Search Movies & TV Series"
}, async (conn, mek, m, { from, q, reply }) => {

  if (!q) return reply("❗ Movie / TV name එකක් දෙන්න");

  const movieRes = await axios.get(
    `https://api.themoviedb.org/3/search/movie`,
    { params:{ api_key:TMDB_KEY, query:q } }
  );

  const tvRes = await axios.get(
    `https://api.themoviedb.org/3/search/tv`,
    { params:{ api_key:TMDB_KEY, query:q } }
  );

  const results = [];

  movieRes.data.results.forEach(r=>{
    results.push({
      id:r.id,
      title:r.title,
      date:r.release_date,
      type:"movie"
    });
  });

  tvRes.data.results.forEach(r=>{
    results.push({
      id:r.id,
      title:r.name,
      date:r.first_air_date,
      type:"tv"
    });
  });

  if (!results.length) return reply("😓 Results නෑ");

  conn.movieSearch = conn.movieSearch || {};
  conn.movieSearch[from] = { results };

  let list = `🎬 *SEARCH RESULTS*\n\n`;
  results.slice(0,10).forEach((r,i)=>{
    list += `${i+1}. ${r.title} (${r.date?.slice(0,4)||"N/A"}) [${r.type.toUpperCase()}]\n`;
  });

  list += `\n📌 Details ගන්න:\n.imd <number>\n.mvd <number>\n.tvd <number>`;

  reply(list);
});

// ================= COMMON DETAILS BUILDER =================
async function getDetails(item) {
  const endpoint = item.type === "tv" ? "tv" : "movie";

  const res = await axios.get(
    `https://api.themoviedb.org/3/${endpoint}/${item.id}`,
    { params:{ api_key:TMDB_KEY, language:"en-US" } }
  );

  const d = res.data;
  const plotSI = await translateToSinhala(d.overview || "N/A");

  return {
    poster: d.poster_path
      ? `https://image.tmdb.org/t/p/original${d.poster_path}`
      : null,

    caption:
`🎬 \`${item.title}\`

📅 *RELEASED :* ${item.type==="tv" ? d.first_air_date : d.release_date}
🔊 *LANGUAGE :* ${LANG_MAP[d.original_language] || d.original_language}
🌟 *RATING :* ${d.vote_average}/10
🎭 *GENRES :* ${d.genres.map(g=>g.name).join(", ")}
⏰ *DURATION :* ${
  item.type==="tv"
  ? d.number_of_seasons+" Seasons"
  : d.runtime+" min"
}

🗣️ *STORY LINE :*
${plotSI}

> ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *CK CineMAX*`
  };
}

// ================= IMD → CHAT =================
cmd({ pattern:"imd", category:"movie" }, async (conn, mek, m, { from, q, reply })=>{
  const cache = conn.movieSearch?.[from];
  if (!cache) return reply("❗ Search කරන්න කලින්");

  const item = cache.results[q-1];
  if (!item) return reply("❌ Wrong number");

  const data = await getDetails(item);

  await conn.sendMessage(from, {
    image:{ url:data.poster },
    caption:data.caption
  }, { quoted:ck });
});

// ================= MVD → MOVIE GROUP =================
cmd({ pattern:"mvd", category:"movie" }, async (conn, mek, m, { from, q, reply })=>{
  const item = conn.movieSearch?.[from]?.results[q-1];
  if (!item) return reply("❌ Wrong number");

  const data = await getDetails(item);

  await conn.sendMessage(MVJID, {
    image:{ url:data.poster },
    caption:data.caption
  }, { quoted:ck });
});

// ================= TVD → TV GROUP =================
cmd({ pattern:"tvd", category:"movie" }, async (conn, mek, m, { from, q, reply })=>{
  const item = conn.movieSearch?.[from]?.results[q-1];
  if (!item) return reply("❌ Wrong number");

  const data = await getDetails(item);

  await conn.sendMessage(TVJID, {
    image:{ url:data.poster },
    caption:data.caption
  }, { quoted:ck });
});

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
