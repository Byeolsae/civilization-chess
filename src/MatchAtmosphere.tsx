import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Music2, Volume2 } from 'lucide-react';
import { civilizations, type Civilization } from './civilizations';
import { MEDIA_SETTINGS_KEY, mediaForCivilization, parseMediaPreferences } from './civilizationMedia';
import { useBackgroundMusic } from './useBackgroundMusic';
import './atmosphere.css';

export default function MatchAtmosphere({ civilization }: { civilization: Civilization }) {
  const media = mediaForCivilization(civilization);
  const name = civilizations.find(civ => civ.id === civilization)!.name;
  const [preferences, setPreferences] = useState(() => {
    try { return parseMediaPreferences(localStorage.getItem(MEDIA_SETTINGS_KEY)); }
    catch { return parseMediaPreferences(null); }
  });
  const [failedBackground, setFailedBackground] = useState<string | null>(null);
  const [loadedBackground, setLoadedBackground] = useState<string | null>(null);
  const [backgroundRetry, setBackgroundRetry] = useState(0);
  const music = useBackgroundMusic(media.bgm, preferences.music, preferences.volume);
  useEffect(() => {
    try { localStorage.setItem(MEDIA_SETTINGS_KEY, JSON.stringify(preferences)); }
    catch { /* Audio controls remain usable when storage is unavailable. */ }
  }, [preferences]);
  const background = preferences.background && media.background !== failedBackground ? media.background : null;
  return <section className="match-atmosphere" aria-label="상대 문명 배경과 음악" data-civilization={civilization}>
    {background && createPortal(<div className="civilization-backdrop" aria-hidden="true">
      <img key={`${background}-${backgroundRetry}`} src={background} alt="" draggable={false} onLoad={() => setLoadedBackground(background)} onError={() => setFailedBackground(background)} />
    </div>, document.body)}
    <div className="atmosphere-title"><Music2 size={17} /><span>상대 문명 <strong>{name}</strong></span></div>
    <div className="atmosphere-controls">
      <button type="button" aria-pressed={preferences.music} disabled={!media.bgm}
        onClick={() => setPreferences(value => ({ ...value, music: !value.music }))}>
        {media.bgm ? preferences.music ? 'BGM 끄기' : 'BGM 켜기' : 'BGM 준비 중'}
      </button>
      <label><Volume2 size={15} /><span className="media-volume-label">음량</span>
        <input aria-label="BGM 음량" type="range" min="0" max="100" value={Math.round(preferences.volume * 100)}
          onChange={event => setPreferences(value => ({ ...value, volume: Number(event.target.value) / 100 }))} />
      </label>
      <button type="button" aria-pressed={!!media.background && preferences.background} disabled={!media.background}
        onClick={() => setPreferences(value => ({ ...value, background: !value.background }))}>
        {!media.background ? '배경 준비 중' : preferences.background ? '배경 켜짐' : '배경 꺼짐'}
      </button>
    </div>
    {!media.background && <p>상대 문명({name})의 배경은 준비 중입니다. 현재 그리스·이집트·로마·아즈텍·조선·청나라 배경을 사용할 수 있어요.</p>}
    {background && loadedBackground !== background && <p role="status">{name} 배경 불러오는 중…</p>}
    {media.background && preferences.background && failedBackground === media.background && <p role="status">배경을 불러오지 못했어요. <button onClick={() => { setFailedBackground(null); setBackgroundRetry(value => value + 1); }}>다시 불러오기</button></p>}
    {media.bgm && preferences.music && (music.status === 'loading' || music.status === 'playing') && <p role="status">{music.status === 'playing' ? '음악 재생 중' : '음악 불러오는 중…'}</p>}
    {media.bgm && preferences.music && music.status === 'blocked' && <button className="music-retry" onClick={music.retry}>눌러서 음악 재생</button>}
    {media.bgm && preferences.music && music.status === 'error' && <p role="status">음악을 불러오지 못했어요. <button onClick={() => setPreferences(value => ({ ...value, music: false }))}>음악 끄기</button></p>}
  </section>;
}
