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
  await chunkRepository.train();

  const msg = "Que es una interrupción?";

  console.log(`\nQuery: "${msg}"`);
  const bestMatch = await chunkRepository.findMostSimilar(msg);
  if (bestMatch) {
    console.log(`Top Score: ${bestMatch.score}`);
    console.log(`Text: ${bestMatch.chunk.texto}`);
  } else {
    console.log(`No match found`);
  }
}

test().catch(console.error);
