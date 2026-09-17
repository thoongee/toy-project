"use client";

import { useState, useTransition } from "react";
import { Trash } from "@phosphor-icons/react";

import { removeNoteCard } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { NoteCard } from "@/lib/note";

export function DeleteCardButton({ card }: { card: NoteCard }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setMessage(null);
    startTransition(async () => {
      const result = await removeNoteCard(card.paperId);

      // 지운 카드는 곧 목록에서 빠지지만, 확인 창은 여기서 직접 닫는다.
      if (result.status === "done") {
        setOpen(false);
        return;
      }
      setMessage(result.message);
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setMessage(null);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="ml-auto text-muted-foreground hover:text-destructive"
            aria-label="이 카드 지우기"
          />
        }
      >
        <Trash />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 카드를 지울까요?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{card.title}</span> 카드를 노트에서
            지웁니다. 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>그대로 두기</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>
            {pending ? <Spinner data-icon="inline-start" /> : <Trash data-icon="inline-start" />}
            지우기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
