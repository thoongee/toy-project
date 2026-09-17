"use server";

import { revalidatePath } from "next/cache";

import { dedupePapers, searchArxiv, type ArxivPaper } from "@/lib/arxiv";
import { curatePapers, curationModelName, planSearches, type SearchPlan } from "@/lib/curation";
import type { NoteCard } from "@/lib/note";
import { appendToNote } from "@/lib/note-store";

export type AskState =
  | { status: "idle" }
  | {
      status: "done";
      situation: string;
      plans: SearchPlan[];
      candidateCount: number;
      cards: NoteCard[];
      model: string;
    }
  | { status: "error"; situation: string; message: string };

export async function askAboutSituation(
  _previous: AskState,
  formData: FormData,
): Promise<AskState> {
  const situation = String(formData.get("situation") ?? "").trim();

  if (situation.length === 0) {
    return { status: "error", situation, message: "지금 하려는 일을 한 문장 이상 적어주세요." };
  }

  try {
    const plans = await planSearches(situation);
    const groups = await Promise.all(plans.map((plan) => searchArxiv(plan.query)));
    const candidates = dedupePapers(groups);

    const curations = await curatePapers(situation, candidates);
    const byId = new Map<string, ArxivPaper>(candidates.map((paper) => [paper.id, paper]));
    const createdAt = new Date().toISOString();

    const cards: NoteCard[] = curations.flatMap((curation) => {
      const paper = byId.get(curation.paperId);
      if (!paper) return [];
      return [
        {
          paperId: paper.id,
          title: paper.title,
          authors: paper.authors,
          publishedAt: paper.publishedAt,
          venue: paper.venue,
          url: paper.url,
          contribution: curation.contribution,
          strengths: curation.strengths,
          limitations: curation.limitations,
          applications: [
            {
              question: situation,
              reason: curation.reason,
              application: curation.application,
              createdAt,
            },
          ],
        },
      ];
    });

    if (cards.length > 0) {
      await appendToNote(cards);
      revalidatePath("/note");
    }

    return {
      status: "done",
      situation,
      plans,
      candidateCount: candidates.length,
      cards,
      model: curationModelName(),
    };
  } catch (error) {
    return {
      status: "error",
      situation,
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
