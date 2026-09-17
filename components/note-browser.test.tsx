import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { NoteBrowser } from "@/components/note-browser";
import type { NoteCard } from "@/lib/note";

function card(overrides: Partial<NoteCard> = {}): NoteCard {
  return {
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
    ...overrides,
  };
}

const diffusion = card();
const bootstrapping = card({
  paperId: "2607.27401v1",
  title: "Low-Latency Bootstrapping for CKKS using Roots of Unity",
  authors: ["Jean-Sebastien Coron"],
  contribution: "SPRU bootstrapping으로 multiplicative depth를 줄입니다.",
});

describe("NoteBrowser", () => {
  it("검색어를 넣으면 맞는 카드만 남는다", () => {
    render(<NoteBrowser cards={[diffusion, bootstrapping]} />);

    expect(screen.getByRole("heading", { name: diffusion.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: bootstrapping.title })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/찾기/), { target: { value: "bootstrapping" } });

    expect(screen.queryByRole("heading", { name: diffusion.title })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: bootstrapping.title })).toBeInTheDocument();
  });

  it("검색 결과가 없으면 노트가 빈 것과 다르게 알린다", () => {
    render(<NoteBrowser cards={[diffusion]} />);

    fireEvent.change(screen.getByLabelText(/찾기/), { target: { value: "존재하지않는말" } });

    expect(screen.getByText(/찾는 조건에 맞는 카드가 없습니다/)).toBeInTheDocument();
  });
});
