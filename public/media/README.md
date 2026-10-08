# 문명별 배경과 BGM

그리스·이집트·로마·아즈텍·조선(korea)·청나라 임시 배경(background-v1.webp)을 등록했습니다. 내장 image_gen으로 생성한 게임용 분위기 일러스트이며, 실제 유적을 재현한 자료는 아닙니다. 6개 문명의 사용자 제공 음원을 bgm-loop-v1.mp3로 등록했습니다. 음악은 기본 꺼짐이며 게임의 음악 버튼으로 켤 수 있습니다. 파일이 없는 문명은 기존 배경과 무음으로 표시하며 요청하지 않습니다.

## 파일 등록

1. 이 폴더 아래 정확한 문명 ID의 폴더를 만듭니다. 예: `public/media/greece/`.
2. 배경 `background.webp`와 음원 `bgm.mp3`를 넣습니다. 다른 브라우저 지원 형식도 사용할 수 있습니다.
3. `src/civilizationMedia.ts`의 `civilizationMedia`에 다음처럼 등록합니다. 배경이나 음악만 먼저 등록하려면 나머지는 `null`로 둡니다.

```ts
greece: {
  background: '/media/greece/background.webp',
  bgm: '/media/greece/bgm.mp3',
},
```

파일명은 자유이며 등록 경로와 일치해야 합니다. 조선의 ID는 `korea`입니다. 전체 ID는 `src/civilizations.ts`에서 확인합니다. 기물 팔레트를 공유하더라도 당·송·한 등 문명별로 독립적인 미디어를 등록할 수 있습니다. 같은 파일을 명시적으로 여러 문명에 연결할 수도 있습니다.

## 적용 규칙

- AI: 내 진영 반대쪽 문명. AI 차례에도 바뀌지 않습니다.
- 로컬: 현재 둘 차례인 플레이어의 상대 문명. 차례와 무르기에 따라 바뀝니다.
- 보드 뒤집기는 시각적 방향만 바꾸므로 미디어 기준에 영향을 주지 않습니다.
- 새 대전 설정으로 나가면 배경을 제거하고 음악을 중단합니다.
- 배경은 어둡게 표시하여 체스판과 글자의 가독성을 유지합니다. 깨진 이미지는 기본 배경으로 돌아갑니다.
- BGM은 반복 재생하며 초기에는 꺼져 있습니다. 켜짐·음량·배경 설정은 브라우저에 저장됩니다.
- 다른 음원으로 바뀌면 이전 음원을 정지·해제합니다. 같은 경로를 공유하면 음악을 재시작하지 않습니다.
- 숨겨진 탭에서는 일시 정지합니다. 브라우저 자동 재생 제한이 있으면 재생 버튼을 표시합니다. 실패한 음원이 게임을 막지 않습니다.

배경은 넓은 화면에서 잘리는 부분을 고려해 제작하고, 음원은 반복 지점을 맞춰 준비하세요. 이 폴더는 공개 배포되므로 사용할 수 있는 권리가 있는 파일만 넣으세요.


## BGM processing

Original user files are preserved. `scripts/prepare-bgm.py` decodes each source,
trims only near-silent leading/trailing blocks, and constructs a circular loop
with a 6-second equal-power tail/head crossfade. The cycle starts immediately after
that overlap, so the overlap is not played twice. Two-pass FFmpeg loudness
normalization targets -18 LUFS integrated and -1.5 dBTP, then exports stereo
44.1 kHz / 160 kbps MP3 with gapless encoder metadata. Measurement of the encoded
files is recorded in `audio-processing.json`. This smooths the audio seam but
is not a beat-perfect musical rearrangement. See the report for source titles.

## Display credits

Track and artist names for Greece, Egypt, Aztec and Joseon follow the user-supplied filenames.
Qing: Cup of Solid Gold (Medley), source tag Norwegian Baron.
Rome: National Anthem of the Roman Empire — S.P.Q.R., source tag VidGames.
The latter two are displayed as audio sources, not verified original composers.
