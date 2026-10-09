import { AbilityGame } from './AbilityGame';
import { skills } from './draft';
import type { Square } from 'chess.js';

type Step = { text: string; run: (game: AbilityGame) => void };
export type SkillScenario = { game: AbilityGame; steps: Step[]; intro: string };
const none = { passive: 'pending', active: 'pending', piece: 'pending' };
function fen(pieces: Record<string, string>, turn = 'w') {
  const rows: string[] = [];
  for (let rank = 8; rank > 0; rank--) {
    let row = '', empty = 0;
    for (const file of 'abcdefgh') {
      const piece = pieces[file + rank];
      if (piece) { if (empty) row += empty; empty = 0; row += piece; } else empty++;
    }
    rows.push(row + (empty || ''));
  }
  return rows.join('/') + ` ${turn} - - 0 1`;
}
const move = (from: Square, to: Square, quiz?: boolean) => (game: AbilityGame) => game.perform({ kind: 'move', from, to, ...(quiz === undefined ? {} : { quiz }) });
const cast = (skill: string, to?: Square, direction?: number) => (game: AbilityGame) => {
  const action = game.actions().find(a => a.skill === skill && (!to || a.to === to) && (direction === undefined || a.direction === direction));
  if (!action) throw Error(`Missing legal demonstration action: ${skill} ${to}`);
  game.perform(action);
};
export function createSkillScenario(id: string): SkillScenario | null {
  const category = Object.values(skills).flatMap(c => Object.entries(c)).find(([, list]) => list.some(s => s.id === id && !s.pending))?.[0];
  if (!category) return null;
  const loadouts = { w: { ...none, [category]: id }, b: { ...none } };
  let pieces: Record<string, string> = { a1: 'K', h8: 'k', d4: 'P', d6: 'p' };
  let turn = 'w';
  let intro = '실제 규칙으로 진행되는 예시 대전입니다.';
  const steps: Step[] = [];
  const add = (text: string, run: Step['run']) => steps.push({ text, run });
  switch (id) {
    case 'zeus': pieces = { a1:'K',h8:'k',d5:'r',e5:'p',e4:'P' }; add('번개가 전이되고 감전된 기물 주변에 전기가 남습니다.',cast(id,'d5')); break;
    case 'poseidon': pieces = { a1:'K',h8:'k',c5:'p',e5:'r' }; add('선택한 행에 파도가 지나가며 적을 오른쪽으로 밀어냅니다.',cast(id,'a5',0)); break;
    case 'hades': pieces = { a1:'K',h8:'k',c6:'p',d6:'n',e6:'b' }; add('죽은 적 셋을 봉인합니다. 이후 부활할 수 없습니다.',cast(id)); break;
    case 'osiris': pieces = { a1:'K',h8:'k',d3:'B' }; add('사망한 아군이 빈 칸에서 부활하고 그 턴에는 행동하지 못합니다.',cast(id,'d3')); break;
    case 'set': add('실제 사막 지형이 생성되고 영역 내 적의 이동을 제한합니다.',cast(id,'d5')); break;
    case 'anubis': add('빈 칸에 함정을 설치합니다.',cast(id,'d5')); add('적 폰이 함정에 들어오면 사망하고 함정이 사라집니다.',move('d6','d5')); break;
    case 'alesia': add('실제 2×2 포위망이 생겨 적의 경계 통과를 막습니다.',cast(id,'d5')); break;
    case 'vesta': loadouts.b.active='zeus'; add('성화를 설치해 주변 아군을 한 번 보호합니다.',cast(id,'d5')); add('상대의 번개를 성화 보호가 막습니다.',cast('zeus','d4')); break;
    case 'pilum': add('상대 기물에 인게임 무장 해제 표시가 나타납니다.',cast(id,'d6')); break;
    case 'trojan': pieces={a1:'K',h8:'k',d4:'N',d3:'P'}; add('인접한 폰을 목마에 태웁니다.',cast(id,'d3')); add('상대가 한 수를 둡니다.',move('h8','g8')); add('목마에서 폰을 인접한 빈 칸에 내립니다.',cast('deploy','e4')); break;
    case 'minotaur': pieces={a1:'K',h8:'k',d4:'N',d5:'r',e4:'P'}; add('실제 충격파와 화면 흔들림이 발생하고 주변 기물에 기절 표시가 남습니다.',cast(id)); break;
    case 'cleopatra': pieces={a1:'K',h8:'k',c3:'Q',e5:'p'}; add('폰의 진영이 바뀌고 실제 하트 효과가 나타납니다.',cast(id,'e5')); break;
    case 'ballista': pieces={a1:'K',h8:'k',d3:'R',d4:'P',d6:'b'}; add('아군을 관통하는 실제 사격으로 적을 제거하고 재장전합니다.',cast(id,'d6')); break;
    case 'gladiator': pieces={a1:'K',h8:'k',c3:'B',f6:'r'}; add('두 기물이 본 보드에서 사라지고 실제 결투장으로 이동합니다.',cast(id,'f6')); add('결투장에서 가능한 첫 수를 둡니다.',g => { const a=g.actions()[0]; if(!a)throw Error('Missing duel move');g.perform(a); }); break;
    case 'sparta': pieces={a1:'K',h8:'k',d4:'P',d6:'r'};turn='b';add('첫 공격을 견디며 방패가 사라집니다.',move('d6','d4'));add('상대 차례를 진행합니다.',move('a1','b1'));add('방패가 없는 폰이 두 번째 공격에 잡힙니다.',move('d6','d4'));break;
    case 'mummy': pieces={a1:'K',h8:'k',d4:'P',d6:'r'};turn='b';add('미라가 잡힙니다. 사망 칸이 점유되어 바로 부활하지 못합니다.',move('d6','d4'));add('다음 부활 기회를 기다립니다.',move('a1','b1'));add('공격자가 떠나면 미라가 원래 칸에서 붕대를 벗고 부활합니다.',move('d4','e4'));break;
    case 'sphinx': pieces={a1:'K',h8:'k',d4:'N',d6:'r'};turn='b';intro='공격자가 구구단을 틀린 상황을 시연합니다.';add('오답으로 공격이 취소되고 실제 스핑크스 방어 효과가 나옵니다.',move('d6','d4',false));break;
    case 'praetorian':pieces={d4:'K',h8:'k',c4:'N',d6:'r'};turn='b';add('킹을 공격하면 근위병과 공격자가 함께 사망합니다.',move('d6','d4'));break;
    case 'democracy':pieces={d4:'K',h8:'k',b2:'P',d6:'r'};turn='b';add('킹이 잡혀도 폰이 살아 있으므로 대전이 계속됩니다.',move('d6','d4'));break;
    case 'olympics':pieces={a1:'K',h8:'k',d3:'R',d6:'p'};intro='영광 두 개를 쌓은 룩으로 시작합니다.';add('세 번째 포획으로 실제 트로피가 채워지고 같은 기물에 추가 행동이 생깁니다.',move('d3','d6'));add('상대 턴 전에 같은 룩으로 한 번 더 움직입니다.',move('d6','e6'));break;
    case 'nile':pieces={a1:'K',h8:'k',d3:'P'};turn='b';intro='백의 네 번째 턴 직전 상황입니다.';add('백의 네 번째 턴에 범람 이동이 활성화됩니다.',move('h8','g8'));add('폰이 실제 추가 전진 규칙으로 두 칸 이동합니다.',move('d3','d5'));break;
    case 'sandstorm':pieces={a1:'K',h8:'k',b2:'P',c2:'P',d2:'P',e2:'P',d6:'r'};intro='이집트 기물 네 개가 사망한 상황입니다. 상대 시점으로 보여줍니다.';add('턴이 넘어가며 실제 모래폭풍과 시야 제한이 발동합니다.',move('a1','b1'));break;
    case 'pyramid':loadouts.b.active='zeus';add('시작 배치로 중심 칸과 주변에 실제 축복 영역을 만듭니다.',g => g.placePassive('w',{square:'d4',axis:'row'}));add('배치를 마치고 백이 한 수를 둡니다.',move('a1','b1'));add('영역 안의 아군은 상태이상 면역을 얻습니다. 이 장면에서는 상대의 감전을 막습니다.',cast('zeus','d4'));break;
    case 'roads':pieces={a1:'K',h8:'k',c2:'R',c3:'P'};add('시작 전에 두 행을 도로로 지정합니다.',g=>g.placePassive('w',{square:'a4',axis:'row'}));add('룩이 아군 폰을 뛰어넘어 실제 도로 위에 착지합니다.',move('c2','c4'));break;
    case 'legion':pieces={a1:'K',h8:'k',c4:'P',d4:'P',e4:'P'};loadouts.b.active='zeus';turn='b';add('군단의 세 폰이 실제로 연쇄 감전을 한 번씩 막습니다.',cast('zeus','d4'));break;
    case 'philosophy':intro='실제 제한 시간: 철학 진영 13분, 상대 10분.';add('한 수를 두어도 추가된 시간은 그대로 적용됩니다.',move('d4','d5'));break;
  }
  const game = new AbilityGame(loadouts, fen(pieces,turn));
  if (id === 'hades' || id === 'osiris' || id === 'sandstorm') {
    const owner = id === 'hades' ? 'b' : 'w';
    for (const unit of game.units()) if(unit.owner===owner && unit.type!=='k')unit.square=null;
    game.restore(game.snapshot());
  }
  if (id === 'olympics') game.unit('d3')!.glory=2;
  if (id === 'nile') game.state.turns.w=3;
  if (id === 'pyramid' || id === 'roads') game.beginPlacement();
  return {game,steps,intro};
}
