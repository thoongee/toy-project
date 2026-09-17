import { mergeCards, type CardApplication, type NoteCard } from "./note";
import { supabaseClient } from "./supabase";

type NoteCardRow = {
  paper_id: string;
  title: string | null;
  authors: string[] | null;
  published_at: string | null;
  venue: string | null;
  url: string | null;
  contribution: string | null;
  strengths: string | null;
  limitations: string | null;
  applications: CardApplication[] | null;
};

const CARD_COLUMNS =
  "paper_id, title, authors, published_at, venue, url, contribution, strengths, limitations, applications";

function toCard(row: NoteCardRow): NoteCard {
  return {
    paperId: row.paper_id,
    title: row.title ?? "",
    authors: row.authors ?? [],
    publishedAt: row.published_at ?? "",
    venue: row.venue ?? "",
    url: row.url ?? "",
    contribution: row.contribution ?? "",
    strengths: row.strengths ?? "",
    limitations: row.limitations ?? "",
    applications: row.applications ?? [],
  };
}

export async function readNote(): Promise<NoteCard[]> {
  const { data, error } = await supabaseClient()
    .from("note_cards")
    .select(CARD_COLUMNS)
    .order("updated_at", { ascending: true });

  if (error) throw new Error(`노트를 읽지 못했습니다: ${error.message}`);

  return ((data ?? []) as NoteCardRow[]).map(toCard);
}

export async function appendToNote(cards: NoteCard[]): Promise<void> {
  const { error } = await supabaseClient().rpc("append_note_cards", {
    cards: mergeCards([], cards),
  });

  if (error) throw new Error(`노트에 저장하지 못했습니다: ${error.message}`);
}
