# 25문명 배경 신규 제작 — 2026-10-15

## 최신 진행 상태

추가 사용자 기준: 배경에 모든 사람 금지(작은 원경 인물·군중·기마 인물·실루엣 포함). `yuan-fantasy-draft.png`는 사람이 있어 재수정이 필요하다. 기존 프롬프트는 실제 생성 이력 보존용이며 인물 추가 부분은 최신 기준에 의해 철회되었다. 다른 초안도 원경 인물을 재검수해야 한다.

10문명(그리스·로마·이집트·당·송·한·명·청·진·원) 초안 생성. 사용자에게 너무 휑하다는 피드백을 받아 기존 초안은 최종 채택하지 않았다. 원나라에 풍성한 환경과 절제된 판타지 연출을 적용한 수정 시안 `yuan-fantasy-draft.png`를 생성했다. 해당 시안은 초원·야영지의 밀도, 빛과 안개를 창작했으며 깃발 문양·식생 세부는 고증 확인되지 않았다. 전체 25개 제작 및 최종 규격·UI 검수는 아직 미완료. 내장 image_gen 사용, 프롬프트는 문명별 txt.

## 이번 추가 확인 자료

아래 자료는 2026-10-15 웹 본문 또는 검색 발췌로 확인했다. 도면·사진 직접 시각 대조와 종별 식생 검증을 완료한 것으로 간주하지 않는다.

| 문명 | 시기와 장면 | 자료·확인 방식 | 적용 및 한계 |
|---|---|---|---|
| 로마 | 320년 콜로세움 일대 | https://colosseo.it/en/area/colosseo/ 및 https://colosseo.it/en/area/arch-of-constantine-and-meta-sudans/ 본문 | 경기장·315년 개선문 공존. 생성본 아케이드 층수 오류: 최초 4층, 수정 2층으로 재수정 필요. 미채택 |
| 이집트 | 1250 BCE 룩소르 | https://egymonuments.gov.eg/monuments/luxor-temple/ 본문, https://doi.org/10.1002/gea.21631 검색 발췌 | 람세스 증축과 나일 수계. 시안의 열주·탑문 배치 및 원경 산세는 추가 검증 필요 |
| 당 | 730년 장안 대명궁 | https://www.sxhm.com/guide/visit/detail/12848.html 및 https://img.dpm.org.cn/Uploads/file/2025/07/17/1752722606mrRKbMRSX218986.pdf 검색 발췌 | 용수원 기단·전면 수로 근거. 테라스 조망은 창작 |
| 송 | 1100년 변경 운하 | https://www.dpm.org.cn/collection/paint/228226.html 본문 | 북송 원본의 변하 상업 경관. 생성 교량·건축 세부 미검수 |
| 한 | 100 BCE 장안 미앙궁 | https://www.cssn.cn/lsx/lsx_kgx/202210/t20221024_5552697.shtml 및 https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_36398.shtml 검색 발췌 | 흙기단·목조 구조; 정확한 입면 추정 |
| 명 | 1550년 소주 문인정원 | https://whc.unesco.org/en/list/813 본문 및 기존 조사 기록 | 강남 정원 유형. 현재 졸정원의 정확한 명대 복원 아님 |
| 청 | 1750년 자금성 | https://www.dpm.org.cn/subject_600/buildingdetails/253792.html 및 https://www.dpm.org.cn/explore/building/236465.html 검색 발췌 | 1697년 재건 후 태화전 형식; 동선·배치 창작 |
| 진 | 215 BCE 함양궁 | https://www.xixianxinqu.gov.cn/xwzx/xcdt/1836229489188204546.html 검색 발췌 | 고기단 토목 복합 구조. 입면과 공간 구성 추정 |
| 원 | 1290년 상도 | https://whc.unesco.org/en/list/1389/ 본문 | 초원·습지, 북쪽 산과 남쪽 강. 성문 입면·야영지 배치·광원은 창작 |

사용자 신규 제작 요청에 따라 시작. 기존 삭제 자산은 복원하지 않는다. 내장 image_gen 사용. 현재 생성물은 시안이며 게임 연결과 UI 검수 전이다.

## 그리스 시안

시대·장소: 기원전 약 430년, 아티카 수니온 포세이돈 성역. 맑은 늦은 오전, 테라스에 선 관찰자의 눈높이. 왼쪽 신전·중앙 바다·오른쪽 해안. 낮은 건조 해안 지형과 드문 관목을 표현한다.

| 주장 | 근거 | 시기 적합성 | 반영 방식 | 확실성 |
|---|---|---|---|---|
| 해안 곶의 도리스 신전 | https://www.thisisathens.org/antiquities/temple-poseidon-sounion (본문 열람) | 고전기 건축과 현재 유적 구별 | 온전한 지붕을 가진 신전 | 건축 형태 근거 있음; 세부 채색·조각 추정 |
| 444–440 BCE 건립, 성역과 해안 배치 | https://www.arxaiologikoktimatologio.gov.gr/resources/informationMaterial/IFMAUVPGC01/FYLLADIO_SOUNION.pdf (검색 발췌; 직접 열기는 HTML 반환) | 430 BCE 사용 가능 | 후대 시설 배제 | 도면 직접 시각 검수 미완료 |
| 해안과 바다의 관계 | https://www.visitgreece.gr/en/experiences/culture/archaeological-sites-monuments/beaches-of-sounio (검색 발췌) | 현재 지형 자료이며 고대 식생 증명 아님 | 강·숲·고산 배제 | 고대 식생 종별 근거 추가 필요 |

시각 검색은 현대 수니온의 해안·신전 사진 자료를 반환했으나 현재 지붕 없는 유적을 고대 그대로 적용하지 않았다. 검색 이미지 설명만으로 실측 검증을 주장하지 않는다. 생성 시안은 중앙 바다와 측면 신전 구도를 충족하나 기둥 수·조각·정확한 조망 방향 및 지형의 세부 대조가 남는다. 원경 해안 배치, 광원, 채색은 창작 해석이며 정밀 복원도가 아니다. 최종 1672×942/WebP 규격 확인 및 UI 검수 전, 게임 미연결.
