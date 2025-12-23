const config = require('../config')
const { cmd } = require('../command')

cmd({
    pattern: "kickall",
    desc: "Remove all members from the group except admins and bot",
    react: "👏",
    category: "group",
    filename: __filename,
},
async (conn, mek, m, {
    from,
    isGroup,
    isAdmins,
    groupMetadata,
    reply,
    sender
}) => {
    try {

        // Group check
        if (!isGroup) return reply("❌ *මෙම command එක group වලට විතරයි!*")

        // Fetch updated group metadata and admins (Ensuring Bot's admin status is updated)
        const group = await conn.groupMetadata(from)
        
        // Check if bot is an admin in the group
        const botIsAdmin = group.participants.some(p => p.id === conn.user.id && p.admin === 'admin')

        if (!botIsAdmin) return reply("❌ *Bot ගේ Admin permission නැත*")  // Check if bot has admin rights

        // Fetch all participants
        const participants = groupMetadata.participants

        // Filter non-admin members and exclude bot itself
        const targets = participants.filter(p =>
            !group.participants.some(admin => admin.id === p.id && admin.admin === 'admin') &&
            p.id !== conn.user.id
        )

        if (targets.length === 0) {
            return reply("ℹ️ *Non-admin members නොමැත*")
        }

        reply(`⚠️ *KickAll start*
👥 *Total members to remove: ${targets.length}*`)

        // Kicking non-admins with 2 second delay between each removal to prevent spam blocking
        for (let user of targets) {
            await conn.groupParticipantsUpdate(
                from,
                [user.id],
                "remove"
            )
            await new Promise(res => setTimeout(res, 2000)) // 2s delay per kick (safe limit)
        }

        reply("*Successfully romoved all members* ✅")

    } catch (err) {
        console.error("KickAll Error:", err)
        reply("❌ *KickAll කරනකොට error එකක් ආවා.*")
    }
})
