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

문명 스킬은 선택·저장만 구현되어 있으며 **대전에 효과가 적용되지 않습니다**. 그리스·이집트·로마는 각 범주에서 카드 3장 중 하나를 선택합니다. 다른 문명의 미구현 스킬은 자동으로 건너뜁니다. 같은 문명 선택이 가능하며 밴은 없습니다.

AI는 Web Worker에서 실행되는 기본 체스 탐색 엔진입니다. 기물 가치와 위치를 평가하며 난이도별 탐색량이 다릅니다. 온라인 매칭, 시간제한, 시대 전환은 아직 없습니다.

여러 현대 국가에 걸친 문명은 중복 표시됩니다. 국가 분류는 중심지와 주요 역사 문화권 기준이며 전체 정복 영토를 나열하지 않습니다. 3회 동형 반복과 50수 규칙은 별도 청구 없이 자동 무승부로 처리합니다.

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

## 기물 및 문장

그리스·로마·이집트·한국·중국·일본 계열은 문명별 백·흑 팔레트와 문장을 사용하고 나머지는 기본 기물을 사용합니다. 배색은 게임 디자인이며 역사 고증을 주장하지 않습니다.

현재 기물은 자체 SVG 세트이며 node scripts/create-pieces.mjs로 재생성합니다. 문장은 node scripts/create-civilization-icons.mjs로 생성합니다. 이전 Chessnut 세트의 출처와 Apache 2.0 라이선스는 관련 자산과 함께 보존되어 있습니다. Noto Sans KR은 Google Fonts에서 로드하며 연결이 없으면 시스템 글꼴을 사용합니다.
