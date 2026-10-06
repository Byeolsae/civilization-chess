import type { PieceSymbol } from 'chess.js';
export const specialPieceTypes: Record<string, PieceSymbol> = {
  trojan: 'n', sparta: 'p', minotaur: 'n', mummy: 'p', cleopatra: 'q', sphinx: 'n', gladiator: 'b', ballista: 'r', praetorian: 'n',
};
export function specialPieceSkill(type: PieceSymbol, skill?: string) {
  return skill && specialPieceTypes[skill] === type ? skill : null;
}
