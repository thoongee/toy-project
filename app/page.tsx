"use client";

import { useActionState } from "react";
import { MagnifyingGlass, WarningCircle, FileMagnifyingGlass } from "@phosphor-icons/react";

import { askAboutSituation, type AskState } from "@/app/actions";
import { PaperCard } from "@/components/paper-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE = "DLLM을 동형암호로 구현하려는데, diffusion 구조에 동형암호를 적용한 논문이 있어?";

export default function Home() {
  const [state, formAction, pending] = useActionState<AskState, FormData>(askAboutSituation, {
    status: "idle",
  });

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="situation">지금 하려는 일</FieldLabel>
            <Textarea
              id="situation"
              name="situation"
              rows={3}
              placeholder={EXAMPLE}
              defaultValue={state.status === "idle" ? "" : state.situation}
              disabled={pending}
            />
            <FieldDescription>
              검색 키워드가 아니라 상황을 그대로 적으세요. 검색 질의는 알아서 만듭니다.
            </FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner data-icon="inline-start" /> : <MagnifyingGlass data-icon="inline-start" />}
              논문 찾기
            </Button>
          </Field>
        </FieldGroup>
      </form>

      {pending ? <PendingResult /> : null}

      {!pending && state.status === "error" ? (
        <Alert variant="destructive">
          <WarningCircle />
          <AlertTitle>찾지 못했습니다</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {!pending && state.status === "done" ? <DoneResult state={state} /> : null}
    </div>
  );
}

function PendingResult() {
  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <p className="text-sm text-muted-foreground">
        검색 질의를 만들고 arXiv에서 초록을 읽는 중입니다.
      </p>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function DoneResult({ state }: { state: Extract<AskState, { status: "done" }> }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-medium">이렇게 찾았습니다</h2>
        <div className="flex flex-col gap-2">
          {state.plans.map((plan) => (
            <div key={plan.query} className="flex flex-col gap-1">
              <Badge variant="outline" className="w-fit font-mono text-xs">
                {plan.query}
              </Badge>
              <span className="text-xs text-muted-foreground">{plan.intent}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          후보 {state.candidateCount}건의 초록을 {state.model}이(가) 읽고 {state.cards.length}건을
          골랐습니다.
        </p>
      </section>

      {state.cards.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileMagnifyingGlass />
            </EmptyMedia>
            <EmptyTitle>고를 만한 논문이 없습니다</EmptyTitle>
            <EmptyDescription>
              후보 {state.candidateCount}건을 읽었지만 이 상황과 관련 있다고 근거를 댈 수 있는
              논문이 없었습니다. 개수를 채우지 않고 없다고 알려드립니다.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-xs text-muted-foreground">
              상황을 조금 더 구체적으로 적으면 검색 질의가 달라집니다.
            </p>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {state.cards.map((card) => (
            <PaperCard key={card.paperId} card={card} defaultOpen />
          ))}
        </div>
      )}
    </div>
  );
}
