import type { Square } from 'chess.js';
import type { AbilityAction } from './AbilityGame';

export function waveTarget(start: Square, dx: number, dy: number, flipped: boolean): { square: Square; direction: number } | null {
  if (Math.hypot(dx, dy) < 14) return null;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const worldX = flipped ? -dx : dx;
  const worldY = flipped ? dy : -dy;
  return { square: horizontal ? `a${start[1]}` as Square : `${start[0]}1` as Square,
    direction: horizontal ? worldX > 0 ? 0 : 1 : worldY > 0 ? 2 : 3 };
}

export function activeArea(skill: string, square: Square, direction?: number): Square[] {
  const x = square.charCodeAt(0) - 97, y = Number(square[1]);
  if (skill === 'poseidon' && direction !== undefined) return Array.from({ length: 8 }, (_, i) => direction < 2 ? `${'abcdefgh'[i]}${y}` as Square : `${square[0]}${i+1}` as Square);
  const result: Square[] = [];
  const radius = ['set', 'vesta'].includes(skill) ? 1 : 0;
  const min = skill === 'alesia' ? 0 : -radius, max = skill === 'alesia' ? 1 : radius;
  for (let dx = min; dx <= max; dx++) for (let dy = min; dy <= max; dy++) {
    if (x+dx >= 0 && x+dx < 8 && y+dy >= 1 && y+dy <= 8) result.push(`${'abcdefgh'[x+dx]}${y+dy}` as Square);
  }
  return result;
}
export function findActiveAction(actions: AbilityAction[], skill: string, square: Square, id?: string, direction?: number) {
  return actions.find(a => a.kind === 'skill' && a.skill === skill && a.to === square && (id === undefined || a.id === id) && (direction === undefined || a.direction === direction));
}
