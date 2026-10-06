import type { Color, PieceSymbol } from 'chess.js';
import { civilizationAppearance, type Civilization } from './civilizations';
import { specialPieceSkill } from './specialPieces';

export default function Piece({ type, color, civilization, small = false, skill }: { type: PieceSymbol; color: Color; civilization: Civilization; small?: boolean; skill?: string }) {
  const palette = civilizationAppearance[civilization];
  const special = specialPieceSkill(type, skill);
  return <img aria-hidden="true" alt="" draggable={false} src={special ? `/pieces/special/${color}-${special}.svg` : `/pieces/${palette}/${color}${type.toUpperCase()}.svg`} className={`piece ${small ? 'small-piece' : ''}`} />;
}
