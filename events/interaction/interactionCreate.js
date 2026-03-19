import { Events } from "discord.js";
import { generarRespuestaJerarquia } from "../../models/utils/botMensajes.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isMessageComponent()) return;

    const { customId } = interaction;

    // Manejo de navegación por jerarquías (botones "Volver" y selección de Subtemas)
    if (customId.startsWith("hier_view_") || customId === "hier_subs_select") {
      const targetId = interaction.isStringSelectMenu()
        ? interaction.values[0]
        : customId.replace("hier_view_", "");

      const respuesta = await generarRespuestaJerarquia(
        targetId,
        "Navegando por el contenido:",
      );

      await interaction.update(respuesta);
    }
  },
};
