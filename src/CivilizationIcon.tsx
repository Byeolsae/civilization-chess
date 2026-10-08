import type { Color } from 'chess.js';
import { civilizationAppearance, type Civilization } from './civilizations';

export const hasCivilizationIcon = (civilization: Civilization) => ['greece','egypt','rome','china','korea','japan','joseon','aztec','qing'].includes(civilizationAppearance[civilization]);

export default function CivilizationIcon({ civilization, color = 'w', size = 48 }: { civilization: Civilization; color?: Color; size?: number }) {
  if (!hasCivilizationIcon(civilization)) return null;
  return <img className="civilization-icon" src={`/civilizations/${civilizationAppearance[civilization]}-${color}.svg`} width={size} height={size} alt="" aria-hidden="true" draggable={false} />;
}
