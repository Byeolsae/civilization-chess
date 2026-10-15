import type { Civilization } from './civilizations';
import type { DraftCivilization } from './draftRoster';

// Original narration. Historical scope and sources: CIVILIZATION_INTRO_RESEARCH.md.
export const additionalCivilizationIntros = {
  'mongol-empire': {
    ko: '오르혼의 초원에는 유목의 삶과 제국의 도읍 카라코룸이 함께 자리했습니다. 드넓은 땅을 오가는 사람들은 서로 다른 세계의 물산과 생각을 이곳으로 가져왔습니다. 이제 당신은 초원의 힘으로 무엇을 이루겠습니까? 먼 곳을 잇는 길에 신뢰를 더하여, 만남이 오래도록 번영을 낳게 하십시오.',
    en: 'In the Orkhon grasslands, pastoral life stood alongside Karakorum, an imperial capital. Travelers across vast distances brought the goods and ideas of different worlds together. What will you accomplish with the strength of the steppe? Build trust along those distant routes, so that encounters may sustain lasting prosperity.',
  },
  'russian-empire': {
    ko: '네바강 어귀에 세워진 상트페테르부르크는 러시아가 새로운 시대를 향해 내디딘 거대한 발걸음이었습니다. 운하와 거리, 궁전으로 이어진 도시는 제국의 포부를 돌에 새겼습니다. 이제 당신에게는 수도의 장관 너머 사람들의 삶을 살필 책임이 있습니다. 변화의 힘을 나라 곳곳에 전하여, 겉모습만큼 굳건한 내일을 세우십시오.',
    en: 'Saint Petersburg rose at the mouth of the Neva as an immense step toward a new age for Russia. Its canals, streets, and palaces gave stone form to imperial ambition. Your responsibility now reaches beyond the spectacle of the capital to the lives of its people. Carry the strength of change throughout the realm, building a future as sound as it is impressive.',
  },
  prussia: {
    ko: '포츠담의 궁전과 정원에는 프로이센 왕실이 꿈꾼 질서와 아름다움이 남아 있습니다. 상수시에서는 프리드리히 2세의 궁정과 볼테르의 사상이 만났습니다. 당신의 시대에는 어떤 생각이 나라의 힘이 되겠습니까? 권세에 배움과 성찰을 더하여, 다음 세대가 머물고 싶은 터전을 이루십시오.',
    en: 'The palaces and gardens of Potsdam preserve the Prussian court’s pursuit of order and beauty. At Sanssouci, Frederick II’s court encountered the ideas of Voltaire. Which ideas will give strength to your own age? Join power with learning and reflection, shaping a home that future generations will wish to inherit.',
  },
  inca: {
    ko: '잉카의 길은 안데스의 높은 산과 깊은 골짜기를 넘어 서로 다른 땅을 연결했습니다. 사람과 소식, 물자가 오가는 길목에는 제국을 지탱하는 시설들이 놓였습니다. 이제 이 거대한 연결망을 당신이 이어받습니다. 가장 먼 마을의 목소리까지 도읍에 닿도록 하여, 산맥을 가로지르는 길을 공동의 미래로 바꾸십시오.',
    en: 'Inca roads crossed the heights and valleys of the Andes, joining very different lands. Along the routes traveled by people, messages, and supplies stood the facilities that sustained an empire. This immense network now passes into your care. Let even the most distant village be heard in the capital, turning roads across the mountains into a shared future.',
  },
  maya: {
    ko: '티칼의 신전과 광장은 마야 도시들이 이루었던 정교한 세계를 보여 줍니다. 높이 솟은 건축물 주변에는 수많은 사람들이 삶의 터전을 일구었습니다. 이제 당신이 이 도시의 다음 장을 열 차례입니다. 기념비를 세우는 솜씨에 사람을 살피는 지혜를 더해, 오래 기억될 시대를 이루십시오.',
    en: 'The temples and plazas of Tikal reveal the intricate world of Maya cities. Around their towering monuments, many people built homes and livelihoods. It is your turn to open the city’s next chapter. Match the skill of raising monuments with the wisdom of caring for people, and shape an age worthy of remembrance.',
  },
  gaul: {
    ko: '비브락테의 성벽 안에서는 장인과 상인들이 갈리아의 활기를 만들어 냈습니다. 여러 공동체가 저마다의 터전을 지키던 땅에서 이 도시는 교역과 정치의 중요한 만남터였습니다. 당신 앞에도 서로 다른 뜻을 모아야 할 시간이 다가옵니다. 성벽 안의 번영과 이웃의 신뢰를 함께 키워, 공동체가 스스로의 앞날을 선택하게 하십시오.',
    en: 'Within Bibracte’s walls, craftspeople and merchants gave life to Gaul. In a land of distinct communities, the city became an important meeting place for trade and politics. A time to bring different purposes together now lies before you. Cultivate prosperity within the walls and trust beyond them, so that your community can choose its own future.',
  },
  babylon: {
    ko: '바빌론의 성문과 궁전, 신전은 메소포타미아의 거대한 도성이 품었던 힘을 전합니다. 여러 왕조를 거치며 쌓인 도시는 통치자들의 포부보다 긴 기억을 남겼습니다. 이제 당신의 이름도 그 역사 앞에 놓입니다. 높이 세운 성벽에 걸맞은 책임으로 도시를 이끌어, 번영이 한 사람의 시대를 넘어 이어지게 하십시오.',
    en: 'Babylon’s gates, palaces, and temples speak of a great Mesopotamian city’s power. Built across successive reigns, the city preserved a memory longer than any ruler’s ambitions. Your own name now stands before that history. Govern with a responsibility equal to its mighty walls, allowing prosperity to endure beyond a single reign.',
  },
  'dai-viet': {
    ko: '홍강 유역의 탕롱에 세워진 황성은 대월의 독자적인 왕조가 나아갈 중심이 되었습니다. 남과 북에서 전해진 문화는 이 땅에서 새로운 모습을 얻었습니다. 당신은 이 풍부한 만남의 유산을 이어받습니다. 이웃의 지혜를 받아들이면서도 스스로의 길을 지켜, 강가의 도읍에 새로운 번영을 여십시오.',
    en: 'The imperial citadel at Thang Long became a center for Dai Viet’s independent dynasty in the Red River valley. Cultural influences from north and south took on new forms here. You inherit that rich meeting of traditions. Welcome the wisdom of your neighbors while choosing your own course, opening a new prosperity for the riverside capital.',
  },
  khmer: {
    ko: '앙코르의 신전들은 여러 세대에 걸쳐 크메르의 도읍을 빛냈습니다. 앙코르와트와 바이욘에 남은 돌과 조각에는 왕국의 믿음과 장인들의 솜씨가 함께 담겼습니다. 이제 당신에게 또 하나의 시대가 주어집니다. 돌에 남길 위업과 사람들에게 남길 삶을 함께 헤아려, 오래 지속할 나라의 토대를 세우십시오.',
    en: 'Across generations, Angkor’s temples gave splendor to Khmer capitals. The stone and sculpture of Angkor Wat and the Bayon preserve both royal devotion and the skill of artisans. Another age now lies in your hands. Consider the lives you will leave behind as carefully as the monuments, and lay foundations for a realm that will endure.',
  },
  siam: {
    ko: '아유타야의 높은 탑과 거대한 사원들은 시암 왕국의 옛 번영을 전합니다. 무너진 도성의 흔적에도 한 시대가 쌓아 올린 솜씨와 믿음은 남아 있습니다. 당신은 이 유산에서 어떤 미래를 시작하겠습니까? 눈부신 도읍을 이루는 일과 그것을 지켜낼 힘을 함께 길러, 다음 세대의 터전을 마련하십시오.',
    en: 'Ayutthaya’s soaring towers and great monasteries recall the prosperity of Siam. Even the remains of the fallen capital preserve an age of skill and devotion. What future will you begin from this inheritance? Nurture both the brilliance of your capital and the strength to sustain it, preparing a home for generations to come.',
  },
  majapahit: {
    ko: '자바의 트로울란에는 마자파힛 도성의 생활과 건축을 보여 주는 흔적이 남아 있습니다. 왕국의 이름은 궁정만이 아니라 그곳을 채운 사람들의 솜씨를 통해서도 전해집니다. 이제 당신이 그 터전의 앞날을 이끌 차례입니다. 도시의 재능을 모으고 번영의 기반을 다져, 자바에 오래 기억될 시대를 여십시오.',
    en: 'At Trowulan in Java, the remains of Majapahit’s capital reveal its buildings and everyday life. The kingdom’s name survives through the skill of its inhabitants as well as the memory of its court. It is now your turn to guide that homeland. Gather the talents of the city and strengthen its prosperity, opening an age that Java will remember.',
  },
  maurya: {
    ko: '마우리아의 황제 아소카는 룸비니를 찾아 돌기둥에 방문의 흔적을 남겼습니다. 제국의 권력은 신앙의 장소와 만났고, 그 기록은 먼 세대까지 전해졌습니다. 이제 당신의 선택은 무엇으로 기억되겠습니까? 넓은 나라를 다스리는 힘에 깊은 성찰을 더해, 사람들의 마음에도 남을 유산을 이루십시오.',
    en: 'Ashoka, emperor of the Mauryas, visited Lumbini and left a record upon a stone pillar. Imperial power met a place of faith, and the inscription carried that encounter across generations. How will your choices be remembered? Bring reflection to the power of governing a vast realm, creating a legacy that lives in people’s hearts as well.',
  },
  chola: {
    ko: '촐라의 왕들은 남인도에 거대한 사원을 세웠고, 장인들은 돌과 청동에 섬세한 생명을 불어넣었습니다. 탄자부르의 신전처럼 오래 남은 건축은 왕조의 힘과 예술의 깊이를 함께 보여 줍니다. 이제 그 창조의 힘을 당신이 이어 가십시오. 사람들의 재능이 모일 터전을 마련하여, 당신의 시대에도 새로운 걸작이 태어나게 하십시오.',
    en: 'Chola rulers raised great temples in southern India, where artisans gave stone and bronze a remarkable vitality. Enduring works such as the temple at Thanjavur reveal both royal power and artistic depth. Carry that creative strength into your own age. Make a place where human talents can gather, and allow new masterpieces to take form.',
  },
  mughal: {
    ko: '아그라의 흰 대리석에는 무굴 황제 샤 자한이 남긴 기억이 새겨져 있습니다. 타지마할은 한 사람을 기리는 건축이 수많은 세대의 마음에 닿을 수 있음을 보여 줍니다. 이제 당신은 어떤 뜻을 이 땅에 남기겠습니까? 뛰어난 솜씨를 보살피고 통치의 무게를 헤아려, 아름다움과 삶이 함께 번성하는 시대를 여십시오.',
    en: 'Agra’s white marble preserves a memory left by the Mughal emperor Shah Jahan. The Taj Mahal shows how a monument to one person can move generations. What purpose will you leave upon this land? Sustain its great craftsmanship and weigh the responsibilities of rule, opening an age in which beauty and human life can flourish together.',
  },
  'nepal-kingdom': {
    ko: '고르카에서 일어난 샤 왕조는 카트만두 계곡의 여러 왕국을 통합하며 네팔 왕국의 새 장을 열었습니다. 하나의 왕관 아래 모인 땅에는 저마다 깊은 전통을 지닌 사람들이 살고 있었습니다. 이제 당신은 통합 이후의 삶을 책임져야 합니다. 서로 다른 터전과 목소리를 존중하며, 산들 사이에 오래 이어질 신뢰를 세우십시오.',
    en: 'Rising from Gorkha, the Shah dynasty united the kingdoms of the Kathmandu Valley and opened a new chapter for Nepal. Beneath one crown lived peoples with deep traditions of their own. You must now take responsibility for life after unification. Respect their different homes and voices, building trust that will endure among the mountains.',
  },
  'ancient-persia': {
    ko: '페르세폴리스의 거대한 기단 위에서 아케메네스 왕조는 제국의 위엄을 건축으로 드러냈습니다. 메소포타미아의 전통을 받아들인 궁전은 서로 다른 문화가 만나는 무대가 되었습니다. 당신도 이 넓은 시야를 이어받으십시오. 여러 땅의 솜씨와 지혜가 함께 설 자리를 마련하여, 권위에 걸맞은 풍요를 이루십시오.',
    en: 'Upon the great terrace of Persepolis, the Achaemenid dynasty gave architectural form to imperial authority. Palaces drawing upon Mesopotamian traditions became a meeting place of cultures. Inherit that broad horizon. Give the skills and wisdom of different lands room to stand together, creating a prosperity worthy of your authority.',
  },
  sumer: {
    ko: '남부 메소포타미아의 물과 땅 사이에서 우루크와 우르 같은 수메르 도시들이 자라났습니다. 강의 삼각주에 모여든 사람들은 함께 살아갈 새로운 터전을 만들어 냈습니다. 이제 당신 앞에는 도시의 내일을 세울 가능성이 펼쳐집니다. 물길과 삶을 세심하게 돌보아, 사람들이 모이는 곳이 오래 머물 수 있는 고향이 되게 하십시오.',
    en: 'Between water and land in southern Mesopotamia, Sumerian cities such as Uruk and Ur took shape. People gathering in the river delta created new places to live together. The possibilities of a city’s tomorrow now lie before you. Tend its waterways and its people with care, making a place of gathering into a lasting home.',
  },
  assyria: {
    ko: '티그리스강의 아슈르는 아시리아의 도읍이자 신앙과 교역의 중심이었습니다. 농경의 터전과 먼 곳을 잇는 거래는 이 도시의 힘을 뒷받침했습니다. 이제 당신에게 도읍의 운명이 맡겨집니다. 바깥으로 뻗는 권세와 안에서 자라는 삶을 함께 살펴, 제국이 의지할 굳건한 중심을 세우십시오.',
    en: 'On the Tigris, Ashur served as an Assyrian capital and a center of religion and trade. Farmland and exchanges with distant places sustained its strength. The capital’s destiny now rests with you. Attend to life within as carefully as power beyond its walls, giving your empire a steadfast center.',
  },
  abbasid: {
    ko: '티그리스강을 따라 펼쳐진 사마라는 아바스 제국의 웅대한 도읍이었습니다. 이곳에서 발전한 건축과 장식은 먼 지역으로 전해지며 새로운 예술의 길을 열었습니다. 당신 앞에도 도시의 재능을 세계와 연결할 기회가 놓여 있습니다. 창조하는 이들의 힘을 모아, 도읍의 영향력이 오래도록 빛나게 하십시오.',
    en: 'Spread along the Tigris, Samarra was a grand capital of the Abbasid Empire. Its innovations in architecture and decoration traveled far, opening new paths for art. You too can connect the talents of your city with a wider world. Gather the strength of its creators, and let the capital’s influence shine across generations.',
  },
  ottoman: {
    ko: '보스포루스의 이스탄불에는 오스만 시대의 거대한 돔이 오래된 도시의 풍경과 나란히 솟았습니다. 발칸과 아나톨리아, 서로 다른 바다를 잇는 위치는 도읍에 넓은 세계를 가져왔습니다. 이제 당신은 이 만남의 중심을 다스립니다. 물려받은 유산과 새로 펼칠 뜻을 조화시켜, 여러 삶이 함께 이어질 도시를 이루십시오.',
    en: 'In Istanbul on the Bosphorus, great Ottoman domes rose beside the city’s older monuments. Its position between the Balkans, Anatolia, and different seas brought a wide world to the capital. You now govern this place of encounter. Bring inherited traditions into harmony with new ambitions, shaping a city where many lives can flourish together.',
  },
  macedon: {
    ko: '아이가이의 궁전과 왕릉은 마케도니아 왕국이 힘을 키워 가던 시대를 전합니다. 필리포스와 알렉산드로스의 시대를 지나며 그 지평은 헬레니즘 세계로 넓어졌습니다. 이제 당신은 그 거대한 변화의 문턱에 서 있습니다. 멀리 나아갈 결단과 만난 세계를 이해할 지혜를 함께 갖추십시오.',
    en: 'The palace and royal tombs of Aigai recall the growing power of the Macedonian kingdom. Through the ages of Philip and Alexander, its horizons opened onto the Hellenistic world. You now stand at the threshold of such immense change. Match the resolve to travel far with the wisdom to understand the worlds you encounter.',
  },
  venice: {
    ko: '작은 섬들 위에 자리 잡은 베네치아는 바다를 향해 힘을 키웠습니다. 물길 곁에 쌓인 건축과 예술은 해양 도시가 이룬 번영을 오래도록 전합니다. 이제 당신의 시선은 석호 너머를 향합니다. 바깥으로 열린 길과 도시 안의 솜씨를 함께 키워, 물 위의 공동체에 새로운 전성기를 가져오십시오.',
    en: 'Built upon small islands, Venice grew into a maritime power. Architecture and art beside its waterways preserve the prosperity of a city facing the sea. Your gaze now turns beyond the lagoon. Cultivate both outward connections and the skills within your city, bringing a new flourishing to this community upon the water.',
  },
  byzantium: {
    ko: '콘스탄티노폴리스의 하기아 소피아는 비잔티움이 남긴 신앙과 건축의 깊이를 보여 줍니다. 보스포루스의 도읍은 여러 지역과 바다가 만나는 길목에 서 있었습니다. 이제 그 오래된 중심을 당신이 이어받습니다. 축적된 지혜를 다가올 변화에 맞게 펼쳐, 도시의 빛이 다음 시대에도 이어지게 하십시오.',
    en: 'Hagia Sophia in Constantinople reveals the depth of Byzantine faith and architecture. The capital on the Bosphorus stood where regions and seas met. You inherit that enduring center. Adapt its accumulated wisdom to the changes ahead, allowing the city’s light to reach another age.',
  },
  carthage: {
    ko: '튀니스만에 자리 잡은 카르타고는 지중해를 무대로 거대한 교역의 힘을 길렀습니다. 먼 항구와 이어진 도시는 바다를 향한 시야로 번영을 이루었습니다. 당신에게는 그 풍요를 지켜낼 새로운 선택이 기다립니다. 교역의 길을 단단히 잇고 위기 앞에서 지혜를 모아, 도시에 오래갈 미래를 선사하십시오.',
    en: 'On the Gulf of Tunis, Carthage grew into a great trading power across the Mediterranean. Connections with distant ports gave the city a broad maritime horizon. New choices now await you in safeguarding that prosperity. Strengthen its routes and gather wisdom in times of danger, giving the city a future that can endure.',
  },
  phoenicia: {
    ko: '티레를 비롯한 페니키아의 도시들은 바다 건너 새로운 거점과 인연을 맺었습니다. 항구에서 시작된 길은 지중해 곳곳으로 이어지며 도시의 가능성을 넓혔습니다. 이제 당신도 수평선 너머의 만남을 준비하십시오. 돌아오는 배에 물산뿐 아니라 신뢰가 실리도록 하여, 작은 항구의 힘을 먼 세계에 전하십시오.',
    en: 'Phoenician cities such as Tyre established new settlements and connections across the sea. Routes beginning in their harbors stretched around the Mediterranean, widening the possibilities of urban life. Prepare your own encounters beyond the horizon. Let returning ships carry trust as well as goods, extending the strength of your harbor into distant worlds.',
  },
  celts: {
    ko: '켈트 예술의 굽이치는 선과 정교한 금속 장식에는 여러 공동체의 솜씨가 담겨 있습니다. 서로 다른 땅에서 이어진 전통은 하나의 왕관으로 묶을 수 없는 풍부한 유산을 남겼습니다. 당신은 이 다양함에서 어떤 힘을 길러내겠습니까? 각자의 자부심을 존중하며 뜻을 모아, 후세에 전할 새로운 이야기를 이루십시오.',
    en: 'The flowing lines and intricate metalwork of Celtic art preserve the skill of many communities. Traditions across different lands left an inheritance richer than any single crown could contain. What strength will you draw from that diversity? Bring people together with respect for their distinct identities, creating a new story to pass to future generations.',
  },
  huns: {
    ko: '아틸라의 시대에 훈족은 로마 세계가 외면할 수 없는 세력으로 떠올랐습니다. 여러 집단을 모은 권력은 전쟁과 협상으로 유럽의 질서를 흔들었습니다. 이제 당신에게는 승리 이후까지 내다볼 판단이 필요합니다. 모인 힘이 흩어지지 않을 기반을 마련하여, 격변 속에서 이어갈 미래를 찾으십시오.',
    en: 'In Attila’s age, the Huns became a power the Roman world could not ignore. Authority drawing different groups together challenged Europe’s order through warfare and negotiation. You now need judgment that reaches beyond victory. Give that gathered strength a foundation against division, and find a future amid the upheaval.',
  },
  scythia: {
    ko: '초원을 누빈 스키타이 사람들에게 말은 삶을 함께하는 중요한 존재였습니다. 금속에 새긴 동물의 형상에는 그들이 바라본 세계와 뛰어난 솜씨가 남아 있습니다. 이제 당신은 넓은 땅에서 공동체가 나아갈 길을 찾습니다. 이동의 힘과 전통의 깊이를 함께 살려, 변화하는 지평에서도 이어질 터전을 지키십시오.',
    en: 'For Scythian peoples of the steppe, horses were essential companions in life. Animal forms worked in metal preserve their vision of the world and their remarkable craftsmanship. You must now find a course for your community across these broad lands. Draw on both mobility and tradition, sustaining a homeland amid changing horizons.',
  },
  aksum: {
    ko: '악숨의 거대한 석비와 왕릉은 아프리카 북동부에서 번성한 왕국의 위엄을 전합니다. 정치의 중심이 달라진 뒤에도 이 도시는 오랫동안 왕권의 기억을 간직했습니다. 당신은 그 깊은 유산 앞에 서 있습니다. 돌기둥의 높이에 걸맞은 포부로 사람들을 이끌되, 나라의 힘이 삶 속에서도 드러나게 하십시오.',
    en: 'Aksum’s great stelae and royal tombs preserve the stature of a flourishing kingdom in northeastern Africa. Long after political power shifted, the city retained its memory of kingship. You stand before that deep inheritance. Lead with ambitions worthy of its towering stones, ensuring that the realm’s strength is felt in everyday life as well.',
  },
  'ethiopian-empire': {
    ko: '곤다르의 성벽 안에는 에티오피아 황제들의 궁전과 교회가 모여들었습니다. 여러 지역에서 전해진 건축의 영향은 이곳에서 독특한 모습을 이루었습니다. 이제 당신의 시대에도 전통과 새로운 만남이 함께 찾아옵니다. 받아들일 지혜와 지켜낼 터전을 헤아려, 다음 세대가 의지할 중심을 세우십시오.',
    en: 'Within Gondar’s walls rose the palaces and churches of Ethiopian emperors. Architectural influences from different regions took on a distinctive form here. Tradition and new encounters now meet in your own age. Consider both the wisdom to welcome and the homeland to preserve, building a center on which future generations can rely.',
  },
  mali: {
    ko: '사하라를 건너는 교역로에는 말리의 금이 실렸고, 만사 무사의 순례는 그 부를 먼 곳에 알렸습니다. 사막 너머로 이어진 관계는 제국의 이름을 넓은 세계에 전했습니다. 이제 당신은 그 풍요의 쓰임을 결정해야 합니다. 부가 지나가는 길마다 사람들의 삶도 풍성해지도록, 다음 시대의 번영을 설계하십시오.',
    en: 'Gold from Mali traveled along routes across the Sahara, while Mansa Musa’s pilgrimage made its wealth known far away. Connections beyond the desert carried the empire’s name into a wider world. You must now decide how that abundance will be used. Shape a prosperity that enriches people’s lives wherever its wealth travels.',
  },
  songhai: {
    ko: '가오의 흙으로 쌓은 기념물은 송가이 제국의 힘과 사헬 장인들의 지혜를 전합니다. 소금과 금이 오가는 사하라 교역은 그 번영을 뒷받침했습니다. 이제 당신은 먼 길의 물산과 도읍의 삶을 함께 책임집니다. 길목의 이익을 튼튼한 나라의 기반으로 바꾸어, 다음 세대에도 풍요가 이어지게 하십시오.',
    en: 'Gao’s earthen monuments preserve the power of Songhai and the knowledge of Sahelian builders. Trans-Saharan trade in salt and gold helped sustain that prosperity. You now hold responsibility for both distant routes and life in the capital. Turn the wealth of a crossroads into firm foundations, so that abundance can reach the next generation.',
  },
  morocco: {
    ko: '모로코의 페스에는 학교와 시장의 숙소, 모스크와 분수가 함께 도시의 결을 이루었습니다. 마린 왕조 시대의 번영은 배움과 생활이 어우러진 공간에 흔적을 남겼습니다. 당신은 그 풍부한 도시의 유산을 이어받습니다. 배우는 이와 일하는 이가 함께 힘을 펼치도록, 새로운 시대의 문을 여십시오.',
    en: 'In Fez, schools, merchants’ lodgings, mosques, and fountains formed the fabric of a Moroccan city. Prosperity under the Marinids left its mark on places where learning and everyday life met. You inherit that rich urban legacy. Open a new age in which those who study and those who labor can flourish together.',
  },
  kongo: {
    ko: '고원 위의 음반자콩고에는 왕의 거처와 재판의 자리, 공동체의 신성한 장소가 모여 있었습니다. 바깥 세계와의 만남은 콩고 왕국의 도읍에 깊은 변화를 가져왔습니다. 이제 당신은 변화 속에서 무엇을 이어갈지 선택해야 합니다. 오랜 질서와 새 가능성을 살피며, 사람들이 스스로의 뿌리를 지킬 미래를 여십시오.',
    en: 'On its plateau, Mbanza Kongo brought together the royal residence, customary court, and sacred places of the community. Encounters with the outside world brought profound change to the kingdom’s capital. You must now choose what to carry forward through change. Weigh inherited institutions and new possibilities, opening a future in which people can preserve their roots.',
  },
  buganda: {
    ko: '부간다의 카수비에는 나무와 갈대, 짚으로 이룬 왕실 건축의 깊은 솜씨가 남아 있습니다. 그곳은 통치자의 기억과 공동체의 믿음이 이어지는 장소이기도 합니다. 당신에게 주어진 유산은 건물의 모습보다 넓습니다. 사람들을 묶는 전통을 돌보며, 다음 세대가 자신들의 이야기를 이어갈 터전을 지키십시오.',
    en: 'At Kasubi, wood, reeds, and thatch reveal the depth of Buganda’s royal building traditions. The site also carries the memory of rulers and the beliefs of a community. Your inheritance reaches beyond the shape of its buildings. Care for the traditions that bind people together, protecting a home where the next generation can continue its story.',
  },
  kush: {
    ko: '메로에의 피라미드와 신전은 쿠시 왕국이 남긴 독자적인 세계를 보여 줍니다. 나일과 아프리카 내륙을 잇는 땅에서 서로 다른 예술과 믿음이 만났습니다. 이제 당신은 그 만남에서 새로운 힘을 길러낼 차례입니다. 물과 삶의 터전을 보살피며, 강 너머에도 전해질 왕국의 다음 장을 여십시오.',
    en: 'The pyramids and temples of Meroe reveal a distinctive world left by the kingdom of Kush. In lands connecting the Nile with Africa’s interior, different arts and beliefs met. It is your turn to draw new strength from those encounters. Tend the waters and the foundations of life, opening a chapter whose memory will travel beyond the river.',
  },
  normans: {
    ko: '시칠리아의 노르만 왕국에서는 서유럽과 이슬람, 비잔티움의 건축 전통이 만났습니다. 팔레르모의 궁전과 성당은 서로 다른 장인들의 솜씨가 이룬 새로운 아름다움을 전합니다. 이제 당신도 차이를 나라의 힘으로 바꿀 수 있습니다. 함께 만들어 낼 가능성을 알아보고, 여러 전통이 빛을 더하는 시대를 여십시오.',
    en: 'In Norman Sicily, Western European, Islamic, and Byzantine building traditions came together. Palermo’s palaces and churches preserve a new beauty created through different crafts. You too can turn difference into strength. Recognize what people can create together, opening an age illuminated by many traditions.',
  },
  'british-empire': {
    ko: '카리브해의 브림스톤힐 요새는 대영제국이 바다 건너 펼친 힘을 보여 줍니다. 그 돌벽에는 설계자의 기술뿐 아니라 강제로 동원된 아프리카인들의 노동도 새겨져 있습니다. 당신은 이 무거운 유산 앞에서 어떤 길을 택하겠습니까? 먼 곳에 미치는 힘만큼 깊은 책임으로, 사람들의 존엄을 지키는 미래를 이루십시오.',
    en: 'Brimstone Hill in the Caribbean reveals the reach of British imperial power across the sea. Its stone walls embody both the engineers’ skill and the forced labor of enslaved Africans. What course will you choose before this weighty inheritance? Match the distance of your influence with a depth of responsibility, shaping a future that safeguards human dignity.',
  },
  'french-empire': {
    ko: '나폴레옹 시대의 프랑스는 법을 하나로 정리하며 사회를 새롭게 조직하려 했습니다. 민법전에 담긴 질서는 제국의 부침을 넘어 긴 영향을 남겼습니다. 이제 당신은 제도에 어떤 삶을 담을지 결정해야 합니다. 명령의 힘에 신중한 판단을 더해, 사람들이 믿고 살아갈 나라의 토대를 마련하십시오.',
    en: 'France in Napoleon’s age sought to reorganize society by bringing its civil laws into one code. That legal order left an influence beyond the fortunes of the empire. You must now decide what kind of life your institutions will sustain. Join authority with careful judgment, laying foundations on which people can confidently build their lives.',
  },
  'spanish-empire': {
    ko: '세비야에는 스페인 제국과 아메리카를 잇던 항로의 기록이 모여 있습니다. 바다를 건넌 교역과 정복은 서로 다른 대륙의 삶을 깊이 바꾸었습니다. 이제 당신 앞에는 넓은 세계와 그만큼 무거운 책임이 놓입니다. 먼 땅의 사람들까지 헤아리는 판단으로, 만남 이후에 이어질 미래를 선택하십시오.',
    en: 'Seville preserves the records of routes linking the Spanish Empire with the Americas. Trade and conquest across the ocean profoundly changed lives on different continents. A wide world, and a responsibility just as great, now lies before you. Consider the people of distant lands as you choose the future that will follow these encounters.',
  },
  'portugal-kingdom': {
    ko: '리스본의 벨렝에 남은 건축은 포르투갈 왕국이 바다로 시야를 넓히던 시대를 전합니다. 먼 항로는 새로운 연결을 만들었지만, 그 만남에는 지배와 강제의 역사도 따랐습니다. 이제 당신은 수평선 너머로 무엇을 가져가겠습니까? 항해의 용기에 책임을 더하여, 오가는 길이 서로의 삶을 풍요롭게 하십시오.',
    en: 'The monuments of Belém in Lisbon recall an age when Portugal widened its horizons at sea. Distant routes created new connections, but those encounters also brought domination and coercion. What will you carry beyond the horizon? Join the courage to sail with responsibility, making the routes between peoples enrich their lives.',
  },
  'dutch-republic': {
    ko: '네덜란드 공화국 시대의 암스테르담은 물길을 정비하며 도시의 경계를 넓혔습니다. 운하와 거리, 집들이 함께 짜인 계획은 항구 도시의 새로운 모습을 만들었습니다. 이제 당신에게도 물과 땅 사이의 가능성이 열립니다. 정교한 계획에 사람을 위한 비전을 더해, 번영을 오래 담아낼 도시를 이루십시오.',
    en: 'During the Dutch Republic, Amsterdam expanded through a carefully planned network of waterways. Canals, streets, and homes together gave the port city a new form. Possibilities between land and water now open before you. Add a vision for people to the precision of your plans, building a city capable of sustaining prosperity.',
  },
  'poland-kingdom': {
    ko: '크라쿠프의 광장과 바벨 언덕은 폴란드 왕국의 도읍이 품었던 활기를 전합니다. 왕실의 터전과 도시의 삶은 비스와강 곁에서 오랜 역사를 함께 쌓았습니다. 이제 당신은 이 중심을 다음 시대로 이끌어야 합니다. 왕관의 무게와 거리의 목소리를 함께 헤아려, 나라가 의지할 굳건한 터전을 이루십시오.',
    en: 'Kraków’s square and Wawel Hill recall the vitality of the Polish kingdom’s capital. Royal institutions and urban life built a long history together beside the Vistula. You must now guide this center into another age. Consider the weight of the crown alongside the voices of the streets, giving the realm a steadfast foundation.',
  },
  'hungary-kingdom': {
    ko: '다뉴브강을 내려다보는 부다의 성에는 헝가리 왕국의 오랜 기억이 남아 있습니다. 강가에 쌓인 건축은 여러 시대가 이 터전에 남긴 변화를 보여 줍니다. 이제 당신도 그 역사 위에 새로운 장을 써야 합니다. 물려받은 중심을 굳건히 지키면서, 다가올 시대를 받아들일 지혜를 기르십시오.',
    en: 'Overlooking the Danube, Buda’s castle preserves the memory of the Hungarian kingdom. Buildings beside the river reveal the changes successive ages brought to this place. You must now write a new chapter upon that history. Safeguard the center you inherit while cultivating the wisdom to meet the age ahead.',
  },
  'holy-roman-empire': {
    ko: '레겐스부르크에는 교역의 활기와 제국의 회의가 함께 모였습니다. 신성 로마 제국의 질서는 여러 권력과 도시가 관계를 맺고 뜻을 조율하는 가운데 이어졌습니다. 당신에게 필요한 것은 홀로 내리는 명령 이상의 지혜입니다. 서로 다른 이해를 연결하여, 함께 지켜낼 질서를 세우십시오.',
    en: 'Regensburg brought the activity of trade together with assemblies of the empire. The Holy Roman Empire’s order depended on relationships among different powers and cities. You will need wisdom beyond issuing commands alone. Connect their varied interests, and build an order they can sustain together.',
  },
  austria: {
    ko: '빈의 궁전과 거리에는 오스트리아가 지나온 제국 시대의 흔적이 남아 있습니다. 오랫동안 음악의 중심이었던 도시는 정치의 변화 속에서도 풍부한 문화적 유산을 전했습니다. 당신은 이 기억을 새로운 시대에 어떻게 이어가겠습니까? 물려받은 품격에 열린 마음을 더해, 사람들의 재능이 함께 울려 퍼질 터전을 만드십시오.',
    en: 'Vienna’s palaces and streets preserve traces of Austria’s imperial past. Long a center of music, the city carried a rich cultural inheritance through political change. How will you bring that memory into a new age? Join inherited refinement with an open mind, creating a home where many talents can resonate together.',
  },
  'georgia-kingdom': {
    ko: '겔라티 수도원에는 중세 조지아 왕국의 번영과 배움의 깊이가 남아 있습니다. 다비트와 타마르의 시대에 자라난 문화는 건축과 예술 속에서 긴 생명을 얻었습니다. 이제 당신도 다음 전성기의 문을 열 수 있습니다. 나라를 지키는 힘과 지혜를 기르는 터전을 함께 보살피십시오.',
    en: 'Gelati Monastery preserves the prosperity and learning of medieval Georgia. Culture flourishing in the ages of David and Tamar found a lasting life in architecture and art. You too can open the door to another great age. Care for the places that cultivate wisdom as well as the strength that protects the realm.',
  },
  'bulgarian-empire': {
    ko: '마다라의 절벽에 새겨진 기마상은 초기 불가리아 왕국의 기억을 품고 있습니다. 높은 바위에 남은 형상과 기록은 나라가 자신의 시대를 세워 가던 모습을 전합니다. 이제 당신의 결단이 그 뒤를 이을 것입니다. 눈앞의 위세를 넘어, 오래 기억될 통치의 기반을 다지십시오.',
    en: 'The rider carved into Madara’s cliff carries the memory of the early Bulgarian state. Its image and inscriptions recall a realm establishing its place in history. Your decisions will now continue that story. Look beyond the display of power before you, and lay foundations for a rule worth remembering.',
  },
  vikings: {
    ko: '비르카의 교역터와 호브고르덴의 유적은 바이킹 시대에 먼 지역을 잇던 관계를 보여 줍니다. 북방의 사람들은 항로를 따라 물산과 생각이 오가는 세계에 참여했습니다. 이제 당신 앞에도 새로운 길이 열립니다. 낯선 곳을 향한 담대함에 돌아올 고향을 돌보는 지혜를 더하십시오.',
    en: 'Birka’s trading settlement and the remains at Hovgården reveal connections reaching far across the Viking world. Northern peoples participated in networks carrying goods and ideas along distant routes. New paths now open before you. Match the boldness to enter unfamiliar lands with the wisdom to care for the home to which you return.',
  },
  'sweden-kingdom': {
    ko: '발트해의 카를스크로나에는 스웨덴 왕국의 해군을 위한 도시가 계획적으로 세워졌습니다. 항구와 조선 시설, 도시의 구조는 바다를 무대로 한 국가의 포부를 드러냈습니다. 이제 당신은 그 힘을 어디로 이끌겠습니까? 단단한 준비와 먼 앞날을 살피는 판단으로, 해안의 터전을 지켜낼 미래를 만드십시오.',
    en: 'On the Baltic, Karlskrona was planned as a naval city for the Swedish kingdom. Its harbor, shipbuilding facilities, and urban design expressed ambitions shaped by the sea. Where will you lead that strength? Join thorough preparation with foresight, building a future capable of safeguarding your coastal homeland.',
  },
  'scotland-kingdom': {
    ko: '중세의 성이 내려다보는 에든버러는 스코틀랜드 왕국의 도읍으로 자리 잡았습니다. 성 아래에 이어진 구시가의 길에는 여러 세대의 삶이 겹쳐졌습니다. 이제 당신은 그 터전을 새로운 시대로 이끕니다. 높은 성벽의 힘과 거리에서 자라는 활기를 함께 살려, 오래도록 이어질 나라의 중심을 세우십시오.',
    en: 'Beneath its medieval fortress, Edinburgh became the capital of the Scottish kingdom. Along the streets of the Old Town, generations of lives left their mark. You now guide that homeland into a new age. Bring the strength of its walls together with the vitality of its streets, sustaining a center that will endure.',
  },
  'iceland-commonwealth': {
    ko: '싱벨리르의 열린 땅에서 알팅은 법을 세우고 분쟁을 조정했습니다. 아이슬란드 자유국의 공동체는 함께 모여 질서를 이어갈 방법을 찾았습니다. 이제 당신의 판단도 여러 목소리 사이에서 시험받을 것입니다. 합의의 무게를 존중하며, 약속이 먼 계절 뒤에도 지켜질 미래를 이루십시오.',
    en: 'On the open ground of Thingvellir, the Althing established laws and settled disputes. Communities of the Icelandic Commonwealth gathered to sustain an order together. Your judgment will now be tested among many voices. Honor the weight of agreement, shaping a future in which promises endure through distant seasons.',
  },
  'brazil-empire': {
    ko: '브라질 제국은 오랫동안 노예제의 모순을 안고 있었고, 그 폐지는 제국 말기에 이르러서야 법으로 선언되었습니다. 나라의 규모와 궁정의 위엄만으로 사람들의 자유를 보장할 수는 없었습니다. 당신 앞에는 더 깊은 변화의 과제가 놓여 있습니다. 누구의 삶도 번영의 그늘에 남지 않도록, 새로운 시대의 토대를 세우십시오.',
    en: 'The Brazilian Empire long carried the injustice of slavery, whose abolition was declared by law only near its end. Neither the size of a country nor the dignity of a court could guarantee human freedom. A deeper task of change now lies before you. Lay foundations for an age in which no one’s life is left in the shadow of prosperity.',
  },
  'gran-colombia': {
    ko: '독립의 격변 속에서 그란 콜롬비아는 남아메리카 북부의 여러 지역을 하나의 공화국으로 묶으려 했습니다. 공동의 나라를 세우려는 뜻은 지역마다 다른 이해와 마주해야 했습니다. 이제 당신에게는 독립 이후를 이어갈 지혜가 필요합니다. 함께 얻은 가능성이 오래갈 신뢰가 되도록, 서로의 목소리가 닿는 길을 여십시오.',
    en: 'Amid the upheaval of independence, Gran Colombia sought to unite regions of northern South America in one republic. The hope of a shared country faced differing regional interests. You now need the wisdom to carry independence forward. Open paths where people can hear one another, turning shared possibilities into lasting trust.',
  },
  iroquois: {
    ko: '하우데노쇼니의 여러 민족은 평화롭게 뜻을 모으기 위해 연맹을 이루었습니다. 각자의 정체성을 지키면서도 함께 논의하는 전통은 공동체를 잇는 힘이 되었습니다. 이제 당신도 그 협의의 자리에 섭니다. 목소리를 듣고 약속을 지키며, 다음 세대까지 이어질 평화의 기반을 돌보십시오.',
    en: 'The nations of the Haudenosaunee formed a confederacy to reach decisions in peace. Traditions of deliberation connected them while allowing each to retain its identity. You now take your place in that work of counsel. Listen to their voices and honor their agreements, caring for the foundations of peace for generations to come.',
  },
  shoshone: {
    ko: '쇼쇼니의 여러 공동체는 저마다의 고향에 대한 깊은 지식을 이어 왔습니다. 팀비샤 쇼쇼니에게 죽음의 계곡이라 불리는 땅도 생명이 깃든 삶의 터전입니다. 당신에게 맡겨진 것은 지도 위의 빈 공간이 아닙니다. 그 땅을 아는 사람들의 지혜를 존중하여, 다음 세대가 고향과 함께 살아갈 길을 지키십시오.',
    en: 'Shoshone communities have carried deep knowledge of their distinct homelands. For the Timbisha Shoshone, the place called Death Valley is a living home. What rests in your care is no empty space upon a map. Honor the knowledge of those who belong to the land, protecting a path for future generations to live with their homeland.',
  },
  mississippian: {
    ko: '카호키아의 거대한 흙 둔덕과 광장은 미시시피 문화의 도시가 이룬 규모를 보여 줍니다. 수많은 사람들이 함께 움직여 만든 공간에는 공동체의 힘이 담겼습니다. 이제 당신은 그 힘을 어떤 미래로 이끌겠습니까? 높은 기념물 곁의 일상도 풍요롭게 하여, 사람들이 함께 살아갈 도시를 이루십시오.',
    en: 'Cahokia’s great earthen mounds and plazas reveal the scale of a Mississippian city. Spaces built through the efforts of many people embody the strength of a community. Toward what future will you guide that strength? Enrich everyday life beside the great monuments, shaping a city where people can thrive together.',
  },
  mapuche: {
    ko: '마푸체의 삶은 친족으로 이어진 공동체인 로프를 중심으로 뿌리를 내렸습니다. 사람들을 묶는 관계는 각자의 터전을 지키며 함께 살아갈 힘이 되었습니다. 이제 당신도 그 관계 속에서 앞날을 열어야 합니다. 공동체의 뜻과 땅에 대한 책임을 헤아려, 다음 세대가 자신의 삶을 이어갈 길을 지키십시오.',
    en: 'Mapuche life took root in kin-based communities known as lof. Relationships joining people gave strength to living together and caring for their homes. You must now find a future within those bonds. Respect the purposes of the community and its responsibilities to the land, protecting the next generation’s ability to continue its own way of life.',
  },
  'hawaii-polynesia': {
    ko: '호놀룰루의 이올라니 궁전은 하와이 왕국의 독자적인 역사를 전합니다. 칼라카우아와 릴리우오칼라니의 시대가 남긴 기억은 태평양 한가운데서 스스로의 길을 지키려던 나라를 떠올리게 합니다. 이제 당신에게 그 미래를 상상할 시간이 주어집니다. 섬의 문화와 사람들의 뜻을 소중히 하여, 바다 너머의 세계와 당당히 마주하십시오.',
    en: 'Iolani Palace in Honolulu preserves the distinct history of the Hawaiian Kingdom. Memories of Kalākaua and Liliʻuokalani recall a country seeking its own course in the Pacific. You are now invited to imagine its future. Cherish the islands’ culture and the purposes of their people as you meet the world beyond the sea.',
  },
  'tonga-empire': {
    ko: '라파하의 왕릉에는 투이통가 왕조의 긴 기억이 남아 있습니다. 섬들을 잇는 권위와 관계는 통가를 넘어 태평양의 이웃들에게도 영향을 전했습니다. 이제 당신은 바다로 이어진 세계를 이끌어 갑니다. 먼 항해만큼 깊은 신뢰를 쌓아, 흩어진 섬들이 함께 미래를 바라보게 하십시오.',
    en: 'The royal tombs at Lapaha preserve the long memory of the Tuʻi Tonga dynasty. Authority and relationships linking islands carried influence beyond Tonga to Pacific neighbors. You now guide a world connected by sea. Build trust as deep as its voyages are long, allowing scattered islands to look toward a future together.',
  },
  maori: {
    ko: '마오리의 화카파파는 사람과 조상, 살아 있는 세계를 관계로 이어 줍니다. 세대를 건너 전해진 이야기는 땅에 대한 기억과 공동체의 자리를 함께 담고 있습니다. 당신도 그 긴 연결 속에서 자신의 시대를 맞이합니다. 물려받은 지혜에 귀 기울이며, 다음 세대가 이어 말할 이야기를 만들어 가십시오.',
    en: 'Māori whakapapa connects people, ancestors, and the living world through relationships. Stories passed across generations carry memories of land and a community’s place within it. Your own age begins within that long connection. Listen to the wisdom you inherit, and shape a story that the next generation can carry forward.',
  },
  'pirate-republic': {
    ko: '나소의 얕은 바다와 항구는 해적들에게 거점이 되었습니다. 왕실의 통제가 약해진 틈에서 모인 이들의 질서는 경쟁과 불안 속에 오래 버티지 못했습니다. 이제 당신 앞에는 항해의 대담함만으로 풀 수 없는 과제가 놓입니다. 서로 다른 이들의 약속을 굳게 묶어, 파도 너머의 내일까지 지켜낼 길을 찾으십시오.',
    en: 'Nassau’s shallow waters and harbor offered pirates a base. In the absence of firm royal control, their precarious order faced rivalry and did not endure. You now confront a task that bold seamanship alone cannot solve. Bind different people through dependable agreements, finding a course that can hold beyond the next wave.',
  },
} satisfies Record<Exclude<Civilization, DraftCivilization>, { ko: string; en: string }>;
