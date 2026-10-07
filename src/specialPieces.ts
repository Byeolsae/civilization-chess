import type { PieceSymbol } from 'chess.js';
export const specialPieceTypes: Record<string, PieceSymbol> = {
  trojan: 'n', sparta: 'p', minotaur: 'n', mummy: 'p', cleopatra: 'q', sphinx: 'n', gladiator: 'b', ballista: 'r', praetorian: 'n',
};
export function specialPieceSkill(type: PieceSymbol, skill?: string) {
  return skill && specialPieceTypes[skill] === type ? skill : null;
}
export function specialPieceVariant(type: PieceSymbol, skill?: string, lives?: number, revived = false) {
  const special = specialPieceSkill(type, skill);
  if (special === 'mummy' && revived) return 'mummy-unwrapped';
  return special === 'sparta' && lives !== undefined && lives <= 1 ? 'sparta-unshielded' : special;
}
