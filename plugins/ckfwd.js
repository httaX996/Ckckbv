const { cmd } = require("../command");

cmd({
  pattern: "ckfwd",
  alias: ["f"],
  desc: "Forward any quoted message to given JID(s)",
  use: ".f jid",
  category: "owner",
  filename: __filename
}, async (sock, m, msg, ctx) => {
  const {
    reply, quoted, q, isOwner, isSudo, isMe
  } = ctx;

  if (!isMe && !isOwner && !isSudo)
    return reply("*📛 OWNER COMMAND ONLY*");

  if (!q || !msg.quoted)
    return reply("*Please give me a JID and quote a message.*");

  let jids = q.split(',').map(x => x.trim());
  if (jids.length === 0)
    return reply("*Provide at least one valid JID.*");

  let fwd = { key: msg.quoted?.fakeObj?.key, message: msg.quoted };
  let success = [];

  for (let jid of jids) {
    try {
      await sock.forwardMessage(jid, fwd, false);
      success.push(jid);
    } catch (err) {
      console.log(err);
    }
  }

  if (success.length)
    reply("*✅ Message Forwarded*\n\n" + success.join("\n"));
});
