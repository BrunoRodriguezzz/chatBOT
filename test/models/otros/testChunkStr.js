import { procesarMarkdown } from "../../../models/utils/mdProcesamiento.js";
import { chunkRepository } from "../../../models/repositories/chunkRepository.js";
import { jerarquiaRepository } from "../../../models/repositories/jerarquiaRepository.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  await procesarMarkdown(
    path.join(__dirname, "documentos", "contextoPrueba.md"),
  );

  // Right now, chunkRepository creates addDocument(chunk.texto).
  // But chunk.texto of the desired result is:
  // "Las interrupciones son señales que indican al CPU que hay un evento que requieren de atención. Pueden ser enmascarables (ignorables). Interrupciones sincrónicas: Excepciones, errores que se dan en ejecución. Interrupciones asíncronas: Dispositivo externo a la CPU"
  // Wait, does mdProcesamiento join the title with the paragraph?
  // Let's print out the chunk's text and its parent title.

  const desiredChunkTextFragment = "Las interrupciones son señales que indican";
  const chunks = chunkRepository.getAll();
  const chunkMatch = chunks.find((c) =>
    c.texto.includes(desiredChunkTextFragment),
  );

  console.log("Chunk:", chunkMatch);

  const jerarquia = jerarquiaRepository.getAll();
  const parent = jerarquia[chunkMatch.idJerarquia];
  console.log("Jerarquia:", parent.ruta_titulos);

  // Notice that "mdProcesamiento.js" stores the titles only in Jerarquia.
  // `chunkRepository.nlpManager` only got trained on `chunk.texto`.
  // If the word "Interrupción" is the title of the section, it is MISSING from `chunk.texto` entirely (except its plural "interrupciones" at the start).
}

test().catch(console.error);
