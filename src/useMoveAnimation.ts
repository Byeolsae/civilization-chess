import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Chess, Move, Square } from 'chess.js';

export function movingSquares(move: Move): { from: Square; to: Square }[] {
  const pieces = [{ from: move.from, to: move.to }];
  const rank = move.color === 'w' ? '1' : '8';
  if (move.flags.includes('k')) pieces.push({ from: `h${rank}`, to: `f${rank}` });
  if (move.flags.includes('q')) pieces.push({ from: `a${rank}`, to: `d${rank}` });
  return pieces;
}

// Animate the committed position before paint, so rules and saved games stay authoritative.
export function useMoveAnimation(board: RefObject<HTMLDivElement | null>, game: Chess, flipped: boolean, skipFen: RefObject<string | null>) {
  const fen = game.fen();
  const history = game.history({ verbose: true });
  const previous = useRef({ game, fen, count: history.length, flipped });
  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = { game, fen, count: history.length, flipped };
    const skip = skipFen.current === fen;
    skipFen.current = null;
    if (old.game !== game || old.flipped !== flipped || old.count + 1 !== history.length || old.fen === fen || skip
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = history.at(-1);
    if (!move || !board.current) return;
    const cleanups = movingSquares(move).map(({ from, to }) => {
      const origin = board.current!.querySelector<HTMLElement>(`[data-square="${from}"]`);
      const target = board.current!.querySelector<HTMLElement>(`[data-square="${to}"]`);
      const piece = target?.querySelector<HTMLElement>('.piece');
      if (!origin || !target || !piece) return () => {};
      const a = origin.getBoundingClientRect(), b = target.getBoundingClientRect();
      target.classList.add('piece-in-motion');
      const animation = piece.animate([
        { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` },
        { transform: 'translate(0, 0)' },
      ], { duration: 280, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' });
      const clear = () => target.classList.remove('piece-in-motion');
      animation.onfinish = clear;
      return () => { animation.cancel(); clear(); };
    });
    return () => cleanups.forEach(cleanup => cleanup());
  // Only position/orientation changes interrupt a move, not selection or modal renders.
  }, [game, fen, flipped, board, skipFen]);
}
