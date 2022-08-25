import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import db from "../mysql/database";
export default {
    data: new SlashCommandBuilder()
        .setName("online")
        .setDescription("Muestra una lista de usuarios conectados al hotel"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();
        const users = ((await db.query("SELECT * FROM users") as unknown) as any[]);
        const onlineUsers = users.filter(u => String(u.online) !== "0");
        await interaction.editReply("```\n" + `[${onlineUsers.length}] Usuarios conectados:\n` + onlineUsers.map(u => String(u.online) === "1" ? u.username : `${u.username} (Ausente)`).join("\n") + "\n```");
    }
}