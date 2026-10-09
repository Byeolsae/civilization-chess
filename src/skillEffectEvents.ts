import type { Square } from 'chess.js';
import type { AbilityAction } from './AbilityGame';
import type { AbilityState } from './abilityState';
import { activeArea } from './activeTargeting';
import { adjacentSquares } from './abilityState';

export type SkillEffect = { skill: string; from: Square; to: Square; squares: Square[]; direction?: number };
export function boardPoint(square: Square, flipped: boolean) {
  const x = square.charCodeAt(0) - 97, y = 8 - Number(square[1]);
  return { x: ((flipped ? 7 - x : x) + .5) * 100, y: ((flipped ? 7 - y : y) + .5) * 100 };
}
// Visual events are derived only from committed actions, never from previews or AI search.
export function skillEffects(action: AbilityAction, before: AbilityState, after: AbilityState): SkillEffect[] {
  const result: SkillEffect[] = [];
  if (action.kind === 'skill' && action.skill) {
    let squares = activeArea(action.skill, action.to, action.direction);
    if (action.skill === 'anubis' && action.id) squares = action.id.split(',').flatMap(id => after.pieces[id]?.square ? [after.pieces[id].square!] : []);
    if (action.skill === 'minotaur') squares = [action.from, ...adjacentSquares(action.from)];
    if (action.skill === 'zeus') squares = [action.to, ...Object.values(after.pieces).filter(p => p.square && p.effects.shock !== before.pieces[p.id]?.effects.shock).map(p => p.square!)];
    result.push({ skill: action.skill, from: action.from, to: action.to, direction: action.direction, squares: [...new Set(squares)] });
  }
  for (const p of Object.values(after.pieces)) {
    const old = before.pieces[p.id];
    if (!old) continue;
    const sentence = p.judgment?.executedAt;
    if (sentence && sentence !== old.judgment?.executedAt) result.push({ skill: 'judgment', from: sentence, to: sentence, squares: [sentence] });
    if (old.lives > p.lives && p.square) result.push({ skill: 'shield', from: p.square, to: p.square, squares: [p.square] });
    if (!old.square && p.square && p.revived && !old.revived && action.skill !== 'osiris') result.push({ skill: 'revive', from: p.square, to: p.square, squares: [p.square] });
  }
  if (action.quiz === false) result.push({ skill: 'sphinx', from: action.to, to: action.to, squares: [action.to] });
  return result;
}
