import { procesarMarkdown } from "../../../models/utils/mdProcesamiento.js";
import { chunkRepository } from "../../../models/repositories/chunkRepository.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  await procesarMarkdown(
    path.join(__dirname, "documentos", "contextoPrueba.md"),
  );
  const msgs = ["Que es una interrupción?"];

  for (const msg of msgs) {
    console.log(`\nQuery: "${msg}"`);
    const bestMatch = chunkRepository.findMostSimilar(msg);
    if (bestMatch) {
      console.log(`Top Score: ${bestMatch.score}`);
      console.log(`Text: ${bestMatch.chunk.texto}`);
    } else {
      console.log(`No match found`);
    }

    // Let's print top 3 matches
    console.log("--- Detail ---");
    let results = [];
    chunkRepository.tfidfIndex.tfidfs(msg, (i, score) => {
      results.push({
        score,
        text: chunkRepository.chunks[i].texto,
      });
    });
    results.sort((a, b) => b.score - a.score);
    for (let i = 0; i < Math.min(3, results.length); i++) {
      console.log(`Rank ${i + 1} (${results[i].score}): ${results[i].text}`);
    }
  }
}

test().catch(console.error);
