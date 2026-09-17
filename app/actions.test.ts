import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const removeFromNote = vi.fn();
vi.mock("@/lib/note-store", () => ({
  appendToNote: vi.fn(),
  removeFromNote: (paperId: string) => removeFromNote(paperId),
}));

import { askAboutSituation, removeNoteCard } from "./actions";

describe("askAboutSituation", () => {
  it("상황이 비어 있으면 검색하지 않고 오류를 돌려준다", async () => {
    const formData = new FormData();
    formData.set("situation", "   ");

    const state = await askAboutSituation({ status: "idle" }, formData);

    expect(state.status).toBe("error");
  });
});

describe("removeNoteCard", () => {
  beforeEach(() => {
    removeFromNote.mockReset();
    removeFromNote.mockResolvedValue(undefined);
  });

  it("고른 논문을 노트에서 지운다", async () => {
    const result = await removeNoteCard("2403.05794v2");

    expect(removeFromNote).toHaveBeenCalledWith("2403.05794v2");
    expect(result.status).toBe("done");
  });

  it("어떤 카드인지 모르면 지우지 않는다", async () => {
    const result = await removeNoteCard("  ");

    expect(removeFromNote).not.toHaveBeenCalled();
    expect(result.status).toBe("error");
  });

  it("지우기가 실패하면 이유를 돌려준다", async () => {
    removeFromNote.mockRejectedValue(new Error("권한이 없습니다"));

    const result = await removeNoteCard("2403.05794v2");

    expect(result).toEqual({ status: "error", message: "권한이 없습니다" });
  });
});
