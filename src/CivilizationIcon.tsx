import type { Color } from 'chess.js';
import { civilizationAppearance, type Civilization } from './civilizations';

// Emblems can differ without changing the civilization's chess-piece assets.
const emblemOverrides: Partial<Record<Civilization, string>> = { goguryeo: 'goguryeo', baekje: 'baekje', silla: 'silla' };
export const civilizationEmblem = (civilization: Civilization) => emblemOverrides[civilization] ?? civilizationAppearance[civilization];
export const hasCivilizationIcon = (civilization: Civilization) => ['greece','egypt','rome','china','korea','japan','joseon','aztec','qing','ming','goryeo','yuan','song','han','goguryeo','baekje','silla'].includes(civilizationEmblem(civilization));

export default function CivilizationIcon({ civilization, color = 'w', size = 48 }: { civilization: Civilization; color?: Color; size?: number }) {
  if (!hasCivilizationIcon(civilization)) return null;
  return <img className="civilization-icon" src={`/civilizations/${civilizationEmblem(civilization)}-${color}.svg`} width={size} height={size} alt="" aria-hidden="true" draggable={false} />;
}
