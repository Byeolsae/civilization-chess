# 문명 선택 소개문구 조사 기록 — 25문명

2026-10-14. `CIVILIZATION_INTRO_STANDARD.md`의 짧음·웅장함·시대별 역사 근거·한시/무협시의 압축된 호흡을 적용했다. 모든 문구는 직접 창작한 게임 소개문이며 사료나 고전의 인용이 아니다. 문구의 새벽·빛·염원·시대 등의 표현은 시적 비유다. 영어는 같은 소재의 짧은 창작 번안이다.

## 대상과 노출

기존 작업 상태상 미착수(classic 공용 외형)인 62개를 제외한 25개를 `src/draftRoster.ts`에 명시했다. 현재 외형 상태에서 추출한 명단을 고정했으며, 이후 색상/소개 완료 표시만 바뀌어도 자동으로 픽 후보가 늘어나지 않는다. 스킬 완성 여부를 25개 모두 완료로 표시하지 않는다.

- 그리스·로마·이집트·아즈텍
- 진·한·위·촉·오·당·송·원·명·청
- 고조선·고구려·백제·신라·고려·조선
- 헤이안·가마쿠라·센고쿠·에도·메이지

새 문명 픽(로컬/AI/온라인), 선택 검색 결과, AI 후보는 같은 명단을 사용한다. 도감의 87개 문명과 기존 대전/복기 데이터의 문명 정의는 유지한다. 이전에 저장된 픽 진행 중 대상 밖 문명이 있다면 새로 선택하도록 초기화한다. 소개는 문명 선택 단계의 양쪽 카드에서만 노출하며, 스킬 선택 시 아이콘을 가리지 않는다.

## 역사 소재와 근거

링크는 작업 중 실제 검색/열람한 자료다. 자료의 해당 부분만 소재로 사용했으며 문명 전체 역사를 완전 검증했다는 의미는 아니다. 왕조 연대는 기관마다 경계 설정이 달라 소개문에서 단정하지 않았다.

