import { useEffect, useState, type ReactNode } from 'react';
import { translateUi } from './i18n';
import type { Color, Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { effectActive } from './abilityState';
import { Trophy, Scale } from 'lucide-react';
import './statusEffects.css';

export function PieceStatusEffects({game,square}:{game:AbilityGame;square:Square}) {
  const p=game.unit(square);
  const [page,setPage]=useState(0);
  const trojan=!!p && p.type==='n' && game.loadouts[p.owner].piece==='trojan';
  const hasEffects=!!p && (['shock','stun','disarm'] as const).some(kind=>effectActive(game.state,p,kind)) || !!p?.charmed || !!p?.question;
  const hasJudgment=!!p?.judgment && !p.judgment.executedAt;
  const hasGlory=!!p && (game.state.extraAction===p.id || p.glory>0);
  const pageCount=trojan ? 1+Number(hasEffects)+Number(hasJudgment)+Number(hasGlory) : 1;
  useEffect(()=>{
    setPage(0);
    if(pageCount<2)return;
    const timer=setInterval(()=>setPage(value=>(value+1)%pageCount),3500);
    return ()=>clearInterval(timer);
  },[p?.id,pageCount]);
  if(!p)return null;
  const shock=effectActive(game.state,p,'shock'),stun=effectActive(game.state,p,'stun'),disarm=effectActive(game.state,p,'disarm');
  const glory=game.state.extraAction===p.id ? 3 : p.glory;
  const judgment = p.judgment&&!p.judgment.executedAt ? <span className={`judgment-status ${p.judgment.kills?'is-heavy':''}`}><Scale size={17}/><b key={p.judgment.kills}>{p.judgment.kills}<small>/2</small></b></span> : null;
  const trophies = glory>0 ? <span className="glory-trophies">{[0,1,2].map(i=><Trophy key={i} className={i<glory?'filled':'empty'} />)}</span> : null;
  const effects = <>
    {p.question&&<span className="philosophy-question">?</span>}
    {translateUi(shock&&<svg className="status-electric" viewBox="0 0 100 100"><path d="M18 25 L10 39 L20 37 L12 57 M83 38 L92 51 L82 49 L88 70 M29 79 L40 88 L43 78 L58 87"/></svg>)}
    {translateUi(stun&&<svg className="status-dizzy" viewBox="0 0 100 100"><g className="dizzy-orbit"><path d="M27 25 c-12,-10 -24,7 -12,13 c10,5 17,-8 8,-11 c-6,-2 -8,5 -3,6"/><path d="M81 19 c-12,-10 -24,7 -12,13 c10,5 17,-8 8,-11 c-6,-2 -8,5 -3,6"/><path d="M59 12 c-9,-7 -18,5 -9,9 c7,4 12,-6 6,-8"/></g></svg>)}
    {translateUi(p.charmed&&<span className="status-hearts"><i>♥</i><i>♥</i><i>♥</i></span>)}
    {translateUi(disarm&&<svg className="status-disarm" viewBox="0 0 100 100"><path d="M72 67 L86 81 M86 67 L72 81"/><circle cx="79" cy="74" r="14"/></svg>)}
  </>;
  if(trojan){
    const cargo=<span className="trojan-passengers">{[0,1,2,3].map(i=><svg key={i} className={i<p.cargo.length?'filled':'empty'} viewBox="0 0 16 22"><circle cx="8" cy="5" r="3"/><path d="M5 9h6l-1 3 1 3 3 3v2H2v-2l3-3 1-3Z"/></svg>)}</span>;
    const pages: {id:string;node:ReactNode}[]=[{id:'cargo',node:cargo}];
    if(judgment)pages.push({id:'judgment',node:judgment});
    if(trophies)pages.push({id:'glory',node:trophies});
    if(hasEffects)pages.push({id:'effects',node:effects});
    return <span className="piece-status-effects trojan-status" aria-hidden="true">{pages.map((item,index)=><span key={item.id} className={`trojan-status-page ${index===page%pages.length?'visible':''}`}>{item.node}</span>)}</span>;
  }
  if(!hasEffects&&!judgment&&!trophies)return null;
  return <span className={`piece-status-effects ${glory>0&&judgment?'alternating-stacks':''}`} aria-hidden="true">{judgment}{effects}{trophies}</span>;
}
export function Sandstorm({game,viewer,flipped}:{game:AbilityGame;viewer:Color;flipped:boolean}) {
  if(game.state.stormUntil[viewer]<=0||game.state.stormUntil[viewer]<game.state.turns[viewer])return null;
  const top=(viewer==='w')!==flipped;
  return <div className={`sandstorm-veil ${top?'top':'bottom'}`} aria-hidden="true"><div className="sand-cloud sand-cloud-back"/><div className="sand-cloud sand-cloud-front"/><div className="sand-grains"/></div>;
}
