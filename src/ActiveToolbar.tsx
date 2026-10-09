import { translateUi } from './i18n';
import { Waves, Zap, Scale, Skull, Sun, Wind, Fence, Flame, Swords, X } from 'lucide-react';
import type { Color } from 'chess.js';
import { AbilityGame, abilityNames } from './AbilityGame';
import type { ActiveTargeting } from './useActiveTargeting';
import { colorNames, pieceNames, type Players } from './game';
import Piece from './Piece';
import './activeTargeting.css';
const icons = { zeus: Zap, poseidon: Waves, hades: Skull, osiris: Sun, set: Wind, anubis: Scale, alesia: Fence, vesta: Flame, pilum: Swords };
export function ActiveButton({game,target,owner,onToggle}:{game:AbilityGame;target:ActiveTargeting;owner:Color;onToggle:()=>void}) {
  const Icon=icons[target.skill as keyof typeof icons] ?? Zap;
  const used=game.state.activeUsed[owner];
  return <aside className="active-rail" aria-label={translateUi("일회용 능력")}><button className={`active-skill-button ${target.armed?'armed':''}`} aria-label={translateUi(`${abilityNames[target.skill]??'액티브'} ${used?'사용 완료':'사용'}`)} aria-pressed={target.armed} disabled={!target.actions.length&&!target.armed} onClick={onToggle} title={translateUi(used?'이미 사용한 능력입니다':target.actions.length?'선택 후 보드에서 대상을 지정하세요':'현재 사용할 수 있는 대상이 없습니다')}><Icon size={22}/><span>{translateUi(abilityNames[target.skill]??'액티브')}</span><small>{translateUi(used?'완료':target.skill==='pending'?'없음':target.armed?'취소':'1회')}</small></button></aside>;
}
export function ActiveGuide({game,target,players}:{game:AbilityGame;target:ActiveTargeting;players:Players}) {
  if(!target.armed)return null;
  const graveSkill=['hades','osiris'].includes(target.skill);
  const ids=new Set(target.actions.flatMap(a=>a.id?.split(',')??[]));
  return <section className="active-guide" aria-label={translateUi("능력 대상 지정")}><div role="status"><strong>{translateUi(abilityNames[target.skill])}</strong> · {translateUi(target.skill==='poseidon'?'시작 칸에서 원하는 방향으로 드래그하세요. 가로는 행, 세로는 열입니다.':target.skill==='anubis'?`심판할 적 기물 두 개를 고르세요 (${target.graves.length}/2). 각각 지정 이후 2킬이면 사망합니다. 킹은 제외됩니다.`:target.skill==='hades'?`속박할 적 사망 기물 3개를 고르세요 (${target.graves.length}/3).`:target.skill==='osiris'?target.graves.length?'강조된 빈 칸을 눌러 부활시키세요.':'부활시킬 아군 기물을 고르세요.':target.skill==='alesia'?'2×2 영역의 왼쪽 아래 칸을 누르세요.':'강조된 대상 칸을 누르면 사용됩니다.')}</div><button className="active-cancel" onClick={target.cancel} aria-label={translateUi("능력 선택 취소")}><X size={16}/>{translateUi("취소")}</button>{translateUi(graveSkill&&<div className="grave-choices">{translateUi([...ids].map(id=>{const p=game.state.pieces[id];return <button key={id} aria-label={translateUi(`${colorNames[p.owner]} ${pieceNames[p.type]}, ${id.slice(2)} 출신`)} title={translateUi(`${colorNames[p.owner]} ${pieceNames[p.type]} · ${id.slice(2)} 출신`)} aria-pressed={target.graves.includes(id)} onClick={()=>target.pickGrave(id)}><Piece type={p.type} color={p.owner} civilization={players[p.owner]} skill={game.loadouts[p.owner].piece} lives={p.lives} revived={p.revived}/></button>;}))}</div>)}{translateUi(target.direction!==undefined&&<span className="wave-direction">{translateUi(['→','←','↑','↓'][target.direction])} {translateUi(['오른쪽','왼쪽','위쪽','아래'][target.direction])}{translateUi("으로 밀기")}</span>)}</section>;
}
