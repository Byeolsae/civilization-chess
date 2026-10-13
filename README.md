# 문명체스

문명을 선택하고 AI 또는 같은 화면의 다른 플레이어와 겨루는 체스 웹앱입니다.

- 사이트: https://civilization-chess.vercel.app
- React + TypeScript + Vite + chess.js
- AI 난이도 3단계, 백·흑 선택, 로컬 2인 대전
- 31개 문명과 왕조, 현대 국가·대륙·시대별 필터
- 문명 선택 → 패시브 → 액티브 → 기물 스킬 → 대전
- 클릭·드래그 이동, 부드러운 이동 애니메이션, 캐슬링 동시 모션
- 체크메이트, 캐슬링, 앙파상, 네 가지 폰 승격, 무승부
- 내 차례까지 무르기, 보드 뒤집기, 기권, 브라우저 자동 저장
- 모바일·키보드 조작과 감소된 모션 설정 지원

## 현재 범위

**새 대전에는 그리스·이집트·로마 능력 26개가 적용됩니다. 12표법은 효과 미정으로 준비 중입니다.** 임시 규칙은 각 카드와 대전 도움말에 명시됩니다. 이전 버전 저장 대전은 기본 체스로 유지됩니다. 그리스·이집트·로마는 각 범주에서 카드 3장 중 하나를 선택합니다. 다른 문명의 미구현 스킬은 자동으로 건너뜁니다. 같은 문명 선택이 가능하며 밴은 없습니다.

AI는 Web Worker에서 실행되는 기본 체스 탐색 엔진입니다. 기물 가치와 위치를 평가하며 난이도별 탐색량이 다릅니다. 능력 대전 AI는 합법적인 이동과 스킬을 함께 평가하는 실험 엔진입니다. 철학을 선택하면 양쪽 10분에 철학 진영 3분을 추가합니다. 온라인 매칭과 시대 전환은 아직 없습니다.

여러 현대 국가에 걸친 문명은 중복 표시됩니다. 국가 분류는 중심지와 주요 역사 문화권 기준이며 전체 정복 영토를 나열하지 않습니다. 기본 체스의 3회 동형 반복과 50수 규칙은 자동 무승부입니다. 능력 대전은 부활·추가 행동 등 상태가 있으므로 반복·50수·기물 부족 자동 무승부를 사용하지 않습니다.

## 실행 및 검증

Node.js 22 이상과 package.json에 지정된 pnpm을 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

개발 서버: http://127.0.0.1:5173

테스트는 체스 규칙, AI, 저장·복원, 문명 선택, 드래그 좌표와 이동 모션 경로를 검증합니다.

## 코드 구조

- src/game.ts: 체스 판정과 대전 저장
- src/AbilityGame.ts, src/abilityState.ts: 능력 판정, 상태, 행동 기록, 저장·무르기
- src/experimentalRules.ts: 26개 능력의 명시적인 임시 규칙
- src/AbilityPanel.tsx, src/abilityAi.ts: 능력 UI·결투·수수께끼와 AI
- src/civilizations.ts, src/civilizationFilters.ts: 문명 목록과 분류
- src/draft.ts, src/DraftScreen.tsx: 문명·스킬 선택
- src/ai.ts, src/ai.worker.ts, src/useAiTurn.ts: AI 탐색과 차례 처리
- src/App.tsx, src/useMoveAnimation.ts: 보드·대전 화면과 이동 모션
- scripts/: 기물 팔레트와 SVG 생성 도구

## 배포

이 저장소의 루트가 Vercel 프로젝트 루트입니다. 상위 Bracket-Arena 프로젝트와 별개입니다.

- Vercel 프로젝트: civilization-chess
- Production branch: main
- Framework: Vite
- Root Directory: 저장소 루트 (하위 경로 없음)
- Install: pnpm install --frozen-lockfile
- Build: pnpm build
- Output: dist
- 서버 환경변수는 필요하지 않습니다.

GitHub 저장소 https://github.com/Byeolsae/civilization-chess 가 Vercel에 연결되어 있으며 main으로 push할 때 자동 배포됩니다. .vercel/, 환경변수 파일, node_modules/, dist/는 Git에서 제외합니다.

## 상대 문명 배경·BGM

대전 화면은 플레이어의 상대 문명을 기준으로 배경과 음악을 선택합니다. AI 대전은 내 진영의 반대쪽으로 고정되며, 로컬 대전은 현재 차례인 플레이어의 상대 문명으로 바뀝니다. 보드 뒤집기는 이 기준에 영향을 주지 않습니다.

2026-10-13 배경 초기화로 모든 문명 배경 이미지를 삭제했으며 기본 UI 바탕을 표시합니다. 기존 6개 문명의 BGM은 유지합니다. 새 배경은 `BACKGROUND_STANDARD.md`의 기준에 따라 추후 제작합니다. `public/media/README.md`의 파일 등록 안내와 `src/civilizationMedia.ts`의 문명별 설정을 사용하면 이후 개별 문명에 연결할 수 있습니다. BGM 켜기·끄기, 음량, 배경 표시 설정을 저장하며 자동 재생 차단과 미디어 로딩 실패를 처리합니다.

## 기물 및 문장

그리스·로마·이집트·한국·중국·일본 계열은 문명별 백·흑 팔레트와 문장을 사용하고 나머지는 기본 기물을 사용합니다. 배색은 게임 디자인이며 역사 고증을 주장하지 않습니다.

현재 기물은 자체 SVG 세트이며 node scripts/create-pieces.mjs로 재생성합니다. 문장은 node scripts/create-civilization-icons.mjs로 생성합니다. 이전 Chessnut 세트의 출처와 Apache 2.0 라이선스는 관련 자산과 함께 보존되어 있습니다. Noto Sans KR은 Google Fonts에서 로드하며 연결이 없으면 시스템 글꼴을 사용합니다.
