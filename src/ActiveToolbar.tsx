import { Waves, Zap, Skull, Sun, Wind, Fence, Flame, Swords, X } from 'lucide-react';
import type { Color } from 'chess.js';
import { AbilityGame, abilityNames } from './AbilityGame';
import type { ActiveTargeting } from './useActiveTargeting';
import { colorNames, pieceNames } from './game';
import './activeTargeting.css';
const icons = { zeus: Zap, poseidon: Waves, hades: Skull, osiris: Sun, set: Wind, anubis: Skull, alesia: Fence, vesta: Flame, pilum: Swords };
export function ActiveButton({game,target,owner,onToggle}:{game:AbilityGame;target:ActiveTargeting;owner:Color;onToggle:()=>void}) {
  const Icon=icons[target.skill as keyof typeof icons] ?? Zap;
  const used=game.state.activeUsed[owner];
  return <aside className="active-rail" aria-label="일회용 능력"><button className={`active-skill-button ${target.armed?'armed':''}`} aria-label={`${abilityNames[target.skill]??'액티브'} ${used?'사용 완료':'사용'}`} aria-pressed={target.armed} disabled={!target.actions.length&&!target.armed} onClick={onToggle} title={used?'이미 사용한 능력입니다':target.actions.length?'선택 후 보드에서 대상을 지정하세요':'현재 사용할 수 있는 대상이 없습니다'}><Icon size={22}/><span>{abilityNames[target.skill]??'액티브'}</span><small>{used?'완료':target.skill==='pending'?'없음':target.armed?'취소':'1회'}</small></button></aside>;
}
export function ActiveGuide({game,target}:{game:AbilityGame;target:ActiveTargeting}) {
  if(!target.armed)return null;
  const graveSkill=['hades','osiris'].includes(target.skill);
  const ids=new Set(target.actions.flatMap(a=>a.id?.split(',')??[]));
  return <section className="active-guide" aria-label="능력 대상 지정"><div role="status"><strong>{abilityNames[target.skill]}</strong> · {target.skill==='poseidon'?'시작 칸에서 원하는 방향으로 드래그하세요. 가로는 행, 세로는 열입니다.':target.skill==='hades'?`속박할 적 사망 기물 3개를 고르세요 (${target.graves.length}/3).`:target.skill==='osiris'?target.graves.length?'강조된 빈 칸을 눌러 부활시키세요.':'부활시킬 아군 기물을 고르세요.':target.skill==='alesia'?'2×2 영역의 왼쪽 아래 칸을 누르세요.':'강조된 대상 칸을 누르면 사용됩니다.'}</div><button className="active-cancel" onClick={target.cancel} aria-label="능력 선택 취소"><X size={16}/>취소</button>{graveSkill&&<div className="grave-choices">{[...ids].map(id=>{const p=game.state.pieces[id];return <button key={id} aria-pressed={target.graves.includes(id)} onClick={()=>target.pickGrave(id)}>{colorNames[p.owner]} {pieceNames[p.type]}<small>{id.slice(2)} 출신</small></button>;})}</div>}{target.direction!==undefined&&<span className="wave-direction">{['→','←','↑','↓'][target.direction]} {['오른쪽','왼쪽','위','아래'][target.direction]}으로 밀기</span>}</section>;
}
