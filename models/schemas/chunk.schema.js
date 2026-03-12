import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // hash SHA-256 de 16 chars generado por generateId()
    },
    id_padre: {
      type: String,
      ref: "Jerarquia",
      required: true,
    },
    texto: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false, // deshabilitamos el ObjectId automático; usamos el hash como _id
    versionKey: false,
  },
);

export const ChunkModel = mongoose.model("Chunk", chunkSchema);
