import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { chunkRepository } from "../repositories/chunkRepository.js";
import { jerarquiaRepository } from "../repositories/jerarquiaRepository.js";

/**
 * Genera un ID robusto basado en hash del contenido para evitar duplicados.
 * @param {string} text - Contenido a hashear.
 * @returns {string} ID único de 16 caracteres.
 */
function generateId(text) {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex")
    .substring(0, 16);
}

export async function procesarMarkdown(filePath) {
  try {
    // 1. Validación de entrada
    if (!filePath || typeof filePath !== "string")
      throw new Error("La ruta del archivo es inválida.");
    if (path.extname(filePath).toLowerCase() !== ".md")
      throw new Error("El archivo debe tener extensión .md.");

    const rawContent = await fs.readFile(filePath, "utf-8");
    if (!rawContent.trim()) {
      console.warn(`[MDProcesamiento] Archivo vacío: ${filePath}`);
      return false;
    }

    const lines = rawContent.split(/\r?\n/);
    const newChunks = [];
    const newJerarquia = {};

    // Mantenemos la ruta de títulos en un array. Posición 0 = H1, Posición 1 = H2, etc.
    let currentPath = ["General", "Inicio"];
    let currentPadreId = generateId(currentPath.join("-"));

    let currentParagraphLines = [];

    const commitParagraph = () => {
      if (currentParagraphLines.length === 0) return;

      const paragraphText = currentParagraphLines.join(" ").trim();
      if (!paragraphText) return;

      const chunkId = generateId(
        `${currentPadreId}-${paragraphText}-${newChunks.length}`,
      );

      newChunks.push({
        id: chunkId,
        id_padre: currentPadreId,
        texto: paragraphText,
      });

      if (!newJerarquia[currentPadreId]) {
        // En lugar de titulo y subtitulo fijos, guardamos la ruta completa
        newJerarquia[currentPadreId] = {
          ruta_titulos: [...currentPath],
          ids_chunks_hijos: [],
        };
      }
      newJerarquia[currentPadreId].ids_chunks_hijos.push(chunkId);
      currentParagraphLines = [];
    };

    // Regex para detectar títulos de nivel 1 al 6: ej. "### Título"
    const headingRegex = /^(#{1,6})\s+(.*)/;

    for (let line of lines) {
      const trimmed = line.trim();
      const headingMatch = trimmed.match(headingRegex);

      if (headingMatch) {
        commitParagraph();

        const level = headingMatch[1].length; // Cantidad de '#'
        const titleText = headingMatch[2].trim();

        // Recortamos el array hasta el nivel anterior y agregamos el nuevo título
        // Ej: Si estamos en H3 (level 3) y viene un H2 (level 2), cortamos dejando solo el H1, y agregamos el nuevo H2.
        currentPath = currentPath.slice(0, level - 1);
        currentPath.push(titleText);

        // Si el documento salta niveles (ej. de H1 directo a H3), rellenamos los huecos con "Sin título" para no romper el índice del array
        while (currentPath.length < level) {
          currentPath.splice(currentPath.length - 1, 0, "Sin título");
        }

        currentPadreId = generateId(currentPath.join("-"));
        continue;
      }

      // Línea en blanco -> Indica fin de párrafo
      if (!trimmed) {
        commitParagraph();
        continue;
      }

      // Si no es un título ni línea vacía, es parte de un párrafo
      currentParagraphLines.push(trimmed);
    }

    commitParagraph();

    chunkRepository.addMany(newChunks);
    jerarquiaRepository.addMany(newJerarquia);

    return true;
  } catch (error) {
    console.error(`[MDProcesamiento] Error en ${filePath}:`, error.message);
    throw error;
  }
}
