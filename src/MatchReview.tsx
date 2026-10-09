import { reviewPosition } from './reviewPosition';
import { useEffect, useRef, useState } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { civilizations, type Players } from './game';
import CivilizationIcon from './CivilizationIcon';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Flame, RotateCw } from 'lucide-react';
import Piece from './Piece';
import { PieceStatusEffects } from './StatusEffects';
import './matchReview.css';

export default function MatchReview({ game, players, initialPly, flipped, viewer, live }: {
  game: Chess; players: Players; initialPly: number; flipped: boolean; viewer: Color; live: boolean;
}) {
  // Freeze this review session while the real match can continue receiving moves.
  const [frames] = useState(() => Array.from({ length: game.history().length + 1 }, (_, i) => reviewPosition(game, i)));
  const [moves] = useState(() => game.history({ verbose: true }));
  const [ply, setPly] = useState(Math.min(initialPly, frames.length - 1));
  const [orientation, setOrientation] = useState(flipped);
  const activeMove = useRef<HTMLButtonElement>(null);
  useEffect(() => { activeMove.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }, [ply]);
  const playerStrip = (side: Color) => <div className="review-player"><CivilizationIcon civilization={players[side]} color={side} size={28}/><strong>{civilizations.find(c => c.id === players[side])?.name}</strong><span className={`color-chip ${side}`}>{side === 'w' ? '백' : '흑'}</span><small>{frames[ply].turn() === side ? '다음 차례' : ''}</small></div>;
  const position = frames[ply], variant = position instanceof AbilityGame ? position : null;
  const last = moves[ply - 1];
  const ranks = orientation ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
  const files = (orientation ? 'hgfedcba' : 'abcdefgh').split('');
  return <div className="match-review">
    <div className="review-summary"><div><span>POSITION REVIEW</span><strong role="status">{ply === 0 ? '시작 배치' : `${last.color === 'w' ? '백' : '흑'} · ${last.san}`}</strong></div><b>{ply}<small> / {frames.length - 1}수</small></b></div>
    <div className="review-stage">
    {playerStrip(orientation ? 'w' : 'b')}
    <div className="board-frame review-frame" data-board-theme={players[viewer === 'w' ? 'b' : 'w']}>
    <div className="review-board" role="img" aria-label={`${ply}수 이후 체스판`}>
      {ranks.flatMap((rank, row) => files.map((file, column) => {
        const square = `${file}${rank}` as Square, piece = position.get(square), unit = variant?.unit(square);
        const zones = variant?.state.zones.filter(z => z.squares.includes(square)) ?? [];
        const fogged = variant && variant.state.stormUntil[viewer] > 0 && variant.state.stormUntil[viewer] >= variant.state.turns[viewer] && (viewer === 'w' ? rank >= 5 : rank <= 4);
        return <div key={square} className={`review-square ${(file.charCodeAt(0)-97+rank)%2 ? 'dark' : 'light'} ${last?.from === square || last?.to === square ? 'review-last' : ''}`}>
          {zones.some(z => z.kind === 'desert') && <span className="review-sand"/>}
          {zones.some(z => z.kind === 'pyramid') && <span className="pyramid-blessing"><i/><i/><i/></span>}
          {zones.some(z => z.kind === 'pyramid' && z.center === square) && <span className="passive-pyramid"><img src="/terrain/pyramid.svg" alt="피라미드"/></span>}
          {zones.some(z => z.kind === 'road') && <span className="passive-road"/>}
          {zones.some(z => z.kind === 'flame') && <span className="review-flame" aria-label="성화"><Flame/></span>}
          {!fogged && piece && <Piece type={piece.type} color={piece.color} civilization={players[piece.color]} skill={variant?.loadouts[piece.color].piece} lives={unit?.lives} revived={unit?.revived}/>}
          {!fogged && variant && <PieceStatusEffects game={variant} square={square}/>}
          {fogged && <span className="review-fog"/>}<>{column === 0 && <span className="review-rank">{rank}</span>}{row === 7 && <span className="review-file">{file}</span>}</>
        </div>;
      }))}
    </div>
    </div>
    {playerStrip(orientation ? 'b' : 'w')}
    </div>
    <div className="review-moves" aria-label="수 목록"><button aria-pressed={ply === 0} ref={ply === 0 ? activeMove : undefined} onClick={() => setPly(0)}>시작</button>{moves.map((move, i) => <button key={i} ref={ply === i + 1 ? activeMove : undefined} aria-pressed={ply === i + 1} onClick={() => setPly(i + 1)}><small>{i + 1}.</small>{move.san}</button>)}</div>
    <nav aria-label="복기 이동">
      <button disabled={ply === 0} onClick={() => setPly(0)} aria-label="처음으로" title="처음"><ChevronsLeft size={19}/></button>
      <button disabled={ply === 0} onClick={() => setPly(p => p - 1)} aria-label="이전 수" title="이전 수"><ChevronLeft size={23}/></button>
      <button onClick={() => setOrientation(v => !v)} aria-label="복기판 뒤집기" title="보드 뒤집기"><RotateCw size={17}/></button>
      <button disabled={ply === frames.length - 1} onClick={() => setPly(p => p + 1)} aria-label="다음 수" title="다음 수"><ChevronRight size={23}/></button>
      <button disabled={ply === frames.length - 1} onClick={() => setPly(frames.length - 1)} aria-label="마지막으로" title="마지막"><ChevronsRight size={19}/></button>
    </nav>
    <input aria-label="복기할 수 선택" type="range" min={0} max={frames.length - 1} value={ply} onChange={e => setPly(Number(e.target.value))}/>
    {live && <p className="review-notice">복기 중에도 실제 대전과 제한 시간은 계속 진행됩니다.</p>}
  </div>;
}
