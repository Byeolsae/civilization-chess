import type { Square } from 'chess.js';

// Visual spill only: the movement rules still use the original zone squares.
export function desertTerrainMask(square: Square, desert: Square[], flipped: boolean): string | undefined {
  if (desert.includes(square)) return 'none';
  const x = square.charCodeAt(0), y = Number(square[1]);
  const masks = new Set<string>();
  for (const source of desert) {
    const dx = (source.charCodeAt(0) - x) * (flipped ? -1 : 1);
    const dy = (Number(source[1]) - y) * (flipped ? 1 : -1);
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) continue;
    if (dx && dy) {
      masks.add('radial-gradient(ellipse 100% 100% at ' + (dx < 0 ? '0%' : '100%') + ' ' + (dy < 0 ? '0%' : '100%') + ',#000 0%,#0009 30%,transparent 90%)');
    } else {
      const direction = dx ? (dx < 0 ? 'right' : 'left') : (dy < 0 ? 'bottom' : 'top');
      masks.add('linear-gradient(to ' + direction + ',#000 0%,#0009 30%,transparent 90%)');
    }
  }
  return masks.size ? [...masks].join(',') : undefined;
}
