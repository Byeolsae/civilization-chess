import type { RefObject } from 'react';
import type { Move } from 'chess.js';
import { History, Play, ChevronRight, Swords, Sparkles } from 'lucide-react';
import Piece from './Piece';
import type { Players } from './game';
import './matchHistory.css';

export default function MatchHistory({ moves, players, listRef, onReview, waiting }: {
  moves: Move[]; players: Players; listRef: RefObject<HTMLDivElement | null>;
  onReview: (ply: number) => void; waiting: string;
}) {
  return <section className="match-history" aria-label="대전 기록">
    <header className="match-history-heading"><div><History size={17}/><h3>대전 기록</h3><span>{moves.length}</span></div>
      <button className="history-review-action" disabled={!moves.length} onClick={() => onReview(moves.length)}><Play size={12} fill="currentColor"/>복기</button>
    </header>
    <div className="match-history-columns" aria-hidden="true"><span>수</span><span>진영</span><span>행동</span></div>
    <div className="match-history-list" ref={listRef} aria-label="수를 누르면 해당 장면 복기">
      {!moves.length ? <div className="match-history-empty"><Swords size={27} strokeWidth={1.25}/><strong>첫 수를 기다리고 있어요</strong><p>{waiting}</p></div> : moves.map((move, index) => {
        const latest = index === moves.length - 1;
        const skill = move.flags.includes('s');
        return <button key={index} className={`match-history-entry ${latest ? 'is-latest' : ''}`} onClick={() => onReview(index + 1)} aria-label={`${index + 1}수 ${move.color === 'w' ? '백' : '흑'} ${move.san} 복기`} aria-current={latest ? 'step' : undefined}>
          <span className="history-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="history-side"><i className={move.color}/>{move.color === 'w' ? '백' : '흑'}</span>
          <span className="history-action-icon">{skill ? <Sparkles size={17}/> : <Piece type={move.piece} color={move.color} civilization={players[move.color]} small/>}</span>
          <span className="history-notation">{move.san}</span>
          <ChevronRight className="history-row-arrow" size={14}/>
        </button>;
      })}
    </div>
    <footer className="match-history-footer"><span className="history-live-dot"/>{moves.length ? '수를 누르면 그 장면으로 이동합니다' : '대전이 시작되면 여기에 기록됩니다'}</footer>
  </section>;
}
