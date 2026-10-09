import { civilizationAppearance } from './civilizations';
import type { Players } from './game';
import { specialPieceVariant } from './specialPieces';
import { translateUi } from './i18n';
import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Chess } from 'chess.js';
import { AbilityGame, abilityNames, type AbilityAction } from './AbilityGame';
import { boardPoint, skillEffects, type SkillEffect } from './skillEffectEvents';
import './skillEffects.css';

type PlayingEffect = SkillEffect & { id: number };
const colors: Record<string, string> = { zeus: '#c5eeff', poseidon: '#75d8ff', hades: '#be98ff', osiris: '#fbe3a0', set: '#e7bf7a', anubis: '#eac27b', judgment: '#f3c367', alesia: '#eeb98e', vesta: '#ffbc75', pilum: '#ffce9c', ballista: '#ffe1ac', minotaur: '#f3c98c', cleopatra: '#ffadd8', trojan: '#bcdfac', deploy: '#bcdfac', gladiator: '#efb2a3', shield: '#b7e8fc', revive: '#f5dfa7', sphinx: '#ceb9ff' };
const labels: Record<string, string> = { judgment: '심장의 심판', shield: '방어 발동', revive: '미라 부활', sphinx: '수수께끼 방어' };
export default function SkillEffects({ game, flipped, players }: { game: Chess; flipped: boolean; players: Players }) {
  const count = game.history().length;
  const previous = useRef({ game, count, flipped, state: game instanceof AbilityGame ? structuredClone(game.state) : null });
  const serial = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const [playing, setPlaying] = useState<PlayingEffect[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const layer = useRef<HTMLDivElement>(null);
  const impactId = [...playing].reverse().find(e => e.skill === 'minotaur' || e.skill === 'zeus')?.id;
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
    if (old.game !== game || count < old.count) {
      timers.current.forEach(clearTimeout); timers.current.clear(); setPlaying([]); setAnnouncement(''); return;
    }
    if (!(game instanceof AbilityGame) || !old.state || count !== old.count + 1) return;
    const action = JSON.parse(game.history().at(-1)!) as AbilityAction;
    const effects = skillEffects(action, old.state, game.state).map(effect => ({ ...effect, id: ++serial.current }));
    if (!effects.length) return;
    setPlaying(current => [...current, ...effects].slice(-8));
    setAnnouncement(effects.map(e => `${abilityNames[e.skill] ?? labels[e.skill] ?? '스킬'} 발동`).join(' · '));
    const timer = setTimeout(() => { setPlaying(current => current.filter(e => !effects.some(next => next.id === e.id))); timers.current.delete(timer); }, effects.some(e => e.skill === 'judgment') ? 3600 : effects.some(e => ['osiris', 'revive', 'judgment', 'anubis'].includes(e.skill)) ? 2600 : 1250);
    timers.current.add(timer);
  }, [game, count, flipped]);
  useLayoutEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);
  return <div ref={layer} className="skill-effects" aria-live="polite" aria-atomic="true">
    <span className="sr-only">{translateUi(announcement)}</span>
    <svg viewBox="0 0 800 800" aria-hidden="true" className="skill-fx-svg">
      {translateUi(playing.map(effect => <Effect key={effect.id} effect={effect} flipped={flipped} ghostSrc={effect.victim ? (() => { const p=effect.victim; const special=specialPieceVariant(p.type,game instanceof AbilityGame ? game.loadouts[p.owner].piece : undefined,p.lives,p.revived); return special ? `/pieces/special/${p.owner}-${special}.svg` : `/pieces/${civilizationAppearance[players[p.owner]]}/${p.owner}${p.type.toUpperCase()}.svg`; })() : undefined} />))}
    </svg>
    {translateUi(playing.length > 0 && <div key={playing.at(-1)!.id} className="skill-fx-title" aria-hidden="true">{translateUi(abilityNames[playing.at(-1)!.skill] ?? labels[playing.at(-1)!.skill] ?? '스킬 발동')}</div>)}
  </div>;
}
function Effect({ effect: e, flipped, ghostSrc }: { effect: SkillEffect; flipped: boolean; ghostSrc?: string }) {
  const from = boardPoint(e.from, flipped), to = boardPoint(e.to, flipped);
  const color = colors[e.skill] ?? '#f6d58d';
  if (e.skill === 'osiris' || e.skill === 'revive') return <ResurrectionBurst x={to.x} y={to.y}/>;
  if (e.skill === 'anubis' || e.skill === 'judgment') return <g>{e.squares.map(square => { const point = boardPoint(square, flipped); return <g key={square}>{e.skill === 'judgment'&&<JudgmentDeath x={point.x} y={point.y} src={ghostSrc}/>}<JudgmentScales x={point.x} y={point.y} sentence={e.skill === 'judgment'}/></g>; })}</g>;
  if (e.skill === 'minotaur') return <GroundFracture x={from.x} y={from.y}/>;
  if (e.skill === 'set') return <g className="skill-fx skill-fx-set"><ellipse className="set-dust" cx={to.x} cy={to.y} rx="138" ry="118" /></g>;
  const beam = ['ballista', 'pilum', 'cleopatra', 'trojan', 'deploy', 'gladiator'].includes(e.skill);
  const portal = ['osiris', 'hades', 'anubis', 'trojan', 'deploy', 'gladiator', 'revive'].includes(e.skill);
  const zone = ['set', 'vesta', 'alesia'].includes(e.skill);
  const direction = flipped ? (e.direction ?? 0) ^ 1 : e.direction ?? 0;
  const waveStyle = { '--wave-x': `${direction === 0 ? 800 : direction === 1 ? -800 : 0}px`, '--wave-y': `${direction === 2 ? -800 : direction === 3 ? 800 : 0}px` } as CSSProperties;
  return <g style={{ color }} className={`skill-fx skill-fx-${e.skill}`}>
    {translateUi(beam && <line className="fx-beam" x1={from.x} y1={from.y} x2={to.x} y2={to.y} pathLength="1" />)}
    {translateUi(e.skill === 'poseidon' && <>
      {translateUi(e.squares.map(square => { const p = boardPoint(square, flipped); return <rect key={square} className="fx-water" x={p.x-49} y={p.y-49} width="98" height="98" />; }))}
      <g className="fx-wave" style={waveStyle}>{translateUi([0, 18, 36].map(offset => direction < 2 ? <path key={offset} d={`M ${direction === 0 ? -offset : 800+offset},${to.y-48} q 40,48 0,96`} /> : <path key={offset} d={`M ${to.x-48},${direction === 2 ? 800+offset : -offset} q 48,40 96,0`} />))}</g>
    </>)}
    {translateUi(e.skill === 'zeus' && e.squares.map((square, i) => { const p = boardPoint(square, flipped); const a = i ? boardPoint(e.squares[i-1], flipped) : { x: p.x-18, y: Math.max(0,p.y-140) }; return <path key={square} className="fx-lightning" style={{ animationDelay: `${i*85}ms` }} d={`M ${a.x},${a.y} L ${(a.x+p.x)/2-14},${(a.y+p.y)/2} l 28,-8 L ${p.x},${p.y}`} />; }))}
    {translateUi(e.squares.map((square, i) => { const p = boardPoint(square, flipped); return <g key={square} style={{ animationDelay: `${Math.min(i,5)*45}ms` }} className="fx-impact">
      {translateUi(zone ? <rect className="fx-zone" x={p.x-46} y={p.y-46} width="92" height="92" rx="8" /> : e.skill !== 'poseidon' && <circle className="fx-ring" cx={p.x} cy={p.y} r={portal ? 38 : 29} />)}
      {translateUi(e.skill === 'cleopatra' && <path className="fx-heart" d={`M ${p.x},${p.y+20} C ${p.x-60},${p.y-16} ${p.x-18},${p.y-52} ${p.x},${p.y-22} C ${p.x+18},${p.y-52} ${p.x+60},${p.y-16} ${p.x},${p.y+20}`} />)}
      {translateUi(portal && <path className="fx-rune" d={`M ${p.x},${p.y-40} L ${p.x+32},${p.y} ${p.x},${p.y+40} ${p.x-32},${p.y} Z`} />)}
      {translateUi(['shield','sphinx'].includes(e.skill) && <path className="fx-shield" d={`M ${p.x},${p.y-36} l 30,12 v 25 q -4,25 -30,36 q -26,-11 -30,-36 v -25 Z`} />)}
      {translateUi(['vesta','osiris','revive'].includes(e.skill) && <path className="fx-rays" d={`M ${p.x-20},${p.y+30} v -60 M ${p.x},${p.y+38} v -88 M ${p.x+20},${p.y+30} v -60`} />)}
    </g>; }))}
  </g>;
}

