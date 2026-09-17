-- 노트 카드를 담는 공용 테이블.
-- 로그인이 없는 단계라 anon 역할이 읽고 쓴다. 사용자별 분리는 인증 도입 시 다룬다.

create table if not exists public.note_cards (
  paper_id text primary key,
  title text not null,
  authors text[] not null default '{}',
  published_at date,
  venue text not null default '',
  url text not null default '',
  contribution text not null default '',
  strengths text not null default '',
  limitations text not null default '',
  applications jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists note_cards_updated_at_idx on public.note_cards (updated_at);

-- 같은 논문이 다시 나오면 카드는 하나로 두고 적용할 수 있는 부분만 이어 붙인다.
-- 읽고 합쳐서 쓰는 대신 한 문장으로 처리해, 동시에 저장해도 카드가 유실되지 않는다.
create or replace function public.append_note_cards(cards jsonb)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.note_cards (
    paper_id, title, authors, published_at, venue, url,
    contribution, strengths, limitations, applications
  )
  select
    card ->> 'paperId',
    card ->> 'title',
    coalesce(array(select jsonb_array_elements_text(card -> 'authors')), '{}'),
    nullif(card ->> 'publishedAt', '')::date,
    coalesce(card ->> 'venue', ''),
    coalesce(card ->> 'url', ''),
    coalesce(card ->> 'contribution', ''),
    coalesce(card ->> 'strengths', ''),
    coalesce(card ->> 'limitations', ''),
    coalesce(card -> 'applications', '[]'::jsonb)
  from jsonb_array_elements(cards) as card
  on conflict (paper_id) do update
    set applications = note_cards.applications || excluded.applications,
        updated_at = now();
$$;

alter table public.note_cards enable row level security;

drop policy if exists note_cards_public_select on public.note_cards;
create policy note_cards_public_select on public.note_cards
  for select to anon, authenticated
  using (true);

drop policy if exists note_cards_public_insert on public.note_cards;
create policy note_cards_public_insert on public.note_cards
  for insert to anon, authenticated
  with check (true);

drop policy if exists note_cards_public_update on public.note_cards;
create policy note_cards_public_update on public.note_cards
  for update to anon, authenticated
  using (true)
  with check (true);

-- 새로 만든 테이블은 Data API에 자동으로 열리지 않으므로 권한을 직접 준다.
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.note_cards to anon, authenticated;
grant execute on function public.append_note_cards(jsonb) to anon, authenticated;
