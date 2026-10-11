import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Chess, Move, Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';

export function movingSquares(move: Move): { from: Square; to: Square }[] {
  if (move.flags.includes('s') || move.from === move.to) return [];
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
  const positions = game instanceof AbilityGame ? Object.fromEntries(Object.values(game.state.pieces).map(p => [p.id, p.square])) : {};
  const previous = useRef({ game, fen, count: history.length, flipped, positions });
  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = { game, fen, count: history.length, flipped, positions };
    const skip = skipFen.current === fen;
    skipFen.current = null;
    if (old.game !== game || old.flipped !== flipped || old.count + 1 !== history.length || old.fen === fen || skip
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = history.at(-1);
    if (!move || !board.current) return;
    const wave = game instanceof AbilityGame && JSON.parse(game.history().at(-1)!).skill === 'poseidon';
    const moving = wave ? Object.entries(positions).flatMap(([id, to]) => {
      const from = old.positions[id]; return from && to && from !== to ? [{ from, to }] : [];
    }) : movingSquares(move);
    const actualMoving = game instanceof AbilityGame ? moving.filter(m=>Object.entries(positions).some(([id,to])=>old.positions[id]===m.from&&to===m.to)) : moving;
    const cleanups = actualMoving.map(({ from, to }) => {
      const origin = board.current!.querySelector<HTMLElement>(`[data-square="${from}"]`);
      const target = board.current!.querySelector<HTMLElement>(`[data-square="${to}"]`);
      const piece = target?.querySelector<HTMLElement>('.piece');
      if (!origin || !target || !piece) return () => {};
      const a = origin.getBoundingClientRect(), b = target.getBoundingClientRect();
      target.classList.add('piece-in-motion');
      const animation = piece.animate([
        { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` },
        { transform: 'translate(0, 0)' },
      ], { duration: wave ? 520 : 280, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' });
      const clear = () => target.classList.remove('piece-in-motion');
      animation.onfinish = clear;
      return () => { animation.cancel(); clear(); };
    });
    return () => cleanups.forEach(cleanup => cleanup());
  // Only position/orientation changes interrupt a move, not selection or modal renders.
  }, [game, fen, flipped, board, skipFen]);
}
