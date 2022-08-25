import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder, User } from "discord.js";
import db from "../mysql/database";
export default {
    data: new SlashCommandBuilder()
        .setName("warns")
        .setDescription("Visualiza las advertencias de un usuario específico")
        .addUserOption(option => option.setName("target").setDescription("Usuario cuyas advertencias deseas ver").setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ ephemeral: false });
        const authorMember = await interaction.guild?.members.fetch(interaction.user.id);
        if (!authorMember?.permissions.has("ModerateMembers")) return interaction.editReply("No tienes permisos para el uso de este comando.");
        const target: User = (interaction.options.getUser("target") as User)
        const userWarns: any[] = ((await db.query("SELECT * FROM discord_warnings WHERE userid = ?", [target.id]) as unknown) as any[]);
        if (userWarns.length < 1) return interaction.editReply(`El usuario **${target.tag}** no tiene advertencias.`);
        else {
            await interaction.editReply(`Advertencias de **${target.tag}**:\n\n` + userWarns.map(w => `ID: ${String(w.id)}\nMotivo: ${w.reason}\nAutor de la advertencia: ${(interaction.guild?.members.cache.get(w.authorid) as GuildMember).user.tag}\nFecha: <t:${w.createdAt}> (<t:${w.createdAt}:R>)`).join("\n------------\n"));
        }
    }
}