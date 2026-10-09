import { translateUi } from './i18n';
import CooldownBadge from './CooldownBadge';
import { Swords } from 'lucide-react';
import type { Square } from 'chess.js';
import { AbilityGame, abilityNames } from './AbilityGame';
import { pieceNames, type Players } from './game';
import { skills } from './draft';
import { pieceSkillInfo } from './pieceSkills';

export function PieceSkillGuide({ game, square, players, mode, cargo, enabled, onMode, onCargo }: {
  game: AbilityGame; square: Square; players: Players; mode: string; cargo: string; enabled: boolean;
  onMode: (mode: string) => void; onCargo: (id: string) => void;
}) {
  const info = pieceSkillInfo(game, square), p = game.unit(square);
  if (!info || !p) return null;
  const card = skills[players[p.owner]].piece.find(s => s.id === info.skill);
  return <section className="piece-skill-guide" aria-label={translateUi("선택한 기물 스킬")}>
    <div className="piece-skill-heading"><strong>{translateUi(square)} {translateUi(pieceNames[p.type])} · {translateUi(card?.name ?? abilityNames[info.skill])}</strong><span role="status">{translateUi(info.cooldown > 0 ? <CooldownBadge turns={info.cooldown}/> : info.status)}</span></div>
    <p>{translateUi(info.timing)}</p>
    {translateUi(info.skill === 'trojan' && <p>{translateUi("탑승 ")}{translateUi(info.cargo.length)}{translateUi("/4 · 상하좌우 한 칸")}</p>)}

    {translateUi(mode === 'deploy' && <div className="grave-choices">{translateUi(info.cargo.map(id => <button key={id} aria-pressed={cargo === id} onClick={() => onCargo(id)}>{translateUi("폰 · ")}{translateUi(id.slice(2))}{translateUi(" 출신")}</button>))}</div>)}
    <p className="piece-skill-hint">{translateUi(info.automatic ? '조건을 만족하면 자동으로 적용됩니다.' : mode ? mode === 'minotaur' ? '주변 강조 칸이 함께 영향을 받습니다. 선택한 나이트를 다시 누르면 발동합니다. 아군도 기절합니다.' : mode === 'deploy' && !cargo ? '하차시킬 폰을 먼저 고르세요.' : '금색으로 표시된 대상을 누르면 사용합니다. Esc로 취소합니다.' : '점은 일반 이동, 보라색 테두리는 스킬 대상입니다. 왼쪽 기물 스킬 버튼을 눌러 사용하세요.')}</p>
    <details><summary>{translateUi("사용 조건과 효과")}</summary><p>{translateUi(card?.detail)}</p></details>
  </section>;
}

export function PieceSkillButtons({ game, square, mode, enabled, onMode }: {
  game: AbilityGame; square: Square | null; mode: string; enabled: boolean; onMode: (mode: string) => void;
}) {
  const info = square ? pieceSkillInfo(game, square) : null;
  const modes = info?.skill === 'trojan' ? ['trojan', 'deploy'] : info ? [info.skill] : [];
  return <div className="piece-skill-rail" aria-label={translateUi("기물 스킬 버튼")}>
    <span className="skill-rail-label">{translateUi("기물 스킬")}</span>
    {translateUi(!info && <button className="active-skill-button piece-rail-button" disabled title={translateUi("보드에서 스킬을 가진 아군 기물을 선택하세요")}><Swords size={22}/><span>{translateUi("기물 선택")}</span><small>{translateUi("보드에서 선택")}</small></button>)}
    {translateUi(info && modes.map(id => <button key={id} className={`active-skill-button piece-rail-button ${mode === id ? 'armed' : ''}`}
      aria-pressed={mode === id} disabled={!enabled || info.automatic || (!info.actions.some(a => a.skill === id) && mode !== id)}
      title={translateUi(info.status)} onClick={() => onMode(mode === id ? '' : id)}>
      <>{translateUi(info.cooldown > 0 ? <CooldownBadge turns={info.cooldown}/> : <Swords size={22}/>)}</><span>{translateUi(abilityNames[id] ?? id)}</span><small>{translateUi(info.cooldown > 0 ? '대기 중' : info.automatic ? '자동 적용' : mode === id ? '선택 중 · 취소' : info.actions.some(a => a.skill === id) ? '사용하기' : '사용 불가')}</small>
    </button>))}
  </div>;
}
