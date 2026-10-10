import { romanLaws, type RomanLaw } from './romanLaws';
import { useState } from 'react';
import { ScrollText, LockKeyhole, Check } from 'lucide-react';
import { translateUi } from './i18n';
import './lawSelection.css';

export default function LawSelection({enabled,onSelect}:{enabled:boolean;onSelect:(law:RomanLaw)=>void}) {
  const [selected,setSelected]=useState<RomanLaw | null>(null);
  return <section id="law-selection" className="law-selection" aria-label={translateUi('12표법 선택')}>
    <header><ScrollText size={23}/><div><h2>{translateUi('12표법')}</h2><p>{translateUi(enabled?'대전 시작 전, 적용할 법 하나를 선택하세요.':'상대가 법을 선택하고 있습니다.')}</p></div></header>
    <div className="law-grid">
      {romanLaws.map((law,index)=><button key={law.id} disabled={!enabled} className={selected===law.id?'selected':''} aria-pressed={selected===law.id} onClick={()=>setSelected(law.id)}>
        <small>{['I','II','III'][index]}</small><ScrollText size={26}/><strong>{translateUi(law.name)}</strong><span>{translateUi(law.effect)}</span><em>{translateUi(law.privilege)}</em>{selected===law.id&&<Check size={16}/>}
      </button>)}
      {['IV','V','VI','VII','VIII','IX','X','XI','XII'].map(n=><button key={n} disabled><small>{n}</small><LockKeyhole size={19}/><span>{translateUi('준비 중')}</span></button>)}
    </div>
    <footer><p>{translateUi('현재 세 가지 법을 선택할 수 있습니다. 나머지 9개 법은 준비 중입니다.')}</p><button className="primary-button" disabled={!enabled||!selected} onClick={()=>selected&&onSelect(selected)}>{translateUi('법 선택 확정')}</button></footer>
  </section>;
}
