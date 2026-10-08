import type { Color } from 'chess.js';
import type { Civilization } from './civilizations';
import type { Players } from './game';
import type { MatchSettings } from './matchSettings';

export type CivilizationMedia = { background: string | null; bgm: string | null };
export const defaultMedia: CivilizationMedia = { background: null, bgm: null };

// Use exact civilization IDs; dynasties can have their own assets.
// Example after adding files under public/media/greece/:
// greece: { background: '/media/greece/background.webp', bgm: '/media/greece/bgm.mp3' },
export const civilizationMedia: Partial<Record<Civilization, CivilizationMedia>> = {
  greece: { background: '/media/greece/background-v1.webp', bgm: null },
  egypt: { background: '/media/egypt/background-v1.webp', bgm: null },
};
export function mediaForCivilization(id: Civilization): CivilizationMedia {
  return { ...defaultMedia, ...civilizationMedia[id] };
}

export function opponentCivilization(players: Players, settings: MatchSettings, turn: Color): Civilization {
  const viewer = settings.mode !== 'local' ? settings.humanColor : turn;
  return players[viewer === 'w' ? 'b' : 'w'];
}

export const MEDIA_SETTINGS_KEY = 'civilization-chess.media.v1';
export type MediaPreferences = { music: boolean; volume: number; background: boolean };
export const defaultMediaPreferences: MediaPreferences = { music: false, volume: 0.35, background: true };
export function parseMediaPreferences(raw: string | null): MediaPreferences {
  try {
    const value = JSON.parse(raw ?? 'null');
    return {
      music: typeof value?.music === 'boolean' ? value.music : false,
      volume: typeof value?.volume === 'number' && Number.isFinite(value.volume) ? Math.max(0, Math.min(1, value.volume)) : 0.35,
      background: typeof value?.background === 'boolean' ? value.background : true,
    };
  } catch { return { ...defaultMediaPreferences }; }
}
