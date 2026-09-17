import { describe, it, expect, vi, beforeEach } from "vitest";

const order = vi.fn();
const rpc = vi.fn();
const eq = vi.fn();

vi.mock("./supabase", () => ({
  supabaseClient: () => ({
    from: () => ({ select: () => ({ order }), delete: () => ({ eq }) }),
    rpc,
  }),
}));

import { appendToNote, readNote, removeFromNote } from "./note-store";
import type { NoteCard } from "./note";

function card(paperId: string, question: string): NoteCard {
  return {
    paperId,
    title: "제목",
    authors: ["저자"],
    publishedAt: "2024-03-15",
    venue: "cs.LG",
    url: `https://arxiv.org/abs/${paperId}`,
    contribution: "기여",
    strengths: "강점",
    limitations: "한계",
    applications: [
      { question, reason: "이유", application: "적용", createdAt: "2026-09-17T00:00:00.000Z" },
    ],
  };
}

beforeEach(() => {
  order.mockReset();
  rpc.mockReset();
  eq.mockReset();
  rpc.mockResolvedValue({ error: null });
  eq.mockResolvedValue({ error: null });
});

describe("readNote", () => {
  it("저장된 카드가 없으면 빈 배열을 돌려준다", async () => {
    order.mockResolvedValue({ data: [], error: null });

    await expect(readNote()).resolves.toEqual([]);
  });

  it("테이블의 행을 카드 모양으로 바꾼다", async () => {
    order.mockResolvedValue({
      data: [
        {
          paper_id: "2401.00001",
          title: "제목",
          authors: ["저자"],
          published_at: "2024-03-15",
          venue: "cs.LG",
          url: "https://arxiv.org/abs/2401.00001",
          contribution: "기여",
          strengths: "강점",
          limitations: "한계",
          applications: [],
        },
      ],
      error: null,
    });

    const [read] = await readNote();

    expect(read.paperId).toBe("2401.00001");
    expect(read.publishedAt).toBe("2024-03-15");
    expect(read.authors).toEqual(["저자"]);
  });

  it("읽기가 실패하면 오류를 알린다", async () => {
    order.mockResolvedValue({ data: null, error: { message: "권한이 없습니다" } });

    await expect(readNote()).rejects.toThrow("권한이 없습니다");
  });
});

describe("appendToNote", () => {
  it("한 번에 들어온 같은 논문은 하나로 합쳐서 보낸다", async () => {
    await appendToNote([card("2401.00001", "첫 질문"), card("2401.00001", "두 번째 질문")]);

    const [, payload] = rpc.mock.calls[0];
    expect(payload.cards).toHaveLength(1);
    expect(payload.cards[0].applications).toHaveLength(2);
  });

  it("저장이 실패하면 오류를 알린다", async () => {
    rpc.mockResolvedValue({ error: { message: "함수를 찾지 못했습니다" } });

    await expect(appendToNote([card("2401.00001", "질문")])).rejects.toThrow(
      "함수를 찾지 못했습니다",
    );
  });
});

describe("removeFromNote", () => {
  it("논문 하나만 골라서 지운다", async () => {
    await removeFromNote("2401.00001");

    expect(eq).toHaveBeenCalledWith("paper_id", "2401.00001");
  });

  it("지우기가 실패하면 오류를 알린다", async () => {
    eq.mockResolvedValue({ error: { message: "권한이 없습니다" } });

    await expect(removeFromNote("2401.00001")).rejects.toThrow("권한이 없습니다");
  });
});
