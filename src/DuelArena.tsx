import { createPortal } from 'react-dom';
import { useDuelMotion } from './useDuelMotion';
import { useRef } from 'react';
import type { Square } from 'chess.js';
import { Swords, RotateCcw } from 'lucide-react';
import { AbilityGame, type AbilityAction } from './AbilityGame';
import type { Players } from './game';
import { translateUi } from './i18n';
import Piece from './Piece';
import './duelArena.css';

export default function DuelArena({game,players,enabled,onAction,embedded=false,onUndo,undoEnabled=false,undoLabel='한 수 무르기'}:{game:AbilityGame;players:Players;enabled:boolean;embedded?:boolean;onUndo?:()=>void;undoEnabled?:boolean;undoLabel?:string;onAction:(action:AbilityAction)=>void}) {
  const root=useRef<HTMLDivElement>(null);
  const motion=useDuelMotion(root,game,enabled,onAction);
  const duel=game.state.duel!;
  const flipped=duel.initiator==='b';
  const actor=[duel.attacker,duel.defender].find(id=>game.state.pieces[id].owner===game.turn())!;
  const actions=enabled?game.actions():[];
  const destinations=new Map(actions.filter(a=>a.kind==='duel').map(a=>[a.to,a]));
  const ghost=motion.visual ? game.state.pieces[motion.visual.id] : null;
  return <div className={`duel-overlay ${embedded?'embedded-duel':''}`} role={embedded?'region':'dialog'} aria-modal={embedded?undefined:true} aria-label={translateUi('콜로세움 결투')}>
    <div className="colosseum-scenery" aria-hidden="true"/><section className={`duel-arena ${motion.collapsing?'arena-collapse':''}`}>
      <header><Swords size={24}/><div><h2>{translateUi('콜로세움 결투')}</h2><p>{translateUi('본 게임 일시정지 · 두 기물의 생존 결투')}</p></div><b>{duel.actions+1} / 8</b></header>
      <div className="duel-phase">{translateUi(duel.actions<4?'8×8 · 4번째 행동 후 외곽 붕괴':'6×6 · 8번째 행동까지 생존')}<span>{translateUi(actor===duel.attacker?'글라디아토르의 차례':'생존자의 차례')}</span></div>
      <div className="arena-floor"><div ref={root} className={`colosseum-board ${duel.actions>=4?'is-contracted':''}`}>
        {Array.from({length:64},(_,i)=>{
          const x=flipped?7-i%8:i%8,y=flipped?Math.floor(i/8):7-Math.floor(i/8);
          const square=`${'abcdefgh'[x]}${y+1}` as Square;
          const id=[duel.attacker,duel.defender].find(id=>duel.positions[id]===square);
          const p=id?game.state.pieces[id]:null;
          const edge=x===0||x===7||y===0||y===7;
          const collapsed=edge&&duel.actions>=4;
          return <button key={square} data-duel-square={square} className={`duel-square ${(x+y)%2?'light':'dark'} ${collapsed?'collapsed':''} ${edge&&duel.actions===3?'danger':''} ${id===actor?'acting':''} ${motion.visual?.id===id&&id?'duel-drag-origin':''} ${motion.visual?.over===square&&destinations.has(square)?'duel-drop-target':''}`} disabled={!enabled||collapsed} aria-label={`${square}${id===duel.attacker?' · '+translateUi('글라디아토르'):''}`} onClick={()=>motion.click(square)} onPointerDown={e=>motion.down(e,id)} onPointerMove={motion.move} onPointerUp={motion.up} onPointerCancel={motion.cancel} onLostPointerCapture={motion.clear}>
            <small>{square}</small>{p&&<Piece type={p.type} color={p.owner} civilization={players[p.owner]} skill={game.loadouts[p.owner].piece} lives={p.lives} revived={p.revived}/>}{destinations.has(square)&&<i className={p?'duel-capture':'duel-dot'}/>}
          </button>;
        })}
      </div><div className="arena-dust" aria-hidden="true"/></div>
      <p className="duel-instructions">{translateUi(actor===duel.attacker?'이동·공격은 퀸처럼. 제한 안에 상대를 잡으세요.':'원래 기물의 이동으로 버티세요. 외곽에 남으면 즉사합니다.')}</p>
      {onUndo&&<button className="duel-undo" disabled={!undoEnabled} onClick={()=>{motion.clear();onUndo();}}><RotateCcw size={16}/>{translateUi(undoLabel)}</button>}
      {!enabled&&<p className="duel-wait">{translateUi('상대의 결투 행동을 기다리는 중')}</p>}
      {actions.some(a=>a.kind==='pass')&&<button className="primary-button" onClick={()=>onAction(actions.find(a=>a.kind==='pass')!)}>{translateUi('행동 대기')}</button>}
    </section>
    {motion.visual&&ghost&&createPortal(<div className="duel-drag-piece" style={{left:motion.visual.x,top:motion.visual.y,width:motion.visual.size,height:motion.visual.size}}><Piece type={ghost.type} color={ghost.owner} civilization={players[ghost.owner]} skill={game.loadouts[ghost.owner].piece} lives={ghost.lives} revived={ghost.revived}/></div>,document.body)}
  </div>;
}
