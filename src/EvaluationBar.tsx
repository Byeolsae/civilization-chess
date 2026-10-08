import { useMemo } from 'react';
import type { Chess, Color } from 'chess.js';
import { boardEvaluation } from './boardEvaluation';
import './evaluationBar.css';

export default function EvaluationBar({ game, revision, resigned, flipped, viewer }: {
  game: Chess; revision: number; resigned: Color | null; flipped: boolean; viewer: Color;
}) {
  const evaluation = useMemo(() => boardEvaluation(game, resigned, viewer), [game, revision, resigned, viewer]);
  const description = evaluation?.description ?? '배치·결투·시야 제한 중에는 평가를 잠시 숨깁니다.';
  return <div className={`evaluation-bar ${flipped ? 'flipped' : ''} ${!evaluation ? 'unavailable' : ''}`}
    role="img" aria-label={`우세 평가: ${description}`} title={description}>
    <div className="evaluation-white" style={{ height: `${evaluation?.whiteShare ?? 50}%` }} />
    <span className="evaluation-midline" />
    <span className="evaluation-label">{evaluation?.label ?? '—'}</span>
  </div>;
}
