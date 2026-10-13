import { useSyncExternalStore } from 'react';
export const DEVELOPER_MODE_KEY = 'civilization-chess.developer-mode';
function readMode(): boolean { try { return localStorage.getItem(DEVELOPER_MODE_KEY) === 'true'; } catch { return false; } }
let enabled = readMode();
const listeners = new Set<() => void>();
export function setDeveloperMode(next: boolean) {
  enabled = next;
  try { localStorage.setItem(DEVELOPER_MODE_KEY, String(next)); } catch { /* Keep the setting for this session. */ }
  listeners.forEach(listener => listener());
}
export const getDeveloperMode = () => enabled;
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useDeveloperMode() { return useSyncExternalStore(subscribe, getDeveloperMode, () => false); }
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key === DEVELOPER_MODE_KEY || event.key === null) {
    enabled = readMode();
    listeners.forEach(listener => listener());
  }
});
