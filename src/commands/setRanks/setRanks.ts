import { SlashCommandBuilder, CommandInteraction, GuildMemberRoleManager, CacheType } from 'discord.js';
import { Command } from '../../types/command';
import { prisma } from '../../services/prismaClient';

const setRanks: Command = {
  data: new SlashCommandBuilder()
    .setName('set-ranks')
    .setDescription('Setup ranks')
    .addStringOption((option) =>
      option.setName('prefix').setDescription('Prefix of roles to search').setRequired(true),
    ),
  execute: async (interaction: CommandInteraction) => {
    // Obtener el prefijo de los roles del usuario
    const prefix = interaction.options.get('prefix');

    // Validar si se proporcionó un prefijo
    if (!prefix) {
      await interaction.reply({ content: 'Por favor, proporciona un prefijo para buscar los roles.', ephemeral: true });
      return;
    }

    // Obtener todos los roles del servidor que empiecen con el prefijo especificado
    const roles = interaction.guild?.roles.cache.filter((role) =>
      role.name.toLowerCase().startsWith((prefix?.value as string).toLowerCase()),
    );

    // Validar si se encontraron roles con el prefijo especificado
    if (!roles || roles.size === 0) {
      await interaction.reply({ content: 'No se encontraron roles con el prefijo especificado.', ephemeral: true });

      return;
    } else {
      roles.forEach(async (role) => {
        await prisma.role.create({
          data: {
            discordRoleId: role.id,
            discordRoleName: role.name,
          },
        });
      });
    }

    // Respondemos al usuario confirmando que se han encontrado y almacenado los roles
    await interaction.reply({
      content: `Se encontraron y almacenaron ${roles.size} roles con el prefijo "${prefix.value as string}".\n**Son los siguientes:**\n- ${roles.map((role) => role.id + ' - ' + role.name).join('\n- ')}`,
      ephemeral: true,
    });
  },
};

export default setRanks;
