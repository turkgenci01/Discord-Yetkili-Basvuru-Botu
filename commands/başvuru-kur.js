const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvuru-kur')
        .setDescription('Başvuru sistemini kurar ve yapılandırır')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: '❌ Bu komutu kullanmak için Yönetici yetkisine sahip olmalısınız!',
                ephemeral: true
            });
        }

        const setupEmbed = new EmbedBuilder()
            .setTitle('🔧 Başvuru Sistemi Kurulumu')
            .setDescription('Başvuru sistemini kurmak için aşağıdaki adımları takip edin:')
            .addFields(
                { name: '1️⃣ Başvuru Kanalı', value: 'Kullanıcıların başvuru yapacağı kanal', inline: false },
                { name: '2️⃣ Başvurular Kanalı', value: 'Başvuruların yetkililer tarafından görüleceği kanal', inline: false },
                { name: '3️⃣ Sonuç Kanalı', value: 'Başvuru sonuçlarının paylaşılacağı kanal', inline: false },
                { name: '4️⃣ Log Kanalı', value: 'Tüm işlemlerin kaydedileceği kanal', inline: false },
                { name: '5️⃣ Deneme Yetkilisi Rolü', value: 'Kabul edilen kişilere verilecek rol', inline: false }
            )
            .setColor(0x3498db)
            .setTimestamp();

        const applicationChannelSelect = new ActionRowBuilder()
            .addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_application_channel')
                    .setPlaceholder('📝 Başvuru Kanalını Seçin')
                    .addChannelTypes(ChannelType.GuildText)
                    .setMaxValues(1)
            );

        await interaction.reply({
            embeds: [setupEmbed],
            components: [applicationChannelSelect],
            ephemeral: true
        });
    }
};