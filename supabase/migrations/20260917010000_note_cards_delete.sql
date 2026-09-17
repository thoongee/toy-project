-- 노트에서 카드를 지우려면 delete 권한이 있어야 한다.
-- 로그인이 없는 단계라 읽기·쓰기와 같은 범위로 anon에게 연다. 사용자별 분리는 인증 도입 시 다룬다.

drop policy if exists note_cards_public_delete on public.note_cards;
create policy note_cards_public_delete on public.note_cards
  for delete to anon, authenticated
  using (true);

grant delete on table public.note_cards to anon, authenticated;
