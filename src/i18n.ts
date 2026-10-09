import { useSyncExternalStore } from 'react';
import english from './locales/en.json';

export type Locale = 'ko' | 'en';
export const LOCALE_KEY = 'civilization-chess-locale';
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const catalog: Record<string, string> = english;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Match complete messages, including engine-generated labels, without changing game data.
const templates = Object.entries(catalog).filter(([key]) => /\{\d+\}/.test(key) && /[가-힣]/.test(key) && !/\}\{/.test(key)).sort(([a], [b]) => b.indexOf('{') - a.indexOf('{') || b.replace(/\{\d+\}/g, '').length - a.replace(/\{\d+\}/g, '').length).map(([key, value]) => {
  const ids: string[] = [];
  const parts = key.split(/(\{\d+\})/).map(part => {
    if (/^\{\d+\}$/.test(part)) { ids.push(part.slice(1, -1)); return '(.+)'; }
    return escape(part);
  });
  return { pattern: new RegExp('^' + parts.join('') + '$'), ids, value };
});
const phrases = Object.keys(catalog).filter(key => /[가-힣]/.test(key) && !key.includes('{')).sort((a, b) => b.length - a.length);
const fragments = new RegExp(phrases.map(escape).join('|'), 'g');

export function translate(text: string, language: Locale, depth = 0): string {
  if (language === 'ko' || !/[가-힣]/.test(text)) return text;
  const key = normalize(text);
  let result: string | undefined = catalog[key];
  if (result === undefined && depth < 4) {
    for (const template of templates) {
      const match = key.match(template.pattern);
      if (!match) continue;
      result = template.value.replace(/\{(\d+)\}/g, (_, id: string) => translate(match[template.ids.indexOf(id) + 1], language, depth + 1));
      break;
    }
  }
  // Composed labels (piece names, move records, tooltips) retain punctuation and numbers.
  if (result === undefined) result = key.replace(fragments, part => catalog[part]);
  return (text.match(/^\s*/)?.[0] ?? '') + result + (text.match(/\s*$/)?.[0] ?? '');
}

function initialLocale(): Locale {
  try { const saved = localStorage.getItem(LOCALE_KEY); if (saved === 'ko' || saved === 'en') return saved; } catch { /* Storage is optional. */ }
  return typeof navigator !== 'undefined' && !navigator.language.toLowerCase().startsWith('ko') ? 'en' : 'ko';
}
let locale = initialLocale();
const listeners = new Set<() => void>();
export const getLocale = () => locale;
export function setLocale(next: Locale) {
  if (next !== 'ko' && next !== 'en') return;
  locale = next;
  try { localStorage.setItem(LOCALE_KEY, next); } catch { /* Switching still works. */ }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
    document.title = next === 'ko' ? '문명체스 · Civilization Chess' : 'Civilization Chess';
  }
  listeners.forEach(listener => listener());
}
function subscribe(callback: () => void) { listeners.add(callback); return () => { listeners.delete(callback); }; }
export function useLocale() {
  return useSyncExternalStore(subscribe, getLocale, () => 'ko' as Locale);
}
/** Translate only render values. IDs, input values, game state and network data stay unchanged. */
export function translateUi<T>(value: T): T {
  if (typeof value === 'string') return translate(value, locale) as T;
  if (Array.isArray(value)) return value.map(item => translateUi(item)) as T;
  return value;
}
if (typeof window !== 'undefined') {
  setLocale(locale);
  window.addEventListener('storage', event => {
    if (event.key === LOCALE_KEY && (event.newValue === 'en' || event.newValue === 'ko')) setLocale(event.newValue);
  });
}
