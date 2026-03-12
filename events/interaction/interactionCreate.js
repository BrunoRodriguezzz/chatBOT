import { Events } from "discord.js";
import { generarRespuestaChunk } from "../../models/utils/botMensajes.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    if (customId.startsWith("chunk_view_")) {
      const chunkId = customId.replace("chunk_view_", "");
      
      // Actualizamos el mensaje con el nuevo chunk
      const respuesta = generarRespuestaChunk(chunkId, "Navegando por el contenido:");
      
      await interaction.update(respuesta);
    }
  },
};
