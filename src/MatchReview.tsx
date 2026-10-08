import { reviewPosition } from './reviewPosition';
import { useState } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import type { Players } from './game';
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
  const position = frames[ply], variant = position instanceof AbilityGame ? position : null;
  const last = moves[ply - 1];
  const ranks = flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
  const files = (flipped ? 'hgfedcba' : 'abcdefgh').split('');
  return <div className="match-review">
    <p role="status">{ply === 0 ? '시작 배치' : `${ply}수 · ${last.color === 'w' ? '백' : '흑'} ${last.san}`}</p>
    <div className="review-board" role="img" aria-label={`${ply}수 이후 체스판`}>
      {ranks.flatMap(rank => files.map(file => {
        const square = `${file}${rank}` as Square, piece = position.get(square), unit = variant?.unit(square);
        const zones = variant?.state.zones.filter(z => z.squares.includes(square)) ?? [];
        const fogged = variant && variant.state.stormUntil[viewer] > 0 && variant.state.stormUntil[viewer] >= variant.state.turns[viewer] && (viewer === 'w' ? rank >= 5 : rank <= 4);
        return <div key={square} className={`review-square ${(file.charCodeAt(0)-97+rank)%2 ? 'dark' : 'light'} ${last?.from === square || last?.to === square ? 'review-last' : ''}`}>
          {zones.some(z => z.kind === 'desert') && <span className="review-sand"/>}
          {zones.some(z => z.kind === 'pyramid') && <span className="pyramid-blessing"/>}
          {zones.some(z => z.kind === 'pyramid' && z.center === square) && <span className="passive-pyramid"><img src="/terrain/pyramid.svg" alt="피라미드"/></span>}
          {zones.some(z => z.kind === 'road') && <span className="passive-road"/>}
          {zones.some(z => z.kind === 'flame') && <span className="review-flame" aria-label="성화">♨</span>}
          {!fogged && piece && <Piece type={piece.type} color={piece.color} civilization={players[piece.color]} skill={variant?.loadouts[piece.color].piece} lives={unit?.lives} revived={unit?.revived}/>}
          {!fogged && variant && <PieceStatusEffects game={variant} square={square}/>}
          {fogged && <span className="review-fog"/>}<small>{square}</small>
        </div>;
      }))}
    </div>
    <nav aria-label="복기 이동">
      <button disabled={ply === 0} onClick={() => setPly(0)}>처음</button>
      <button disabled={ply === 0} onClick={() => setPly(p => p - 1)}>이전</button>
      <span>{ply} / {frames.length - 1}</span>
      <button disabled={ply === frames.length - 1} onClick={() => setPly(p => p + 1)}>다음</button>
      <button disabled={ply === frames.length - 1} onClick={() => setPly(frames.length - 1)}>마지막</button>
    </nav>
    <input aria-label="복기할 수 선택" type="range" min={0} max={frames.length - 1} value={ply} onChange={e => setPly(Number(e.target.value))}/>
    {live && <p className="review-notice">복기 중에도 실제 대전과 제한 시간은 계속 진행됩니다.</p>}
  </div>;
}
