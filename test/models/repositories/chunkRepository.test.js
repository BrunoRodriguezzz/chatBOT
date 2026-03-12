import { describe, it, expect, beforeEach } from "vitest";
import { chunkRepository } from "../../../models/repositories/chunkRepository.js";
import { Chunk } from "../../../models/entities/Chunk.js";

describe("ChunkRepository Navigation", () => {
  beforeEach(() => {
    chunkRepository.clear();
  });

  it("getPrevious and getNext work correctly", () => {
    const chunk1 = Chunk.create("hier1", "texto 1", 0);
    const chunk2 = Chunk.create("hier1", "texto 2", 1);
    const chunk3 = Chunk.create("hier2", "texto 3", 2);

    chunkRepository.addMany([chunk1, chunk2, chunk3]);

    expect(chunkRepository.getById(chunk1.id)).toEqual(chunk1);
    
    expect(chunkRepository.getPrevious(chunk1.id)).toBeNull();
    expect(chunkRepository.getNext(chunk1.id).id).toBe(chunk2.id);

    expect(chunkRepository.getPrevious(chunk2.id).id).toBe(chunk1.id);
    expect(chunkRepository.getNext(chunk2.id).id).toBe(chunk3.id);

    expect(chunkRepository.getPrevious(chunk3.id).id).toBe(chunk2.id);
    expect(chunkRepository.getNext(chunk3.id)).toBeNull();
  });

  it("getById returns the correct chunk", () => {
    const chunk = Chunk.create("hier1", "test", 0);
    chunkRepository.addMany([chunk]);
    expect(chunkRepository.getById(chunk.id).id).toBe(chunk.id);
    expect(chunkRepository.getById("nonexistent")).toBeUndefined();
  });
});
