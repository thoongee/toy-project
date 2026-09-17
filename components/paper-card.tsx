"use client";

import { useState } from "react";
import { ArrowSquareOut, CaretDown } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import type { NoteCard } from "@/lib/note";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export function PaperCard({
  card,
  defaultOpen = false,
  action,
}: {
  card: NoteCard;
  defaultOpen?: boolean;
  // 카드를 쓰는 화면이 정하는 동작. 노트에서는 지우기 버튼이 들어온다.
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{card.publishedAt.slice(0, 4)}</Badge>
            <Badge variant="secondary">{card.venue}</Badge>
            <span className="text-xs text-muted-foreground">{card.publishedAt}</span>
            <span className="text-xs text-muted-foreground">arXiv:{card.paperId}</span>
            {action}
          </div>

          <CollapsibleTrigger
            className="group/trigger flex w-full items-start gap-3 text-left"
            aria-label={open ? "카드 접기" : "카드 펼치기"}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <CardTitle className="text-balance leading-snug">
                <h3>{card.title}</h3>
              </CardTitle>
              <CardDescription className="line-clamp-1">{card.authors.join(", ")}</CardDescription>
            </div>
            <span className="flex shrink-0 items-center gap-2 pt-0.5 text-xs text-muted-foreground">
              질문 {card.applications.length}개
              <CaretDown
                className={open ? "rotate-180 transition-transform" : "transition-transform"}
              />
            </span>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="flex flex-col gap-4 pt-3">
            <Detail label="핵심 기여">{card.contribution}</Detail>
            <Detail label="장점">{card.strengths}</Detail>
            <Detail label="한계">{card.limitations}</Detail>

            <Separator />

            <div className="flex flex-col gap-4">
              {card.applications.map((application) => (
                <div
                  key={application.createdAt + application.question}
                  className="flex flex-col gap-3"
                >
                  <p className="rounded-md bg-muted px-3 py-2 text-xs">
                    <span className="text-muted-foreground">질문 </span>
                    <span className="font-medium text-foreground">{application.question}</span>
                  </p>
                  <Detail label="선정 근거">{application.reason}</Detail>
                  <Detail label="이 질문에 적용할 수 있는 부분">{application.application}</Detail>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              arXiv 원문 보기
              <ArrowSquareOut />
            </a>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
