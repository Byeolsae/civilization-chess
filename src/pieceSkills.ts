import type { Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { adjacentSquares, effectActive } from './abilityState';
import { specialPieceTypes } from './specialPieces';

const types = specialPieceTypes;
const timing: Record<string, string> = {
  trojan: '탑승·하차마다 한 행동 · 주변 8칸 · 최대 폰 4개',
  minotaur: '주변 8칸 피아 모두 각자 3턴 기절 · 사용 후 내 5번째 턴에 재사용',
  cleopatra: '퀸이 공격 가능한 적 폰 · 동시에 1개만 매혹 · 원래 주인의 두 번째 턴에 복귀',
  ballista: '8방향 최대 5칸 · 아군 관통, 첫 적에서 정지 · 사용 후 내 3개 턴 동안 재장전',
  gladiator: '체크 중 사용 불가 · 적 킹 제외 · 비숍마다 2회',
  sparta: '첫 피격 때 목숨만 소모하고 제자리 유지 · 함정은 방어 불가',
  mummy: '사망 후 내 턴 시작마다 최대 3번 확인 · 사망 칸이 비면 1회 부활',
  sphinx: '공격받을 때 발동 · 공격자가 5초 안에 문제를 풀지 못하면 생존',
  praetorian: '방패 보유: 나이트 이동·킹 1회 보호 / 방패 소모: 전방 1칸·대각선 포획',
};
export function pieceSkillInfo(game: AbilityGame, square: Square) {
  const p = game.unit(square);
  if (!p) return null;
  const skill = game.loadouts[p.owner].piece;
  if (types[skill] !== p.type) return null;
  const automatic = ['sparta', 'mummy', 'sphinx', 'praetorian'].includes(skill);
  const actions = game.actions().filter(a => a.kind === 'skill' && a.from === square && (a.skill === skill || (skill === 'trojan' && a.skill === 'deploy')));
  const cooldown = Math.max(0, p.cooldownUntil - game.state.turns[p.owner]);
  const blocked = ['stun', 'shock'].some(kind => effectActive(game.state, p, kind as 'stun' | 'shock'));
  const status = automatic ? skill === 'sparta' ? `자동 발동 · 목숨 ${p.lives}개` : skill === 'mummy' && p.revived ? '부활 사용 완료' : '자동 발동' : p.owner !== game.turn() ? '상대 차례' : blocked ? '기절·감전 중' : cooldown ? `재사용까지 내 ${cooldown}턴` : skill === 'gladiator' && (p.duelUses ?? 0) >= 2 ? '결투 2회 사용 완료' : skill === 'ballista' && effectActive(game.state, p, 'disarm') ? '무장 해제 중' : game.state.extraAction ? '추가 이동 중에는 사용 불가' : actions.length ? '지금 사용 가능 · 한 행동 소모' : '현재 합법적인 대상 없음';
  const penalized = game.lawApplies(p.owner, 'military-code');
  const timingText = penalized && skill === 'minotaur' ? '주변 8칸 피아 모두 각자 3턴 기절 · 군율법으로 내 6번째 턴에 재사용' : penalized && skill === 'ballista' ? '8방향 최대 5칸 · 아군 관통, 첫 적에서 정지 · 군율법으로 내 4개 턴 동안 재장전' : timing[skill];
  return { skill, automatic, actions, cooldown, status, timing: timingText + (skill === 'gladiator' ? ` · 남은 ${2 - (p.duelUses ?? 0)}회` : ''), cargo: p.cargo, area: skill === 'minotaur' ? adjacentSquares(square) : actions.map(a => a.to) };
}
