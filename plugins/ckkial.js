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
    groupMetadata,
    reply,
    sender
}) => {
    try {

        // Group check
        if (!isGroup) return reply("❌ *මෙම command එක group වලට විතරයි!*")

        // Fetch all participants from group metadata
        const participants = groupMetadata.participants

        // Filter non-admin members and exclude bot itself
        const targets = participants.filter(p =>
            !groupMetadata.participants.some(admin => admin.id === p.id && admin.admin === 'admin') &&  // Exclude admins
            p.id !== conn.user.id // Exclude the bot
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
