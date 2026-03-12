import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { chunkRepository } from "../repositories/chunkRepository.js";
import { jerarquiaRepository } from "../repositories/jerarquiaRepository.js";

/**
 * Genera un objeto de respuesta para un chunk específico, incluyendo navegación.
 * @param {string} chunkId - ID del chunk a mostrar.
 * @param {string} prefix - Texto opcional para poner antes del contenido.
 * @returns {object} - Objeto listo para ser usado en message.reply() o interaction.update().
 */
export function generarRespuestaChunk(chunkId, prefix = "¡Hola! He encontrado un tema relacionado:") {
  const chunk = chunkRepository.getById(chunkId);
  if (!chunk) return { content: "No se encontró el contenido solicitado." };

  const jerarquia = jerarquiaRepository.getById(chunk.idJerarquia);
  const titulo = jerarquia ? jerarquia.ruta_titulos.join(" > ") : "Sin categoría";

  const texto = chunk.texto || "(sin contenido)";
  
  const embed = new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(texto)
    .setColor(0x0099FF);

  const prev = chunkRepository.getPrevious(chunkId);
  const next = chunkRepository.getNext(chunkId);

  const row = new ActionRowBuilder();

  if (prev) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`chunk_view_${prev.id}`)
        .setLabel("⬅️ Anterior")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  if (next) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`chunk_view_${next.id}`)
        .setLabel("Siguiente ➡️")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  const response = {
    content: prefix,
    embeds: [embed],
  };

  if (row.components.length > 0) {
    response.components = [row];
  }

  return response;
}
