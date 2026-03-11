import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Events, GatewayIntentBits } from "discord.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Carga de eventos desde la carpeta "events"
const eventsPath = path.join(__dirname, "events");
async function loadEvents(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await loadEvents(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    // Skip test files and specs to avoid importing test runners (vitest, jest)
    if (entry.name.endsWith(".test.js") || entry.name.endsWith(".spec.js"))
      continue;
    try {
      const fileUrl = pathToFileURL(fullPath).href;
      const { default: event } = await import(fileUrl);
      if (!event || !event.name || !event.execute) continue;
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    } catch (err) {
      console.error(`Error loading event file ${fullPath}:`, err);
    }
  }
}

await loadEvents(eventsPath);

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);
