import { translateUi } from './i18n';
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { desertTerrainMask } from './desertTerrain';

export default function BoardTerrain({game,square,row,column,flipped}:{game:AbilityGame;square:Square;row:number;column:number;flipped:boolean}) {
  const center = game.state.zones.some(z=>z.kind==='pyramid'&&z.center===square);
  const previousCenter = useRef(center);
  const [building,setBuilding] = useState(false);
  useLayoutEffect(() => {
    const placed = center && !previousCenter.current && game.history().length === 0;
    previousCenter.current = center;
    if (!placed) { setBuilding(false); return; }
    setBuilding(true);
    const timer = setTimeout(()=>setBuilding(false),1400);
    return ()=>clearTimeout(timer);
  },[center,game]);
  const pyramid = game.state.zones.some(z => z.kind === 'pyramid' && z.squares.includes(square));
  const mask = desertTerrainMask(square,game.state.zones.filter(z=>z.kind==='desert').flatMap(z=>z.squares),flipped);
  return <>
    {translateUi(game.state.zones.some(z=>z.kind==='road'&&z.squares.includes(square)) && <span className="passive-road" aria-hidden="true"/>)}
    {translateUi(pyramid && <span className="pyramid-blessing" style={{'--blessing-delay':`${-((row*3+column*5)%11)/3}s`} as CSSProperties} aria-hidden="true"><i/><i/><i/></span>)}
    {translateUi(center && <span className={`passive-pyramid ${building?'is-building':''}`} aria-hidden="true">{[70,55,40,25,0].map((top,index)=><span key={top} className="pyramid-build-course" style={{clipPath:`inset(${top}% 0 ${index===0?0:100-[70,55,40,25][index-1]}% 0)`}}><img src="/terrain/pyramid.svg" alt="" draggable={false} style={{animationDelay:`${index*180}ms`}}/></span>)}<i className="pyramid-build-dust"/></span>)}
    {translateUi(mask && <span className="desert-terrain" style={{backgroundPosition:`${column/7*100}% ${row/7*100}%`,maskImage:mask,WebkitMaskImage:mask}} aria-hidden="true"/>)}
    {translateUi((pyramid||mask) && <span className="terrain-square-state" aria-hidden="true"/>)}
  </>;
}
