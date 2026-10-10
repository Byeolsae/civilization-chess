import { experimentalRules } from './experimentalRules.js';
import { civilizations } from './civilizations.js';
import type { Color } from 'chess.js';
import type { Civilization, Players } from './game.js';

export type Category = 'passive' | 'active' | 'piece';
export type Loadout = Record<Category, string>;
export type Loadouts = Record<Color, Loadout>;
export type Skill = { id: string; name: string; subtitle: string; description: string; detail: string; symbol: string; pending?: boolean };
export const categories: { id: Category; name: string; english: string; description: string }[] = [
  { id: 'passive', name: '패시브', english: 'PASSIVE', description: '문명의 기반이 될 지속 효과를 선택하세요.' },
  { id: 'active', name: '액티브', english: 'ACTIVE', description: '전세를 바꿀 단 한 번의 힘을 선택하세요.' },
  { id: 'piece', name: '기물 스킬', english: 'SPECIAL PIECE', description: '전장을 이끌 특별한 기물을 선택하세요.' },
];
export const skills: Record<Civilization, Record<Category, Skill[]>> = {
  ...Object.fromEntries(civilizations.map(civ => [civ.id, { passive: [], active: [], piece: [] } as Record<Category, Skill[]>])) as Record<Civilization, Record<Category, Skill[]>>,
  greece: {
    passive: [
      { id: 'democracy', name: '민주주의', subtitle: '왕보다 강한 시민', description: '킹을 잃어도 전투는 계속됩니다. 모든 폰을 잃으면 패배합니다.', detail: '기존 킹 중심의 패배 조건을 폰 중심으로 바꾸는 패시브입니다.', symbol: 'crown' },
      { id: 'philosophy', name: '철학', subtitle: '사유하는 자의 시간', description: '상대보다 3분의 추가시간을 얻습니다.', detail: '시간제한 대전용 능력입니다. 현재 기본 대전에는 타이머가 없습니다.', symbol: 'hourglass' },
      { id: 'olympics', name: '올림픽', subtitle: '승리가 부르는 승리', description: '기물이 적을 잡아 영광을 3개 쌓으면 한 번 더 행동합니다.', detail: '기물마다 영광을 쌓습니다. 추가 행동이 발동하면 해당 기물의 영광은 0이 됩니다.', symbol: 'trophy' },
    ],
    active: [
      { id: 'zeus', name: '제우스', subtitle: '전장을 가르는 번개', description: '적 하나를 감전시키고 인접 기물에 연쇄 감전을 일으킵니다.', detail: '최대 3번 전이됩니다. 아군과 적군 모두 영향을 받을 수 있습니다.', symbol: 'zap' },
      { id: 'poseidon', name: '포세이돈', subtitle: '거스를 수 없는 파도', description: '한 행 또는 열에 파도를 일으켜 상대 기물을 한 칸 밀어냅니다.', detail: '이동할 칸에 기물이 있거나 체스판 밖인 경우에는 밀려나지 않습니다.', symbol: 'waves' },
      { id: 'hades', name: '하데스', subtitle: '돌아올 수 없는 저승', description: '죽은 상대 기물 3개를 속박해 부활을 차단합니다.', detail: '선택한 기물은 어떤 효과로도 부활할 수 없습니다.', symbol: 'skull' },
    ],
    piece: [
      { id: 'trojan', name: '트로이 목마', subtitle: '나이트의 변신', description: '최대 4개의 폰을 수용하고 인접한 상하좌우 칸에 배치합니다.', detail: '목마가 잡히면 안에 있던 모든 폰도 함께 사망합니다.', symbol: 'horse' },
      { id: 'sparta', name: '스파르타', subtitle: '폰의 변신', description: '모든 폰이 추가 목숨 하나를 얻습니다.', detail: '공격으로 목숨을 잃어도 남은 목숨이 있다면 기물은 유지됩니다.', symbol: 'shield' },
      { id: 'minotaur', name: '미노타우르스', subtitle: '나이트의 변신', description: '5턴마다 바닥을 내리쳐 주변 8칸의 기물을 기절시킵니다.', detail: '아군과 적군 모두 각자 자신의 3턴 동안 전투불능 상태가 됩니다.', symbol: 'hammer' },
    ],
  },
  egypt: {
    passive: [
      { id: 'nile', name: '나일강의 범람', subtitle: '강이 가져오는 기회', description: '4턴마다 아군 진영 일부가 범람해 폰의 추가 전진을 돕습니다.', detail: '범람은 1턴 지속됩니다. 해당 지역의 폰은 다음 이동에 직선으로 1칸 더 전진하며, 추가 이동으로 포획할 수 없습니다.', symbol: 'waves' },
      { id: 'sandstorm', name: '모래폭풍', subtitle: '모래에 가려진 전장', description: '아군 기물이 일정 수 이상 잡히면 상대의 시야와 이동을 제한합니다.', detail: '2턴 동안 상대는 아군 진영 절반의 시야가 제한되며 룩·비숍·퀸은 최대 3칸만 이동합니다. 발동 기준 수는 기획 중입니다.', symbol: 'wind' },
      { id: 'pyramid', name: '피라미드의 축복', subtitle: '불멸의 수호 영역', description: '시작 전 위치를 고른 피라미드와 주변 8칸의 아군이 상태이상 면역을 얻습니다.', detail: '상태이상 면역: 기절·감전·밀침을 막고 감전 전이를 차단합니다. 영역을 벗어나면 면역이 사라집니다.', symbol: 'pyramid' },
    ],
    active: [
      { id: 'osiris', name: '오시리스', subtitle: '다시 일어서는 영혼', description: '죽은 아군 하나를 아군 진영의 빈 칸에 부활시킵니다.', detail: '원래 능력을 유지하지만 그 턴에는 행동하지 못합니다. 부활 불가 기물은 제외됩니다.', symbol: 'sun' },
      { id: 'set', name: '세트', subtitle: '사막의 지배자', description: '빈 칸과 주변 8칸에 2턴 동안 사막 지대를 만듭니다.', detail: '사막 안의 상대 기물은 최대 1칸만 이동합니다. 나이트 계열은 예외입니다.', symbol: 'wind' },
      { id: 'anubis', name: '아누비스', subtitle: '죽음의 심판', description: '적 기물 두 개에 심판을 지정합니다. 각 대상이 지정 이후 2킬을 하면 심장이 깃털보다 무거워져 사망합니다.', detail: '두 대상의 킬 수는 각각 계산합니다. 킹은 제외하며 지정 이전의 킬은 세지 않습니다. 심판은 추가 목숨을 무시합니다.', symbol: 'scale' },
    ],
    piece: [
      { id: 'mummy', name: '미라 병사', subtitle: '폰의 변신', description: '처음 잡힌 뒤 자기 턴 시작마다 최대 3번 확인하고, 사망 칸이 비면 한 번 부활합니다.', detail: '부활할 칸이 비어 있어야 합니다. 한 번 부활한 뒤 다시 잡히면 완전히 사망합니다.', symbol: 'shield' },
      { id: 'cleopatra', name: '클레오파트라', subtitle: '퀸의 변신', description: '상대 폰을 잡는 대신 2턴 동안 아군으로 매혹합니다.', detail: '두 기물은 원래 위치에 남습니다. 동시에 하나만 매혹하며 종료 후 원래 진영으로 돌아갑니다.', symbol: 'heart' },
      { id: 'sphinx', name: '스핑크스', subtitle: '나이트의 변신', description: '공격자에게 구구단 문제를 내고 5초 안에 풀지 못하면 공격을 무효화합니다.', detail: '정답을 맞히면 정상적으로 잡힙니다. 오답이나 시간 초과라면 살아남습니다.', symbol: 'question' },
    ],
  },
  rome: {
    passive: [
      { id: 'roads', name: '로마의 도로', subtitle: '모든 길은 로마로', description: '룩·비숍·퀸이 아군 하나를 뛰어넘어 도로 위에 착지할 수 있습니다.', detail: '게임 시작 전 인접한 2개 행 또는 열을 골라 도로로 지정합니다. 적은 뛰어넘을 수 없습니다.', symbol: 'route' },
      { id: 'legion', name: '군단', subtitle: '함께 서면 무너지지 않는다', description: '폰 3개 이상이 가로로 붙으면 각 기물이 기절·감전·밀침 중 한 번을 막습니다.', detail: '각 기물당 상태이상 한 번을 막습니다. 진형이 깨진 뒤 다시 형성되면 보호 효과를 다시 얻습니다.', symbol: 'shield' },
      { id: 'twelve-tables', name: '12표법', subtitle: '전장을 다스리는 법', description: '양쪽에 적용되는 법률 하나를 정하고 로마는 추가 혜택을 받습니다.', detail: '12개 법률의 세부 효과는 원안에서 아직 기획 중입니다. 이 카드의 선택은 저장할 수 있습니다.', symbol: 'scroll', pending: true },
    ],
    active: [
      { id: 'alesia', name: '알레시아 포위망', subtitle: '벗어날 수 없는 포위', description: '2×2 영역에 2턴 동안 상대가 드나들 수 없는 포위망을 만듭니다.', detail: '아군은 자유롭게 통과합니다. 킹 계열이 포함된 영역은 선택할 수 없습니다.', symbol: 'fence' },
      { id: 'vesta', name: '베스타의 성화', subtitle: '꺼지지 않는 수호', description: '3턴 동안 성화 주변 8칸의 아군을 전투불능 효과에서 한 번 보호합니다.', detail: '기물마다 한 번 보호합니다. 적이 성화 칸에 들어오면 성화가 사라집니다.', symbol: 'flame' },
      { id: 'pilum', name: '필룸 투척', subtitle: '공격의 기회를 빼앗다', description: '상대 하나를 무장 해제해 다음 자기 턴의 공격을 막습니다.', detail: '이동은 가능하며 상대의 다음 자기 턴이 끝나면 해제됩니다.', symbol: 'swords' },
    ],
    piece: [
      { id: 'gladiator', name: '글라디아토르', subtitle: '비숍의 변신', description: '적 하나를 콜로세움으로 데려가 6턴 동안 결투합니다.', detail: '게임당 2번 사용합니다. 킹은 지목할 수 없습니다. 4턴 뒤 외곽이 붕괴하며, 시간 내 상대를 잡지 못하면 패배합니다.', symbol: 'swords' },
      { id: 'ballista', name: '발리스타', subtitle: '룩의 변신', description: '이동 대신 8방향으로 최대 5칸 사격합니다. 아군은 관통합니다.', detail: '처음 맞은 적을 잡고 자기 턴 3번 동안 재장전합니다.', symbol: 'crosshair' },
      { id: 'praetorian', name: '프라이토리아니', subtitle: '나이트의 변신', description: '킹 곁에서 킹을 노리는 공격을 대신 받고 공격자와 함께 사망합니다.', detail: '킹 주변 8칸에서 근위 상태가 됩니다. 킹은 생존하고 근위 기물은 제거됩니다.', symbol: 'shield' },
    ],
  },
};

