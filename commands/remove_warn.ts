import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, User } from "discord.js";
import db from "../mysql/database";
export default {
    data: new SlashCommandBuilder()
        .setName("remove-warn")
        .setDescription("Elimina una advertencia específica de un usuario")
        .addUserOption(option => option.setName("target").setDescription("El usuario cuya advertencia deseas remover").setRequired(true))
        .addIntegerOption(option => option.setName("id").setDescription("ID de la advertencia que deseas remover (debe ser del usuario en cuestión)").setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ ephemeral: true });
        const authorMember = await interaction.guild?.members.fetch(interaction.user.id);
        if (!authorMember?.permissions.has("ModerateMembers")) return interaction.editReply("No tienes permisos para el uso de este comando.");
        const target = interaction.options.getUser("target") as User;
        const id = interaction.options.getInteger("id") as number;
        const foundWarn = ((await db.query("SELECT * FROM discord_warnings WHERE userid = ? AND id = ?", [target.id, id]) as unknown) as any[]);
        if (!foundWarn[0]) return interaction.editReply("La ID de advertencia proporcionada es inexistente o no pertenece a una advertencia al usuario proporcionado.");
        else {
            await db.query("DELETE FROM discord_warnings WHERE id = ?", [id]);
            interaction.editReply(`La advertencia al usuario **${target.tag}** con ID **${String(id)}** ha sido eliminada.`);
        }
    }
}