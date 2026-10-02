import type { Color } from 'chess.js';

export const difficultyNames = { easy: '쉬움', normal: '보통', hard: '어려움' } as const;
export type Difficulty = keyof typeof difficultyNames;
export type MatchSettings = { mode: 'local' | 'ai'; humanColor: Color; difficulty: Difficulty };
export const localSettings: MatchSettings = { mode: 'local', humanColor: 'w', difficulty: 'normal' };
export const defaultSettings: MatchSettings = { mode: 'ai', humanColor: 'w', difficulty: 'normal' };
export const SETUP_KEY = 'civilization-chess.setup.v1';

export function isMatchSettings(value: unknown): value is MatchSettings {
  if (!value || typeof value !== 'object') return false;
  const data = value as MatchSettings;
  return ['local', 'ai'].includes(data.mode) && ['w', 'b'].includes(data.humanColor)
    && Object.hasOwn(difficultyNames, data.difficulty);
}
