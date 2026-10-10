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
  const roads = game.state.zones.filter(z=>z.kind==='road').flatMap(z=>z.squares);
  const road = roads.includes(square);
  // The shoulder is visual only; roads retain their original movement area.
  const roadMask = desertTerrainMask(square,roads,flipped)?.replaceAll('30%', '5%').replaceAll('90%', '20%');
  const hasRoad = !!roadMask;
  const previousRoad = useRef(hasRoad);
  const [roadConstruction,setRoadConstruction] = useState<{delay:number}|null>(null);
  useLayoutEffect(()=>{
    const justPlaced=hasRoad&&!previousRoad.current&&game.history().length===0;
    previousRoad.current=hasRoad;
    if(!justPlaced){setRoadConstruction(null);return;}
    const nearest=game.state.zones.filter(z=>z.kind==='road').reduce((best,z)=>Math.min(best,Math.abs(square.charCodeAt(0)-z.center.charCodeAt(0))+Math.abs(Number(square[1])-Number(z.center[1]))),14);
    const delay=nearest*65;
    setRoadConstruction({delay});
    const timer=setTimeout(()=>setRoadConstruction(null),delay+1000);
    return ()=>clearTimeout(timer);
  },[hasRoad]);
  const unit = game.unit(square);
  const legion = !!unit?.legion && unit.type === 'p';
  const linked = (offset:number) => {
    const file = square.charCodeAt(0) + offset * (flipped ? -1 : 1);
    if(file<97||file>104)return false;
    const neighbor=game.unit(`${String.fromCharCode(file)}${square[1]}` as Square);
    return !!neighbor?.legion && neighbor.type==='p' && neighbor.owner===unit?.owner;
  };
  const pyramid = game.state.zones.some(z => z.kind === 'pyramid' && z.squares.includes(square));
  const mask = desertTerrainMask(square,game.state.zones.filter(z=>z.kind==='desert').flatMap(z=>z.squares),flipped);
  return <>
    {translateUi(roadMask && <span className={`passive-road ${road ? '' : 'road-shoulder'} ${roadConstruction?'is-paving':''}`} style={{backgroundPosition:`${column%2*100}% ${row%2*100}%`,maskImage:roadMask,WebkitMaskImage:roadMask,'--paving-delay':`${roadConstruction?.delay??0}ms`} as CSSProperties} aria-hidden="true">{roadConstruction&&<>{[0,1,2].map(i=><span key={i} className="road-build-course" style={{clipPath:`inset(${i*33.333}% 0 ${100-(i+1)*33.333}% 0)`,'--course-delay':`${i*90}ms`} as CSSProperties}/>)}<i className="road-build-dust"/></>}</span>)}
    {translateUi(pyramid && <span className="pyramid-blessing" style={{'--blessing-delay':`${-((row*3+column*5)%11)/3}s`} as CSSProperties} aria-hidden="true"><i/><i/><i/></span>)}
    {translateUi(center && <span className={`passive-pyramid ${building?'is-building':''}`} aria-hidden="true">{[70,55,40,25,0].map((top,index)=><span key={top} className="pyramid-build-course" style={{clipPath:`inset(${top}% 0 ${index===0?0:100-[70,55,40,25][index-1]}% 0)`}}><img src="/terrain/pyramid.svg" alt="" draggable={false} style={{animationDelay:`${index*180}ms`}}/></span>)}<i className="pyramid-build-dust"/></span>)}
    {translateUi(mask && <span className="desert-terrain" style={{backgroundPosition:`${column/7*100}% ${row/7*100}%`,maskImage:mask,WebkitMaskImage:mask}} aria-hidden="true"/>)}
    {legion && <span className={`legion-formation ${linked(-1)?'linked-left':''} ${linked(1)?'linked-right':''} ${unit?.legionSpent?'is-spent':''}`} aria-label={translateUi(unit?.legionSpent?'군단 · 보호 소모':'군단 · 보호 가능')}><i/><svg viewBox="0 0 24 28" aria-hidden="true"><path d="M3 3Q12 0 21 3V15Q20 22 12 26Q4 22 3 15Z"/><path className="legion-insignia" d="M12 6V19M8 10L12 6 16 10M8 15L12 19 16 15"/></svg></span>}
    {translateUi((pyramid||mask||roadMask) && <span className="terrain-square-state" aria-hidden="true"/>)}
  </>;
}
