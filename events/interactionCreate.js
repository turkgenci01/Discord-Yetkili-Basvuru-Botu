const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Slash command handling
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error('Komut çalıştırılırken hata:', error);
                const errorMessage = { content: '❌ Komut çalıştırılırken bir hata oluştu!', ephemeral: true };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }

        // Channel Select Menu handling for setup
        if (interaction.isAnySelectMenu()) {
            const setupData = interaction.client.applicationData.get(interaction.user.id) || {};

            if (interaction.customId === 'select_application_channel') {
                setupData.applicationChannel = interaction.values[0];
                interaction.client.applicationData.set(interaction.user.id, setupData);

                const applicationsChannelSelect = new ActionRowBuilder()
                    .addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId('select_applications_channel')
                            .setPlaceholder('📋 Başvurular Kanalını Seçin')
                            .addChannelTypes(ChannelType.GuildText)
                            .setMaxValues(1)
                    );

                await interaction.update({
                    content: '✅ **Başvuru Kanalı** seçildi! Şimdi **Başvurular Kanalını** seçin.',
                    components: [applicationsChannelSelect]
                });
            }

            else if (interaction.customId === 'select_applications_channel') {
                setupData.applicationsChannel = interaction.values[0];
                interaction.client.applicationData.set(interaction.user.id, setupData);

                const resultChannelSelect = new ActionRowBuilder()
                    .addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId('select_result_channel')
                            .setPlaceholder('📢 Sonuç Kanalını Seçin')
                            .addChannelTypes(ChannelType.GuildText)
                            .setMaxValues(1)
                    );

                await interaction.update({
                    content: '✅ **Başvurular Kanalı** seçildi! Şimdi **Sonuç Kanalını** seçin.',
                    components: [resultChannelSelect]
                });
            }

            else if (interaction.customId === 'select_result_channel') {
                setupData.resultChannel = interaction.values[0];
                interaction.client.applicationData.set(interaction.user.id, setupData);

                const logChannelSelect = new ActionRowBuilder()
                    .addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId('select_log_channel')
                            .setPlaceholder('📝 Log Kanalını Seçin')
                            .addChannelTypes(ChannelType.GuildText)
                            .setMaxValues(1)
                    );

                await interaction.update({
                    content: '✅ **Sonuç Kanalı** seçildi! Şimdi **Log Kanalını** seçin.',
                    components: [logChannelSelect]
                });
            }

            else if (interaction.customId === 'select_log_channel') {
                setupData.logChannel = interaction.values[0];
                interaction.client.applicationData.set(interaction.user.id, setupData);

                const roleSelect = new ActionRowBuilder()
                    .addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId('select_trial_role')
                            .setPlaceholder('👥 Deneme Yetkilisi Rolünü Seçin')
                            .setMaxValues(1)
                    );

                await interaction.update({
                    content: '✅ **Log Kanalı** seçildi! Son olarak **Deneme Yetkilisi Rolünü** seçin.',
                    components: [roleSelect]
                });
            }

            else if (interaction.customId === 'select_trial_role') {
                setupData.trialRole = interaction.values[0];
                interaction.client.applicationData.set(interaction.user.id, setupData);

                // Final setup
                await this.finalizeSetup(interaction, setupData);
            }
        }

        // Button handling
        if (interaction.isButton()) {
            if (interaction.customId === 'start_application') {
                // Check if applications are open
                const guild = interaction.guild;
                const guildData = interaction.client.applicationData.get(`guild_${guild.id}`);
                
                if (!guildData) {
                    return await interaction.reply({
                        content: '❌ Başvuru sistemi bu sunucuda henüz kurulmamış!',
                        ephemeral: true
                    });
                }
                
                if (guildData.applicationStatus === 'closed') {
                    return await interaction.reply({
                        content: '❌ **Başvurular şu anda kapalı!**\n\n' +
                            '📢 Başvurular açıldığında duyuru yapılacaktır.\n' +
                            '⏰ Lütfen daha sonra tekrar deneyin.',
                        ephemeral: true
                    });
                }

                const applicationModal = new ModalBuilder()
                    .setCustomId('application_modal')
                    .setTitle('📋 Ekip Başvuru Formu');

                const nameInput = new TextInputBuilder()
                    .setCustomId('name_input')
                    .setLabel('Ad & Soyad')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(50);

                const ageInput = new TextInputBuilder()
                    .setCustomId('age_input')
                    .setLabel('Yaş')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(2);

                const activityInput = new TextInputBuilder()
                    .setCustomId('activity_input')
                    .setLabel('Günlük ortalama aktiflik süren (saat)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(10);

                const experienceInput = new TextInputBuilder()
                    .setCustomId('experience_input')
                    .setLabel('Daha önce moderatör/ekip tecrüben var mı?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(500);

                const whyChooseInput = new TextInputBuilder()
                    .setCustomId('why_choose_input')
                    .setLabel('Neden seni seçmeliyiz?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(1000);

                const firstRow = new ActionRowBuilder().addComponents(nameInput);
                const secondRow = new ActionRowBuilder().addComponents(ageInput);
                const thirdRow = new ActionRowBuilder().addComponents(activityInput);
                const fourthRow = new ActionRowBuilder().addComponents(experienceInput);
                const fifthRow = new ActionRowBuilder().addComponents(whyChooseInput);

                applicationModal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

                await interaction.showModal(applicationModal);
            }

            else if (interaction.customId.startsWith('accept_application_')) {
                const userId = interaction.customId.split('_')[2];
                await this.handleApplicationDecision(interaction, userId, 'accepted');
            }

            else if (interaction.customId.startsWith('reject_application_')) {
                const userId = interaction.customId.split('_')[2];
                await this.handleApplicationDecision(interaction, userId, 'rejected');
            }
        }

        // Modal handling
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'application_modal') {
                const name = interaction.fields.getTextInputValue('name_input');
                const age = interaction.fields.getTextInputValue('age_input');
                const activity = interaction.fields.getTextInputValue('activity_input');
                const experience = interaction.fields.getTextInputValue('experience_input');
                const whyChoose = interaction.fields.getTextInputValue('why_choose_input');

                await this.submitApplication(interaction, {
                    name, age, activity, experience, whyChoose
                });
            }
        }
    },

    async finalizeSetup(interaction, setupData) {
        try {
            const guild = interaction.guild;
            const applicationChannel = guild.channels.cache.get(setupData.applicationChannel);
            
            // Set default status to open
            setupData.applicationStatus = 'open';
            
            // Save setup data globally for this guild
            interaction.client.applicationData.set(`guild_${guild.id}`, setupData);

            // Create application announcement embed
            const applicationEmbed = new EmbedBuilder()
                .setTitle('📋 Ekip Başvuru Sistemi')
                .setDescription('**Ekibimize katılmak için başvurunu buradan yapabilirsin!**\n\n' +
                    '📌 **Başvuru Şartları:**\n' +
                    '• Minimum yaş: **16**\n' +
                    '• Minimum aktiflik: **Haftada en az 5 gün**\n' +
                    '• **Sunucu kurallarına uymak**\n' +
                    '• **Saygılı ve uyumlu olmak**\n\n' +
                    '✨ Başvurunu yapmak için aşağıdaki **"Başvur"** butonuna tıkla!')
                .setColor(0x00ff00)
                .setThumbnail(guild.iconURL())
                .setFooter({ text: `${guild.name} Ekip Alımları`, iconURL: guild.iconURL() })
                .setTimestamp();

            const applicationButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('start_application')
                        .setLabel('📝 Başvur')
                        .setStyle(ButtonStyle.Success)
                );

            // Send to application channel
            await applicationChannel.send({
                embeds: [applicationEmbed],
                components: [applicationButton]
            });

            // Success message
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Başvuru Sistemi Başarıyla Kuruldu!')
                .setDescription('Sistem başarıyla yapılandırıldı ve başvuru mesajı gönderildi.')
                .addFields(
                    { name: '📝 Başvuru Kanalı', value: `<#${setupData.applicationChannel}>`, inline: true },
                    { name: '📋 Başvurular Kanalı', value: `<#${setupData.applicationsChannel}>`, inline: true },
                    { name: '📢 Sonuç Kanalı', value: `<#${setupData.resultChannel}>`, inline: true },
                    { name: '📝 Log Kanalı', value: `<#${setupData.logChannel}>`, inline: true },
                    { name: '👥 Deneme Rolü', value: `<@&${setupData.trialRole}>`, inline: true },
                    { name: '📊 Durum', value: '🟢 **AÇIK**', inline: true },
                    { name: '⚙️ Yönetim', value: '`/başvuru-aç` `/başvuru-kapa` `/başvuru-durum`', inline: false }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.update({
                embeds: [successEmbed],
                components: []
            });

        } catch (error) {
            console.error('Setup finalizing error:', error);
            await interaction.update({
                content: '❌ Sistem kurulurken bir hata oluştu! Lütfen tekrar deneyin.',
                components: []
            });
        }
    },

    async submitApplication(interaction, applicationData) {
        try {
            const guild = interaction.guild;
            const user = interaction.user;
            const member = interaction.member;
            
            const guildData = interaction.client.applicationData.get(`guild_${guild.id}`);
            if (!guildData) {
                return await interaction.reply({
                    content: '❌ Başvuru sistemi bu sunucuda henüz kurulmamış!',
                    ephemeral: true
                });
            }

            const applicationsChannel = guild.channels.cache.get(guildData.applicationsChannel);
            
            // Create application embed for staff channel
            const applicationEmbed = new EmbedBuilder()
                .setTitle('📋 Yeni Ekip Başvurusu')
                .setDescription(`**${user.tag}** tarafından gönderilen başvuru:`)
                .addFields(
                    { name: '👤 Başvuran', value: `${user} (${user.tag})`, inline: false },
                    { name: '📛 Ad & Soyad', value: applicationData.name, inline: true },
                    { name: '🎂 Yaş', value: applicationData.age, inline: true },
                    { name: '⏰ Günlük Aktiflik', value: `${applicationData.activity} saat`, inline: true },
                    { name: '💼 Deneyim', value: applicationData.experience, inline: false },
                    { name: '✨ Neden Seçmeliyiz?', value: applicationData.whyChoose, inline: false },
                    { name: '📅 Başvuru Tarihi', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setColor(0xffa500)
                .setFooter({ text: `ID: ${user.id}` })
                .setTimestamp();

            const actionButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`accept_application_${user.id}`)
                        .setLabel('✅ Kabul Et')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`reject_application_${user.id}`)
                        .setLabel('❌ Reddet')
                        .setStyle(ButtonStyle.Danger)
                );

            await applicationsChannel.send({
                embeds: [applicationEmbed],
                components: [actionButtons]
            });

            // Save application data
            interaction.client.applicationData.set(`application_${user.id}`, {
                ...applicationData,
                userId: user.id,
                guildId: guild.id,
                timestamp: Date.now()
            });

            await interaction.reply({
                content: '✅ **Başvurun başarıyla gönderildi!**\n\n' +
                    '📋 Başvurun yetkili ekibimiz tarafından incelenecek.\n' +
                    '📬 Sonuç hakkında özelden bilgilendirileceksin.\n\n' +
                    '**Teşekkürler!** 💙',
                ephemeral: true
            });

        } catch (error) {
            console.error('Application submission error:', error);
            await interaction.reply({
                content: '❌ Başvuru gönderilirken bir hata oluştu! Lütfen tekrar deneyin.',
                ephemeral: true
            });
        }
    },

    async handleApplicationDecision(interaction, userId, decision) {
        try {
            const guild = interaction.guild;
            const staff = interaction.user;
            
            const guildData = interaction.client.applicationData.get(`guild_${guild.id}`);
            const applicationData = interaction.client.applicationData.get(`application_${userId}`);
            
            if (!guildData || !applicationData) {
                return await interaction.reply({
                    content: '❌ Başvuru verisi bulunamadı!',
                    ephemeral: true
                });
            }

            const applicant = await guild.members.fetch(userId).catch(() => null);
            if (!applicant) {
                return await interaction.reply({
                    content: '❌ Başvuru sahibi sunucuda bulunamadı!',
                    ephemeral: true
                });
            }

            const resultChannel = guild.channels.cache.get(guildData.resultChannel);
            const logChannel = guild.channels.cache.get(guildData.logChannel);

            const isAccepted = decision === 'accepted';
            
            // Update the application message
            const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
            originalEmbed
                .setColor(isAccepted ? 0x00ff00 : 0xff0000)
                .setTitle(`📋 ${isAccepted ? '✅ Kabul Edilen' : '❌ Reddedilen'} Başvuru`)
                .addFields({ 
                    name: '👮 Karar Veren', 
                    value: `${staff} (${staff.tag})`, 
                    inline: false 
                },
                { 
                    name: '📅 Karar Tarihi', 
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`, 
                    inline: false 
                });

            await interaction.update({
                embeds: [originalEmbed],
                components: []
            });

            // Result channel announcement
            const resultEmbed = new EmbedBuilder()
                .setTitle(`📢 Başvuru Sonucu`)
                .setDescription(`**${applicant.user.tag}** kullanıcısının başvurusu **${isAccepted ? 'KABUL' : 'REDDEDİLDİ'}**.`)
                .addFields(
                    { name: '👤 Başvuran', value: `${applicant.user} (${applicant.user.tag})`, inline: true },
                    { name: '👮 Karar Veren', value: `${staff} (${staff.tag})`, inline: true },
                    { name: '📅 Karar Tarihi', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setThumbnail(applicant.user.displayAvatarURL())
                .setColor(isAccepted ? 0x00ff00 : 0xff0000)
                .setTimestamp();

            await resultChannel.send({ embeds: [resultEmbed] });

            // Log channel
            const logEmbed = new EmbedBuilder()
                .setTitle(`📝 Başvuru İşlem Logu`)
                .addFields(
                    { name: '👤 Başvuran', value: `${applicant.user.tag} (${applicant.user.id})`, inline: false },
                    { name: '👮 Karar Veren', value: `${staff.tag} (${staff.id})`, inline: false },
                    { name: '📊 Karar', value: isAccepted ? '✅ Kabul' : '❌ Red', inline: true },
                    { name: '📅 İşlem Tarihi', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setColor(isAccepted ? 0x00ff00 : 0xff0000)
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });

            // DM to applicant
            const dmEmbed = new EmbedBuilder()
                .setTitle(`📬 ${guild.name} - Başvuru Sonucu`)
                .setDescription(isAccepted 
                    ? '🎉 **Tebrikler!** Başvurunuz kabul edildi!\n\n' +
                      '✅ Yetkililer sizinle yakında iletişime geçecek.\n' +
                      '🎯 Deneme süreciniz başlamış bulunmaktadır.\n\n' +
                      '**Başarılar dileriz!** 💙'
                    : '😔 **Üzgünüz,** başvurunuz reddedildi.\n\n' +
                      '💡 Gelecekte tekrar başvurabilirsiniz.\n' +
                      '📚 Kendinizi geliştirip yeniden deneyebilirsiniz.\n\n' +
                      '**Anlayışınız için teşekkürler.** 💙')
                .setThumbnail(guild.iconURL())
                .setColor(isAccepted ? 0x00ff00 : 0xff0000)
                .setTimestamp();

            try {
                await applicant.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log(`DM gönderilemedi: ${applicant.user.tag}`);
            }

            // Give role if accepted
            if (isAccepted) {
                const trialRole = guild.roles.cache.get(guildData.trialRole);
                if (trialRole) {
                    await applicant.roles.add(trialRole);
                }
            }

            // Clean up application data
            interaction.client.applicationData.delete(`application_${userId}`);

            await interaction.followUp({
                content: `✅ Başvuru ${isAccepted ? 'kabul edildi' : 'reddedildi'} ve ilgili kişiye bilgilendirme gönderildi.`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Application decision error:', error);
            await interaction.reply({
                content: '❌ Karar işlenirken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
};