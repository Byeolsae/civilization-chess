# 문명 선택 소개문구 조사 기록 — 25문명

2026-10-14 개정. 짧은 한시형 초안을 문명 시리즈와 같은 역사적 유산 → 플레이어의 책임/선택 → 미래를 향한 권유의 장중한 내레이션으로 교체했다. 길이 제한은 해제하며 한국어·영어 모두 3~4문장 안팎이다. 모든 문구는 직접 창작한 게임 소개문이며 사료나 고전의 인용이 아니다. 문구의 새벽·빛·염원·시대 등의 표현은 시적 비유다. 영어는 같은 소재의 짧은 창작 번안이다.

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


## 내레이션 문체 개정

문명 시리즈는 문체의 방향만 참고한다. [Civilization VI 공식 매뉴얼](https://downloads.2kgames.com/civilization/vi/manuals/eu/CIV_VI_25TH_ONLINE_MANUAL_ENG.pdf)의 플레이어가 백성을 이끌며 역사를 만든다는 관점을 참고하되 실제 문장은 인용하거나 번안하지 않았다. 위 25행의 기존 역사 소재를 유지하면서, 각 소재의 의미와 플레이어에게 주어지는 과제를 독자적인 문장으로 풀었다. 카드에서는 로고/이름을 고정하고 본문을 별도로 스크롤한다.

## 전체 문명으로 확장 — 2026-10-15

사용자 요청: 기존 25개 소개와 확정 문체를 참고하여 다른 문명에도 적용. `src/additionalCivilizationIntros.ts`에 나머지 62개를 한국어·영어 각 4문장으로 작성했다. 기존 25개 본문은 유지한다. 전체 87개의 소개는 문명 목록 상세에서 읽을 수 있다. 소개 추가는 새 대전 선택 허용이나 스킬·역사 설명·최종 검수 완료를 뜻하지 않으며, 픽창의 25개 제한은 유지한다.

아래는 **본문에 사용한 좁은 역사 소재의 근거**다. 모든 문명의 통사를 검증한 기록이 아니다. 확인일은 2026-10-15. `열람`은 웹 도구로 해당 페이지 본문을 열어 확인한 부분, `검색 발췌`는 검색 도구가 제공한 해당 기관의 본문/발췌를 확인한 부분이다. 후자는 원문 전체를 직접 열람했다는 뜻이 아니다. 직접 인용하지 않았으며, 마지막 두 문장은 플레이어에게 제안하는 가상 미래다.

| 문명 ID | 소재와 시대·해석 범위 | 근거 / 확인 방법 |
|---|---|---|
| mongol-empire | 13~14세기 카라코룸, 오르혼의 유목과 도시·교역. 원나라의 직접 영토와 동일시하지 않음 | [UNESCO 오르혼](https://whc.unesco.org/en/list/1081/) · 열람 |
| russian-empire | 18세기 상트페테르부르크의 계획도시·운하·궁전. 건설의 어려움을 무시한 무조건적 진보 서사 지양 | [UNESCO 상트페테르부르크](https://whc.unesco.org/en/list/540/) · 열람 |
| prussia | 프리드리히 2세의 상수시와 볼테르의 체류, 포츠담의 궁전·정원 | [UNESCO 포츠담](https://whc.unesco.org/en/list/532/) · 열람 |
| inca | 잉카 도로망의 산지·계곡 연결과 교통·교역·보급 시설 | [UNESCO 카팍냔](https://whc.unesco.org/en/list/1459/) · 열람 |
| maya | 티칼의 신전·광장·주거지. 마야 전체를 단일제국이나 소멸한 민족으로 서술하지 않음 | [UNESCO 티칼](https://whc.unesco.org/en/list/64/) · 열람 |
| gaul | 기원전 2~1세기 아이두이의 비브락테, 성벽·공예·교역. 갈리아 전체의 수도로 표현하지 않음 | [Bibracte 유적기관](https://www.bibracte.fr/en/bibracte-throughout-time) · 검색 발췌 |
| babylon | 여러 왕조의 도시 기억, 특히 신바빌로니아의 성벽·성문·궁전·신전. 공중정원을 확정된 실물로 쓰지 않음 | [UNESCO 바빌론](https://whc.unesco.org/en/list/278/) · 열람 |
| dai-viet | 리 왕조의 탕롱, 홍강과 남북 문화 교류 | [UNESCO 탕롱](https://whc.unesco.org/en/list/1328/) · 열람 |
| khmer | 앙코르의 여러 도읍, 앙코르와트·바이욘의 건축과 조각 | [UNESCO 앙코르](https://whc.unesco.org/en/list/668/) · 열람 |
| siam | 아유타야의 탑·사원과 파괴 이후 남은 유산. 시암 전체 시대를 한 도시로 한정하지 않음 | [UNESCO 아유타야](https://whc.unesco.org/en/list/576/) · 열람 |
| majapahit | 자바의 트로울란 도성·생활 유물. 문헌상의 세력권을 현대 국경의 직접 통치로 과장하지 않음 | [UNESCO 잠정목록, 인도네시아 제출자료](https://whc.unesco.org/fr/listesindicatives/5466/) · 검색 발췌; 세계유산 등재와 구분 |
| maurya | 아소카의 룸비니 방문과 기념 석주. 불확실한 부처 탄생연대는 사용하지 않음 | [UNESCO 룸비니](https://whc.unesco.org/en/list/666) · 검색 본문 발췌 |
| chola | 11~12세기 남인도 사원과 석조·청동 공예 | [UNESCO 촐라 사원](https://whc.unesco.org/en/list/250/) · 열람 |
| mughal | 샤 자한의 타지마할, 대리석 추모 건축. 왕조 전체의 정책을 일반화하지 않음 | [UNESCO 타지마할](https://whc.unesco.org/en/list/252/) · 열람 |
| nepal-kingdom | 고르카 샤 왕조의 계곡 왕국 정복·통합. 앞선 말라 왕조와 구분 | [네팔 관광청 역사](https://trade.ntb.gov.np/know-nepal/nepals-history/) · 검색 본문 발췌 |
| ancient-persia | 아케메네스의 페르세폴리스, 기단과 메소포타미아 건축 영향. 사산 왕조와 구분 | [UNESCO 페르세폴리스](https://whc.unesco.org/en/list/114/) · 열람 |
| sumer | 남부 메소포타미아 삼각주의 우르·우루크. 단일 수메르 제국을 가정하지 않음 | [UNESCO 아흐와르와 도시 유적](https://whc.unesco.org/en/list/1481/) · 열람 |
| assyria | 아슈르의 티그리스 지리, 도읍·종교·교역과 농경 기반 | [UNESCO 아슈르](https://whc.unesco.org/en/list/1130/) · 열람 |
| abbasid | 9세기 사마라의 수도 기능과 예술·건축 영향. 바그다드의 특정 기관 일화를 임의로 넣지 않음 | [UNESCO 사마라](https://whc.unesco.org/en/list/276/) · 열람 |
| ottoman | 이스탄불의 보스포루스 지리와 오스만의 돔 건축. 하기아 소피아 건립을 오스만 업적으로 돌리지 않음 | [UNESCO 이스탄불](https://whc.unesco.org/en/list/356/) · 열람 |
| macedon | 아이가이와 필리포스·알렉산드로스 시대의 확장. 모든 헬레니즘 국가를 한 왕국으로 표현하지 않음 | [UNESCO 아이가이](https://whc.unesco.org/en/list/780/) · 열람 |
| venice | 석호 섬도시와 해양 세력, 예술·건축 | [UNESCO 베네치아](https://whc.unesco.org/en/list/394/) · 열람 |
| byzantium | 6세기 하기아 소피아와 콘스탄티노폴리스의 위치. 오스만 시대 건축과 구분 | [UNESCO 이스탄불](https://whc.unesco.org/en/list/356/) · 열람 |
| carthage | 포에니 카르타고의 튀니스만·지중해 교역. 후대 로마도시와 구분 | [UNESCO 카르타고](https://whc.unesco.org/en/list/37/) · 열람 |
| phoenicia | 티레의 항해와 지중해 정착지 연결. 페니키아 단일왕국·보라색 발명 전설을 단정하지 않음 | [UNESCO 티레](https://whc.unesco.org/en/list/299/) · 열람 |
| celts | 여러 공동체의 곡선 장식·금속 예술. 통일왕국 또는 현대 민족과의 단순 동일시 지양 | [대영박물관 전시 도록](https://www.britishmuseumshoponline.org/exhibitions/celts-art-and-identity-exhibition-catalogue-paperback.html), [선사학회 Celtic Art](https://prehistoricsociety.org/sites/prehistoricsociety.org/files/resources/ps-intros-ia-5-celtic-art.pdf) · 검색 발췌 |
| huns | 아틸라 시대 로마와의 충돌·관계 및 여러 집단의 권력. 흉노와의 일대일 동일시·기후 원인 확정 지양 | [케임브리지 대학 연구 소개](https://www.cam.ac.uk/research/news/drought-encouraged-attilas-huns-to-attack-the-roman-empire-tree-rings-suggest), [Met 유럽 연표](https://www.metmuseum.org/ja/toah/ht/05/eue.html) · 검색 발췌 |
| scythia | 초원의 말에 의존한 생활과 동물형 금속 장식. 특정 소설의 관습을 역사로 옮기지 않음 | [대영박물관 비교 해설](https://www.britishmuseum.org/blog/dothraki-and-scythians-game-clones), [동물 장식 금제 유물](https://www.britishmuseum.org/collection/image/596086001) · 검색 발췌 |
| aksum | 악숨의 석비·왕릉과 후대의 대관 전통. 에티오피아 제국 항목과 구분 | [UNESCO 악숨](https://whc.unesco.org/en/list/15/) · 열람 |
| ethiopian-empire | 곤다르 파실 게비의 궁정·교회와 건축 교류 | [UNESCO 파실 게비](https://whc.unesco.org/en/list/19/) · 열람 |
| mali | 사하라 금 교역과 만사 무사의 순례. 부의 정확한 현대 환산 수치는 사용하지 않음 | [Met 사하라 금 교역](https://www.metmuseum.org/es/essays/the-trans-saharan-gold-trade-7th-14th-century) · 검색 본문 발췌 |
| songhai | 가오의 아스키아 기념물, 흙 건축, 금·소금 교역 | [UNESCO 아스키아 묘](https://whc.unesco.org/en/list/1139/) · 열람 |
| morocco | 마린 왕조 시기 페스의 학교·숙소·분수와 도시 생활. 모로코 전체를 단일 왕조로 취급하지 않음 | [UNESCO 페스](https://whc.unesco.org/en/list/170/) · 열람 |
| kongo | 음반자콩고의 왕실·재판·신성한 장소와 포르투갈 접촉에 따른 변화. 현대 콩고 국가와 구분 | [UNESCO 음반자콩고](https://whc.unesco.org/en/list/1511/) · 열람 |
| buganda | 19세기 카수비 왕실 건축과 공동체의 지속성. 유기재료 건축을 미개함으로 서술하지 않음 | [UNESCO 카수비](https://whc.unesco.org/en/list/1022/) · 열람 |
| kush | 메로에의 왕국·피라미드·수계와 문화 교류. 이집트의 부속 문명처럼 표현하지 않음 | [UNESCO 메로에](https://whc.unesco.org/en/list/1336/) · 열람 |
| normans | 12세기 시칠리아 노르만 왕국의 복합 문화 건축에 초점. 모든 노르만 사회가 항상 관용적이었다고 확대하지 않음 | [UNESCO 팔레르모](https://whc.unesco.org/en/list/1487/) · 열람 |
| british-empire | 17~18세기 카리브 브림스톤힐, 영국 설계와 노예화된 아프리카인 노동. 식민주의의 대가를 누락하지 않음 | [UNESCO 브림스톤힐](https://whc.unesco.org/en/list/910/) · 열람 |
| french-empire | 나폴레옹 제1제정 전후의 민법전 유산. 법전은 제정 선포 전인 1804년 3월 제정되어 ‘나폴레옹 시대’로 표현. 제2제정 도시 개조와 혼합하지 않음 | [나폴레옹 재단 민법전 해설](https://www.napoleon.org/en/history-of-the-two-empires/close-up/a-close-up-on-the-promulgation-of-the-french-code-civil-21-march-1804) · 검색 본문 발췌 |
| spanish-empire | 세비야 인디아스 문서관과 아메리카 교역·식민 통치. 정복을 무조건적 진보로 표현하지 않음 | [UNESCO 세비야](https://whc.unesco.org/en/list/383/), [UNESCO 보고서 교역 설명](https://whc.unesco.org/archive/2012/whc12-36com-INF7Ae.pdf) · 열람 / 검색 발췌 |
| portugal-kingdom | 벨렝의 항해 기념 건축, 해외 연결과 노예무역의 대가 | [UNESCO 벨렝](https://whc.unesco.org/en/list/263/), [UNESCO 고레](https://whc.unesco.org/en/list/26/) · 열람 |
| dutch-republic | 16세기 말~17세기 암스테르담 운하 확장과 계획도시. 이를 식민 통치 전체의 찬양으로 확대하지 않음 | [UNESCO 암스테르담](https://whc.unesco.org/en/list/1349/) · 열람 |
| poland-kingdom | 중세 왕도 크라쿠프·바벨과 시장. 폴란드-리투아니아 전체를 단일민족으로 표현하지 않음 | [UNESCO 크라쿠프](https://whc.unesco.org/en/list/29/) · 열람 |
| hungary-kingdom | 부다의 중세 성과 다뉴브. 부다·페스트 통합 이전을 현대 통합도시처럼 단정하지 않음 | [UNESCO 부다페스트](https://whc.unesco.org/en/list/400/) · 열람 |
| holy-roman-empire | 레겐스부르크의 교역과 제국 회의. 고대 로마와 구분, 다중 권력의 조율이라는 서사 해석 | [UNESCO 레겐스부르크](https://whc.unesco.org/en/list/1155/), [등재 결정](https://whc.unesco.org/en/decisions/1008) · 열람 / 검색 발췌 |
| austria | 묶인 임시 이름은 유지하되 빈의 제국시대 유산과 음악이 후대로 이어지는 소재로 작성. 공화국과 제국을 동시 통치체제로 혼동하지 않음 | [UNESCO 빈](https://whc.unesco.org/en/list/1033/) · 열람 |
| georgia-kingdom | 다비트 4세·타마르 시기의 겔라티와 중세 문화·학문 | [UNESCO 겔라티](https://whc.unesco.org/en/list/710), [겔라티 역사 보고서](https://whc.unesco.org/document/157524) · 검색 본문 발췌 |
| bulgarian-empire | 제1불가리아 제국의 마다라 기마상과 비문. 제2제국과 구분 | [UNESCO 마다라](https://whc.unesco.org/en/list/43/) · 열람 |
| vikings | 비르카·호브고르덴의 바이킹 시대 교역 관계. 단일 바이킹 국가를 가정하지 않음 | [UNESCO 비르카](https://whc.unesco.org/en/list/555/) · 검색 본문 발췌 |
| sweden-kingdom | 17세기 말 카를스크로나 계획 해군도시 | [UNESCO 카를스크로나](https://whc.unesco.org/en/list/871/) · 검색 본문 발췌 |
| scotland-kingdom | 15세기부터의 에든버러 왕도·중세 구시가에 초점. 연합 이후 신시가 건설은 왕국 업적으로 사용하지 않음 | [UNESCO 에든버러](https://whc.unesco.org/en/list/728/) · 열람 |
| iceland-commonwealth | 930년 시작된 알팅의 법·분쟁 조정. 현대 보통선거 민주주의로 동일시하지 않음 | [UNESCO 싱벨리르](https://whc.unesco.org/en/list/1152/) · 열람 |
| brazil-empire | 제국의 노예제와 1888년 폐지법. 황제 한 사람에게 해방의 공로를 독점시키지 않음 | [브라질 대통령실 법률 원문](https://www.planalto.gov.br/ccivil_03/leis/lim/lim3353.htm) · 열람; 1831년 수입 금지법을 전면 폐지법으로 혼동하지 않음 |
| gran-colombia | 1819~1820년대 공화국 통합 구상과 지역 이해의 충돌 | [콜롬비아 중앙은행 문화백과](https://enciclopedia.banrepcultural.org/index.php/El_proyecto_grancolombiano) · 검색 본문 발췌 |
| iroquois | 하우데노쇼니의 자칭과 연맹 협의·각 민족의 정체성. 정확한 건국연대나 신화를 사실로 단정하지 않음 | [연맹 공식 소개](https://www.haudenosauneeconfederacy.com/who-we-are/), [공식 정부 설명](https://www.haudenosauneeconfederacy.com/government/) · 검색 본문 발췌; 직접 접근 robots 제한 |
| shoshone | 여러 쇼쇼니 공동체 중 팀비샤의 고향과 환경 지식을 사례로 선택. 모든 쇼쇼니를 사막 또는 평원 문화 하나로 일반화하지 않음 | [미 국립공원청 팀비샤 소개](https://www.nps.gov/articles/000/home-timbisha-shoshone-demonstration.htm) · 검색 발췌 |
| mississippian | 카호키아의 흙 둔덕·광장·공동 노동. 미시시피 문화 전체를 단일 국가로 취급하지 않음 | [UNESCO 카호키아](https://whc.unesco.org/en/list/198) · 검색 본문 발췌 |
| mapuche | 친족 공동체 로프를 중심으로 한 사회. 하나의 중앙집권 왕국을 가정하지 않음 | [칠레 국립도서관 Memoria Chilena](https://www.memoriachilena.gob.cl/602/w3-article-689.html) · 검색 발췌 |
| hawaii-polynesia | 기존 국가·시대 태그에 맞춰 19세기 하와이 왕국과 이올라니 궁전으로 소개 범위를 명시. 폴리네시아 전체를 하와이 왕국과 동일시하지 않음 | [이올라니 궁전 박물관](https://www.iolanipalace.org/sacred-palace/) · 검색 본문 발췌 |
| tonga-empire | 투이통가의 라파하 왕릉과 태평양 지역 영향. 영향권을 근대식 직접 영토로 환산하지 않음 | [UNESCO/ANU 라파하 연구, World Heritage Papers 34](https://whc.unesco.org/documents/publi_paper_series_34_en.pdf) · 검색 본문 발췌 |
| maori | 화카파파의 계보·관계와 세대 전승. 창세 전통을 실증 역사로 쓰지 않으며 단일 마오리 제국을 가정하지 않음 | [뉴질랜드 Te Ara, 화카파파](https://teara.govt.nz/en/whakapapa-genealogy/page-1) · 검색 본문 발췌 |
| pirate-republic | 18세기 초 나소의 얕은 바다·해적 거점·경쟁과 짧은 지속. 관광박물관 설명의 과장된 일화·현대 민주공화국 해석은 채택하지 않음 | [Pirates of Nassau 박물관](https://www.piratesofnassau.com/the-republic-of-pirates/) · 검색 본문 발췌 |

원문 접근 제한이 있었던 대영박물관의 일반 ‘who were’ 블로그 주소와 Britannica Hun 페이지는 근거로 사용하지 않았다. 검색 중 발견한 관련 없는 유적 페이지 역시 위 근거표에서 제외했다. 새 배경·문양을 제작할 때는 이 소개문 자료만으로 고증이 끝났다고 판단하지 않고 별도 조사한다.
