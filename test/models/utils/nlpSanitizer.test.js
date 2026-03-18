import { describe, it, expect } from "vitest";
import natural from "natural";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const stopwords = require("stopwords-es");
import { NlpSanitizer } from "../../../models/utils/nlpSanitizer.js";

describe("NlpSanitizer", () => {
  it("sanitizar devuelve cadena vacía para entradas vacías o nulas", () => {
    expect(NlpSanitizer.sanitizar("")).toBe("");
    expect(NlpSanitizer.sanitizar(null)).toBe("");
    expect(NlpSanitizer.sanitizar(undefined)).toBe("");
  });

  it("elimina stopwords y aplica stemming correctamente", () => {
    const texto = "La rápida zorra marrón salta sobre el perro";
    const resultado = NlpSanitizer.sanitizar(texto);

    // Calcular el resultado esperado usando las mismas librerías (independiente del método)
    const tokenizer = new natural.AggressiveTokenizerEs();
    const tokens = tokenizer.tokenize(texto.toLowerCase());
    const filtered = tokens.filter((t) => !stopwords.includes(t));
    const stemmed = filtered.map((t) => natural.PorterStemmerEs.stem(t));
    const esperado = stemmed.join(" ");

    expect(resultado).toBe(esperado);
    // Verificar explícita eliminación de stopwords comunes
    expect(resultado).not.toContain("la");
    expect(resultado).not.toContain("el");
    expect(resultado).not.toContain("sobre");
  });

  it("prepararTextoIndice concatena la ruta y prioriza el último título", () => {
    const ruta = ["Introducción", "Instalación", "Windows"];
    const resultado = NlpSanitizer.prepararTextoIndice(ruta);

    const combinado = `${ruta.join(" ")} ${ruta[ruta.length - 1]}`;
    const tokenizer = new natural.AggressiveTokenizerEs();
    const tokens = tokenizer.tokenize(combinado.toLowerCase());
    const filtered = tokens.filter((t) => !stopwords.includes(t));
    const stemmed = filtered
      .map((t) => natural.PorterStemmerEs.stem(t))
      .join(" ");

    expect(resultado).toBe(stemmed);
  });
});
