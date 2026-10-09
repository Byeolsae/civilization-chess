import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Chess, Square, Color } from 'chess.js';
import { AbilityGame, type AbilityAction } from './AbilityGame';
import { activeArea, findActiveAction, waveTarget } from './activeTargeting';

export function useActiveTargeting(game: Chess, enabled: boolean, revision: number, flipped: boolean, owner: Color, onAction: (action: AbilityAction) => void) {
  const [armed, setArmed] = useState(false);
  const [hover, setHover] = useState<Square | null>(null);
  const [wave, setWave] = useState<ReturnType<typeof waveTarget>>(null);
  const [graves, setGraves] = useState<string[]>([]);
  const gesture = useRef<{ pointerId: number; square: Square; x: number; y: number } | null>(null);
  const skill = game instanceof AbilityGame ? game.loadouts[owner].active : 'pending';
  const actions = game instanceof AbilityGame && enabled ? game.actions().filter(a => a.skill === skill) : [];
  const cancel = () => { setArmed(false); setHover(null); setWave(null); setGraves([]); gesture.current = null; };
  useEffect(cancel, [game, enabled, revision, flipped]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel(); };
    window.addEventListener('keydown', escape); window.addEventListener('blur', cancel);
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('blur', cancel); };
  }, []);
  const execute = (action: AbilityAction | undefined) => { if (action) { cancel(); onAction(action); } };
  const select = (square: Square) => {
    if (!armed || !enabled || skill === 'poseidon' || skill === 'hades' || (skill === 'osiris' && graves.length !== 1)) return;
    if (skill === 'anubis' && game instanceof AbilityGame) {
      const id = game.unit(square)?.id;
      if (!id || !actions.some(a => a.id?.split(',').includes(id))) return;
      const next = graves.includes(id) ? graves.filter(value => value !== id) : [...graves, id];
      if (next.length === 2) execute(actions.find(a => a.id?.split(',').every(value => next.includes(value))));
      else setGraves(next);
      return;
    }
    execute(findActiveAction(actions, skill, square, skill === 'osiris' ? graves[0] : undefined));
  };
  const pickGrave = (id: string) => {
    const next = graves.includes(id) ? graves.filter(x => x !== id) : skill === 'osiris' ? [id] : [...graves, id].slice(0, 3);
    setGraves(next);
    if (skill === 'hades' && next.length === 3) execute(actions.find(a => a.id?.split(',').every(id => next.includes(id))));
  };
  const down = (e: ReactPointerEvent<HTMLButtonElement>, square: Square) => {
    if (!enabled || !armed || !e.isPrimary || e.button !== 0) return;
    gesture.current = { pointerId: e.pointerId, square, x: e.clientX, y: e.clientY };
    setHover(square); setWave(null); e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault();
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId || skill !== 'poseidon') return;
    e.preventDefault(); setWave(waveTarget(g.square, e.clientX-g.x, e.clientY-g.y, flipped));
  };
  const up = (e: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
    const g = gesture.current; if (!g || g.pointerId !== e.pointerId) return;
    gesture.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setWave(null);
    if (cancelled) { setHover(null); return; }
    const board = e.currentTarget.closest('.board')?.getBoundingClientRect();
    if (!board || e.clientX < board.left || e.clientX >= board.right || e.clientY < board.top || e.clientY >= board.bottom) return;
    if (skill === 'poseidon') {
      const target = waveTarget(g.square, e.clientX-g.x, e.clientY-g.y, flipped);
      if (target) execute(findActiveAction(actions, skill, target.square, undefined, target.direction));
    } else if (Math.hypot(e.clientX-g.x, e.clientY-g.y) < 14) select(g.square);
  };
  const usable = actions.filter(a => skill !== 'osiris' || a.id === graves[0]);
  const valid = new Set(armed && skill !== 'poseidon' && skill !== 'hades' ? skill === 'anubis' && game instanceof AbilityGame ? usable.filter(a => !graves.length || a.id?.split(',').includes(graves[0])).flatMap(a => a.id!.split(',').map(id => game.state.pieces[id].square!)) : usable.map(a => a.to) : []);
  const chosen = new Set(skill === 'anubis' && game instanceof AbilityGame ? graves.map(id => game.state.pieces[id].square!) : []);
  const waveAction = wave && findActiveAction(actions, skill, wave.square, undefined, wave.direction);
  const area = armed ? wave && waveAction ? activeArea(skill, wave.square, wave.direction) : hover && valid.has(hover) ? activeArea(skill, hover) : [] : [];
  return { armed, skill, actions, graves, valid, chosen, area, direction: waveAction && wave ? (flipped ? wave.direction ^ 1 : wave.direction) : undefined, cancel, select, pickGrave, down, move, up,
    hover: (square: Square | null) => { if (armed && !gesture.current) setHover(square); },
    toggle: () => { if (armed) cancel(); else if (actions.length) setArmed(true); } };
}
export type ActiveTargeting = ReturnType<typeof useActiveTargeting>;
