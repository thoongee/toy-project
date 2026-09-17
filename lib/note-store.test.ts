import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs/promises", () => {
  const fs = {
    readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  };
  return { ...fs, default: fs };
});

import { readNote } from "./note-store";

describe("readNote", () => {
  it("노트 파일이 아직 없으면 빈 배열을 돌려준다", async () => {
    await expect(readNote()).resolves.toEqual([]);
  });
});
