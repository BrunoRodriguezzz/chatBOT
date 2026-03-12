import fs from "fs";
import { Events } from "discord.js";
import { chunkRepository } from "../../models/repositories/chunkRepository.js";
import { generarRespuestaChunk } from "../../models/utils/botMensajes.js";

const roles = JSON.parse(
  await fs.promises.readFile(
    new URL("../../models/roles.json", import.meta.url),
    "utf8",
  ),
);

export default {
  name: Events.ThreadCreate,
  async execute(thread) {
    try {
      const starterMessage = await thread.fetchStarterMessage();

      // TODO: Definir que canal es el que queremos escuchar, de momento aplica a todos. (Podriamos chequear que sea un foro)
      if (!starterMessage) return;

      const contenido = starterMessage.content;

      // resultado.chunk contiene el chunk más similar, resultado.score el puntaje
      const resultado = await chunkRepository.findMostSimilar(contenido);
      if (!resultado) {
        console.log(
          `No se encontró un tema relacionado para el hilo: ${thread.name}`,
        );
        return;
      }

      const respuesta = generarRespuestaChunk(resultado.chunk.id);
      starterMessage.reply(respuesta);
    } catch (error) {
      console.error("Error al procesar el nuevo hilo:", error);
    }
  },
};
