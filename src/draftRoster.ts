import { civilizations, type Civilization } from './civilizations.js';

// Temporary explicit roster; progress/art updates must not silently add factions.
// Keep the complete archive and saved-match registry intact.
export const draftCivilizationIds = [
  'greece', 'rome', 'egypt', 'tang', 'song', 'han', 'ming', 'qing', 'qin', 'yuan',
  'wei', 'shu', 'wu', 'korea', 'goryeo', 'goguryeo', 'baekje', 'silla', 'gojoseon',
  'heian', 'edo', 'meiji', 'sengoku', 'kamakura', 'aztec',
] as const satisfies readonly Civilization[];
export type DraftCivilization = typeof draftCivilizationIds[number];
const roster = new Set<string>(draftCivilizationIds);
export function isDraftCivilization(id: string): id is DraftCivilization { return roster.has(id); }
export const draftCivilizations = civilizations.filter(c => isDraftCivilization(c.id));
