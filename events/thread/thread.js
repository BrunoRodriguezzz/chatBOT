import fs from "fs";
import { Events } from "discord.js";
import { jerarquiaRepository } from "../../models/repositories/jerarquiaRepository.js";
import { generarRespuestaJerarquia } from "../../models/utils/botMensajes.js";

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

      // TODO: Sanetizar el contenido del mensaje.
      const contenido = starterMessage.content;

      // resultado.jerarquia contiene la jerarquia más similar, resultado.score el puntaje
      const resultado = await jerarquiaRepository.findMostSimilar(contenido);
      if (!resultado) {
        console.log(
          `No se encontró un tema relacionado para el hilo: ${thread.name}`,
        );
        return;
      }

      const respuesta = await generarRespuestaJerarquia(resultado.jerarquia.id);
      starterMessage.reply(respuesta);
    } catch (error) {
      console.error("Error al procesar el nuevo hilo:", error);
    }
  },
};
