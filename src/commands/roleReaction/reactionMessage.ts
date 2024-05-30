// const collector = interaction.channel?.createMessageComponentCollector({
//   componentType: ComponentType.StringSelect,
//   time: 60000,
// });

// collector?.on('collect', async (i) => {
//   const selectedRoleId = i.values[0];
//   const selectedRole = interaction.guild?.roles.cache.get(selectedRoleId!);
//   // console.info('Selected Role:', selectedRole);

//   message!.react('👍');

//   // if (selectedRole) {
//   //   // const confirmButton = new ButtonBuilder()
//   //   //   .setCustomId('confirm-role')
//   //   //   .setLabel('Confirm Role')
//   //   //   .setStyle(ButtonStyle.Primary);

//   //   const finalizeButton = new ButtonBuilder()
//   //     .setCustomId('finalize-setup')
//   //     .setLabel('Finalize Setup')
//   //     .setStyle(ButtonStyle.Danger);

//   //   const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(finalizeButton);

//   //   await interaction.editReply({
//   //     content: `You selected the role: **${selectedRole.name}**.\n\n**Next Step:** *React to the target message with the emoji you want to use for this role.*`,
//   //     components: [actionRow],
//   //   });

//   //   const buttonCollector = i.channel?.createMessageComponentCollector({
//   //     componentType: ComponentType.Button,
//   //     time: 60000,
//   //   });

//   //   // buttonCollector?.on('collect', async (btnInt) => {
//   //   //   if (btnInt.customId === 'confirm-role') {
//   //   //     await btnInt.reply({
//   //   //       content: `React to the message with ID ${messageId} with your chosen emoji.`,
//   //   //       ephemeral: true,
//   //   //     });

//   //   //     const reactionFilter = (reaction: MessageReaction, user: any) => !user.bot;

//   //   //     // Verificar si el canal no es undefined
//   //   //     if (!interaction.channel) {
//   //   //       await btnInt.followUp({
//   //   //         content: 'Channel is undefined. Cannot proceed.',
//   //   //         ephemeral: true,
//   //   //       });
//   //   //       return;
//   //   //     }

//   //   //     const message = await (interaction.channel as TextChannel).messages.fetch(messageId);

//   //   //     if (message) {
//   //   //       const reactionCollector = message.createReactionCollector({
//   //   //         filter: reactionFilter,
//   //   //         max: 1,
//   //   //         time: 60000, // 1 minute
//   //   //       });

//   //   //       reactionCollector.on('collect', async (reaction: MessageReaction, user: any) => {
//   //   //         const emoji = reaction.emoji;
//   //   //         await message.react(emoji);

//   //   //         // Save the emoji and role mapping somewhere (database or in-memory storage)
//   //   //         // For example:
//   //   //         // emojiRoleMap.set(emoji.id, selectedRoleId);

//   //   //         await btnInt.followUp({
//   //   //           content: `Role ${selectedRole.name} has been assigned to emoji ${emoji}.`,
//   //   //           ephemeral: true,
//   //   //         });
//   //   //       });
//   //   //     } else {
//   //   //       await btnInt.followUp({
//   //   //         content: `Could not fetch the message with ID ${messageId}. Please ensure the ID is correct and the bot has access to the channel.`,
//   //   //         ephemeral: true,
//   //   //       });
//   //   //     }
//   //   //   } else if (btnInt.customId === 'finalize-setup') {
//   //   //     await btnInt.reply({
//   //   //       content: 'Role reaction setup has been finalized.',
//   //   //       ephemeral: true,
//   //   //     });

//   //   //     // Finalize setup and save to persistent storage if needed

//   //   //     buttonCollector.stop();
//   //   //     collector.stop();
//   //   //   }
//   //   // });
//   // }
// });

// collector?.on('end', (collected) => {
//   if (collected.size === 0) {
//     interaction.followUp({
//       content: 'No role was selected. Please try again.',
//       ephemeral: true,
//     });
//   }
// });
