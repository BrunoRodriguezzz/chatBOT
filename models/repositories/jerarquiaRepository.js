/**
 * Repositorio en memoria para la estructura jerárquica de los datos.
 */
class JerarquiaRepository {
  constructor() {
    this.jerarquia = {};
  }

  addMany(newJerarquia) {
    if (!newJerarquia || typeof newJerarquia !== "object") return;

    for (const [id, value] of Object.entries(newJerarquia)) {
      if (this.jerarquia[id]) {
        const uniqueHijos = new Set([
          ...this.jerarquia[id].ids_chunks_hijos,
          ...(value.ids_chunks_hijos || []),
        ]);
        this.jerarquia[id] = {
          ...this.jerarquia[id],
          ...value,
          ids_chunks_hijos: Array.from(uniqueHijos),
        };
      } else {
        this.jerarquia[id] = { ...value };
      }
    }
  }

  getById(id) {
    return this.jerarquia[id] ? { ...this.jerarquia[id] } : undefined;
  }

  getAll() {
    const copy = {};
    for (const id in this.jerarquia) {
      copy[id] = { ...this.jerarquia[id] };
    }
    return copy;
  }

  clear() {
    this.jerarquia = {};
  }
}

export const jerarquiaRepository = new JerarquiaRepository();
export { JerarquiaRepository };
