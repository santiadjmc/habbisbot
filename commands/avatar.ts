import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Muestra el avatar de un usuario específico")
        .addUserOption(option => option.setName("target").setDescription("Usuario cuyo avatar deseas ver").setRequired(false)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.options.getUser("target") ?? interaction.user;
        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(interaction.guild?.members.cache.get(user.id)?.nickname ?? user.username)
            .setImage(user.displayAvatarURL({ size: 1024 }))
            .setColor("Random")
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_avatar_${interaction.user.id}`)
                    .setLabel("Eliminar")
                    .setStyle(ButtonStyle.Danger)
            );
        await interaction.reply({ embeds: [embed], components: [(row as any)] });
    }
}