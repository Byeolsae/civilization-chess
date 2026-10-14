import type { Civilization } from './civilizations';
import type { DraftCivilization } from './draftRoster';

// Original poetic copy, NOT historical quotations. Evidence: CIVILIZATION_INTRO_RESEARCH.md.
const reviewedIntros = {
  greece: { ko: '도시는 서로 겨루고, 그 이름은 시대를 넘는다.', en: 'Cities contend. Their names outlive the ages.' },
  rome: { ko: '돌길로 대지를 잇고, 군단으로 제국을 세우다.', en: 'Stone roads bind the land. Legions raise an empire.' },
  egypt: { ko: '나일이 생명을 깨우니, 메마른 대지에 왕국이 선다.', en: 'The Nile awakens life. A kingdom rises from the dust.' },
  tang: { ko: '장안에 만국이 모이고, 시 한 수에 시대가 빛난다.', en: 'Nations meet in Chang’an. An age shines in verse.' },
  song: { ko: '붓끝에 산하를 담고, 장터에 천하를 모으다.', en: 'Mountains live in ink. The world gathers in the market.' },
  han: { ko: '비단길이 사막을 가르니, 제국의 지평이 열린다.', en: 'Silk roads cross the desert. An empire’s horizons unfold.' },
  ming: { ko: '장성은 산맥을 넘고, 돛은 대양을 가른다.', en: 'Walls crest the mountains. Sails cleave the seas.' },
  qing: { ko: '서로 다른 말과 땅을, 하나의 황권 아래 묶다.', en: 'Many tongues, vast lands. One imperial throne.' },
  qin: { ko: '갈라진 천하를 거두어, 하나의 법도로 세우다.', en: 'Gather the divided realms. Forge one imperial order.' },
  yuan: { ko: '초원에서 도성까지, 뭍과 바다의 길이 열린다.', en: 'From steppe to city, roads and sea lanes unfold.' },
  wei: { ko: '북방에 깃발을 세워, 갈라진 천하를 겨누다.', en: 'Banners rise in the north, poised over a divided realm.' },
  shu: { ko: '촉의 산하에 뜻을 세워, 난세의 한 축을 이루다.', en: 'Amid Shu’s mountains, a kingdom stands against the age.' },
  wu: { ko: '장강을 경계 삼아, 강동에 왕업을 세우다.', en: 'The Yangtze marks the frontier. A throne rises in the southeast.' },
  korea: { ko: '백성의 말을 글로 세워, 오래 밝을 길을 열다.', en: 'Give the people’s voice a script. Open a path of lasting light.' },
  goryeo: { ko: '청자에 하늘빛을 담고, 경판에 염원을 새기다.', en: 'Celadon holds the sky. Woodblocks bear a kingdom’s prayers.' },
  goguryeo: { ko: '산을 성벽 삼고, 바위 위에 왕도를 세우다.', en: 'Mountains become ramparts. Royal cities rise upon the rock.' },
  baekje: { ko: '바다 건너 문화를 잇고, 돌탑에 품격을 새기다.', en: 'Culture crosses the sea. Grace endures in stone pagodas.' },
  silla: { ko: '금관에 새벽을 담아, 천년 왕도의 빛을 세우다.', en: 'Gold crowns hold the dawn. A royal city shines across the ages.' },
  gojoseon: { ko: '청동검에 새벽이 서리니, 오래된 나라가 깨어난다.', en: 'Dawn gleams on bronze. An ancient realm awakens.' },
  heian: { ko: '도읍에 시가 흐르니, 붓끝의 영화가 오래 남는다.', en: 'Verse flows through the capital. Splendor endures in ink.' },
  edo: { ko: '전란을 거둔 도성에, 태평의 문화를 꽃피우다.', en: 'War recedes. A city’s culture blooms in peace.' },
  meiji: { ko: '철길이 옛 땅을 가르니, 격변의 시대가 달려온다.', en: 'Rails cross the old land. An age of upheaval thunders forth.' },
  sengoku: { ko: '군웅의 성마다 깃발이 서니, 난세는 주인을 묻는다.', en: 'Banners rise above rival castles. Who shall master the age?' },
  kamakura: { ko: '무사의 손에 권세가 드니, 새 질서의 막이 오른다.', en: 'Power passes to the warriors. A new order rises.' },
  aztec: { ko: '호수 위에 도성이 솟고, 물길마다 왕국이 뻗는다.', en: 'A capital rises from the lake. A realm spreads along its waterways.' },
} satisfies Record<DraftCivilization, { ko: string; en: string }>;

export const civilizationIntros: Partial<Record<Civilization, { ko: string; en: string }>> = reviewedIntros;
