import crypto from "crypto";

export class Chunk {
  constructor({ id, idJerarquia, texto }) {
    this.id = id;
    this.idJerarquia = idJerarquia;
    this.texto = texto;
  }

  static generarId(idJerarquia, texto, salt) {
    return crypto
      .createHash("sha256")
      .update(`${idJerarquia}-${texto}-${salt}`)
      .digest("hex")
      .substring(0, 16);
  }

  static create(idJerarquia, texto, salt) {
    const id = Chunk.generarId(idJerarquia, texto, salt);
    return new Chunk({ id, idJerarquia, texto });
  }
}
