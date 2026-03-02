import { randomInt } from "crypto";
import { Events } from "discord.js";
import { GeminiValidator } from "../models/entities/GeminiValidator.js";
import fs from 'fs';

const roles = JSON.parse(
  await fs.promises.readFile(new URL('../models/roles.json', import.meta.url), 'utf8'),
);

export default {
  name: Events.MessageCreate,
  async execute(message) {
    console.log(
      `Message received: ${message.content}, from: ${message.author.tag}`,
    );
    if (message.author.bot) return; // Ignoramos mensajes de bots

    // Ver roles del autor del mensaje (si es un miembro de un servidor)
    //console.log(message.member ? 'Roles:' + message.member.roles.cache.map(role => role.name + ' (' + role.id + ')').join(', ') : 'No member info');

    if (
      message.member &&
      message.member.roles.cache.some((role) => role.id == roles.profesor)
    )
      return; // Ignoramos mensajes de usuarios con el rol de "profesor"
    else {
      // Es el mensaje de un alumno -> lo moderamos
      const evaluacion = await GeminiValidator(message);

      if (!evaluacion.corresponde) {
        // Borramos el mensaje
        await message.delete();

        // Le avisamos al alumno por privado
        await message.author.send(
          `Hola! Tu mensaje en el canal de dudas fue eliminado. Motivo: ${evaluacion.razon}. Por favor, hacé tu consulta en el canal correspondiente.`,
        );
        console.log(
          `Mensaje eliminado a ${message.author.tag}: ${evaluacion.razon}`,
        );
      } else {
        console.log(`Mensaje aprobado: ${message.content}`);
      }
    }
  },
};
