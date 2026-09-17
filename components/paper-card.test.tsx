import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { PaperCard } from "@/components/paper-card";
import type { NoteCard } from "@/lib/note";

const card: NoteCard = {
  paperId: "2403.05794v2",
  title: "Privacy-Preserving Diffusion Model Using Homomorphic Encryption",
  authors: ["Yaojian Chen", "Qiben Yan"],
  publishedAt: "2024-03-09",
  venue: "preprint",
  url: "https://arxiv.org/abs/2403.05794v2",
  contribution: "denoising 단계를 암호문 상태로 처리하는 HE-Diffusion을 제안합니다.",
  strengths: "baseline 대비 500배 빠릅니다.",
  limitations: "부분 암호화라 보호 범위가 전체 파이프라인은 아닙니다.",
  applications: [
    {
      question: "diffusion 구조에 동형암호를 적용한 논문이 있어?",
      reason: "diffusion의 denoising 단계를 암호문으로 처리합니다.",
      application: "DLLM 구현 시 부분 암호화 전략을 참고할 수 있습니다.",
      createdAt: "2026-09-17T00:00:00.000Z",
    },
    {
      question: "암호문 상태로 이미지 생성이 가능한가?",
      reason: "암호문 위에서 stable diffusion 추론을 수행합니다.",
      application: "생성 모델 PoC의 속도 기준선으로 쓸 수 있습니다.",
      createdAt: "2026-09-17T01:00:00.000Z",
    },
  ],
};

describe("PaperCard", () => {
  it("접힌 상태에서는 서지 정보와 쌓인 질문 수만 보여준다", () => {
    render(<PaperCard card={card} />);

    expect(screen.getByRole("heading", { name: card.title })).toBeInTheDocument();
    expect(screen.getByText(/Yaojian Chen/)).toBeInTheDocument();
    expect(screen.getByText("preprint")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("질문 2개")).toBeInTheDocument();

    expect(screen.queryByText(/denoising 단계를 암호문으로 처리합니다/)).not.toBeInTheDocument();
  });

  it("펼치면 선정 근거와 원문 링크까지 보여준다", () => {
    render(<PaperCard card={card} defaultOpen />);

    expect(screen.getByText(/denoising 단계를 암호문으로 처리합니다/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /arXiv 원문/ })).toHaveAttribute("href", card.url);
  });
});
