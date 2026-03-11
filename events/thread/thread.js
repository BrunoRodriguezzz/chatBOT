import fs from "fs";
import { Events } from "discord.js";

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
        
      // Enviamos el mensaje de prueba al hilo
      await thread.send(`Gracias por tu mensaje: ${contenido}`);
    } catch (error) {
      console.error("Error al procesar el nuevo hilo:", error);
    }
  },
};
