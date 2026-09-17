import { NoteBrowser } from "@/components/note-browser";
import { NoteList } from "@/components/note-list";
import { readNote } from "@/lib/note-store";

export const dynamic = "force-dynamic";

export default async function NotePage() {
  const cards = await readNote();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-medium">노트</h1>
        <p className="text-sm text-muted-foreground">
          카드는 접혀 있습니다. 제목을 눌러 펼치세요. 같은 논문이 다른 질문에서 다시 나오면 카드는
          하나로 유지되고 적용할 수 있는 부분만 늘어납니다.
        </p>
      </div>
      {cards.length === 0 ? <NoteList cards={cards} /> : <NoteBrowser cards={cards} />}
    </div>
  );
}
