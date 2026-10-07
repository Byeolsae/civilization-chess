import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Chess } from 'chess.js';
import { AbilityGame, abilityNames, type AbilityAction } from './AbilityGame';
import { boardPoint, skillEffects, type SkillEffect } from './skillEffectEvents';
import './skillEffects.css';

type PlayingEffect = SkillEffect & { id: number };
const colors: Record<string, string> = { zeus: '#c5eeff', poseidon: '#75d8ff', hades: '#be98ff', osiris: '#fbe3a0', set: '#e7bf7a', anubis: '#b995ed', alesia: '#eeb98e', vesta: '#ffbc75', pilum: '#ffce9c', ballista: '#ffe1ac', minotaur: '#f3c98c', cleopatra: '#ffadd8', trojan: '#bcdfac', deploy: '#bcdfac', gladiator: '#efb2a3', shield: '#b7e8fc', revive: '#f5dfa7', sphinx: '#ceb9ff' };
const labels: Record<string, string> = { shield: '방어 발동', revive: '미라 부활', sphinx: '수수께끼 방어' };
export default function SkillEffects({ game, flipped }: { game: Chess; flipped: boolean }) {
  const count = game.history().length;
  const previous = useRef({ game, count, flipped, state: game instanceof AbilityGame ? structuredClone(game.state) : null });
  const serial = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const [playing, setPlaying] = useState<PlayingEffect[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const layer = useRef<HTMLDivElement>(null);
  const impactId = [...playing].reverse().find(e => e.skill === 'minotaur')?.id;
  useLayoutEffect(() => {
    if (!impactId || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const board = layer.current?.closest('.board-section');
    const motion = board?.animate([
      { transform: 'translate(0,0)' }, { transform: 'translate(-4px,3px)' },
      { transform: 'translate(4px,-2px)' }, { transform: 'translate(-3px,2px)' },
      { transform: 'translate(2px,-1px)' }, { transform: 'translate(0,0)' },
    ], { duration: 420, easing: 'ease-out' });
    return () => motion?.cancel();
  }, [impactId]);
  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = { game, count, flipped, state: game instanceof AbilityGame ? structuredClone(game.state) : null };
    if (old.game !== game || old.flipped !== flipped || count < old.count) {
      timers.current.forEach(clearTimeout); timers.current.clear(); setPlaying([]); setAnnouncement(''); return;
    }
    if (!(game instanceof AbilityGame) || !old.state || count !== old.count + 1) return;
    const action = JSON.parse(game.history().at(-1)!) as AbilityAction;
    const effects = skillEffects(action, old.state, game.state).map(effect => ({ ...effect, id: ++serial.current }));
    if (!effects.length) return;
    setPlaying(current => [...current, ...effects].slice(-8));
    setAnnouncement(effects.map(e => `${abilityNames[e.skill] ?? labels[e.skill] ?? '스킬'} 발동`).join(' · '));
    const timer = setTimeout(() => { setPlaying(current => current.filter(e => !effects.some(next => next.id === e.id))); timers.current.delete(timer); }, 1250);
    timers.current.add(timer);
  }, [game, count, flipped]);
  useLayoutEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);
  return <div ref={layer} className="skill-effects" aria-live="polite" aria-atomic="true">
    <span className="sr-only">{announcement}</span>
    <svg viewBox="0 0 800 800" aria-hidden="true" className="skill-fx-svg">
      {playing.map(effect => <Effect key={effect.id} effect={effect} flipped={flipped} />)}
    </svg>
    {playing.length > 0 && <div key={playing.at(-1)!.id} className="skill-fx-title" aria-hidden="true">{abilityNames[playing.at(-1)!.skill] ?? labels[playing.at(-1)!.skill] ?? '스킬 발동'}</div>}
  </div>;
}
function Effect({ effect: e, flipped }: { effect: SkillEffect; flipped: boolean }) {
  const from = boardPoint(e.from, flipped), to = boardPoint(e.to, flipped);
  const color = colors[e.skill] ?? '#f6d58d';
  const beam = ['ballista', 'pilum', 'cleopatra', 'trojan', 'deploy', 'gladiator'].includes(e.skill);
  const portal = ['osiris', 'hades', 'anubis', 'trojan', 'deploy', 'gladiator', 'revive'].includes(e.skill);
  const zone = ['set', 'vesta', 'alesia'].includes(e.skill);
  const direction = flipped ? (e.direction ?? 0) ^ 1 : e.direction ?? 0;
  const waveStyle = { '--wave-x': `${direction === 0 ? 800 : direction === 1 ? -800 : 0}px`, '--wave-y': `${direction === 2 ? -800 : direction === 3 ? 800 : 0}px` } as CSSProperties;
  return <g style={{ color }} className={`skill-fx skill-fx-${e.skill}`}>
    {beam && <line className="fx-beam" x1={from.x} y1={from.y} x2={to.x} y2={to.y} pathLength="1" />}
    {e.skill === 'poseidon' && <>
      {e.squares.map(square => { const p = boardPoint(square, flipped); return <rect key={square} className="fx-water" x={p.x-49} y={p.y-49} width="98" height="98" />; })}
      <g className="fx-wave" style={waveStyle}>{[0, 18, 36].map(offset => direction < 2 ? <path key={offset} d={`M ${direction === 0 ? -offset : 800+offset},${to.y-48} q 40,48 0,96`} /> : <path key={offset} d={`M ${to.x-48},${direction === 2 ? 800+offset : -offset} q 48,40 96,0`} />)}</g>
    </>}
    {e.skill === 'zeus' && e.squares.map((square, i) => { const p = boardPoint(square, flipped); const a = i ? boardPoint(e.squares[i-1], flipped) : { x: p.x-18, y: Math.max(0,p.y-140) }; return <path key={square} className="fx-lightning" style={{ animationDelay: `${i*85}ms` }} d={`M ${a.x},${a.y} L ${(a.x+p.x)/2-14},${(a.y+p.y)/2} l 28,-8 L ${p.x},${p.y}`} />; })}
    {e.skill === 'minotaur' && [0, 1, 2].map(i => <circle key={i} className="fx-shockwave" style={{ animationDelay: `${i*140}ms` }} cx={from.x} cy={from.y} r="135" />)}
    {e.squares.map((square, i) => { const p = boardPoint(square, flipped); return <g key={square} style={{ animationDelay: `${Math.min(i,5)*45}ms` }} className="fx-impact">
      {zone ? <rect className="fx-zone" x={p.x-46} y={p.y-46} width="92" height="92" rx="8" /> : e.skill !== 'poseidon' && <circle className="fx-ring" cx={p.x} cy={p.y} r={portal ? 38 : 29} />}
      {e.skill === 'cleopatra' && <path className="fx-heart" d={`M ${p.x},${p.y+20} C ${p.x-60},${p.y-16} ${p.x-18},${p.y-52} ${p.x},${p.y-22} C ${p.x+18},${p.y-52} ${p.x+60},${p.y-16} ${p.x},${p.y+20}`} />}
      {portal && <path className="fx-rune" d={`M ${p.x},${p.y-40} L ${p.x+32},${p.y} ${p.x},${p.y+40} ${p.x-32},${p.y} Z`} />}
      {['shield','sphinx'].includes(e.skill) && <path className="fx-shield" d={`M ${p.x},${p.y-36} l 30,12 v 25 q -4,25 -30,36 q -26,-11 -30,-36 v -25 Z`} />}
      {['vesta','osiris','revive'].includes(e.skill) && <path className="fx-rays" d={`M ${p.x-20},${p.y+30} v -60 M ${p.x},${p.y+38} v -88 M ${p.x+20},${p.y+30} v -60`} />}
    </g>; })}
  </g>;
}
