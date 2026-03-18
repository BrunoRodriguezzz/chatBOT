import path from "path";
import fs from "fs/promises";
import { procesarMarkdown } from "./mdProcesamiento.js";
import { jerarquiaRepository } from "../repositories/jerarquiaRepository.js";

/**
 * Lee todos los archivos .md de un directorio y los ingesta.
 * @param {string} dirPath - Ruta absoluta al directorio de documentos.
 */
export async function cargarDocumentos(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const fullPath = path.join(dirPath, file);
        await procesarMarkdown(fullPath);
        console.log(`[CargarDocumentos] Ingerido documento: ${file}`);
      }
    }
    
    console.log("[CargarDocumentos] Entrenando modelo NLP...");
    await jerarquiaRepository.train();
    console.log("[CargarDocumentos] Modelo NLP entrenado.");
  } catch (error) {
    console.error(`[CargarDocumentos] Error al procesar documentos en ${dirPath}:`, error.message);
  }
}
