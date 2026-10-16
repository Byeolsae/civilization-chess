# 여섯 문명 하늘 수정 및 아즈텍 야경 — 2026-10-16

후속 사용자 승인: 여섯 수정본을 게임에 적용하고 푸시하도록 요청했다. 각 원본을 1672×942 WebP quality 84로 변환해 미디어 설정에 연결했다. 아래 미연결 표기는 생성 당시 이력이다. 청나라 기둥은 목재 위 보호층·붉은 도장으로 매끈한 표면을 만드는 방향을 유지한다. 참고: https://www.sypm.org.cn/xinwen_2/6.html (앞선 대화 검색 설명 확인). 특정 생성 기둥의 모든 세부를 실물 검증했다는 뜻은 아니다.

사용자가 여섯 장의 과한 구름을 지적하고 하늘 차별화 수정에 동의했다. 아즈텍은 추가로 횃불 디자인의 역사 고증과 야경을 요청했다. 모든 대상 원본을 view_image로 확인하고 내장 image_gen의 referenced_image_paths를 사용해 편집했다. 파일별 -prompt.txt는 실제 입력 전문이다. 이전 원본은 보존한다.

| 수정본 | 입력 원본 | 수정 내용 |
|---|---|---|
| egypt-clear-sunset.png | ../../three-civilizations/egypt-sunset-gold.png | 얇은 구름과 맑은 일몰, 흰 외장·금장 유지 |
| rome-clear-dawn.png | ../../three-civilizations/rome-dawn-banners.png | 맑은 새벽, 수평선 낮은 구름, 붉은 군기 유지 |
| greece-clear-day.png | ../../three-civilizations/greece-harmony.png | 청명한 낮, 낮은 작은 구름과 얇은 권운 |
| joseon-clear-morning.png | ../joseon-palace.png | 맑은 아침, 산허리 안개 중심 |
| qing-clear-afternoon.png | ../qing-imperial-garden.png | 얇은 구름과 맑은 오후, 황색 기와 |
| aztec-night.png | ../aztec-lake-city.png | 맑은 밤, 전경 목재 횃불과 따뜻한 소규모 불빛 |

## 횃불 근거와 해석 범위

2026-10-16 조사. 원본 문화재 이미지를 합성하거나 재배포하지 않고 재료·형태 설명을 참고했다.

- [Nahuatl Dictionary: ocotl](https://nahuatl.wired-humanities.org/content/ocotl) 본문 열람: 소나무 및 소나무 횃불/쪼갠 나무에 대한 어휘 근거. 목재 자체가 연료인 형태를 선택했다.
- [Visual Lexicon: ocotl, Florentine Codex Book 6 folio 204r](https://aztecglyphs.wired-humanities.org/content/ocotl-fcbk6f204r) 검색 반환의 상세 설명 확인: 위쪽에 불꽃이 있는 곧게 세운 횃불 도상. 원자료는 1577년 식민지기 문헌이며 1518년 현장사진이나 고고학적 실물은 아니다. 유럽식 음영 표현 영향도 자료에 명시된다. 원도판 직접 대조는 미완료.
- [Taube, The Turquoise Hearth](https://www.mesoweb.com/publications/Works2/Taube%5B2000%5D2022.pdf) 검색 요약 확인: 송진 많은 ocote 목재가 횃불·불붙이기에 쓰인다는 연구. 전문 도판 검토 전.
- [INAH: Braseros prehispánicos](https://www.inah.gob.mx/foto-del-dia/braseros-prehispanicos) 검색 요약은 신전 밖 화로 사용을 설명하나 본문 직접 접근 실패. 특정 화로 디자인의 직접 복제 근거로 쓰지 않았다.

재료는 송진 많은 소나무를 참고. 결과에는 목재 막대 끝에 작은 나뭇조각을 묶은 형태의 횃불 두 개가 보인다. 묶음·끈·길이·고정 받침·설치 위치는 근거가 확정된 실물 복원이 아닌 미술적 추정이다. 금속 바구니·유리 등롱·중세식 철제 횃대를 피했다. 배경의 원경 불빛 수와 위치는 창작이며 역사적 가로등 체계를 주장하지 않는다. 아즈텍 새불 의식 재현은 아니며 사람이나 의식 장면을 넣지 않았다.

## 육안 검토 및 남은 한계

- 여섯 장 모두 하늘의 짙은 구름 덩어리와 쏟아지는 광선이 제거되거나 크게 줄었다. 기존 측면 건축·중앙 자연·원경 상징물 구도가 유지된다.
- 이집트 흰 외장과 세 금장 꼭대기, 로마 두 붉은 군기, 아즈텍 상부 쌍신전 및 전경 횃불 확인. 눈에 띄는 사람·군중·화재 피해 없음.
- 아즈텍 원경 불빛은 요청한 소수보다 많이 생성됐다. 정확한 조명 밀도 복원이 아니며 일부 불빛은 점으로만 보인다. 하늘 별 배치는 장식적이며 특정 날짜의 천문 재현이 아니다.
- 기존 건축·식생·지리 배치의 미검증 항목은 ../REVIEW.md 및 ../../three-civilizations/REVIEW.md에서 승계한다. 이번 하늘 편집만으로 해결되었다고 간주하지 않는다. 이집트 저녁 광원과 일부 면·수면 반사의 일치도 정밀 검증 전이다.
- 최신 생성 원본 보존. 최종 게임 규격 1672×942 WebP quality 84 변환과 UI/모바일 크롭 검수 전. 게임 연결·푸시·배포는 수행하지 않았다.
