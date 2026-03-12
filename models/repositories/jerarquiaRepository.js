import { Jerarquia } from "../entities/Jerarquia.js";

class JerarquiaRepository {
  constructor() {
    this.jerarquia = {};
  }

  addMany(newJerarquia) {
    if (!newJerarquia || typeof newJerarquia !== "object") return;

    for (const [id, value] of Object.entries(newJerarquia)) {
      if (!(value instanceof Jerarquia)) continue;
      if (this.jerarquia[id]) {
        this.jerarquia[id].merge(value);
      } else {
        this.jerarquia[id] = value;
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