function ResurrectionBurst({x,y}:{x:number;y:number}) {
  const id=useId().replace(/:/g,'');
  return <g transform={`translate(${x} ${y})`} className="resurrection-burst">
    <defs><linearGradient id={`${id}-pillar`} x1="0" y1="1" x2="0" y2="0"><stop stopColor="#fff7d2" stopOpacity=".95"/><stop offset=".4" stopColor="#f3cf7b" stopOpacity=".42"/><stop offset="1" stopColor="#77f1e8" stopOpacity="0"/></linearGradient><radialGradient id={`${id}-halo`}><stop stopColor="#fff9d6" stopOpacity=".8"/><stop offset=".5" stopColor="#e3bf69" stopOpacity=".24"/><stop offset="1" stopColor="#e3bf69" stopOpacity="0"/></radialGradient></defs>
    <circle className="resurrection-halo" r="100" fill={`url(#${id}-halo)`}/>
    <path className="resurrection-pillar" d="M-38 30 L-64 -190 Q0 -220 64 -190 L38 30Z" fill={`url(#${id}-pillar)`}/>
    <g className="resurrection-seal"><ellipse rx="65" ry="24" cy="28"/><ellipse rx="48" ry="17" cy="28"/><path d="M-76 28H-58 M58 28H76 M0 0V13 M0 43V55 M-48 9L-38 17 M48 9L38 17 M-48 47L-38 39 M48 47L38 39"/></g>
    {[0,1,2].map(i=><ellipse key={i} className="resurrection-wave" style={{animationDelay:`${i*180}ms`}} rx="80" ry="32" cy="28"/>)}
    <g className="resurrection-ankh"><ellipse cx="0" cy="-77" rx="12" ry="18"/><path d="M0 -59V-16 M-20 -46H20"/></g>
    {Array.from({length:18},(_,i)=>{const angle=i*2.399;return <circle key={i} className="resurrection-spark" cx={Math.cos(angle)*42} cy={18+Math.sin(angle)*13} r={i%3===0?3:1.8} style={{'--spark-x':`${Math.cos(angle)*28}px`,'--spark-y':`${-85-(i%5)*22}px`,animationDelay:`${i*65}ms`} as CSSProperties}/>;})}
  </g>;
}
function JudgmentScales({x,y,sentence}:{x:number;y:number;sentence:boolean}) {
  return <g transform={`translate(${x} ${y})`} className={`judgment-effect ${sentence?'is-sentence':''}`}>
    <circle className="judgment-ring" r="68"/><circle className="judgment-ring inner" r="55"/>
    <g className="judgment-scales"><path className="scales-pillar" d="M0 -51V36 M-25 37H25 M-12 31L0 18 12 31"/>
      <g className="scales-balance"><path d="M-49 -32H49 M-39 -32L-54 3H-24Z M39 -32L24 3H54Z"/>
        <path className="judgment-feather" d="M-40 -2L-29 -28 Q-50 -31 -47 -9Z M-40 -2L-35 -22 M-45 -12L-36 -14"/>
        <path className="judgment-heart" d="M39 -5C15 -20 26 -36 39 -25C52 -36 63 -20 39 -5Z"/>
      </g>
    </g>
    {sentence&&<>{[0,1,2].map(i=><circle key={i} className="judgment-verdict" r="78" style={{animationDelay:`${900+i*120}ms`}}/>)}<path className="judgment-fall" d="M-24 -76L0 -47 24 -76 M0 -47V55"/></>}
  </g>;
}