for (const categories of Object.values(skills)) for (const cards of Object.values(categories)) for (const card of cards) { if (experimentalRules[card.id]) card.detail = experimentalRules[card.id]; }

export const draftSteps = [
  { category: 'civilization', color: 'w' }, { category: 'civilization', color: 'b' },
  ...categories.flatMap(category => [{ category: category.id, color: 'w' }, { category: category.id, color: 'b' }]),
] as { category: 'civilization' | Category; color: Color }[];

export function optionsAt(picks: string[]): string[] {
  const step = draftSteps[picks.length];
  if (!step) return [];
  if (step.category === 'civilization') return Object.keys(skills);
  const civilization = picks[step.color === 'w' ? 0 : 1] as Civilization;
  const cards = skills[civilization]?.[step.category];
  return cards ? cards.length ? cards.map(skill => skill.id) : ['pending'] : [];
}

// Keep the saved eight-slot format; unconfigured skills have no gameplay effect.
function skipPending(picks: string[]): string[] {
  const next = [...picks];
  while (optionsAt(next).length === 1 && optionsAt(next)[0] === 'pending') next.push('pending');
  return next;
}

export function confirmPick(picks: string[], choice: string): string[] {
  return optionsAt(picks).includes(choice) ? skipPending([...picks, choice]) : picks;
}

