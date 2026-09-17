# 검색 질의 중복 시 React key 충돌

## 증상
`planSearches`가 같은 query 문자열을 두 항목으로 반환하면 결과 화면의 질의 목록에서 React key가 중복돼, 경고가 나고 두 항목 중 하나의 intent 문구가 잘못 표시될 수 있습니다.

## 근거
`app/page.tsx`에서 질의 목록의 key로 `plan.query`를 씁니다. `lib/curation.ts`의 `planSchema`는 query 중복을 막지 않습니다.

## 상태
`code-review low`에서 지적됐습니다. 실행 검증 4회에서 질의 중복은 한 번도 관측되지 않아 재현을 확인하지 못했고, 주 경로도 깨지지 않아 이번 범위에서 제외했습니다.

## 다음 단계
질의 목록 key에 인덱스를 함께 쓰거나, `planSearches` 반환값에서 query 기준 중복을 제거합니다. 한 줄 수정이라 다음 작업 단위에서 함께 처리하면 됩니다.