function JudgmentDeath({x,y,src}:{x:number;y:number;src?:string}) {
  return <g transform={`translate(${x} ${y})`} className="judgment-death">
    {src&&<image className="judgment-victim" href={src} x="-43" y="-43" width="86" height="86"/>}
    <circle className="judgment-death-flash" r="57"/>
    <path className="judgment-fracture" d="M-12 -45L8 -18 -10 -1 13 16 2 44 M-10 -1L-34 14 M8 -18L30 -30"/>
    {Array.from({length:16},(_,i)=>{const angle=i*Math.PI/8;return <path key={i} className="judgment-ash" d="M-4 -5L5 -2 2 6-4 2Z" style={{'--ash-x':`${Math.cos(angle)*(50+i%3*18)}px`,'--ash-y':`${Math.sin(angle)*55+35}px`,'--ash-rotate':`${i*47}deg`,animationDelay:`${1050+i%4*65}ms`} as CSSProperties}/>;})}
    <g className="judgment-final-stack"><rect x="-27" y="-62" width="54" height="25" rx="8"/><text x="0" y="-44" textAnchor="middle">2 / 2</text></g>
  </g>;
}

function GroundFracture({x,y}:{x:number;y:number}) {
  const cracks = [
    'M0 12L-23 -7 -39 -3 -55 -31 -79 -40 -98 -76 -132 -100 M-55 -31L-50 -64 -63 -89 M-98 -76L-126 -68',
    'M0 12L20 -12 17 -36 49 -57 53 -84 84 -111 97 -142 M49 -57L80 -50 104 -68',
    'M0 12L32 21 50 5 81 17 98 0 144 8 M81 17L98 43 132 52',
    'M0 12L12 44 39 58 30 85 59 115 51 143 M30 85L3 96 -7 125',
    'M0 12L-28 34 -49 29 -68 57 -101 62 -135 90 M-68 57L-61 89 -84 119',
  ];
  return <g transform={`translate(${x} ${y})`} className="ground-fracture">
    {cracks.map((d,i)=><g key={d} style={{animationDelay:`${i*35}ms`}} className="ground-crack"><path className="ground-crack-edge" d={d} pathLength="1"/><path className="ground-crack-core" d={d} pathLength="1"/></g>)}
    {Array.from({length:14},(_,i)=>{const a=i*2.399;return <path key={i} className="ground-debris" d="M-5 -3L2 -6 6 1 1 5Z" style={{'--debris-x':`${Math.cos(a)*(42+i%4*22)}px`,'--debris-y':`${Math.sin(a)*85+14}px`,'--debris-turn':`${i*39}deg`,animationDelay:`${80+i%4*35}ms`} as CSSProperties}/>;})}
  </g>;
}
