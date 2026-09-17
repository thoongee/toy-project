import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

export type PaperInput = {
  id: string;
  title: string;
  abstract: string;
};

export type SearchPlan = {
  query: string;
  intent: string;
};

export type Curation = {
  paperId: string;
  contribution: string;
  strengths: string;
  limitations: string;
  application: string;
  reason: string;
};

// 비용을 예측 가능하게 두려고 Haiku로 고정합니다. 바꾸려면 여기만 고칩니다.
const CURATION_MODEL = "claude-haiku-4-5";

function model() {
  return anthropic(CURATION_MODEL);
}

const planSchema = z.object({
  queries: z
    .array(
      z.object({
        query: z.string().describe("arXiv API search_query 문법에 맞는 질의"),
        intent: z.string().describe("이 질의가 무엇을 노리는지 한국어 한 문장"),
      }),
    )
    .min(1)
    .max(3),
});

const curationSchema = z.object({
  selections: z.array(
    z.object({
      paperId: z.string().describe("후보 목록에 있던 id를 그대로"),
      contribution: z.string().describe("핵심 기여, 한국어 1~2문장"),
      strengths: z.string().describe("장점, 한국어 1~2문장"),
      limitations: z.string().describe("한계나 주의점, 한국어 1~2문장"),
      application: z
        .string()
        .describe(
          "질문자의 상황에 적용할 수 있는 부분. 반드시 한국어 두 문장. " +
            "첫 문장은 이 논문의 어느 기법·구조·수치를 가져다 쓸 수 있는지 이름을 대고, " +
            "둘째 문장은 질문자의 작업 어디에 어떻게 넣는지 또는 무엇부터 확인해야 하는지 씁니다.",
        ),
      reason: z.string().describe("이 논문을 고른 근거, 한국어 한 문장"),
    }),
  ),
});

const WRITING_RULES = `설명은 한국어로 쓰되 기술 용어는 원문 표기를 유지합니다.
예: bootstrapping, CKKS, ReLU, polynomial approximation은 번역하지 않습니다.`;

export async function planSearches(situation: string): Promise<SearchPlan[]> {
  const { object } = await generateObject({
    model: model(),
    schema: planSchema,
    system: `당신은 동형암호(homomorphic encryption) 분야 연구자의 논문 검색을 돕습니다.
연구자가 지금 하려는 일을 설명하면, arXiv API에 던질 검색 질의를 1~3개 만듭니다.

arXiv search_query 문법:
- 필드 접두사: ti(제목), abs(초록), au(저자), cat(분류), all(전체)
- 구 검색은 큰따옴표: abs:"homomorphic encryption"
- 결합: AND, OR, ANDNOT. 괄호로 묶을 수 있습니다.

질의 설계 원칙:
- 질의 하나는 좁게 잡고, 여러 개로 각도를 나눕니다. 단일 질의는 결과가 2~3건에 그치는 경우가 많습니다.
- 동형암호 분야 질의라면 abs:"homomorphic encryption" 또는 abs:FHE 같은 항을 포함해 범위를 잡습니다.
- 질문에 등장한 구체 기술(diffusion, transformer, bootstrapping 등)을 별도 항으로 결합합니다.
- 질문이 동형암호와 무관해 보이면 억지로 동형암호를 끼워넣지 말고, 질문 그대로의 주제로 질의를 만듭니다.

${WRITING_RULES}`,
    prompt: `연구자의 상황:\n${situation}`,
  });

  return object.queries;
}

export async function curatePapers(
  situation: string,
  papers: PaperInput[],
  limit = 5,
): Promise<Curation[]> {
  if (papers.length === 0) return [];

  const candidates = papers
    .map((paper) => `## id: ${paper.id}\n제목: ${paper.title}\n초록: ${paper.abstract}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: model(),
    schema: curationSchema,
    system: `당신은 동형암호 연구자의 논문 선별을 돕습니다.
후보 논문의 초록을 읽고, 연구자가 지금 하려는 일에 실제로 쓸모 있는 것만 고릅니다.

반드시 지킬 것:
- 관련이 있다고 근거를 댈 수 없는 논문은 고르지 않습니다. 개수를 채우려고 느슨하게 관련된 논문을 넣지 마십시오.
- 쓸모 있는 논문이 하나도 없으면 selections를 빈 배열로 두십시오. 그것이 정상적인 결과입니다.
- 최대 ${limit}건까지만 고릅니다. 그보다 적어도 괜찮습니다.
- paperId는 후보 목록에 있는 id를 그대로 씁니다.
- 초록에 없는 수치나 사실을 지어내지 마십시오. 초록이 밝히지 않은 한계는 "초록만으로는 확인되지 않습니다"라고 쓰십시오.

application 항목은 이 도구에서 가장 중요한 칸이므로 두 문장으로 구체적으로 씁니다.
- "참고할 수 있습니다", "도움이 됩니다" 같은 두루뭉술한 문장은 쓰지 마십시오.
- 첫 문장에서 논문의 기법·구조·수치를 이름으로 지목합니다. 예: "SPRU bootstrapping의 sparse roots of unity 임베딩으로 multiplicative depth를 줄이는 방식".
- 둘째 문장에서 질문자의 작업 어디에 들어가는지, 또는 적용 전에 무엇부터 확인해야 하는지 씁니다. 초록에 근거가 없으면 "초록에 없어 직접 확인이 필요합니다"라고 밝힙니다.

${WRITING_RULES}`,
    prompt: `연구자의 상황:\n${situation}\n\n후보 논문:\n\n${candidates}`,
  });

  const known = new Set(papers.map((paper) => paper.id));
  return object.selections.filter((selection) => known.has(selection.paperId)).slice(0, limit);
}

export function curationModelName(): string {
  return CURATION_MODEL;
}
