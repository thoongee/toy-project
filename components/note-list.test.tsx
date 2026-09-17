import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/app/actions", () => ({ removeNoteCard: vi.fn() }));

import { NoteList } from "@/components/note-list";
import type { NoteCard } from "@/lib/note";

const card: NoteCard = {
  paperId: "2403.05794v2",
  title: "Privacy-Preserving Diffusion Model Using Homomorphic Encryption",
  authors: ["Yaojian Chen"],
  publishedAt: "2024-03-09",
  venue: "preprint",
  url: "https://arxiv.org/abs/2403.05794v2",
  contribution: "denoising 단계를 암호문 상태로 처리합니다.",
  strengths: "baseline 대비 500배 빠릅니다.",
  limitations: "부분 암호화입니다.",
  applications: [
    {
      question: "diffusion 구조에 동형암호를 적용한 논문이 있어?",
      reason: "denoising을 암호문으로 처리합니다.",
      application: "부분 암호화 전략을 참고할 수 있습니다.",
      createdAt: "2026-09-17T00:00:00.000Z",
    },
  ],
};

describe("NoteList", () => {
  it("쌓인 카드가 없으면 아직 비어 있다고 알린다", () => {
    render(<NoteList cards={[]} />);

    expect(screen.getByText(/아직 쌓인 카드가 없습니다/)).toBeInTheDocument();
  });

  it("쌓인 카드를 목록으로 보여준다", () => {
    render(<NoteList cards={[card]} />);

    expect(screen.getByRole("heading", { name: card.title })).toBeInTheDocument();
  });

  it("카드마다 지우기를 두고, 누르면 먼저 확인을 받는다", () => {
    render(<NoteList cards={[card]} />);

    fireEvent.click(screen.getByRole("button", { name: "이 카드 지우기" }));

    expect(screen.getByText("이 카드를 지울까요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지우기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "그대로 두기" })).toBeInTheDocument();
  });
});
