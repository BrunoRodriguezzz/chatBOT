import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export async function cargarEventos(dir, client) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await cargarEventos(fullPath, client);
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
