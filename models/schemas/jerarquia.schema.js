import mongoose from "mongoose";

const jerarquiaSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // hash SHA-256 de 16 chars generado por generateId() sobre la ruta_titulos
    },
    // Ruta completa de títulos desde la raíz hasta este nodo.
    // Ej: ["General", "Introducción", "Subtema A"]
    ruta_titulos: {
      type: [String],
      required: true,
    },
    ids_chunks_hijos: {
      type: [String],
      ref: "Chunk",
      default: [],
    },
  },
  {
    _id: false, // deshabilitamos el ObjectId automático; usamos el hash como _id
    versionKey: false,
  },
);

export const JerarquiaModel = mongoose.model("Jerarquia", jerarquiaSchema);
