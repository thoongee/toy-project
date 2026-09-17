import { Notebook } from "@phosphor-icons/react/dist/ssr";

import { DeleteCardButton } from "@/components/delete-card-button";
import { PaperCard } from "@/components/paper-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { NoteCard } from "@/lib/note";

export function NoteList({ cards }: { cards: NoteCard[] }) {
  if (cards.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Notebook />
          </EmptyMedia>
          <EmptyTitle>아직 쌓인 카드가 없습니다</EmptyTitle>
          <EmptyDescription>
            홈에서 지금 하려는 일을 적어 논문을 찾으면 여기에 카드가 남습니다.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {cards.map((card) => (
        <PaperCard key={card.paperId} card={card} action={<DeleteCardButton card={card} />} />
      ))}
    </div>
  );
}
