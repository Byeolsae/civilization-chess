import { useState } from 'react';
import { ScrollText, LockKeyhole, Check } from 'lucide-react';
import { translateUi } from './i18n';
import './lawSelection.css';

export default function LawSelection({enabled,onSelect}:{enabled:boolean;onSelect:()=>void}) {
  const [selected,setSelected]=useState(false);
  return <section id="law-selection" className="law-selection" aria-label={translateUi('12표법 선택')}>
    <header><ScrollText size={23}/><div><h2>{translateUi('12표법')}</h2><p>{translateUi(enabled?'대전 시작 전, 적용할 법 하나를 선택하세요.':'상대가 법을 선택하고 있습니다.')}</p></div></header>
    <div className="law-grid">
      <button disabled={!enabled} className={selected?'selected':''} aria-pressed={selected} onClick={()=>setSelected(true)}>
        <small>I</small><ScrollText size={26}/><strong>{translateUi('군율법')}</strong><span>{translateUi('상대 기물 스킬 쿨타임 +1턴')}</span><em>{translateUi('로마는 기존 쿨타임 유지')}</em>{selected&&<Check size={16}/>}
      </button>
      {['II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'].map(n=><button key={n} disabled><small>{n}</small><LockKeyhole size={19}/><span>{translateUi('준비 중')}</span></button>)}
    </div>
    <footer><p>{translateUi('현재 군율법만 선택할 수 있습니다. 나머지 법은 추후 추가됩니다.')}</p><button className="primary-button" disabled={!enabled||!selected} onClick={onSelect}>{translateUi('법 선택 확정')}</button></footer>
  </section>;
}
