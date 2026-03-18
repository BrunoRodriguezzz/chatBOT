import crypto from "crypto";

export class Jerarquia {
  constructor({ id, ruta_titulos, subtitulos = [], linea_md = 0, archivo_md = "" }) {
    this.id = id;
    this.ruta_titulos = [...ruta_titulos];
    this.subtitulos = [...subtitulos];
    this.linea_md = linea_md;
    this.archivo_md = archivo_md;
  }

  // Utiliza la cadena de títulos para generar un ID único y consistente.
  static generarId(ruta_titulos) {
    return crypto
      .createHash("sha256")
      .update(ruta_titulos.join("-"))
      .digest("hex")
      .substring(0, 16);
  }

  static create(ruta_titulos, linea_md = 0, archivo_md = "") {
    const id = Jerarquia.generarId(ruta_titulos);
    return new Jerarquia({ id, ruta_titulos, linea_md, archivo_md, subtitulos: [] });
  }

  agregarSubtitulo(subtitulo) {
    if (!this.subtitulos.includes(subtitulo)) {
      this.subtitulos.push(subtitulo);
    }
  }

  merge(other) {
    // Si la ruta o el archivo coincide, se actualizan las propiedades.
    // Generalmente para el merge de subtítulos
    const uniqueSubtitulos = new Set([
      ...this.subtitulos,
      ...other.subtitulos,
    ]);
    this.subtitulos = Array.from(uniqueSubtitulos);
    
    // Mantenemos la linea_md si está o si la 'other' es mejor.
    if (!this.linea_md && other.linea_md) {
      this.linea_md = other.linea_md;
      this.archivo_md = other.archivo_md;
    }
  }
}
