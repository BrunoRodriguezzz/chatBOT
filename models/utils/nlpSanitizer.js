import natural from "natural";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const stopwords = require("stopwords-es");

const tokenizer = new natural.AggressiveTokenizerEs();

export class NlpSanitizer {
  /**
   * Toma un texto, lo tokeniza, elimina stopwords y aplica stemming para normalizar las palabras.
   * @param {string} texto - Texto a sanitizar
   * @returns {string} Texto sanitizado y procesado
   */
  static sanitizar(texto) {
    if (!texto) return "";
    const tokens = tokenizer.tokenize(texto.toLowerCase());
    const filtered = tokens.filter((t) => !stopwords.includes(t));
    const stemmed = filtered.map((t) => natural.PorterStemmerEs.stem(t));
    return stemmed.join(" ");
  }

  /**
   * Procesa la ruta de títulos para crear un solo texto combinando el contexto del breadcrumb.
   * Da un mayor peso al título principal repitiéndolo o asegurando su correcta posición.
   * @param {string[]} rutaTitulos - Array con la jerarquía de títulos
   * @returns {string} Texto con el contexto de la ruta sanitizada
   */
  static prepararTextoIndice(rutaTitulos) {
    if (!rutaTitulos || rutaTitulos.length === 0) return "";

    // El último título de la ruta (mainTitle) tiene mayor importancia
    const mainTitle = rutaTitulos[rutaTitulos.length - 1];

    // Todos los títulos aportan al contexto global
    const fullPathText = rutaTitulos.join(" ");

    // Concatena el path y resalta el título principal para el stemmer/TF-IDF
    const combinado = `${fullPathText} ${mainTitle}`;

    return NlpSanitizer.sanitizar(combinado);
  }
}
