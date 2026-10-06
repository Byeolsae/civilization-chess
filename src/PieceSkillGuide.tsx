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
  const modes = info.skill === 'trojan' ? ['trojan', 'deploy'] : [info.skill];
  return <section className="piece-skill-guide" aria-label="선택한 기물 스킬">
    <div className="piece-skill-heading"><strong>{square} {pieceNames[p.type]} · {card?.name ?? abilityNames[info.skill]}</strong><span role="status">{info.status}</span></div>
    <p>{info.timing}</p>
    {info.skill === 'trojan' && <p>탑승 {info.cargo.length}/4 · 상하좌우 한 칸</p>}
    {!info.automatic && <div className="piece-skill-controls"><button aria-pressed={!mode} onClick={() => onMode('')}>일반 이동</button>{modes.map(id => <button key={id} aria-pressed={mode === id} disabled={!enabled || !info.actions.some(a => a.skill === id)} onClick={() => onMode(id)}>{abilityNames[id] ?? id} 사용</button>)}</div>}
    {mode === 'deploy' && <div className="grave-choices">{info.cargo.map(id => <button key={id} aria-pressed={cargo === id} onClick={() => onCargo(id)}>폰 · {id.slice(2)} 출신</button>)}</div>}
    <p className="piece-skill-hint">{info.automatic ? '조건을 만족하면 자동으로 적용됩니다.' : mode ? mode === 'minotaur' ? '주변 강조 칸이 함께 영향을 받습니다. 선택한 나이트를 다시 누르면 발동합니다. 아군도 기절합니다.' : mode === 'deploy' && !cargo ? '하차시킬 폰을 먼저 고르세요.' : '금색으로 표시된 대상을 누르면 사용합니다. Esc로 취소합니다.' : '점은 일반 이동, 보라색 테두리는 스킬 대상입니다. 버튼을 눌러 스킬 모드로 전환하세요.'}</p>
    <details><summary>사용 조건과 효과</summary><p>{card?.detail}</p></details>
  </section>;
}
