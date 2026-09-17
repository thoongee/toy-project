# 노트가 로그인 없이 모두에게 공유됨

## 증상
노트는 Supabase `note_cards` 테이블 하나에 쌓이고, RLS 정책이 `anon` 역할에게 전체 읽기·쓰기를 열어둡니다. 배포 주소를 아는 사람은 누구나 남의 카드를 보고 자기 카드를 섞어 넣을 수 있습니다.

## 근거
`supabase/migrations/20260917000000_note_cards.sql`의 `note_cards_public_select`·`note_cards_public_insert`·`note_cards_public_update` 정책이 모두 `using (true)`입니다. 파일 저장(`.data/note.json`) 시절에도 노트는 전역 하나였으므로 이번 교체로 나빠진 것은 아니고, 같은 성격이 배포 환경에서 드러난 것입니다.

## 상태
Vercel 배포에서 `.data` 디렉터리를 만들지 못해 저장이 실패하던 문제를 푸는 범위에서, 사용자와 함께 "인증 없이 공용 노트"로 결정했습니다. 로그인과 사용자별 노트는 이번 범위에서 의도적으로 제외했습니다.

## 다음 단계
Supabase Auth(이메일·비밀번호)를 붙이고 `note_cards`에 `user_id` 컬럼을 더한 뒤, 정책을 `auth.uid() = user_id` 소유자 전용으로 좁힙니다. `append_note_cards` 함수의 충돌 키도 `paper_id` 단독에서 `(user_id, paper_id)`로 바꿔야 합니다. 기존 행은 소유자가 없으므로 이전 방법을 함께 정합니다.
