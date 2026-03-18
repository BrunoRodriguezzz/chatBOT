import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { procesarMarkdown, leerSeccionMarkdown } from "../../../../models/utils/mdProcesamiento.js";
import { jerarquiaRepository } from "../../../../models/repositories/jerarquiaRepository.js";
import { Jerarquia } from "../../../models/entities/Jerarquia.js";

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
No compartas este archivo.`
    ),
  },
}));

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
    jerarquiaRepository.clear();
  });

  it("procesarMarkdown guarda la jerarquía esperada con subtítulos y líneas", async () => {
    const result = await procesarMarkdown(mdFile);
    expect(result).toBe(true);
    expect(fs.readFile).toHaveBeenCalledWith(mdFile, "utf-8");

    const jerarquias = jerarquiaRepository.getAll();

    const generalId = generateId("General-Inicio");
    const introParentId = generateId("Proyecto Alpha");
    const configParentId = generateId("Proyecto Alpha-Configuración");
    const databaseParentId = generateId(
      "Proyecto Alpha-Configuración-Base de Datos"
    );

    const expectedJerarquia = {
      [generalId]: {
        id: generalId,
        ruta_titulos: ["General", "Inicio"],
        subtitulos: ["Proyecto Alpha"],
        linea_md: 1,
        archivo_md: mdFile,
      },
      [introParentId]: {
        id: introParentId,
        ruta_titulos: ["Proyecto Alpha"],
        subtitulos: ["Configuración"],
        linea_md: 1,
        archivo_md: mdFile,
      },
      [configParentId]: {
        id: configParentId,
        ruta_titulos: ["Proyecto Alpha", "Configuración"],
        subtitulos: ["Base de Datos"],
        linea_md: 6,
        archivo_md: mdFile,
      },
      [databaseParentId]: {
        id: databaseParentId,
        ruta_titulos: ["Proyecto Alpha", "Configuración", "Base de Datos"],
        subtitulos: [],
        linea_md: 10,
        archivo_md: mdFile,
      },
    };

    expect(jerarquias).toEqual(expectedJerarquia);
  });

  it("findMostSimilar devuelve la jerarquía esperada para la consulta mockeada", async () => {
    await procesarMarkdown(mdFile);
    await jerarquiaRepository.train();

    const best = await jerarquiaRepository.findMostSimilar("base datos config", 0);

    expect(best).not.toBeNull();
    if (best) {
      expect(best).toHaveProperty("score");
      expect(best).toHaveProperty("jerarquia");
      expect(best.score).toBeGreaterThan(0);
      expect(best.jerarquia.id).toBe(
        generateId("Proyecto Alpha-Configuración-Base de Datos")
      );
    }
  });

  it("leerSeccionMarkdown lee la sección correcta", async () => {
    // startLine es 10 para 'Base de Datos'
    const texto = await leerSeccionMarkdown(mdFile, 10);
    expect(texto).toContain("Las credenciales están en el archivo .env.");
    expect(texto).not.toContain("Aquí explicamos cómo inicializar el sistema.");
  });
});

