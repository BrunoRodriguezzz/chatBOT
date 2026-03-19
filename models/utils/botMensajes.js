import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { Jerarquia } from "../entities/Jerarquia.js";
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

  // Manejo de secciones sin contenido directo pero con subtemas
  if (!texto && jerarquia.subtitulos && jerarquia.subtitulos.length > 0) {
    texto = "*Esta sección no contiene información directa, pero puedes explorar sus subtemas a continuación:*";
  } else if (!texto) {
    texto = "*(Sin contenido disponible)*";
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

  const response = {
    content: prefix,
    embeds: [embed],
    components: [],
  };

  // Botón para volver al padre si existe
  if (jerarquia.ruta_titulos.length > 1) {
    const parentPath = jerarquia.ruta_titulos.slice(0, -1);
    const parentId = Jerarquia.generarId(parentPath);
    
    // Verificamos si el padre existe en el repositorio (por si acaso)
    if (jerarquiaRepository.getById(parentId)) {
      const backRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`hier_view_${parentId}`)
          .setLabel("Volver")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("⬅️"),
      );
      response.components.push(backRow);
    }
  }

  // Muestra subtítulos disponibles en un menú de selección
  if (jerarquia.subtitulos && jerarquia.subtitulos.length > 0) {
    const subOptions = jerarquia.subtitulos.map((sub) => {
      const subPath = [...jerarquia.ruta_titulos, sub];
      const subId = Jerarquia.generarId(subPath);
      
      return {
        label: sub.length > 100 ? sub.substring(0, 97) + "..." : sub,
        description: `Ver contenido de ${sub}`,
        value: subId,
      };
    });

    // Discord permite hasta 25 opciones por menú.
    const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("hier_subs_select")
        .setPlaceholder("Selecciona un subtema para navegar...")
        .addOptions(subOptions.slice(0, 25)),
    );
    
    response.components.push(menuRow);

    // También lo dejamos en el embed para visibilidad
    const sub = jerarquia.subtitulos.join(", ");
    const limitSub = sub.length > 1000 ? sub.substring(0, 1000) + "..." : sub;
    embed.addFields({ name: "Subtemas disponibles", value: limitSub });
  }

  return response;
}
