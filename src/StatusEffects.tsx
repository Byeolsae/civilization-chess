import { translateUi } from './i18n';
import type { Color, Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { effectActive } from './abilityState';
import { Trophy, Scale } from 'lucide-react';
import './statusEffects.css';

export function PieceStatusEffects({game,square}:{game:AbilityGame;square:Square}) {
  const p=game.unit(square);
  if(!p)return null;
  const shock=effectActive(game.state,p,'shock'),stun=effectActive(game.state,p,'stun'),disarm=effectActive(game.state,p,'disarm');
  const glory=game.state.extraAction===p.id ? 3 : p.glory;
  if(!shock&&!stun&&!disarm&&!p.charmed&&!glory&&(!p.judgment||!!p.judgment.executedAt))return null;
  return <span className="piece-status-effects" aria-hidden="true">
    {p.judgment&&!p.judgment.executedAt&&<span className={`judgment-status ${p.judgment.kills?'is-heavy':''}`}><Scale size={17}/><b>{p.judgment.kills}/2</b></span>}
    {translateUi(shock&&<svg className="status-electric" viewBox="0 0 100 100"><path d="M18 25 L10 39 L20 37 L12 57 M83 38 L92 51 L82 49 L88 70 M29 79 L40 88 L43 78 L58 87"/></svg>)}
    {translateUi(stun&&<svg className="status-dizzy" viewBox="0 0 100 100"><g className="dizzy-orbit"><path d="M27 25 c-12,-10 -24,7 -12,13 c10,5 17,-8 8,-11 c-6,-2 -8,5 -3,6"/><path d="M81 19 c-12,-10 -24,7 -12,13 c10,5 17,-8 8,-11 c-6,-2 -8,5 -3,6"/><path d="M59 12 c-9,-7 -18,5 -9,9 c7,4 12,-6 6,-8"/></g></svg>)}
    {translateUi(p.charmed&&<span className="status-hearts"><i>♥</i><i>♥</i><i>♥</i></span>)}
    {translateUi(disarm&&<svg className="status-disarm" viewBox="0 0 100 100"><path d="M72 67 L86 81 M86 67 L72 81"/><circle cx="79" cy="74" r="14"/></svg>)}
    {translateUi(glory>0&&<span className="glory-trophies">{translateUi([0,1,2].map(i=><Trophy key={i} className={i<glory?'filled':'empty'} />))}</span>)}
  </span>;
}
export function Sandstorm({game,viewer,flipped}:{game:AbilityGame;viewer:Color;flipped:boolean}) {
  if(game.state.stormUntil[viewer]<=0||game.state.stormUntil[viewer]<game.state.turns[viewer])return null;
  const top=(viewer==='w')!==flipped;
  return <div className={`sandstorm-veil ${top?'top':'bottom'}`} aria-hidden="true"><div className="sand-cloud sand-cloud-back"/><div className="sand-cloud sand-cloud-front"/><div className="sand-grains"/></div>;
}
