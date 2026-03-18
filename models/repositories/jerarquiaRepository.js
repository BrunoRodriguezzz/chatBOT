import natural from "natural";
import { Jerarquia } from "../entities/Jerarquia.js";
import { NlpSanitizer } from "../utils/nlpSanitizer.js";

class JerarquiaRepository {
  constructor() {
    this.jerarquia = {};
    this.tfidfIndex = new natural.TfIdf();
    this.idList = []; // Para mapear el índice del tfidfIndex al ID de Jerarquia
  }

  addMany(newJerarquia) {
    if (!newJerarquia || typeof newJerarquia !== "object") return;

    for (const [id, value] of Object.entries(newJerarquia)) {
      if (!(value instanceof Jerarquia)) continue;
      if (this.jerarquia[id]) {
        this.jerarquia[id].merge(value);
      } else {
        this.jerarquia[id] = value;
        // Solo indexamos si es nuevo o podemos re-indexar todo después
        // Para simplificar, asumimos que addMany ocurre en bloque por archivo
      }
    }
  }

  /**
   * Aplica el algoritmo de TF-IDF a las Jerarquias (Titulos) que esten en el repositorio.
   */
  async train() {
    // Re-construir el index TF-IDF usando las jerarquías actuales
    this.tfidfIndex = new natural.TfIdf();
    this.idList = [];

    for (const [id, j] of Object.entries(this.jerarquia)) {
      const procesado = NlpSanitizer.prepararTextoIndice(j.ruta_titulos);
      this.tfidfIndex.addDocument(procesado);
      this.idList.push(id);
    }
  }


  /**
   * Encuentra la Jerarquia más similar a la consulta dada utilizando el índice TF-IDF.
   * Devuelve un objeto con la Jerarquia y su score de similitud, o null si no hay coincidencias.
   * @param {*} query 
   * @param {*} minScore 
   * @returns 
   */
  async findMostSimilar(query, minScore = 0.2) {
    if (this.idList.length === 0 || !query) return null;

    let bestMatch = null;
    let maxScore = -1;
    const processedQuery = NlpSanitizer.sanitizar(query);

    this.tfidfIndex.tfidfs(processedQuery, (i, score) => {
      if (score > maxScore) {
        maxScore = score;
        bestMatch = {
          jerarquia: { ...this.jerarquia[this.idList[i]] },
          score: score,
        };
      }
    });

    return bestMatch && bestMatch.score >= minScore ? bestMatch : null;
  }

  getById(id) {
    return this.jerarquia[id] ? { ...this.jerarquia[id] } : undefined;
  }

  getAll() {
    const copy = {};
    for (const id in this.jerarquia) {
      copy[id] = { ...this.jerarquia[id] };
    }
    return copy;
  }

  clear() {
    this.jerarquia = {};
    this.tfidfIndex = new natural.TfIdf();
    this.idList = [];
  }
}

export const jerarquiaRepository = new JerarquiaRepository();
export { JerarquiaRepository };

