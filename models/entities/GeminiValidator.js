import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializamos el cliente fuera de la función para no repetir este paso en cada mensaje
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GeminiValidator = async (message) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // TODO: Separar el canal y las reglas para obtener el canal del mensaje y aplicar reglas que conozcamos segun el canal.
    const prompt = `
      Eres un moderador estricto de un servidor de Discord de la facultad.
      Estás analizando mensajes en el canal "#dudas-trabajos-practicos".
      
      Reglas del canal:
      - SOLO se permite hablar sobre código, consignas de los TPs, errores de compilación o lógica.
      - NO se permite preguntar por notas, fechas de exámenes, asistencia o temas administrativos.

      Mensaje a evaluar: "${message.content}"

      Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional:
      {
        "corresponde": true o false,
        "razon": "Breve explicación de 1 línea de por qué corresponde o no"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const evaluacion = JSON.parse(responseText);

    return evaluacion; 
  } catch (error) {
    console.error("Error al validar con Gemini:", error);
    return { corresponde: true, razon: "Fallo en la validación por API." };
  }
};