| 문명 | 사용한 소재 / 범위 | 근거 |
|---|---|---|
| 그리스 | 고전기의 경쟁하는 도시국가와 문화적 유산. 단일 통일제국으로 표현하지 않음 | [Met, Classical Greece](https://www.metmuseum.org/fr/essays/the-art-of-classical-greece-ca-480-323-b-c) |
| 로마 | 군사·교역·영토 연결을 위한 돌길 | [UNESCO, Via Appia](https://whc.unesco.org/en/list/1708) |
| 이집트 | 나일 범람과 퇴적토가 농경과 생명을 지탱 | [이집트 관광유물부, Nile Stelae](https://egymonuments.gov.eg/monuments/nile-stelae-1/) |
| 진 | 전국 통일과 도량형·문자·행정 표준화. 현대 장성을 진의 건축으로 혼동하지 않음 | [Smithsonian, Qin](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/qin-dynasty/) |
| 한 | 서역 교역로의 확대와 비단길. 현대적 국경의 정복으로 과장하지 않음 | [Smithsonian, Han](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/han-dynasty/) |
| 위 | 삼국 중 북방 세력. 연의의 선악 평가를 사용하지 않음 | [Smithsonian, 분열기](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/period-of-division/), [Vassar 대학 삼국지 읽기 자료의 역사 지리 안내](https://facultysites.vassar.edu/brvannor/ThreeKingdoms.pdf) |
| 촉 | 쓰촨을 중심으로 한 삼국의 하나. 소설 속 맹세/인물 무용을 역사로 단정하지 않음 | [Smithsonian, 분열기](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/period-of-division/) |
| 오 | 장강 남동부에 기반한 삼국의 하나. 수상 경계라는 지리적 이미지 | [Vassar 대학 안내](https://facultysites.vassar.edu/brvannor/ThreeKingdoms.pdf), [Smithsonian, 분열기](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/period-of-division/) |
| 당 | 장안의 국제 교류, 시·서·화의 번영. 만국은 모든 국가가 복속했다는 뜻이 아닌 시적 압축 | [Smithsonian, Tang](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/tang-dynasty/) |
| 송 | 문인 산수화와 상업 번영. 군사 팽창으로 묘사하지 않음 | [Smithsonian, Song](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/song-dynasty/) |
| 원 | 몽골계 왕조와 육해상 교역망. 몽골제국 전체를 원의 직접 영토로 표현하지 않음 | [Smithsonian, Yuan](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/yuan-dynasty/) |
| 명 | 장성 확충과 해상 원정·교역 | [Smithsonian, Ming](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/ming-dynasty/) |
| 청 | 만주계 황실이 다스린 다민족 제국과 언어의 다양성 | [Smithsonian, Qing](https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/explore-by-dynasty/qing-dynasty/) |
| 고조선 | 비파형 청동검과 초기 국가. 단군 건국 신화를 확정된 연대처럼 쓰지 않음 | [국립중앙박물관, 고조선실](https://www.museum.go.kr/ENG/contents/E0201030400.do?schM=list&showHallId=760&showroomCode=DM0048) |
| 고구려 | 지형을 이용한 산성과 왕도 | [UNESCO, 고구려 도성과 고분](https://whc.unesco.org/en/list/1135/) |
| 백제 | 동아시아 문화 교류와 석탑 | [UNESCO, 백제역사유적지구](https://whc.unesco.org/en/list/1477/) |
| 신라 | 금관과 오랜 왕국의 유산. 천년은 장기간 존속의 시적 표현 | [Met/국립중앙박물관 공동 전시, Silla](https://www.metmuseum.org/exhibitions/listings/2013/koreas-golden-kingdom) |
| 고려 | 청자와 불교 경판 인쇄. 하늘빛은 청자 색의 비유 | [국사편찬위원회, 상감청자](https://contents.history.go.kr/mobile/tz/view.do?levelId=tz_b69), [UNESCO, Koryo printers](https://www.unesco.org/en/articles/200-years-gutenberg-master-printers-koryo-0) |
| 조선 | 세종의 훈민정음 창제·반포 | [UNESCO, Hunminjeongum](https://www.unesco.org/en/memory-world/hunminjeongum-manuscript?hub=1081) |
| 헤이안 | 헤이안쿄 궁정의 시가·문학 | [Met, Heian](https://www.metmuseum.org/fr/essays/heian-period-794-1185) |
| 가마쿠라 | 귀족에서 무사로의 정치 권력 이동과 막부 | [Met, Kamakura](https://www.metmuseum.org/essays/kamakura-and-nanbokucho-periods-1185-1392) |
| 센고쿠 | 다이묘들의 경쟁과 성곽. 자료는 특히 센고쿠 말기/모모야마의 사례를 뒷받침 | [Met, Momoyama](https://www.metmuseum.org/essays/momoyama-period-1573-1615) |
| 에도 | 도쿠가와 통치하 상대적 평화와 도시 문화. 사회 규제가 없었다는 의미 아님 | [Met, Samurai Splendor](https://www.metmuseum.org/exhibitions../exhibitions/samurai-splendor) |
| 메이지 | 1872년 신바시–요코하마 철도와 근대화의 격변. 제국주의 팽창을 찬양하지 않음 | [일본 국립국회도서관, 철도가 바꾼 것들](https://www.ndl.go.jp/kaleido/entry/32/) |
| 아즈텍 | 호수의 섬 도시 테노치티틀란과 수로 경관 | [UNESCO, Mexico City/Xochimilco](https://whc.unesco.org/en/list/412) |

Vassar PDF는 검색 결과의 지리 설명을 확인했으나 본문 직접 열기는 실패했다. 위·오는 검색으로 확인된 북부/남동부·장강 지리 범위만 사용한다. 전체 서사나 특정 전투의 사실성을 이 문서로 보증하지 않는다.
