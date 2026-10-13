import { useDeveloperMode, setDeveloperMode } from './developerMode';
import { useLocale } from './i18n';
import './developerMode.css';

export default function DeveloperModeToggle() {
  const enabled=useDeveloperMode(), locale=useLocale();
  return <button type="button" className="developer-mode-toggle" role="switch" aria-checked={enabled} aria-label={locale==='ko'?'개발자 모드':'Developer mode'} onClick={()=>setDeveloperMode(!enabled)}>
    <span>{locale==='ko'?'개발자 모드':'Developer mode'}</span><strong>{enabled?'ON':'OFF'}</strong><span className="developer-toggle-track" aria-hidden="true"><i/></span>
  </button>;
}
