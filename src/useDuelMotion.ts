import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import type { Square } from 'chess.js';
import { AbilityGame, type AbilityAction } from './AbilityGame';
export function useDuelMotion(root:RefObject<HTMLDivElement|null>,game:AbilityGame,enabled:boolean,onAction:(a:AbilityAction)=>void){
 const d=game.state.duel!;
 const signature=JSON.stringify(d.positions);
 const prev=useRef({positions:{...d.positions},actions:d.actions});
 const skip=useRef<string|null>(null),suppressed=useRef(false);
 const pointer=useRef<{id:string;startX:number;startY:number;active:boolean}|null>(null);
 const [visual,setVisual]=useState<{id:string;x:number;y:number;size:number;over:Square|null}|null>(null);
 const [collapsing,setCollapsing]=useState(false);
 const clear=()=>{pointer.current=null;setVisual(null);};
 useEffect(()=>{clear();},[signature,enabled]);
 useEffect(()=>{const cancel=(e:KeyboardEvent)=>{if(e.key==='Escape'){suppressed.current=true;clear();}};window.addEventListener('keydown',cancel);return()=>window.removeEventListener('keydown',cancel);},[]);
 useLayoutEffect(()=>{
  const old=prev.current;prev.current={positions:{...d.positions},actions:d.actions};
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer:ReturnType<typeof setTimeout>|undefined;
  if(old.actions<4&&d.actions===4&&!reduce){setCollapsing(true);timer=setTimeout(()=>setCollapsing(false),900);}else setCollapsing(false);
  const animations:Animation[]=[];const cells:HTMLElement[]=[];
  if(!reduce)for(const [id,to] of Object.entries(d.positions)){
   const from=old.positions[id];if(!from||from===to||skip.current===id)continue;
   const a=root.current?.querySelector<HTMLElement>(`[data-duel-square="${from}"]`),b=root.current?.querySelector<HTMLElement>(`[data-duel-square="${to}"]`),piece=b?.querySelector<HTMLElement>('.piece');
   if(!a||!b||!piece)continue;
   const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();b.classList.add('duel-moving');cells.push(b);
   const animation=piece.animate([{transform:`translate(${x.left-y.left}px,${x.top-y.top}px)`},{transform:'translate(0,0)'}],{duration:320,easing:'cubic-bezier(.22,.61,.36,1)'});animation.onfinish=()=>b.classList.remove('duel-moving');animations.push(animation);
  }
  skip.current=null;
  return()=>{animations.forEach(a=>a.cancel());cells.forEach(c=>c.classList.remove('duel-moving'));if(timer)clearTimeout(timer);};
 },[signature,d.actions,root]);
 const destination=(x:number,y:number)=>{const cell=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-duel-square]');return cell&&root.current?.contains(cell)?cell.dataset.duelSquare as Square:null;};
 const moveTo=(to:Square)=>{const action=game.actions().find(a=>a.kind==='duel'&&a.to===to);if(enabled&&action){onAction(action);return true;}return false;};
 return {visual,collapsing,clear,
  click:(to:Square)=>{if(suppressed.current){suppressed.current=false;return;}moveTo(to);},
  down:(e:PointerEvent<HTMLButtonElement>,id:string|undefined)=>{suppressed.current=false;if(e.button!==0||!enabled||!id||game.state.pieces[id].owner!==game.turn())return;pointer.current={id,startX:e.clientX,startY:e.clientY,active:false};e.currentTarget.setPointerCapture(e.pointerId);},
  move:(e:PointerEvent<HTMLButtonElement>)=>{const p=pointer.current;if(!p)return;if(!p.active&&Math.hypot(e.clientX-p.startX,e.clientY-p.startY)<5)return;p.active=true;const size=e.currentTarget.getBoundingClientRect().width;setVisual({id:p.id,x:e.clientX,y:e.clientY,size,over:destination(e.clientX,e.clientY)});},
  up:(e:PointerEvent<HTMLButtonElement>)=>{const p=pointer.current;const to=destination(e.clientX,e.clientY);clear();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(!p?.active)return;suppressed.current=true;if(to){skip.current=p.id;if(!moveTo(to))skip.current=null;}},
  cancel:()=>{suppressed.current=true;clear();}
 };
}
