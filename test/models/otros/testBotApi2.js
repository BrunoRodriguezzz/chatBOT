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
  const response = await chunkRepository.nlpManager.process("es", msg);

  // Show top 3 intents
  const topIntents = response.classifications.slice(0, 3);
  for (const intentObj of topIntents) {
    const chunk = chunkRepository.chunks.find((c) => c.id === intentObj.intent);
    console.log(
      `Score: ${intentObj.score.toFixed(3)} | Text: ${chunk ? chunk.texto : "Unknown"}`,
    );
  }
}

test().catch(console.error);
