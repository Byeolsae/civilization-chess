import type { Color, PieceSymbol } from 'chess.js';
import { civilizationAppearance, type Civilization } from './civilizations';

export default function Piece({ type, color, civilization, small = false }: { type: PieceSymbol; color: Color; civilization: Civilization; small?: boolean }) {
  const palette = civilizationAppearance[civilization];
  return <img aria-hidden="true" alt="" draggable={false} src={`/pieces/${palette}/${color}${type.toUpperCase()}.svg`} className={`piece ${small ? 'small-piece' : ''}`} />;
}
