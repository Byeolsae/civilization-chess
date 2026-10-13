import { translateUi } from './i18n';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Image, Music2, Settings, Volume2, X } from 'lucide-react';
import { civilizations, type Civilization } from './civilizations';
import { MEDIA_SETTINGS_KEY, mediaForCivilization, parseMediaPreferences } from './civilizationMedia';
import { useBackgroundMusic } from './useBackgroundMusic';
import './atmosphere.css';

function BackgroundViewer({ src, name, onClose }: { src: string; name: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = dialog.current!;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = overflow; };
  }, []);
  return createPortal(<dialog ref={dialog} className="background-viewer" aria-label={translateUi(`${name} 배경`)} onCancel={onClose}>
    <img src={src} alt={translateUi(`${name} 배경`)} draggable={false} onError={() => setFailed(true)} />
    {failed && <p role="alert">{translateUi('배경을 불러오지 못했어요.')}</p>}
    <button type="button" autoFocus className="background-viewer-close" onClick={onClose}><X size={19}/>{translateUi('대전으로 돌아가기')}</button>
  </dialog>, document.body);
}

export default function MatchAtmosphere({ civilization }: { civilization: Civilization }) {
  const settingsDialog=useRef<HTMLDialogElement>(null);
  const media = mediaForCivilization(civilization);
  const name = civilizations.find(civ => civ.id === civilization)!.name;
  const [preferences, setPreferences] = useState(() => {
    try { return parseMediaPreferences(localStorage.getItem(MEDIA_SETTINGS_KEY)); }
    catch { return parseMediaPreferences(null); }
  });
  const [failedBackground, setFailedBackground] = useState<string | null>(null);
  const [loadedBackground, setLoadedBackground] = useState<string | null>(null);
  const [backgroundRetry, setBackgroundRetry] = useState(0);
  const [viewing, setViewing] = useState<{ src: string; name: string } | null>(null);
  const music = useBackgroundMusic(media.bgm, preferences.music, preferences.volume);
  useEffect(() => {
    try { localStorage.setItem(MEDIA_SETTINGS_KEY, JSON.stringify(preferences)); }
    catch { /* Audio controls remain usable when storage is unavailable. */ }
  }, [preferences]);
  const background = preferences.background && media.background !== failedBackground ? media.background : null;
  return <>
    <button type="button" className="match-settings-button" aria-label={translateUi('대전 설정')} title={translateUi('대전 설정')} aria-haspopup="dialog" onClick={()=>settingsDialog.current?.showModal()}><Settings size={21}/></button>
    {viewing && <BackgroundViewer {...viewing} onClose={() => setViewing(null)} />}
    {translateUi(background && createPortal(<div className="civilization-backdrop" aria-hidden="true">
      <img key={`${background}-${backgroundRetry}`} src={background} alt="" draggable={false} onLoad={() => setLoadedBackground(background)} onError={() => setFailedBackground(background)} />
    </div>, document.body))}
    <dialog ref={settingsDialog} className="match-settings-dialog" aria-labelledby="match-settings-title">
      <div className="match-settings-heading"><h2 id="match-settings-title">{translateUi('대전 설정')}</h2><button type="button" aria-label={translateUi('닫기')} onClick={()=>settingsDialog.current?.close()}><X size={20}/></button></div>
      <section className="match-atmosphere" aria-label={translateUi("상대 문명 배경과 음악")} data-civilization={civilization}>
    <div className="atmosphere-quick">
      <button type="button" className="music-toggle" aria-label={translateUi(`BGM ${preferences.music ? '켜짐' : '꺼짐'}`)} aria-pressed={preferences.music} disabled={!media.bgm}
        onClick={() => setPreferences(value => ({ ...value, music: !value.music }))}>
        <span className="music-toggle-light" aria-hidden="true"/><strong>BGM {translateUi(media.bgm ? preferences.music ? '켜짐' : '꺼짐' : '준비 중')}</strong><span className="music-toggle-action">{translateUi(media.bgm ? preferences.music ? '눌러서 끄기' : '눌러서 켜기' : '')}</span>
      </button>
    </div>
    <div className="atmosphere-settings-content">
    <div className="atmosphere-title"><Music2 size={17} /><span>{translateUi("상대 문명 ")}<strong>{translateUi(name)}</strong></span></div>
    {translateUi(media.bgm && media.credit && <div className="music-credit" aria-label={translateUi("BGM 곡 정보")}>
      <strong>{translateUi(media.credit.title)}</strong>
      <span>{translateUi(media.credit.sourceOnly ? '음원 출처' : '아티스트')} · {translateUi(media.credit.artist)}</span>
    </div>)}
    <div className="atmosphere-controls">
      <label><Volume2 size={15} /><span className="media-volume-label">{translateUi("음량")}</span>
        <input aria-label={translateUi("BGM 음량")} type="range" min="0" max="100" value={Math.round(preferences.volume * 100)}
          onChange={event => setPreferences(value => ({ ...value, volume: Number(event.target.value) / 100 }))} />
      </label>
      <button type="button" aria-pressed={!!media.background && preferences.background} disabled={!media.background}
        onClick={() => setPreferences(value => ({ ...value, background: !value.background }))}>
        {translateUi(!media.background ? '배경 준비 중' : preferences.background ? '배경 켜짐' : '배경 꺼짐')}
      </button>
      <button type="button" className="background-preview-button" disabled={!media.background} onClick={() => media.background && setViewing({ src: media.background, name })}>
        <Image size={16}/>{translateUi('배경만 보기')}
      </button>
    </div>
    </div>
    {translateUi(!media.background && <p>{translateUi("상대 문명(")}{translateUi(name)}{translateUi(")의 배경은 준비 중입니다. 현재 그리스·이집트·로마·아즈텍·조선·청나라 배경을 사용할 수 있어요.")}</p>)}
    {translateUi(background && loadedBackground !== background && <p role="status">{translateUi(name)}{translateUi(" 배경 불러오는 중…")}</p>)}
    {translateUi(media.background && preferences.background && failedBackground === media.background && <p role="status">{translateUi("배경을 불러오지 못했어요. ")}<button onClick={() => { setFailedBackground(null); setBackgroundRetry(value => value + 1); }}>{translateUi("다시 불러오기")}</button></p>)}
    {translateUi(media.bgm && preferences.music && music.status === 'loading' && <p role="status">{translateUi('음악 불러오는 중…')}</p>)}
    {translateUi(media.bgm && preferences.music && music.status === 'blocked' && <button className="music-retry" onClick={music.retry}>{translateUi("눌러서 음악 재생")}</button>)}
    {translateUi(media.bgm && preferences.music && music.status === 'error' && <p role="status">{translateUi("음악을 불러오지 못했어요. ")}<button onClick={() => setPreferences(value => ({ ...value, music: false }))}>{translateUi("음악 끄기")}</button></p>)}
  </section></dialog></>;
}
