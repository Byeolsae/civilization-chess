import { translateUi } from './i18n';
import './sphinxRiddle.css';

export function SphinxRiddle({ seconds }: { seconds: number }) {
  return <header className="sphinx-riddle-header">
    <div className="sphinx-portrait" aria-hidden="true">
      <svg viewBox="0 0 240 180" fill="none">
        <circle cx="120" cy="86" r="72" stroke="currentColor" strokeDasharray="2 10"/>
        <path d="M25 145L52 108V66L77 31H163L188 66V108L215 145 M37 153H203 M44 160H196" stroke="currentColor" opacity=".3"/>
        <path d="M74 56Q120 4 166 56L183 139 146 151 120 129 94 151 57 139Z" fill="#173d58" stroke="#d6ac62" strokeWidth="2"/>
        {[0,1,2,3,4].map(i=><path key={i} d={`M${70-i*2} ${73+i*14}L${91-i} ${82+i*12} M${170+i*2} ${73+i*14}L${149+i} ${82+i*12}`} stroke="#d6ac62" strokeWidth="4"/>)}
        <path d="M91 59Q120 47 149 59L146 103Q140 126 120 135Q100 126 94 103Z" fill="#e4c787" stroke="#a7793e" strokeWidth="2"/>
        <path d="M101 80L111 82 M129 82L139 80 M120 81L116 99H124 M111 113Q120 116 129 113" stroke="#705135" strokeWidth="2" strokeLinecap="round"/>
        <path d="M114 132L120 150 126 132 M113 54L120 32 127 54" fill="#d6ac62" stroke="#f6e3a4"/>
        <path d="M23 87H42 M198 87H217 M120 7V20" stroke="currentColor"/>
      </svg>
    </div>
    <h2>{translateUi('스핑크스의 수수께끼')}</h2>
    <div className="sphinx-hourglass"><span aria-hidden="true">⌛</span><b>{seconds}</b><span>{translateUi('초 남음')}</span></div>
    <div className="sphinx-time-track" aria-hidden="true"><i style={{width:`${Math.max(0,Math.min(5,seconds))*20}%`}}/></div>
  </header>;
}
