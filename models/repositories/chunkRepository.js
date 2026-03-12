import natural from "natural";
import { Chunk } from "../entities/Chunk.js";

const tokenizer = new natural.AggressiveTokenizerEs();
const spanishStopWords = [
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'es', 'son'
];

class ChunkRepository {
  constructor() {
    this.chunks = [];
    this.tfidfIndex = new natural.TfIdf();
  }
  
  static procesarTexto(texto) {
      if (!texto) return "";
      const tokens = tokenizer.tokenize(texto.toLowerCase());
      const filtered = tokens.filter(t => !spanishStopWords.includes(t));
      const stemmed = filtered.map(t => natural.PorterStemmerEs.stem(t));
      return stemmed.join(" ");
  }

  addMany(newChunks, jerarquiaMap = null) {
    if (!Array.isArray(newChunks)) return;

    newChunks.forEach((chunk) => {
      if (!(chunk instanceof Chunk)) return;
      this.chunks.push(chunk);

      let contentToTrain = chunk.texto;
      if (jerarquiaMap && jerarquiaMap[chunk.idJerarquia]) {
        const titulos = jerarquiaMap[chunk.idJerarquia].ruta_titulos;
        const mainTitle = titulos[titulos.length - 1]; // "Interrupción"
        if (mainTitle && mainTitle !== "Sin título") {
            contentToTrain = `${mainTitle} ${contentToTrain}`;
        }
      }

      const processed = ChunkRepository.procesarTexto(contentToTrain);
      this.tfidfIndex.addDocument(processed);
    });
  }

  async train() {
    // Compatibility stub since node-nlp's NlpManager was previously asynchronous
  }

  async findMostSimilar(query, minScore = 0.2) {
    if (this.chunks.length === 0 || !query) return null;

    let bestMatch = null;
    let maxScore = -1;
    const processedQuery = ChunkRepository.procesarTexto(query);

    this.tfidfIndex.tfidfs(processedQuery, (i, score) => {
      if (score > maxScore) {
        maxScore = score;
        bestMatch = {
          chunk: { ...this.chunks[i] },
          score: score,
        };
      }
    });

    return bestMatch && bestMatch.score >= minScore ? bestMatch : null;
  }

  getAll() {
    return this.chunks.map((c) => ({ ...c }));
  }

  getById(id) {
    return this.chunks.find((c) => c.id === id);
  }

  getPrevious(id) {
    const index = this.chunks.findIndex((c) => c.id === id);
    if (index > 0) {
      return this.chunks[index - 1];
    }
    return null;
  }

  getNext(id) {
    const index = this.chunks.findIndex((c) => c.id === id);
    if (index !== -1 && index < this.chunks.length - 1) {
      return this.chunks[index + 1];
    }
    return null;
  }

  clear() {
    this.chunks = [];
    this.tfidfIndex = new natural.TfIdf();
  }
}

export const chunkRepository = new ChunkRepository();
export { ChunkRepository };
