import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { jerarquiaRepository } from "../repositories/jerarquiaRepository.js";
import { leerSeccionMarkdown } from "./mdProcesamiento.js";

/**
 * Genera un objeto de respuesta para una jerarquía específica leyendo el Markdown en tiempo real.
 * @param {string} jerarquiaId - ID de la jerarquía a mostrar.
 * @param {string} prefix - Texto opcional para poner antes del contenido.
 * @returns {Promise<object>} - Objeto listo para ser usado en message.reply() o interaction.update().
 */
export async function generarRespuestaJerarquia(
  jerarquiaId,
  prefix = "¡Hola! He encontrado la siguiente sección en la documentación:",
) {
  const jerarquia = jerarquiaRepository.getById(jerarquiaId);
  if (!jerarquia) return { content: "No se encontró el contenido solicitado." };

  const titulo = jerarquia.ruta_titulos.join(" > ");
  let texto = "(sin contenido)";

  if (jerarquia.archivo_md && jerarquia.linea_md > 0) {
    texto = await leerSeccionMarkdown(jerarquia.archivo_md, jerarquia.linea_md);
    // Si la sección empieza con un encabezado Markdown (ej. "### Título"), lo removemos
    // para evitar que el título aparezca duplicado (embed title + descripción).
    texto = texto.replace(/^\s*#{1,6}\s+.*(?:\r?\n)?/, "").trim();
  }

  // Si el texto excede los límites de Discord (4096 para descripción de Embed), lo cortamos.
  if (texto.length > 4000) {
    texto = texto.substring(0, 4000) + "... *(el texto ha sido recortado)*";
  }

  const embed = new EmbedBuilder()
    .setTitle(
      jerarquia.ruta_titulos[jerarquia.ruta_titulos.length - 1] || "Sin título",
    )
    .setAuthor({ name: titulo })
    .setDescription(texto)
    .setColor(0x0099ff);

  // Muestra subtítulos disponibles (si los hay)
  if (jerarquia.subtitulos && jerarquia.subtitulos.length > 0) {
    const sub = jerarquia.subtitulos.join(", ");
    const limitSub = sub.length > 1000 ? sub.substring(0, 1000) + "..." : sub;
    embed.addFields({ name: "Subtemas disponibles", value: limitSub });
  }

  const response = {
    content: prefix,
    embeds: [embed],
  };

  // FUTURO: Se podría agregar componentes con los IDs de los subtítulos si los mapeamos, para navegar hacia ellos.
  const row = new ActionRowBuilder();

  /* Ejemplo de cómo podríamos paginar o navegar en el futuro
  if (jerarquia.subtitulos.length > 0) {
      // Logic for buttons
  }
  */

  if (row.components.length > 0) {
    response.components = [row];
  }

  return response;
}
