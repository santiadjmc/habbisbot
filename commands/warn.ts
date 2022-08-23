import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";
import Log from "../Log";
import db from "../mysql/database";
export default {
    data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Da una advertencia a un usuario")
    .addUserOption(option => option.setName("target").setDescription("Usuario a advertir").setRequired(true))
    .addStringOption(option => option.setName("reason").setDescription("Razón de la advertencia").setRequired(false)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ ephemeral: true });
        const authorMember = await interaction.guild?.members.fetch(interaction.user.id);
        if (!authorMember?.permissions.has("ModerateMembers")) return interaction.editReply("No tienes permisos para el uso de este comando.");
        const reason = interaction.options.getString("reason") ?? "Sin motivo";
        const target: User = (interaction.options.getUser("target") as User);
        await interaction.guild?.members.fetch();
        if (!interaction.guild?.members.cache.has(target.id)) return interaction.editReply({ content: "Unknown user" });
        await db.query("INSERT INTO discord_warnings SET ?", [{ userid: target.id, authorid: interaction.user.id, reason }]);
        const userWarnings: any[] = ((await db.query("SELECT * FROM discord_warnings WHERE userid = ?", [target.id]) as unknown) as any[]);
        try {
            target.send(`Has recibido una advertencia en **${interaction.guild.name}** por parte de **${interaction.user.tag}**\nMotivo: ${reason}\nAdvertencia N° ${userWarnings.length}.`);
            await interaction.editReply({ content: `Advertencia registrada y enviada a **${target.tag}**.` });
        }
        catch (err : any) {
            Log.error("bot", err);
            await interaction.editReply({ content: `Advertencia a **${target.tag}** registrada, sin embargo, no pudo ser notificada al usuario.` });
        }
    }
}