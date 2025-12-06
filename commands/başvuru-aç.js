const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvuru-aç')
        .setDescription('Başvuru sistemini açar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: '❌ Bu komutu kullanmak için Yönetici yetkisine sahip olmalısınız!',
                ephemeral: true
            });
        }

        const guild = interaction.guild;
        const guildData = interaction.client.applicationData.get(`guild_${guild.id}`);
        
        if (!guildData) {
            return await interaction.reply({
                content: '❌ Başvuru sistemi bu sunucuda henüz kurulmamış! Önce `/başvuru-kur` komutunu kullanın.',
                ephemeral: true
            });
        }

        // Set application status to open
        guildData.applicationStatus = 'open';
        interaction.client.applicationData.set(`guild_${guild.id}`, guildData);

        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Başvuru Sistemi Açıldı!')
            .setDescription('Başvuru sistemi başarıyla açıldı. Kullanıcılar artık başvuru yapabilir.')
            .addFields(
                { name: '📝 Başvuru Kanalı', value: `<#${guildData.applicationChannel}>`, inline: true },
                { name: '📊 Durum', value: '🟢 **AÇIK**', inline: true },
                { name: '👤 Açan Yetkili', value: `${interaction.user}`, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        // Log to log channel
        const logChannel = guild.channels.cache.get(guildData.logChannel);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('📝 Başvuru Sistemi Açıldı')
                .addFields(
                    { name: '👮 Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                    { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

        await interaction.reply({
            embeds: [successEmbed],
            ephemeral: true
        });
    }
};