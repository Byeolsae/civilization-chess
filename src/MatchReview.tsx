import DuelArena from './DuelArena';
import { translateUi } from './i18n';
import { reviewPosition } from './reviewPosition';
import { useMemo } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { civilizations, type Players } from './game';
import CivilizationIcon from './CivilizationIcon';
import { Flame } from 'lucide-react';
import Piece from './Piece';
import { PieceStatusEffects } from './StatusEffects';
import './matchReview.css';

export default function MatchReview({ game, players, initialPly, flipped, viewer }: {
  game: Chess; players: Players; initialPly: number; flipped: boolean; viewer: Color;
}) {
  const moves=game.history({verbose:true});
  const ply=Math.max(0,Math.min(initialPly,moves.length));
  // Read one independent position; receiving a live move never changes the selected ply.
  const position=useMemo(()=>reviewPosition(game,ply),[game,ply,moves.length]);
  const variant=position instanceof AbilityGame?position:null;
  const orientation=flipped;
  const last=moves[ply-1];
  const playerStrip=(side:Color)=><div className="review-player"><CivilizationIcon civilization={players[side]} color={side} size={28}/><strong>{translateUi(civilizations.find(c=>c.id===players[side])?.name)}</strong><span className={`color-chip ${side}`}>{translateUi(side==='w'?'백':'흑')}</span><small>{translateUi('복기 중')}</small></div>;
  const ranks=orientation?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];
  const files=(orientation?'hgfedcba':'abcdefgh').split('');
  return <div className={`match-review inline-match-review ${variant?"has-abilities":""}`}>
    {variant?.state.duel?<DuelArena game={variant} players={players} enabled={false} onAction={()=>{}} embedded/>:<>
    <div className="review-stage">
    {translateUi(playerStrip(orientation ? 'w' : 'b'))}
    <div className="board-frame review-frame" data-board-theme={players[viewer === 'w' ? 'b' : 'w']}>
    <div className="review-board" role="img" aria-label={translateUi(`${ply}수 이후 체스판`)}>
      {translateUi(ranks.flatMap((rank, row) => files.map((file, column) => {
        const square = `${file}${rank}` as Square, piece = position.get(square), unit = variant?.unit(square);
        const zones = variant?.state.zones.filter(z => z.squares.includes(square)) ?? [];
        const fogged = variant && variant.state.stormUntil[viewer] > 0 && variant.state.stormUntil[viewer] >= variant.state.turns[viewer] && (viewer === 'w' ? rank >= 5 : rank <= 4);
        return <div key={square} className={`review-square ${(file.charCodeAt(0)-97+rank)%2 ? 'dark' : 'light'} ${last?.from === square || last?.to === square ? 'review-last' : ''}`}>
          {translateUi(zones.some(z => z.kind === 'desert') && <span className="review-sand"/>)}
          {translateUi(zones.some(z => z.kind === 'pyramid') && <span className="pyramid-blessing"><i/><i/><i/></span>)}
          {translateUi(zones.some(z => z.kind === 'pyramid' && z.center === square) && <span className="passive-pyramid"><img src="/terrain/pyramid.svg" alt={translateUi("피라미드")}/></span>)}
          {translateUi(zones.some(z => z.kind === 'road') && <span className="passive-road"/>)}
          {translateUi(zones.some(z => z.kind === 'flame') && <span className="review-flame" aria-label={translateUi("성화")}><Flame/></span>)}
          {translateUi(!fogged && piece && <Piece type={piece.type} color={piece.color} civilization={players[piece.color]} skill={variant?.loadouts[piece.color].piece} lives={unit?.lives} revived={unit?.revived}/>)}
          {translateUi(!fogged && variant && <PieceStatusEffects game={variant} square={square}/>)}
          {translateUi(fogged && <span className="review-fog"/>)}<>{translateUi(column === 0 && <span className="review-rank">{translateUi(rank)}</span>)}{translateUi(row === 7 && <span className="review-file">{translateUi(file)}</span>)}</>
        </div>;
      })))}
    </div>
    </div>
    {translateUi(playerStrip(orientation ? 'b' : 'w'))}
    </div>
    </>}
  </div>;
}
