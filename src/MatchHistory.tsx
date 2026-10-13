import { translateUi } from './i18n';
import { useEffect, type RefObject } from 'react';
import type { Move } from 'chess.js';
import { History, Play, ChevronRight, Swords, Sparkles, ChevronLeft, ChevronsLeft, ChevronsRight, RotateCw } from 'lucide-react';
import Piece from './Piece';
import type { Players } from './game';
import './matchHistory.css';

export default function MatchHistory({ moves, players, listRef, onReview, waiting, reviewPly, onLive, onFlip, live }: {
  moves: Move[]; players: Players; listRef: RefObject<HTMLDivElement | null>;
  onReview: (ply: number) => void; waiting: string; reviewPly:number|null; onLive:()=>void; onFlip:()=>void; live:boolean;
}) {
  const current=reviewPly===null?moves.length:Math.min(reviewPly,moves.length);
  useEffect(()=>{
    if(reviewPly===null)return;
    const row=listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    if(row&&listRef.current){const list=listRef.current;list.scrollTo({top:list.scrollTop+row.getBoundingClientRect().top-list.getBoundingClientRect().top,behavior:'auto'});}
    else listRef.current?.scrollTo({top:0,behavior:'auto'});
  },[reviewPly,listRef]);
  return <section className="match-history" aria-label={translateUi("대전 기록")}>
    <header className="match-history-heading"><div><History size={17}/><h3>{translateUi("대전 기록")}</h3><span>{translateUi(moves.length)}</span></div>
      <button className="history-review-action" disabled={!moves.length&&reviewPly===null} onClick={()=>reviewPly===null?onReview(moves.length):onLive()}><Play size={12} fill="currentColor"/>{translateUi(reviewPly===null?"복기":"현재 대전으로 돌아가기")}</button>
    </header>
    {reviewPly!==null&&<div className="inline-review-status" role="status"><strong>{translateUi('복기 중')} · {current} / {moves.length}</strong>{live&&<small>{translateUi('복기 중에도 실제 대전과 제한 시간은 계속 진행됩니다.')}</small>}</div>}
    <div className="match-history-columns" aria-hidden="true"><span>{translateUi("수")}</span><span>{translateUi("진영")}</span><span>{translateUi("행동")}</span></div>
    <div className="match-history-list" ref={listRef} aria-label={translateUi("수를 누르면 해당 장면 복기")}>
      {translateUi(!moves.length ? <div className="match-history-empty"><Swords size={27} strokeWidth={1.25}/><strong>{translateUi("첫 수를 기다리고 있어요")}</strong><p>{translateUi(waiting)}</p></div> : moves.map((move, index) => {
        const latest = index === current - 1;
        const skill = move.flags.includes('s');
        return <button key={index} className={`match-history-entry ${latest ? 'is-latest' : ''}`} onClick={() => onReview(index + 1)} aria-label={translateUi(`${index + 1}수 ${move.color === 'w' ? '백' : '흑'} ${move.san} 복기`)} aria-current={latest ? 'step' : undefined}>
          <span className="history-index">{translateUi(String(index + 1).padStart(2, '0'))}</span>
          <span className="history-side"><i className={move.color}/>{translateUi(move.color === 'w' ? '백' : '흑')}</span>
          <span className="history-action-icon">{translateUi(skill ? <Sparkles size={17}/> : <Piece type={move.piece} color={move.color} civilization={players[move.color]} small/>)}</span>
          <span className="history-notation">{translateUi(move.san)}</span>
          <ChevronRight className="history-row-arrow" size={14}/>
        </button>;
      }))}
    </div>
    <nav className="history-navigation" aria-label={translateUi('복기 이동')}>
      <button disabled={current===0} onClick={()=>onReview(0)} aria-label={translateUi('처음으로')} title={translateUi('처음으로')}><ChevronsLeft size={20}/></button>
      <button disabled={current===0} onClick={()=>onReview(current-1)} aria-label={translateUi('이전 수')} title={translateUi('이전 수')}><ChevronLeft size={21}/></button>
      <button onClick={onFlip} aria-label={translateUi('보드 뒤집기')} title={translateUi('보드 뒤집기')}><RotateCw size={17}/></button>
      <button disabled={current===moves.length} onClick={()=>onReview(current+1)} aria-label={translateUi('다음 수')} title={translateUi('다음 수')}><ChevronRight size={21}/></button>
      <button disabled={reviewPly===null} onClick={onLive} aria-label={translateUi('현재 대전으로 돌아가기')} title={translateUi('현재 대전으로 돌아가기')}><ChevronsRight size={20}/></button>
    </nav>
  </section>;
}
