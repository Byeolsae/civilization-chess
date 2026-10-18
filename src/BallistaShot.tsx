import { useId, type CSSProperties } from 'react';
import { BALLISTA_HIT_MS, BALLISTA_LAUNCH_MS, BALLISTA_EFFECT_MS } from './skillTiming';
import './ballistaShot.css';

type Point = { x: number; y: number };
export default function BallistaShot({ from, to, victim }: { from: Point; to: Point; victim?: string }) {
  const fragmentId = useId();
  const dx = to.x-from.x, dy = to.y-from.y, distance = Math.hypot(dx,dy);
  const angle = Math.atan2(dy,dx)*180/Math.PI;
  const style = {
    '--bolt-distance': `${distance}px`, '--hit-x': `${dx/distance*32}px`, '--hit-y': `${dy/distance*32}px`,
    '--bolt-load': `${BALLISTA_LAUNCH_MS}ms`, '--bolt-flight': `${BALLISTA_HIT_MS-BALLISTA_LAUNCH_MS}ms`,
    '--bolt-hit': `${BALLISTA_HIT_MS}ms`, '--bolt-total': `${BALLISTA_EFFECT_MS}ms`,
  } as CSSProperties;
  return <g className="ballista-shot" style={style}>
    <g transform={`translate(${from.x} ${from.y}) rotate(${angle})`}>
      <g className="ballista-bow">
        <path className="ballista-bow-wood" d="M-8 -33Q15 -24 15 0Q15 24 -8 33"/>
        <path className="ballista-string" d="M-8 -33L-8 0L-8 33"/>
        <path className="ballista-rail" d="M-27 0H27"/>
      </g>
      <g className="ballista-bolt-flight"><g className="ballista-bolt-load">
        <path className="ballista-speed" d="M-116 -7H-62M-137 0H-70M-109 7H-62"/>
        <path fill="#714526" stroke="#241a16" strokeWidth="2" d="M-65 -3H-18V3H-65Z"/>
        <path fill="#eee4cb" stroke="#594a35" strokeWidth="1.5" d="M-62 -2L-77 -12L-72 -1L-77 12L-62 2Z"/>
        <path fill="#b7c8cf" stroke="#283b46" strokeWidth="2" d="M0 0L-24 -11L-19 0L-24 11Z"/>
        <path stroke="#fff9e5" strokeWidth="2" d="M-22 -8L-3 0L-21 1" fill="none"/>
        <path stroke="#ddb477" strokeWidth="1.5" d="M-59 -1H-24"/>
      </g></g>
    </g>
    <g transform={`translate(${to.x} ${to.y})`}>
      {victim && <g className="ballista-victim-push">
        <image className="ballista-victim" href={victim} x="-44" y="-44" width="88" height="88"/>
        {['0,0 -44,-44 0,-44','0,0 0,-44 44,-44','0,0 44,-44 44,44','0,0 44,44 0,44','0,0 0,44 -44,44','0,0 -44,44 -44,-44'].map((points,i)=>{
          const radians=(i*60-120)*Math.PI/180;
          return <g key={i} className="ballista-fragment" style={{
            '--fragment-x':`${Math.cos(radians)*22+dx/distance*12}px`,
            '--fragment-y':`${Math.sin(radians)*22+dy/distance*12+9}px`,
            '--fragment-turn':`${i%2===0?24:-28}deg`,
          } as CSSProperties}>
            <defs><clipPath id={`${fragmentId}-${i}`}><polygon points={points}/></clipPath></defs>
            <image href={victim} x="-44" y="-44" width="88" height="88" clipPath={`url(#${fragmentId}-${i})`}/>
          </g>;
        })}
        <ellipse className="ballista-break-dust" cy="22" rx="32" ry="15"/>
      </g>}
      <g className="ballista-hit" transform={`rotate(${angle})`}>
        <path className="ballista-hit-flash" d="M-37 0L-12 -5L-18 -24L2 -9L18 -19L12 -2L36 0L12 6L20 24L0 12L-19 22L-11 5Z"/>
        {Array.from({length:8},(_,i)=><g key={i} transform={`rotate(${i*45})`}><path className="ballista-splinter" style={{'--chip-distance':`${35+(i%3)*9}px`} as CSSProperties} d="M7 -3L15 0L9 5Z"/></g>)}
      </g>
      <ellipse className="ballista-dust" cy="29" rx="35" ry="12"/>
    </g>
  </g>;
}
