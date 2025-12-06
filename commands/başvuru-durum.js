const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvuru-durum')
        .setDescription('Başvuru sisteminin durumunu gösterir')
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

        const isOpen = guildData.applicationStatus !== 'closed';
        
        // Count active applications
        let activeApplications = 0;
        for (const [key, value] of interaction.client.applicationData.entries()) {
            if (key.startsWith('application_') && value.guildId === guild.id) {
                activeApplications++;
            }
        }

        const statusEmbed = new EmbedBuilder()
            .setTitle('📊 Başvuru Sistemi Durumu')
            .setDescription(`**${guild.name}** sunucusunun başvuru sistemi bilgileri:`)
            .addFields(
                { name: '📊 Sistem Durumu', value: isOpen ? '🟢 **AÇIK**' : '🔴 **KAPALI**', inline: true },
                { name: '📋 Bekleyen Başvuru', value: `${activeApplications} adet`, inline: true },
                { name: '📝 Başvuru Kanalı', value: `<#${guildData.applicationChannel}>`, inline: true },
                { name: '📋 Başvurular Kanalı', value: `<#${guildData.applicationsChannel}>`, inline: true },
                { name: '📢 Sonuç Kanalı', value: `<#${guildData.resultChannel}>`, inline: true },
                { name: '📝 Log Kanalı', value: `<#${guildData.logChannel}>`, inline: true },
                { name: '👥 Deneme Rolü', value: `<@&${guildData.trialRole}>`, inline: true },
                { name: '⚙️ Komutlar', value: '`/başvuru-aç` - `/başvuru-kapa`', inline: true }
            )
            .setColor(isOpen ? 0x00ff00 : 0xff0000)
            .setThumbnail(guild.iconURL())
            .setTimestamp();

        await interaction.reply({
            embeds: [statusEmbed],
            ephemeral: true
        });
    }
};