"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

import { NoteList } from "@/components/note-list";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterCards, questionsInNote, type NoteCard } from "@/lib/note";

const ALL = "all";

function shorten(question: string): string {
  return question.length > 24 ? `${question.slice(0, 24)}…` : question;
}

export function NoteBrowser({ cards }: { cards: NoteCard[] }) {
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState(ALL);

  const questions = useMemo(() => questionsInNote(cards), [cards]);

  // 고른 질문의 카드를 모두 지우면 그 질문도 노트에서 사라지므로 전체 질문으로 되돌린다.
  const selected = questions.includes(question) ? question : ALL;

  const visible = useMemo(
    () => filterCards(cards, { query, question: selected === ALL ? undefined : selected }),
    [cards, query, selected],
  );

  const filtering = query.trim().length > 0 || selected !== ALL;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="sm:flex-1">
          <FieldLabel htmlFor="note-query">노트에서 찾기</FieldLabel>
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="note-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, 저자, 기법 이름으로 찾습니다"
              className="pl-9"
            />
          </div>
        </Field>

        <Field className="sm:w-64">
          <FieldLabel htmlFor="note-question">어떤 질문에서</FieldLabel>
          <Select value={selected} onValueChange={(value) => setQuestion(value ?? ALL)}>
            <SelectTrigger id="note-question">
              <SelectValue>
                {(value: string) => (value === ALL ? "전체 질문" : shorten(value))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-w-[min(20rem,90vw)]">
              <SelectGroup>
                <SelectItem value={ALL}>전체 질문</SelectItem>
                {questions.map((item) => (
                  <SelectItem key={item} value={item} className="block truncate">
                    {shorten(item)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtering ? `${cards.length}건 중 ${visible.length}건` : `${cards.length}건`}
      </p>

      {filtering && visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-foreground/15 px-4 py-8 text-center text-sm text-muted-foreground">
          찾는 조건에 맞는 카드가 없습니다. 검색어를 줄이거나 질문을 전체로 되돌려 보세요.
        </p>
      ) : (
        <NoteList cards={visible} />
      )}
    </div>
  );
}
