import crypto from "crypto";

export class Jerarquia {
  constructor({ id, ruta_titulos, ids_chunks_hijos = [] }) {
    this.id = id;
    this.ruta_titulos = [...ruta_titulos];
    this.ids_chunks_hijos = [...ids_chunks_hijos];
  }

  static generarId(ruta_titulos) {
    return crypto
      .createHash("sha256")
      .update(ruta_titulos.join("-"))
      .digest("hex")
      .substring(0, 16);
  }

  static create(ruta_titulos) {
    const id = Jerarquia.generarId(ruta_titulos);
    return new Jerarquia({ id, ruta_titulos });
  }

  agregarHijo(chunkId) {
    if (!this.ids_chunks_hijos.includes(chunkId)) {
      this.ids_chunks_hijos.push(chunkId);
    }
  }

  merge(other) {
    const uniqueHijos = new Set([
      ...this.ids_chunks_hijos,
      ...other.ids_chunks_hijos,
    ]);
    this.ids_chunks_hijos = Array.from(uniqueHijos);
    this.ruta_titulos = [...other.ruta_titulos];
  }
}