export function previousPick(picks: string[]): string[] {
  let end = picks.length;
  while (end > 0 && picks[end - 1] === 'pending') end--;
  return picks.slice(0, Math.max(0, end - 1));
}

export function completeDraft(picks: string[]): { players: Players; loadouts: Loadouts } | null {
  if (picks.length !== draftSteps.length) return null;
  let validated: string[] = [];
  for (const pick of picks) {
    if (!optionsAt(validated).includes(pick)) return null;
    validated.push(pick);
  }
  const players: Players = { w: picks[0] as Civilization, b: picks[1] as Civilization };
  const loadouts: Loadouts = {
    w: { passive: picks[2], active: picks[4], piece: picks[6] },
    b: { passive: picks[3], active: picks[5], piece: picks[7] },
  };
  return { players, loadouts };
}

export function validLoadouts(players: Players, value: unknown): value is Loadouts {
  if (!value || typeof value !== 'object') return false;
  const data = value as Loadouts;
  return (['w', 'b'] as Color[]).every(color => categories.every(({ id }) => {
    const cards = skills[players[color]]?.[id];
    return cards && (cards.length ? cards.some(skill => skill.id === data[color]?.[id]) : data[color]?.[id] === 'pending');
  }));
}

export const DRAFT_KEY = 'civilization-chess.draft.v1';
export function restoreDraft(raw: string | null): string[] {
  try {
    const data = JSON.parse(raw ?? 'null');
    if (!Array.isArray(data) || data.length > draftSteps.length) return [];
    let validated: string[] = [];
    for (const pick of data) {
      if (!optionsAt(validated).includes(pick)) return [];
      validated.push(pick);
    }
    return skipPending(validated);
  } catch { return []; }
}

export function previousHumanPick(picks: string[], color: Color): string[] | null {
  for (let index = picks.length - 1; index >= 0; index--) {
    if (draftSteps[index]?.color === color && picks[index] !== 'pending') return picks.slice(0, index);
  }
  return null;
}
