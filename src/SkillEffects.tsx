import { POSEIDON_WAVE_MS, POSEIDON_RETURN_MS, POSEIDON_EFFECT_MS } from './skillTiming';
import { createPortal } from 'react-dom';
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
const CHARM_HIT_MS = 720;
const MINOTAUR_JUMP_MS = 920;
const MINOTAUR_DIZZY_DELAY_MS = MINOTAUR_JUMP_MS + 100;
const colors: Record<string, string> = { zeus: '#c5eeff', poseidon: '#75d8ff', hades: '#be98ff', osiris: '#fbe3a0', set: '#e7bf7a', anubis: '#eac27b', judgment: '#f3c367', alesia: '#eeb98e', vesta: '#ffbc75', pilum: '#ffce9c', ballista: '#ffe1ac', minotaur: '#f3c98c', cleopatra: '#ffadd8', trojan: '#bcdfac', deploy: '#bcdfac', gladiator: '#efb2a3', shield: '#b7e8fc', revive: '#f5dfa7', sphinx: '#ceb9ff' };
const labels: Record<string, string> = { judgment: '심장의 심판', shield: '방패 파괴', revive: '미라 부활', sphinx: '수수께끼 방어' };
export default function SkillEffects({ game, flipped, players }: { game: Chess; flipped: boolean; players: Players }) {
  const count = game.history().length;
  const previous = useRef({ game, count, flipped, state: game instanceof AbilityGame ? structuredClone(game.state) : null });
  const serial = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const [playing, setPlaying] = useState<PlayingEffect[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const layer = useRef<HTMLDivElement>(null);
  const playedImpact = useRef(0);
  const impact = [...playing].reverse().find(e => ['minotaur', 'zeus', 'poseidon'].includes(e.skill));
  useLayoutEffect(() => {
    if (!impact || impact.id <= playedImpact.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    playedImpact.current = impact.id;
    const board = layer.current?.closest('.board-section');
    if (!board) return;
    if (impact.skill === 'poseidon') {
      const direction = screenDirection(impact.direction, flipped);
      const distance = Math.min(18, board.getBoundingClientRect().width * .025);
      const x = direction === 0 ? distance : direction === 1 ? -distance : 0;
      const y = direction === 2 ? -distance : direction === 3 ? distance : 0;
      const duration = POSEIDON_WAVE_MS + POSEIDON_RETURN_MS;
      const wave = layer.current?.querySelector('.fx-wave');
      const dx = direction === 0 ? 800 : direction === 1 ? -800 : 0;
      const dy = direction === 2 ? -800 : direction === 3 ? 800 : 0;
      // The board takes the initial push with the white crest, then holds until the wave exits.
      const motion = board.animate([
        { transform: 'translate(0,0)', offset: 0, easing: 'ease-out' },
        { transform: `translate(${x}px,${y}px)`, offset: POSEIDON_WAVE_MS * .65 / duration, easing: 'linear' },
        { transform: `translate(${x}px,${y}px)`, offset: POSEIDON_WAVE_MS / duration, easing: 'ease-in-out' },
        { transform: 'translate(0,0)', offset: 1 },
      ], { duration, easing: 'linear' });
      const sweep = wave?.animate([
        { transform: 'translate(0,0)' },
        { transform: `translate(${dx}px,${dy}px)` },
      ], { duration: POSEIDON_WAVE_MS, easing: 'ease-out', fill: 'forwards' });
      const startTime = document.timeline.currentTime;
      motion.startTime = startTime;
      if (sweep) sweep.startTime = startTime;
      return () => { motion.cancel(); sweep?.cancel(); };
    }
    const motion = board.animate([
      { transform: 'translate(0,0)' }, { transform: 'translate(-4px,3px)' },
      { transform: 'translate(4px,-2px)' }, { transform: 'translate(-3px,2px)' },
      { transform: 'translate(2px,-1px)' }, { transform: 'translate(0,0)' },
    ], { duration: 420, easing: 'ease-out' });
    return () => motion?.cancel();
  }, [impact, flipped]);
  const stomp = [...playing].reverse().find(e => e.skill === 'minotaur');
  useLayoutEffect(() => {
    if (!stomp || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const board = layer.current?.closest('.board');
    const motions: Animation[] = [];
    const cells: Element[] = [];
    for (const square of stomp.stunned ?? []) {
      const cell = board?.querySelector(`[data-square="${square}"]`);
      const piece = cell?.querySelector('.piece');
      if (!cell || !piece) continue;
      cell.classList.add('minotaur-airborne'); cells.push(cell);
      const height = Math.min(24,cell.getBoundingClientRect().height*.32);
      const jump = piece.animate([
        {transform:'translateY(0) scale(1)',offset:0,easing:'ease-in'},
        {transform:'translateY(2px) scale(1.04,.94)',offset:.1,easing:'cubic-bezier(.15,.65,.3,1)'},
        {transform:`translateY(${-height}px) scale(.98,1.02)`,offset:.65,easing:'linear'},
        {transform:`translateY(${-height}px) scale(1)`,offset:.72,easing:'cubic-bezier(.65,0,1,.45)'},
        {transform:'translateY(1px) scale(1.07,.91)',offset:.9,easing:'ease-out'},
        {transform:'translateY(0) scale(1)',offset:1},
      ],{duration:MINOTAUR_JUMP_MS,easing:'linear'});
      motions.push(jump);
      const dizzy = cell.querySelector('.status-dizzy');
      if (dizzy) motions.push(dizzy.animate([
        {opacity:0,offset:0},
        {opacity:0,offset:MINOTAUR_DIZZY_DELAY_MS/(MINOTAUR_DIZZY_DELAY_MS+120)},
        {opacity:1,offset:1},
      ],{duration:MINOTAUR_DIZZY_DELAY_MS+120,easing:'linear'}));
      jump.onfinish=()=>cell.classList.remove('minotaur-airborne');
    }
    return ()=>{motions.forEach(m=>m.cancel());cells.forEach(c=>c.classList.remove('minotaur-airborne'));};
  },[stomp,flipped]);
  const charm = [...playing].reverse().find(e => e.skill === 'cleopatra');
  useLayoutEffect(() => {
    if (!charm || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // The engine commits immediately; only delay the new appearance until impact.
    const square = layer.current?.closest('.board')?.querySelector(`[data-square="${charm.to}"]`);
    const motions = [...(square?.querySelectorAll('.piece, .status-hearts') ?? [])].map(element =>
      element.animate([{ opacity: 0 }, { opacity: 0 }], { duration: CHARM_HIT_MS }));
    return () => motions.forEach(motion => motion.cancel());
  }, [charm]);
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
    const timer = setTimeout(() => { setPlaying(current => current.filter(e => !effects.some(next => next.id === e.id))); timers.current.delete(timer); }, effects.some(e => e.skill === 'judgment') ? 3600 : effects.some(e => ['osiris', 'revive', 'judgment', 'anubis', 'hades'].includes(e.skill)) ? 2600 : effects.some(e => e.skill === 'cleopatra') ? 1900 : effects.some(e => e.skill === 'poseidon') ? POSEIDON_EFFECT_MS : 1250);
    timers.current.add(timer);
  }, [game, count, flipped]);
  useLayoutEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);
  const sprite = (p: NonNullable<SkillEffect['victim']>) => {
    const special = specialPieceVariant(p.type,game instanceof AbilityGame ? game.loadouts[p.owner].piece : undefined,p.lives,p.revived);
    return special ? `/pieces/special/${p.owner}-${special}.svg` : `/pieces/${civilizationAppearance[players[p.owner]]}/${p.owner}${p.type.toUpperCase()}.svg`;
  };
  return <>{playing.filter(effect => effect.skill === 'minotaur').flatMap(effect => effect.squares.map(square => {
    const cell = layer.current?.closest('.board')?.querySelector(`[data-square="${square}"]`);
    if (!cell) return null;
    const point = boardPoint(square, flipped), origin = boardPoint(effect.from, flipped);
    return createPortal(<svg className="ground-fx-layer" viewBox={`${point.x-50} ${point.y-50} 100 100`} aria-hidden="true"><GroundFracture x={origin.x} y={origin.y}/></svg>, cell, `${effect.id}-${square}`);
  }))}<div ref={layer} className="skill-effects" aria-live="polite" aria-atomic="true">
    <span className="sr-only">{translateUi(announcement)}</span>
    <svg viewBox="0 0 800 800" aria-hidden="true" className="skill-fx-svg">
      {translateUi(playing.filter(effect => effect.skill !== 'minotaur').map(effect => <Effect key={effect.id} effect={effect} flipped={flipped} soulSrcs={effect.souls?.map(sprite)} ghostSrc={effect.victim ? (() => { const p=effect.victim; const special=specialPieceVariant(p.type,game instanceof AbilityGame ? game.loadouts[p.owner].piece : undefined,p.lives,p.revived); return special ? `/pieces/special/${p.owner}-${special}.svg` : `/pieces/${civilizationAppearance[players[p.owner]]}/${p.owner}${p.type.toUpperCase()}.svg`; })() : undefined} />))}
    </svg>
    {translateUi(playing.length > 0 && <div key={playing.at(-1)!.id} className="skill-fx-title" aria-hidden="true">{translateUi(abilityNames[playing.at(-1)!.skill] ?? labels[playing.at(-1)!.skill] ?? '스킬 발동')}</div>)}
  </div></>;
}
// Keep board recoil and the wave in the same screen-space direction.
function screenDirection(direction: number | undefined, flipped: boolean) {
  return (direction ?? 0) ^ (flipped ? 1 : 0);
}
function Effect({ effect: e, flipped, ghostSrc, soulSrcs }: { effect: SkillEffect; flipped: boolean; ghostSrc?: string; soulSrcs?: string[] }) {
  const from = boardPoint(e.from, flipped), to = boardPoint(e.to, flipped);
  const color = colors[e.skill] ?? '#f6d58d';
  if (e.skill === 'shield') return <ShieldBreak x={to.x} y={to.y} dark={e.shieldOwner==='b'}/>;
  if (e.skill === 'hades') return <HadesPortal souls={soulSrcs ?? []}/>;
  if (e.skill === 'osiris' || e.skill === 'revive') return <ResurrectionBurst x={to.x} y={to.y}/>;
  if (e.skill === 'anubis' || e.skill === 'judgment') return <g>{e.squares.map(square => { const point = boardPoint(square, flipped); return <g key={square}>{e.skill === 'judgment'&&<JudgmentDeath x={point.x} y={point.y} src={ghostSrc}/>}<JudgmentScales x={point.x} y={point.y} sentence={e.skill === 'judgment'}/></g>; })}</g>;
  if (e.skill === 'cleopatra') return <CharmFlight from={from} to={to} originalSrc={ghostSrc}/>;
  if (e.skill === 'minotaur') return <GroundFracture x={from.x} y={from.y}/>;
  if (e.skill === 'set') return <g className="skill-fx skill-fx-set"><ellipse className="set-dust" cx={to.x} cy={to.y} rx="138" ry="118" /></g>;
  const beam = ['ballista', 'pilum', 'cleopatra', 'trojan', 'deploy', 'gladiator'].includes(e.skill);
  const portal = ['osiris', 'hades', 'anubis', 'trojan', 'deploy', 'gladiator', 'revive'].includes(e.skill);
  const zone = ['set', 'vesta', 'alesia'].includes(e.skill);
  const direction = screenDirection(e.direction, flipped);
  const waveStyle = { '--wave-duration': `${POSEIDON_WAVE_MS}ms`, '--wave-x': `${direction === 0 ? 800 : direction === 1 ? -800 : 0}px`, '--wave-y': `${direction === 2 ? -800 : direction === 3 ? 800 : 0}px` } as CSSProperties;
  return <g style={{ color, '--wave-duration': `${POSEIDON_WAVE_MS}ms` } as CSSProperties} className={`skill-fx skill-fx-${e.skill}`}>
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
    {Array.from({length:7},(_,i)=>{const a=i*2.399;return <path key={i} className="ground-debris" d="M-5 -3L2 -6 6 1 1 5Z" style={{'--debris-x':`${Math.cos(a)*(26+i%4*12)}px`,'--debris-y':`${Math.sin(a)*45+14}px`,'--debris-turn':`${i*39}deg`,animationDelay:`${80+i%4*35}ms`} as CSSProperties}/>;})}
  </g>;
}

function CharmFlight({from,to,originalSrc}:{from:{x:number;y:number};to:{x:number;y:number};originalSrc?:string}) {
  const heart='M0 17C-36 -5 -23 -31 0 -13C23 -31 36 -5 0 17Z';
  return <g className="charm-cast" style={{'--charm-hit':`${CHARM_HIT_MS}ms`,'--charm-x':`${to.x-from.x}px`,'--charm-y':`${to.y-from.y}px`} as CSSProperties}>
    <g transform={`translate(${from.x} ${from.y})`}>
      {[3,2,1,0].map(i=><g key={i} className="charm-projectile" style={{animationDelay:`${i*65}ms`}}><path d={heart} className={i?'charm-echo':'charm-heart'} style={{opacity:i? .38-i*.07:1}}/></g>)}
    </g>
    <g transform={`translate(${to.x} ${to.y})`}>
      {originalSrc&&<image className="charm-original" href={originalSrc} x="-43" y="-43" width="86" height="86"/>}
      <path className="charm-bloom" d={heart}/>
      {Array.from({length:9},(_,i)=><g key={i} className="charm-petal" style={{'--petal-x':`${Math.cos(i*2.4)*55}px`,'--petal-y':`${-40-Math.sin(i*2.4)*30}px`,animationDelay:`${CHARM_HIT_MS+i*40}ms`} as CSSProperties}><path d={heart}/></g>)}
    </g>
  </g>;
}

function HadesPortal({souls}:{souls:string[]}) {
  return <g className="hades-scene">
    <rect className="hades-dim" width="800" height="800"/>
    <g transform="translate(400 400)">
      <g className="hades-gate">
        <path className="hades-void" d="M-100 115V-65Q-100 -168 0 -168Q100 -168 100 -65V115Z"/>
        <path className="hades-arch" d="M-113 115V-68Q-113 -180 0 -180Q113 -180 113 -68V115 M-132 115H132 M-88 115V-66Q-88 -150 0 -150Q88 -150 88 -66V115"/>
        <path className="hades-runes" d="M-112 -55H-88 M-112 -17H-88 M-112 22H-88 M-112 62H-88 M88 -55H112 M88 -17H112 M88 22H112 M88 62H112 M-44 -161L-38 -141 M44 -161L38 -141 M0 -180V-151"/>
        <path className="hades-crown" d="M-30 -180L-45 -206 -12 -197 0 -223 12 -197 45 -206 30 -180Z"/>
      </g>
      {souls.map((src,i)=><g key={i} className="hades-soul" style={{'--soul-x':`${(i-1)*155}px`,'--soul-y':`${i===1?95:25}px`,animationDelay:`${260+i*160}ms`} as CSSProperties}><image href={src} x="-40" y="-40" width="80" height="80"/></g>)}
      {[0,1,2,3,4,5].map(i=><path key={i} className="hades-ember" d="M0 8Q-10 0 0 -15Q10 0 0 8" style={{'--ember-x':`${(i-2.5)*35}px`,animationDelay:`${i*120}ms`} as CSSProperties}/>)}
      <g className="hades-seal"><circle r="57"/><path d="M-22 -8V-23A22 22 0 0 1 22 -23V-8 M-30 -8H30V33H-30Z M0 4V20"/></g>
    </g>
  </g>;
}

function ShieldBreak({x,y,dark}:{x:number;y:number;dark:boolean}) {
  const id=useId().replace(/:/g,'');
  const shards=[
    {d:'M-23 -24H1L-4 -8 3 -2 -6 3 -23 -2Z',x:-15,y:13,r:-32},
    {d:'M1 -24H23V-2L8 5 3 -2 -4 -8Z',x:16,y:10,r:38},
    {d:'M-23 -2L-6 3 3 -2 -1 10 4 25H-23Z',x:-10,y:23,r:-20},
    {d:'M3 -2L8 5 23 -2V25H4L-1 10Z',x:12,y:25,r:28},
  ];
  return <g transform={`translate(${x-12} ${y+15})`}>
    <defs>{shards.map((s,i)=><clipPath key={i} id={`${id}-shield-${i}`}><path d={s.d}/></clipPath>)}</defs>
    {shards.map((s,i)=><g key={i} className="sparta-shield-shard" style={{'--shield-x':`${s.x}px`,'--shield-y':`${s.y}px`,'--shield-r':`${s.r}deg`} as CSSProperties}><g clipPath={`url(#${id}-shield-${i})`}><ellipse rx="17" ry="18.5" fill={dark?'#7fb6b0':'#2f6f7e'} stroke={dark?'#173f4a':'#2f6f7e'} strokeWidth="2.1"/><path d="M-9 8L0 -10 9 8" fill="none" stroke="#d9b98c" strokeWidth="3.5"/></g></g>)}
    <path className="sparta-shield-crack" d="M1 -18L-4 -8 3 -2 -1 10 3 18 M3 -2L-6 3 -17 -1 M3 -2L8 5 17 0"/>
  </g>;
}
