import dotenv from "dotenv";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { cargarEventos } from "./models/utils/cargarEventos.js";
import { cargarDocumentos } from "./models/utils/cargarDocumentos.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asignamos permisos
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Carga de eventos desde la carpeta "events"
const eventsPath = path.join(__dirname, "events");
await cargarEventos(eventsPath, client);

// Carga de documentos inicial
const docsPath = path.join(__dirname, "documentos");
await cargarDocumentos(docsPath);

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);
