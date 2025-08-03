// *C H A N N E L - L O N G R E A C T - C O D E*

cmd({
    pattern: "ckchr",
    alias: ["chr"],
    react: "📕",
    use: ".channelreact *<query,page>*",
    desc: ".",
    category: "owner",
    filename: __filename,
},
async (conn, mek, m, { from, quoted, l,body, isCmd, command, args, q, prefix, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
    let link = q.split(",")[0]
        const channelId = link.split('/')[4];
        const messageId = link.split('/')[5]
     let react = q.split(",")[1].join('');
        const res = await conn.newsletterMetadata("invite", channelId);
        await conn.newsletterReactMessage   (res.id, messageId, react);
     catch (e) {
console.log(e)
reply(e)
}
})

//USAGE-: .chr link,💜💙🩵🩷💝💘💖💗❤‍🔥
//Share with credits 👼
