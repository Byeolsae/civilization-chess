import { translateUi } from './i18n';
import './sphinxRiddle.css';

export function SphinxRiddle({ seconds }: { seconds: number }) {
  return <header className="sphinx-riddle-header">
    <div className="sphinx-portrait" aria-hidden="true">
      <img src="/terrain/sphinx-riddle.svg" alt="" draggable={false}/>
    </div>
    <h2>{translateUi('스핑크스의 수수께끼')}</h2>
    <div className="sphinx-hourglass"><span aria-hidden="true">⌛</span><b>{seconds}</b><span>{translateUi('초 남음')}</span></div>
    <div className="sphinx-time-track" aria-hidden="true"><i style={{width:`${Math.max(0,Math.min(5,seconds))*20}%`}}/></div>
  </header>;
}
