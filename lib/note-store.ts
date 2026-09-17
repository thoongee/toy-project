import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { mergeCards, type NoteCard } from "./note";

const NOTE_DIRECTORY = path.join(process.cwd(), ".data");
const NOTE_FILE = path.join(NOTE_DIRECTORY, "note.json");

export async function readNote(): Promise<NoteCard[]> {
  try {
    const raw = await readFile(NOTE_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NoteCard[]) : [];
  } catch {
    return [];
  }
}

export async function appendToNote(cards: NoteCard[]): Promise<NoteCard[]> {
  const merged = mergeCards(await readNote(), cards);
  await mkdir(NOTE_DIRECTORY, { recursive: true });
  await writeFile(NOTE_FILE, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}
