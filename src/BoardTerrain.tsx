import { translateUi } from './i18n';
import type { CSSProperties } from 'react';
import type { Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { desertTerrainMask } from './desertTerrain';

export default function BoardTerrain({game,square,row,column,flipped}:{game:AbilityGame;square:Square;row:number;column:number;flipped:boolean}) {
  const pyramid = game.state.zones.some(z => z.kind === 'pyramid' && z.squares.includes(square));
  const mask = desertTerrainMask(square,game.state.zones.filter(z=>z.kind==='desert').flatMap(z=>z.squares),flipped);
  return <>
    {translateUi(game.state.zones.some(z=>z.kind==='road'&&z.squares.includes(square)) && <span className="passive-road" aria-hidden="true"/>)}
    {translateUi(pyramid && <span className="pyramid-blessing" style={{'--blessing-delay':`${-((row*3+column*5)%11)/3}s`} as CSSProperties} aria-hidden="true"><i/><i/><i/></span>)}
    {translateUi(game.state.zones.some(z=>z.kind==='pyramid'&&z.center===square) && <span className="passive-pyramid" aria-hidden="true"><img src="/terrain/pyramid.svg" alt="" draggable={false}/></span>)}
    {translateUi(mask && <span className="desert-terrain" style={{backgroundPosition:`${column/7*100}% ${row/7*100}%`,maskImage:mask,WebkitMaskImage:mask}} aria-hidden="true"/>)}
    {translateUi((pyramid||mask) && <span className="terrain-square-state" aria-hidden="true"/>)}
  </>;
}
