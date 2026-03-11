import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { procesarMarkdown } from "../../../../models/utils/mdProcesamiento.js";
import { chunkRepository } from "../../../../models/repositories/chunkRepository.js";
import { jerarquiaRepository } from "../../../../models/repositories/jerarquiaRepository.js";

// Mock del archivo Markdown para pruebas
vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(
      async () => `# Proyecto Alpha

Este es el párrafo introductorio del proyecto.
Tiene dos líneas, pero el código las unirá.

## Configuración

Aquí explicamos cómo inicializar el sistema.

### Base de Datos

Las credenciales están en el archivo .env.
No compartas este archivo.`,
    ),
  },
}));

// Mock 'natural'
vi.mock("natural", () => {
  class TfIdf {
    constructor() {
      this.docs = [];
    }
    addDocument(doc) {
      this.docs.push(doc);
    }
    tfidfs(query, cb) {
      const normalizedQuery = query.toLowerCase();
      for (let i = 0; i < this.docs.length; i++) {
        const normalizedDoc = this.docs[i].toLowerCase();
        const score = normalizedDoc.includes(normalizedQuery) ? 1 : 0;
        cb(i, score);
      }
    }
  }
  return { default: { TfIdf } };
});

const mdFile = path.join(process.cwd(), "documentos", "proyecto-alpha.mock.md");

function generateId(text) {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex")
    .substring(0, 16);
}

describe("mdProcesamiento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chunkRepository.clear();
    jerarquiaRepository.clear();
  });

  it("procesarMarkdown guarda los chunks y la jerarquía esperada", async () => {
    const result = await procesarMarkdown(mdFile);
    expect(result).toBe(true);
    expect(fs.readFile).toHaveBeenCalledWith(mdFile, "utf-8");

    const chunks = chunkRepository.getAll();
    const jerarquia = jerarquiaRepository.getAll();

    const introParentId = generateId("Proyecto Alpha");
    const configParentId = generateId("Proyecto Alpha-Configuración");
    const databaseParentId = generateId(
      "Proyecto Alpha-Configuración-Base de Datos",
    );

    const expectedChunks = [
      {
        id: generateId(
          `${introParentId}-Este es el párrafo introductorio del proyecto. Tiene dos líneas, pero el código las unirá.-0`,
        ),
        id_padre: introParentId,
        texto:
          "Este es el párrafo introductorio del proyecto. Tiene dos líneas, pero el código las unirá.",
      },
      {
        id: generateId(
          `${configParentId}-Aquí explicamos cómo inicializar el sistema.-1`,
        ),
        id_padre: configParentId,
        texto: "Aquí explicamos cómo inicializar el sistema.",
      },
      {
        id: generateId(
          `${databaseParentId}-Las credenciales están en el archivo .env. No compartas este archivo.-2`,
        ),
        id_padre: databaseParentId,
        texto:
          "Las credenciales están en el archivo .env. No compartas este archivo.",
      },
    ];

    const expectedJerarquia = {
      [introParentId]: {
        ruta_titulos: ["Proyecto Alpha"],
        ids_chunks_hijos: [expectedChunks[0].id],
      },
      [configParentId]: {
        ruta_titulos: ["Proyecto Alpha", "Configuración"],
        ids_chunks_hijos: [expectedChunks[1].id],
      },
      [databaseParentId]: {
        ruta_titulos: ["Proyecto Alpha", "Configuración", "Base de Datos"],
        ids_chunks_hijos: [expectedChunks[2].id],
      },
    };

    expect(Array.isArray(chunks)).toBe(true);
    expect(chunks).toEqual(expectedChunks);
    expect(jerarquia).toEqual(expectedJerarquia);

    console.log("Chunks guardados:", JSON.stringify(chunks, null, 2));
    console.log("Jerarquia guardada:", JSON.stringify(jerarquia, null, 2));
  });

  it("findMostSimilar devuelve el chunk esperado para la consulta mockeada", async () => {
    await procesarMarkdown(mdFile);

    const best = chunkRepository.findMostSimilar("credenciales", 0);

    expect(best).not.toBeNull();
    if (best) {
      expect(best).toHaveProperty("score");
      expect(best).toHaveProperty("chunk");
      expect(best.score).toBe(1);
      expect(best.chunk.id_padre).toBe(
        generateId("Proyecto Alpha-Configuración-Base de Datos"),
      );
      expect(best.chunk.texto).toBe(
        "Las credenciales están en el archivo .env. No compartas este archivo.",
      );
    }
  });
});
