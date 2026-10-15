import type { Civilization } from './civilizations';
import type { DraftCivilization } from './draftRoster';
import { additionalCivilizationIntros } from './additionalCivilizationIntros';

// Original historical narration addressing the player, not quotations from Civilization or historical sources.
// Historical materials and scope: CIVILIZATION_INTRO_RESEARCH.md.
const reviewedIntros = {
  greece: {
    ko: '에게해를 바라보던 도시들은 서로 경쟁하면서도 오래도록 남을 문화를 꽃피웠습니다. 신전과 조각에 담긴 이상은 도시의 성벽을 넘어 먼 시대까지 전해졌습니다. 이제 당신은 이 다채로운 유산을 이어받았습니다. 경쟁하는 이들의 힘을 모아, 후세가 기억할 새로운 영광을 세우십시오.',
    en: 'The cities overlooking the Aegean competed fiercely, yet nurtured a culture that would endure. Their ideals, carved into temples and sculpture, traveled far beyond their walls. This varied inheritance is now yours. Gather the strength of rival cities and build a glory that future generations will remember.',
  },
  rome: {
    ko: '로마의 군단이 지나간 곳에는 도시를 잇는 길이 놓였습니다. 정복을 위해 만든 돌길은 상인과 여행자의 발걸음을 받아들이며 제국의 땅을 하나로 연결했습니다. 당신 앞에도 넓은 세계가 펼쳐져 있습니다. 승리로 얻은 땅을 오래 지켜낼 질서로 묶어, 로마의 다음 시대를 여십시오.',
    en: 'Where Rome’s legions marched, roads followed. Built for conquest, those stone routes carried merchants and travelers, binding distant lands together. A wide world now lies before you. Give the lands you win an order that will endure, and open Rome’s next great age.',
  },
  egypt: {
    ko: '메마른 대지 한가운데서 나일은 해마다 새로운 생명을 가져왔습니다. 강물이 남긴 비옥한 흙 위에서 사람들은 곡식을 기르고 왕국의 터전을 일구었습니다. 이제 그들의 미래가 당신의 손에 달려 있습니다. 강의 선물을 지키고 백성을 번영으로 이끌어, 긴 세월에도 빛을 잃지 않을 나라를 세우십시오.',
    en: 'Amid an arid land, the Nile brought life anew each year. In the fertile soil left by its waters, people raised crops and laid the foundations of a kingdom. Their future now rests in your hands. Guard the river’s gifts and lead your people toward a prosperity that will shine across the centuries.',
  },
  tang: {
    ko: '장안의 거리에는 먼 나라에서 온 상인과 사절, 순례자가 모여들었습니다. 새로운 생각이 오가는 가운데 시와 그림은 한 시대의 자신감을 담아냈습니다. 당신은 이 넓은 세계와 마주한 당의 유산을 이어받았습니다. 인재에게 길을 열고 교류를 번영으로 바꾸어, 다시 한번 찬란한 시대를 이루십시오.',
    en: 'Merchants, envoys, and pilgrims from distant lands gathered in Chang’an. As ideas crossed its streets, poetry and painting gave voice to a confident age. You inherit Tang’s outward-looking legacy. Welcome talent, turn exchange into prosperity, and bring forth another age of brilliance.',
  },
  song: {
    ko: '송의 번영은 북적이는 장터와 정교한 도자기, 문인들의 붓끝에서도 드러났습니다. 그러나 풍요로운 도시를 지키는 일은 그것을 일으키는 일만큼 어려웠습니다. 이제 당신이 이 유산의 앞날을 결정할 차례입니다. 학문과 상업의 힘을 모아, 거센 도전 속에서도 흔들리지 않을 나라를 이루십시오.',
    en: 'Song prosperity flourished in busy markets, exquisite ceramics, and the brushwork of scholars. Yet protecting that wealth was as demanding as creating it. Its future is now yours to shape. Unite learning and commerce, and build a realm that can withstand the trials beyond its borders.',
  },
  han: {
    ko: '한의 시대에 서쪽으로 뻗은 교역로는 먼 지역의 물산과 사상을 이어 주었습니다. 비단과 함께 오간 것은 새로운 세계를 향한 지식과 가능성이었습니다. 이제 당신 앞에도 아직 닿지 못한 지평이 열려 있습니다. 나라의 기반을 굳히고 먼 곳과 길을 이어, 오래도록 이어질 번영을 이끄십시오.',
    en: 'During the Han era, routes stretching west connected distant goods and ideas. Silk traveled alongside knowledge of unfamiliar worlds and new possibilities. Unreached horizons now await you. Strengthen your realm and build connections beyond it, guiding your people toward an enduring prosperity.',
  },
  ming: {
    ko: '명의 장성은 산맥을 따라 이어졌고, 거대한 항해는 바다 너머의 세계로 향했습니다. 국경을 지키는 일과 먼 땅을 만나는 일은 이 왕조의 서로 다른 힘을 보여 주었습니다. 이제 그 유산을 당신의 선택으로 이어 가십시오. 굳건한 터전 위에서 더 넓은 세계를 향해 나아갈 때입니다.',
    en: 'Ming walls followed the mountain ranges, while great voyages reached toward worlds beyond the sea. Defending the frontier and engaging distant shores revealed different strengths of the dynasty. Carry that inheritance forward through your own choices. From a secure foundation, turn your gaze toward a wider world.',
  },
  qing: {
    ko: '청의 황실은 서로 다른 언어와 전통을 지닌 사람들을 광대한 제국 안에서 다스렸습니다. 앞선 왕조의 제도를 받아들이면서도 자신들의 문화를 지켜 낸 통치는 끊임없는 조율을 요구했습니다. 이제 그 무게가 당신에게 주어집니다. 넓은 영토만큼 깊은 통찰로, 서로 다른 이들이 살아갈 나라를 이끄십시오.',
    en: 'The Qing court governed an immense empire of different languages and traditions. It adapted institutions from earlier dynasties while preserving customs of its own, a balance that demanded constant care. That responsibility now falls to you. Match the breadth of your realm with the wisdom to govern its many peoples.',
  },
  qin: {
    ko: '오랫동안 나뉘어 있던 나라들은 진의 통일 아래 하나의 질서를 마주했습니다. 문자와 도량형, 행정의 기준을 맞추려는 변화는 왕조보다 오래 남았습니다. 그러나 통일을 이루는 힘만으로 나라가 영원해지지는 않습니다. 당신은 이 거대한 시작을 이어받아, 강한 권력 위에 지속할 토대를 세울 수 있겠습니까?',
    en: 'Long-divided states met a new order under Qin unification. Changes to writing, measures, and administration outlasted the dynasty itself. Yet the power to unite a realm does not ensure its survival. You inherit this immense beginning. Can you give strength a foundation that will last?',
  },
  yuan: {
    ko: '초원에서 일어난 통치자들은 원의 시대에 광대한 도시와 땅을 다스리게 되었습니다. 육지와 바다의 교역로를 따라 물산과 기술이 오가며 새로운 문화가 자라났습니다. 이제 당신은 서로 다른 세계가 만나는 자리에 서 있습니다. 정복의 유산을 교류와 번영으로 바꾸어, 제국에 오래갈 힘을 부여하십시오.',
    en: 'Rulers from the steppe came to govern vast cities and lands under the Yuan. Goods and technologies crossed overland and maritime routes, nourishing new cultural achievements. You stand where different worlds meet. Turn the inheritance of conquest into exchange and prosperity, and give your empire a strength that endures.',
  },
  wei: {
    ko: '한이 무너진 뒤, 위는 북방을 기반으로 갈라진 천하의 한 축을 차지했습니다. 경쟁하는 왕국들 사이에서 나라를 지키고 앞날을 열어 가는 일은 결코 끝나지 않았습니다. 이제 당신의 판단이 이 난세의 향방을 바꿀 것입니다. 북방의 힘을 모아, 분열 너머에 세울 새로운 질서를 준비하십시오.',
    en: 'After the Han fell, Wei emerged in the north as one of three rival kingdoms. Amid their struggles, securing the realm and shaping its future remained unfinished tasks. Your judgment may now change the course of this troubled age. Gather the strength of the north and prepare an order beyond division.',
  },
  shu: {
    ko: '천하가 셋으로 갈라진 시대, 촉은 서남쪽의 산하를 바탕으로 나라를 세웠습니다. 강한 이웃들과 마주한 왕국은 자신의 터전과 가능성을 지켜야 했습니다. 이제 당신이 그 앞길을 선택하십시오. 주어진 땅의 힘을 살리고 사람들의 뜻을 모아, 난세 속에서도 스스로의 역사를 써 내려가십시오.',
    en: 'In an age of three kingdoms, Shu built its realm amid the lands of the southwest. Facing powerful neighbors, it had to preserve both its foothold and its possibilities. Choose its path anew. Draw strength from the land and purpose from its people, and write a history of your own amid the turmoil.',
  },
  wu: {
    ko: '장강 남동쪽에 자리 잡은 오는 갈라진 천하에서 독자적인 왕국을 이루었습니다. 거대한 강은 다른 세력과 맞서는 경계이자, 나라의 앞날을 생각하게 하는 지리적 조건이었습니다. 이제 강동의 운명을 당신에게 맡깁니다. 터전의 이점을 살리고 굳건한 질서를 세워, 오래도록 이어질 왕업을 이루십시오.',
    en: 'Southeast of the Yangtze, Wu established a kingdom of its own in a divided land. The great river marked a frontier and helped shape the choices before its rulers. Its future now passes to you. Use the strengths of your homeland and build a firm order, giving your realm a legacy that will endure.',
  },
  korea: {
    ko: '조선에서는 백성의 말을 담을 새로운 글자가 만들어졌습니다. 훈민정음에 담긴 뜻은 나라의 위대함이 권세뿐 아니라 사람들의 삶에서도 드러날 수 있음을 일깨웁니다. 이제 당신이 그 뜻을 이어 갈 차례입니다. 배움의 길을 넓히고 백성의 목소리에 귀 기울여, 후세에 남길 나라를 세우십시오.',
    en: 'Joseon created a new script to give written form to its people’s speech. The purpose of Hunminjeongeum reminds us that a realm’s greatness can lie in everyday lives as well as royal power. Carry that purpose forward. Widen the paths of learning and listen to your people as you shape the country you will leave behind.',
  },
  goryeo: {
    ko: '고려의 장인들은 청자에 은은한 빛을 담았고, 수많은 경판에는 불교의 가르침과 깊은 염원이 새겨졌습니다. 손끝에서 이루어진 이 성취는 왕조가 지난 뒤에도 그 이름을 전하고 있습니다. 이제 당신은 무엇을 남기겠습니까? 지혜와 솜씨를 모아, 세월을 건너 기억될 고려의 다음 장을 여십시오.',
    en: 'Goryeo’s artisans gave celadon its quiet radiance, while countless woodblocks carried Buddhist teachings and profound hopes. These achievements preserved the kingdom’s name long after its passing. What will you leave behind? Gather wisdom and skill, and open a new chapter worthy of remembrance across the centuries.',
  },
  goguryeo: {
    ko: '고구려의 사람들은 산과 바위를 이용해 성을 쌓고, 그 안에 왕도의 터전을 마련했습니다. 험준한 지형과 어우러진 도시는 나라를 지탱하는 힘이 되었습니다. 이제 당신 앞에도 굳게 지켜야 할 땅과 이끌어야 할 사람들이 있습니다. 산성의 견고함에 흔들리지 않는 판단을 더해, 새로운 역사를 세우십시오.',
    en: 'Goguryeo’s people raised fortifications among mountains and rock, making places for royal cities within them. Joined to the rugged landscape, those cities became foundations of power. You too have lands to defend and people to lead. Add steadfast judgment to the strength of your walls, and build a new history.',
  },
  baekje: {
    ko: '백제는 이웃 나라들과 문화를 주고받으며 자신만의 세련된 예술과 건축을 이루었습니다. 바다를 건넌 교류와 땅 위에 남은 석탑은 그 왕국이 바라보던 넓은 세계를 전합니다. 이제 당신도 그 시야를 이어받으십시오. 사람과 생각이 만나는 길을 열어, 백제의 이름을 다시 빛나게 하십시오.',
    en: 'Through exchange with neighboring lands, Baekje developed distinctive arts and architecture. Connections across the sea and stone pagodas on its soil speak of a kingdom with a broad horizon. Inherit that vision. Open routes where people and ideas can meet, and let Baekje’s name shine anew.',
  },
  silla: {
    ko: '신라의 무덤에서 전해진 금관과 먼 곳의 보물들은 오랜 왕국의 찬란함을 보여 줍니다. 그 빛 뒤에는 세대를 거쳐 쌓인 솜씨와 다른 세계를 받아들인 교류가 있었습니다. 이제 당신에게 새로운 시대가 주어집니다. 물려받은 빛을 넘어, 후세가 당신의 시대를 기억할 까닭을 만들어 보십시오.',
    en: 'Gold crowns and distant treasures preserved in Silla’s tombs reveal the brilliance of a long-lived kingdom. Behind their gleam lie generations of craftsmanship and connections with other worlds. A new age is now yours. Go beyond inherited splendor and give future generations a reason to remember your time.',
  },
  gojoseon: {
    ko: '청동검과 오래된 유물은 이 땅에서 일찍 나라를 이루었던 고조선의 자취를 전합니다. 기록이 드문 시대에도 사람들은 삶의 터전을 가꾸며 공동체의 내일을 준비했습니다. 이제 당신이 그 먼 시작을 이어받습니다. 백성을 모으고 나라의 기반을 다져, 앞으로 펼쳐질 긴 역사의 첫 장을 쓰십시오.',
    en: 'Bronze daggers and ancient objects preserve traces of Gojoseon, an early state in this land’s history. Even where records are scarce, people made homes and prepared a future together. You inherit that distant beginning. Gather your people and lay firm foundations for the long history still to unfold.',
  },
  heian: {
    ko: '헤이안의 도읍에서는 궁정의 시와 이야기가 섬세한 감각을 꽃피웠습니다. 붓으로 남긴 세계는 권력의 주인이 달라진 뒤에도 사람들의 마음에 살아남았습니다. 이제 당신은 무엇으로 이 시대를 이끌겠습니까? 문화의 힘을 보살피고 나라의 앞날을 헤아려, 오래도록 남을 품격을 이루십시오.',
    en: 'In the Heian capital, courtly poems and tales nurtured a refined sensibility. Worlds preserved in ink survived even as political power changed hands. How will you guide this age? Tend the strength of its culture and consider its future, creating a grace that will endure beyond your rule.',
  },
  edo: {
    ko: '긴 전란 뒤에 자리 잡은 에도의 질서는 오랜 평화와 활발한 문화를 뒷받침했습니다. 도시의 번영 속에서 사람들은 저마다 새로운 취향과 솜씨를 펼쳤습니다. 그러나 평화를 지키는 일에도 끊임없는 선택이 따릅니다. 당신의 통치로 안정을 삶의 풍요로 바꾸어, 다음 세대가 이어 갈 시대를 만드십시오.',
    en: 'After long warfare, the Edo order sustained an extended peace and a lively culture. Prosperous cities gave people room to express new tastes and skills. Yet preserving peace demands choices of its own. Turn stability into richer lives, and shape an age that the next generation can carry forward.',
  },
  meiji: {
    ko: '메이지의 철길은 오래된 풍경을 가로지르며 변화의 속도를 드러냈습니다. 새로운 기술과 제도 앞에서 사람들은 자신들이 살아갈 나라의 모습을 다시 생각해야 했습니다. 이제 당신도 변화의 갈림길에 서 있습니다. 무엇을 받아들이고 무엇을 지킬지 살펴, 격변 속에서 백성이 나아갈 길을 여십시오.',
    en: 'Meiji railways crossed familiar landscapes, revealing the pace of change. New technologies and institutions made people reconsider the country they would inhabit. You now stand at such a crossroads. Decide what to embrace and what to preserve, and guide your people through an age of upheaval.',
  },
  sengoku: {
    ko: '성마다 다른 깃발이 오르고, 여러 다이묘가 일본의 주도권을 두고 다투었습니다. 성곽의 위세와 전장의 승리만으로는 끝없는 경쟁을 멈출 수 없었습니다. 이제 당신의 결단이 이 난세에 새로운 방향을 줄 것입니다. 흩어진 힘을 모으고, 싸움이 끝난 뒤에도 지켜질 질서를 세우십시오.',
    en: 'Different banners rose above rival castles as daimyo struggled for mastery of Japan. Imposing fortresses and victories alone could not bring their competition to an end. Your decisions may now give this troubled age a new direction. Gather its divided strength and establish an order that can survive the fighting.',
  },
  kamakura: {
    ko: '가마쿠라의 시대에는 무사들이 정치의 중심으로 나아가 새로운 통치의 틀을 세웠습니다. 권력을 얻은 이들에게는 전장을 넘어 나라를 이끌 책임이 주어졌습니다. 이제 그 책임을 당신이 이어받습니다. 굳센 결의에 신중한 판단을 더해, 무사의 힘이 오래 지속할 질서가 되게 하십시오.',
    en: 'In the Kamakura age, warriors moved to the center of politics and established a new framework of rule. Those who gained power also gained responsibilities beyond the battlefield. You inherit that burden. Join firm resolve with careful judgment, turning martial strength into an order that can last.',
  },
  aztec: {
    ko: '아즈텍의 도성 테노치티틀란은 호수 가운데 솟아올랐습니다. 섬과 육지를 잇는 길, 물 위를 오가는 배들은 이 왕국의 독특한 터전을 이루었습니다. 이제 당신이 그 물길 너머의 미래를 바라볼 차례입니다. 도성을 번영으로 이끌고 다가올 도전에 대비하여, 호수 위의 나라에 새로운 역사를 남기십시오.',
    en: 'The Aztec capital, Tenochtitlan, rose in the midst of a lake. Routes joining island and mainland, and boats crossing the waters, shaped its distinctive homeland. Now look toward the future beyond those waterways. Bring prosperity to the city and prepare for the challenges ahead, writing a new history for the realm upon the lake.',
  },
} satisfies Record<DraftCivilization, { ko: string; en: string }>;

export const civilizationIntros: Record<Civilization, { ko: string; en: string }> = {
  ...reviewedIntros,
  ...additionalCivilizationIntros,
};
