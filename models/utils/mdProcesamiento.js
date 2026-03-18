import fs from "fs/promises";
import path from "path";
import { Jerarquia } from "../entities/Jerarquia.js";
import { jerarquiaRepository } from "../repositories/jerarquiaRepository.js";

export async function procesarMarkdown(filePath) {
  try {
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
    const newJerarquia = {};

    let currentPath = ["General", "Inicio"];
    let mainFileContextPath = path.resolve(filePath);

    // Jerarquía global por defecto si no hay títulos al principio
    let currentPadreId = Jerarquia.generarId(currentPath);
    newJerarquia[currentPadreId] = Jerarquia.create([...currentPath], 1, mainFileContextPath);

    const headingRegex = /^(#{1,6})\s+(.*)/;

    // Trackear los IDs de la ruta actual para poder añadir los subtítulos fácilmente
    // historyPathIds[level] = ID de esa jerarquía
    const historyPathIds = [];
    historyPathIds[0] = Jerarquia.generarId(["General", "Inicio"]); 

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const headingMatch = trimmed.match(headingRegex);

      if (headingMatch) {
        const level = headingMatch[1].length; // Cantidad de '#'
        const titleText = headingMatch[2].trim();

        currentPath = currentPath.slice(0, level - 1);
        currentPath.push(titleText);

        while (currentPath.length < level) {
          currentPath.splice(currentPath.length - 1, 0, "Sin título");
        }

        currentPadreId = Jerarquia.generarId(currentPath);
        
        // Crear o actualizar la jerarquía
        if (!newJerarquia[currentPadreId]) {
          newJerarquia[currentPadreId] = Jerarquia.create([...currentPath], i + 1, mainFileContextPath);
        } else {
          // Si ya existe en este parseo (títulos duplicados ej. mismo nombre), podemos actualizar su línea a la primera ocurrencia
          // pero típicamente los id son por path total, por lo que es único a menos que se repitan títulos exactos en la misma profundidad.
          if (newJerarquia[currentPadreId].linea_md === 0) {
            newJerarquia[currentPadreId].linea_md = i + 1;
            newJerarquia[currentPadreId].archivo_md = mainFileContextPath;
          }
        }

        historyPathIds[level] = currentPadreId;

        // Si existe un padre superior en la estructura de este documento, le asignamos este título como subtitulo
        let parentLevelId = null;
        for (let l = level - 1; l >= 0; l--) {
            if (historyPathIds[l]) {
                parentLevelId = historyPathIds[l];
                break;
            }
        }

        if (parentLevelId && newJerarquia[parentLevelId]) {
             newJerarquia[parentLevelId].agregarSubtitulo(titleText);
        }
      }
    }

    jerarquiaRepository.addMany(newJerarquia);

    return true;
  } catch (error) {
    console.error(`[MDProcesamiento] Error en ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Lee una sección específica de un archivo Markdown.
 * Comienza a leer en `linea_md` y se detiene cuando encuentra un título
 * de igual o mayor jerarquía, o al llegar al final del archivo.
 * @param {string} filePath - Ruta absoluta del archivo .md
 * @param {number} startLine - Línea de inicio (1-indexed)
 * @returns {Promise<string>} Contenido del archivo en esa sección.
 */
export async function leerSeccionMarkdown(filePath, startLine) {
  try {
    const rawContent = await fs.readFile(filePath, "utf-8");
    const lines = rawContent.split(/\r?\n/);
    
    // startLine es 1-indexed, lo convertimos a 0-indexed
    const startIndex = startLine - 1;
    if (startIndex < 0 || startIndex >= lines.length) return "";

    const headingRegex = /^(#{1,6})\s+(.*)/;
    
    // Asumimos que la primera línea es el título que estamos leyendo (para descubrir su nivel)
    const firstLineMatch = lines[startIndex].trim().match(headingRegex);
    let myLevel = 6; // Por defecto el nivel más bajo (más tolerante)
    
    if (firstLineMatch) {
       myLevel = firstLineMatch[1].length;
    }

    const sectionLines = [];
    sectionLines.push(lines[startIndex]); // agregamos la primera línea u omitir? Mejor la agregamos (el título mismo)

    for (let i = startIndex + 1; i < lines.length; i++) {
       const line = lines[i];
       const match = line.trim().match(headingRegex);
       
       if (match) {
           const compareLevel = match[1].length;
           // Si encontramos un título de igual o MAYOR jerarquía (menor número de #), paramos.
           if (compareLevel <= myLevel) {
               break;
           }
       }
       sectionLines.push(line);
    }

    return sectionLines.join("\n").trim();
  } catch(e) {
    console.error(`[MDProcesamiento] Error leyendo sección de ${filePath}:`, e.message);
    return "";
  }
}
