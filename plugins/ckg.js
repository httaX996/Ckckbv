const fg = require("api-dylux");
const { cmd } = require("../command");
const { getBuffer } = require("../lib/functions");

const gdriveCommand = {
  pattern: 'ckg',
  alias: ["googledrive", 'gd', "cyber_gd"],
  react: '📑',
  desc: "Download googledrive files.",
  category: 'download',
  use: ".gdrive <googledrive link>",
  filename: __filename
};

cmd(gdriveCommand, async (m, match, msg, {
  from,
  quoted,
  q, // This is the argument (googledrive link)
  reply
}) => {
  try {
    if (!q) {
      return reply("*Please give me googledrive url...!!*");
    }

    let gdriveData = await fg.GDriveDl(q);

    // Send confirmation message
    reply(
      "\n*🎬CK CineMAX DOWNLOADER🎬*\n\n" +
      `*📃 File name:*  ${gdriveData.fileName}\n` +
      `*💈 File Size:* ${gdriveData.fileSize}\n` +
      `*🕹️ File type:* ${gdriveData.mimetype}\n\n` +
      "> 👨🏻‍💻 ᴍᴀᴅᴇ ʙʏ *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*"
    );

    // Send the actual file
    await m.sendMessage(from, {
      document: { url: gdriveData.downloadUrl },
      fileName: gdriveData.fileName,
      mimetype: gdriveData.mimetype
    }, { quoted });

  } catch (err) {
    reply("*Error..! Your Url is Private. Please Public It*");
    console.error(err);
  }
});
