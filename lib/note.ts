export type CardApplication = {
  question: string;
  reason: string;
  application: string;
  createdAt: string;
};

export type NoteCard = {
  paperId: string;
  title: string;
  authors: string[];
  publishedAt: string;
  venue: string;
  url: string;
  contribution: string;
  strengths: string;
  limitations: string;
  applications: CardApplication[];
};

export function mergeCards(existing: NoteCard[], incoming: NoteCard[]): NoteCard[] {
  const merged = existing.map((card) => ({ ...card, applications: [...card.applications] }));

  for (const card of incoming) {
    const known = merged.find((candidate) => candidate.paperId === card.paperId);
    if (known) {
      known.applications.push(...card.applications);
      continue;
    }
    merged.push({ ...card, applications: [...card.applications] });
  }

  return merged;
}

export type CardFilter = {
  query?: string;
  question?: string;
};

function searchableText(card: NoteCard): string {
  return [
    card.title,
    card.authors.join(" "),
    card.venue,
    card.paperId,
    card.contribution,
    card.strengths,
    card.limitations,
    ...card.applications.flatMap((item) => [item.question, item.reason, item.application]),
  ]
    .join("\n")
    .toLowerCase();
}

export function filterCards(cards: NoteCard[], filter: CardFilter): NoteCard[] {
  const query = filter.query?.trim().toLowerCase() ?? "";

  return cards.filter((card) => {
    if (filter.question && !card.applications.some((item) => item.question === filter.question)) {
      return false;
    }
    if (query.length > 0 && !searchableText(card).includes(query)) {
      return false;
    }
    return true;
  });
}

export function questionsInNote(cards: NoteCard[]): string[] {
  const seen = new Set<string>();
  for (const card of cards) {
    for (const application of card.applications) seen.add(application.question);
  }
  return [...seen];
}
