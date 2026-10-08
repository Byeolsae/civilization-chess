import { useMemo, type CSSProperties } from 'react';
import type { Chess, Color } from 'chess.js';
import { boardEvaluation } from './boardEvaluation';
import './evaluationBar.css';
import { civilizationAppearance } from './civilizations';
import type { Players } from './game';
import palettes from '../scripts/piece-palettes.json';
const piecePalettes: Record<string, Record<Color, { fill: string; line: string }>> = palettes;

export default function EvaluationBar({ game, revision, resigned, flipped, viewer, players }: {
  game: Chess; revision: number; resigned: Color | null; flipped: boolean; viewer: Color; players: Players;
}) {
  const evaluation = useMemo(() => boardEvaluation(game, resigned, viewer), [game, revision, resigned, viewer]);
  const description = evaluation?.description ?? '배치·결투·시야 제한 중에는 평가를 잠시 숨깁니다.';
  const white = (piecePalettes[civilizationAppearance[players.w]] ?? palettes.classic).w;
  const black = (piecePalettes[civilizationAppearance[players.b]] ?? palettes.classic).b;
  return <div style={{ '--evaluation-white': white.fill, '--evaluation-black': black.fill } as CSSProperties} className={`evaluation-bar ${flipped ? 'flipped' : ''} ${!evaluation ? 'unavailable' : ''}`}
    role="img" aria-label={`우세 평가: ${description}`} title={description}>
    <div className="evaluation-white" style={{ height: `${evaluation?.whiteShare ?? 50}%` }} />
    <span className="evaluation-midline" />
    <span className="evaluation-label">{evaluation?.label ?? '—'}</span>
  </div>;
}
