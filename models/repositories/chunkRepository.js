import natural from "natural";

class ChunkRepository {
  constructor() {
    this.chunks = [];
    this.tfidfIndex = new natural.TfIdf();
  }

  addMany(newChunks) {
    if (!Array.isArray(newChunks)) return;

    newChunks.forEach((chunk) => {
      if (chunk && chunk.id && chunk.texto) {
        this.chunks.push({ ...chunk });
        this.tfidfIndex.addDocument(chunk.texto);
      }
    });
  }

  findMostSimilar(query, minScore = 0.2) {
    if (this.chunks.length === 0 || !query) return null;

    let bestMatch = null;
    let maxScore = -1;

    this.tfidfIndex.tfidfs(query, (i, score) => {
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

  clear() {
    this.chunks = [];
    this.tfidfIndex = new natural.TfIdf();
  }
}

export const chunkRepository = new ChunkRepository();
export { ChunkRepository };
