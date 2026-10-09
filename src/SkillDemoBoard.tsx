import { useRef } from 'react';
import type { Square } from 'chess.js';
import type { Civilization } from './civilizations';
import { AbilityGame } from './AbilityGame';
import Piece from './Piece';
import BoardTerrain from './BoardTerrain';
import SkillEffects from './SkillEffects';
import { PieceStatusEffects, Sandstorm } from './StatusEffects';
import { useMoveAnimation } from './useMoveAnimation';
import CooldownBadge from './CooldownBadge';
import { AbilityPanel } from './AbilityPanel';

export default function SkillDemoBoard({game,civilization,storm}:{game:AbilityGame;civilization:Civilization;storm:boolean}) {
  const ref=useRef<HTMLDivElement>(null),skip=useRef<string|null>(null);
  const viewer=storm?'b':'w',flipped=storm;
  useMoveAnimation(ref,game,flipped,skip);
  const ranks=flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];
  const files=(flipped?'hgfedcba':'abcdefgh').split('');
  return <div className="board-section live-demo-stage">
    <div className="board-frame" data-board-theme={civilization}><div className="board" ref={ref} role="img" aria-label="실제 게임 엔진으로 재생하는 스킬 시연">
      {ranks.flatMap((rank,row)=>files.map((file,column)=>{
        const square=`${file}${rank}` as Square,p=game.get(square),unit=game.unit(square);
        const fog=game.state.stormUntil[viewer]>0&&game.state.stormUntil[viewer]>=game.state.turns[viewer]&&(viewer==='w'?rank>=5:rank<=4);
        const cooldown=unit?Math.max(0,unit.cooldownUntil-game.state.turns[unit.owner]):0;
        const note=game.squareNote(square).split(' · ').filter(n=>!n.startsWith('영광 ')&&!n.startsWith('재사용 ')&&!['행동불가','무장해제','매혹','추가 목숨','사막','피라미드'].includes(n)).join(' · ');
        return <div key={square} data-square={square} className={`square ${(file.charCodeAt(0)-97+rank)%2?'dark':'light'}`}>
          <BoardTerrain game={game} square={square} row={row} column={column} flipped={flipped}/>
          {column===0&&<span className="rank-label">{rank}</span>}{row===7&&<span className="file-label">{file}</span>}
          {!fog&&p&&<Piece type={p.type} color={p.color} civilization={civilization} skill={game.loadouts[p.color].piece} lives={unit?.lives} revived={unit?.revived}/>}
          {!fog&&<PieceStatusEffects game={game} square={square}/>}
          {!fog&&cooldown>0&&<span className="board-cooldown"><CooldownBadge turns={cooldown}/></span>}
          {!fog&&note&&<span className="ability-marker">{note}</span>}
        </div>;
      }))}
      <Sandstorm game={game} viewer={viewer} flipped={flipped}/><SkillEffects game={game} flipped={flipped}/>
    </div></div>
    {game.state.duel&&<AbilityPanel game={game} players={{w:civilization,b:civilization}} enabled={false} onAction={()=>{}}/>}
    {game.state.clocks&&<div className="demo-engine-info">백 {Math.floor(game.state.clocks.w/60000)}분 · 흑 {Math.floor(game.state.clocks.b/60000)}분</div>}
    <div className="demo-graves" aria-label="잡힌 기물"><small>잡힌 기물</small>{(['w','b'] as const).flatMap(c=>game.graves(c).map(p=><span key={p.id} className={p.sealed?'sealed':''} title={p.sealed?'부활 봉인':'사망한 기물'}><Piece type={p.type} color={p.owner} civilization={civilization} small skill={game.loadouts[p.owner].piece}/>{p.sealed&&<b>봉인</b>}</span>))}</div>
  </div>;
}
