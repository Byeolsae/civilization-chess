import type { Square } from 'chess.js';

type BoardBounds = { left: number; top: number; width: number; height: number };

// Client coordinates match getBoundingClientRect, including after page scrolling.
export function squareAtPoint(x: number, y: number, bounds: BoardBounds, flipped: boolean): Square | null {
  if (bounds.width <= 0 || bounds.height <= 0) return null;
  const column = Math.floor((x - bounds.left) * 8 / bounds.width);
  const row = Math.floor((y - bounds.top) * 8 / bounds.height);
  if (!Number.isFinite(column) || !Number.isFinite(row) || column < 0 || column > 7 || row < 0 || row > 7) return null;
  return `${'abcdefgh'[flipped ? 7 - column : column]}${flipped ? row + 1 : 8 - row}` as Square;
}
