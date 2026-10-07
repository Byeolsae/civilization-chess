import type { Color, PieceSymbol } from 'chess.js';
import { civilizationAppearance, type Civilization } from './civilizations';
import { specialPieceVariant } from './specialPieces';

export default function Piece({ type, color, civilization, small = false, skill, lives, revived }: { type: PieceSymbol; color: Color; civilization: Civilization; small?: boolean; skill?: string; lives?: number; revived?: boolean }) {
  const palette = civilizationAppearance[civilization];
  const special = specialPieceVariant(type, skill, lives, revived);
  return <img aria-hidden="true" alt="" draggable={false} src={special ? `/pieces/special/${color}-${special}.svg` : `/pieces/${palette}/${color}${type.toUpperCase()}.svg`} className={`piece ${small ? 'small-piece' : ''}`} />;
}
