import { describe, it, expect } from "vitest";
import { filterCards, mergeCards, type NoteCard } from "./note";

function card(overrides: Partial<NoteCard> = {}): NoteCard {
  return {
    paperId: "2403.05794v2",
    title: "Privacy-Preserving Diffusion Model Using Homomorphic Encryption",
    authors: ["Yaojian Chen", "Qiben Yan"],
    publishedAt: "2024-03-09",
    venue: "preprint",
    url: "https://arxiv.org/abs/2403.05794v2",
    contribution: "denoising 단계를 암호문 상태로 처리하는 HE-Diffusion을 제안합니다.",
    strengths: "baseline 대비 500배 빠릅니다.",
    limitations: "부분 암호화라 보호 범위가 전체 파이프라인은 아닙니다.",
    applications: [],
    ...overrides,
  };
}

describe("mergeCards", () => {
  it("같은 논문이 다른 질문에서 다시 선정되면 카드를 하나로 유지하고 적용 부분만 쌓는다", () => {
    const existing = [
      card({
        applications: [
          {
            question: "diffusion 구조에 동형암호를 적용한 논문이 있어?",
            reason: "diffusion의 denoising 단계를 암호문으로 처리합니다.",
            application: "DLLM 구현 시 부분 암호화 전략을 참고할 수 있습니다.",
            createdAt: "2026-09-17T00:00:00.000Z",
          },
        ],
      }),
    ];

    const incoming = [
      card({
        applications: [
          {
            question: "암호문 상태에서 이미지 생성이 가능한가?",
            reason: "암호문 위에서 stable diffusion 추론을 수행합니다.",
            application: "생성 모델 PoC의 속도 기준선으로 쓸 수 있습니다.",
            createdAt: "2026-09-17T01:00:00.000Z",
          },
        ],
      }),
    ];

    const merged = mergeCards(existing, incoming);

    expect(merged).toHaveLength(1);
    expect(merged[0].applications.map((item) => item.question)).toEqual([
      "diffusion 구조에 동형암호를 적용한 논문이 있어?",
      "암호문 상태에서 이미지 생성이 가능한가?",
    ]);
  });
});

describe("filterCards", () => {
  const bootstrapping = card({
    paperId: "2607.27401v1",
    title: "Low-Latency Bootstrapping for CKKS using Roots of Unity",
    authors: ["Jean-Sebastien Coron"],
    contribution: "SPRU bootstrapping으로 multiplicative depth를 줄입니다.",
    applications: [
      {
        question: "CKKS bootstrapping 속도를 개선한 최근 연구가 궁금해",
        reason: "bootstrapping latency를 5배 개선합니다.",
        application: "OpenFHE 구현이 있어 바로 확인할 수 있습니다.",
        createdAt: "2026-09-17T02:00:00.000Z",
      },
    ],
  });

  const diffusion = card({
    applications: [
      {
        question: "diffusion 구조에 동형암호를 적용한 논문이 있어?",
        reason: "denoising 단계를 암호문으로 처리합니다.",
        application: "부분 암호화 전략을 참고할 수 있습니다.",
        createdAt: "2026-09-17T00:00:00.000Z",
      },
    ],
  });

  it("검색어가 제목이나 본문에 있는 카드만 남긴다", () => {
    const found = filterCards([diffusion, bootstrapping], { query: "bootstrapping" });

    expect(found.map((item) => item.paperId)).toEqual(["2607.27401v1"]);
  });

  it("질문을 고르면 그 질문에서 나온 카드만 남긴다", () => {
    const found = filterCards([diffusion, bootstrapping], {
      question: "diffusion 구조에 동형암호를 적용한 논문이 있어?",
    });

    expect(found.map((item) => item.paperId)).toEqual(["2403.05794v2"]);
  });
});
