import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import type { Civilization } from './civilizations';
import { civilizations } from './civilizations';
import { civilizationIntros } from './civilizationIntros';
import { categories, skills, type Skill } from './draft';
import { translateUi as t, useLocale } from './i18n';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import CivilizationProgress from './CivilizationProgressDisplay';
import SkillDemo from './LazySkillDemo';
import SkillSymbol from './SkillSymbol';
import Piece from './Piece';
import { specialPieceTypes } from './specialPieces';
import './civilizationDetail.css';

type HistoryNote = { ko: string; en: string; source: string };
export type CivilizationDetailTab = 'intro' | 'history' | 'skills';
export default function CivilizationDetail({civilization, developerMode, tab, onTab, demo, onDemo, history}: {
  civilization: Civilization; developerMode: boolean; tab: CivilizationDetailTab;
  onTab: (tab:CivilizationDetailTab)=>void; demo: Skill|null; onDemo:(skill:Skill|null)=>void;
  history?:HistoryNote;
}) {
  const locale=useLocale(), text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const civ=civilizations.find(c=>c.id===civilization)!;
  const tabs=(<nav className="civilization-detail-tabs" aria-label={text('문명 상세 메뉴','Civilization details')}>
        <button aria-pressed={tab==='intro'} onClick={()=>onTab('intro')}>{text('소개문구','Introduction')}</button>
        <button aria-pressed={tab==='history'} onClick={()=>onTab('history')}>{text('역사 설명','History')}</button>
        <button aria-pressed={tab==='skills'} onClick={()=>onTab('skills')}>{text('문명별 스킬','Skills')}</button>
      </nav>);
  return <article className={`civilization-detail-view detail-${tab}`}>
    <header className="civilization-identity">
      <div className="civilization-detail-emblem" aria-hidden="true">{hasCivilizationIcon(civilization)?<CivilizationIcon civilization={civilization} size={132}/>:<span>{t(civ.name).slice(0,1)}</span>}</div>
      <div><span className="home-eyebrow">{civ.english}</span><h1>{t(civ.name)}</h1></div>
      {developerMode&&<CivilizationProgress civilization={civilization}/>}
    </header>
    {tab==='skills'&&demo&&<section className="civilization-demo-beside" aria-label={text(`${demo.name} 시연`,`${t(demo.name)} demo`)}>
      <div className="civilization-demo-context"><strong>{t(demo.name)}</strong></div>
      <FittedDemo>
        <SkillDemo key={`${civilization}-${demo.id}`} skill={demo} civilization={civilization} color="w" onClose={()=>onDemo(null)}/>
      </FittedDemo>
    </section>}
    {tab!=='skills'?<section className="civilization-history-panel" aria-labelledby="civilization-history-title">
      <header>{tabs}<small>{tab==='intro'?'INTRODUCTION':'CHRONICLES'}</small><h2 id="civilization-history-title">{t(civ.name)}</h2><span className="civilization-reading-label">{tab==='intro'?text('소개문구','Introduction'):text('역사 설명','History')}</span></header>
      <div key={tab} className="civilization-history-scroll" role="region" aria-label={tab==='intro'?text(`${civ.name} 소개문구`,`${t(civ.name)} introduction`):text(`${civ.name} 역사 본문`,`${t(civ.name)} history text`)} tabIndex={0}>
        {tab==='intro'?<p>{civilizationIntros[civilization][locale]}</p>:history?<><h3>{text('역사와 풍경','History and landscape')}</h3><p>{history[locale]}</p><a href={history.source} target="_blank" rel="noreferrer">{text('역사 자료 보기 ↗','Read historical source ↗')}</a></>:<p>{text('역사 설명을 준비하고 있습니다. 역사 자료를 확인한 뒤 추가할 예정입니다.','Historical notes are being prepared and will be added after reviewing sources.')}</p>}
      </div>
      <div className="civilization-history-seal" aria-hidden="true">{hasCivilizationIcon(civilization)?<CivilizationIcon civilization={civilization} size={88}/>:<span>{civ.english}</span>}</div>
    </section>:<section className={`civilization-history-panel civilization-skill-panel theme-${civilization}`} aria-label={text('문명 스킬 9칸','Nine civilization skill slots')}>
      <header>{tabs}<small>ABILITIES</small><h2>{t(civ.name)}</h2><span className="civilization-reading-label">{text('문명별 스킬 · 선택하면 시연을 볼 수 있습니다.','Skills · Select to watch a demonstration.')}</span></header>
      <div className="civilization-skill-grid">{categories.flatMap(category=>Array.from({length:3},(_,index)=>{
        const skill=skills[civilization][category.id][index];
        return <button key={`${category.id}-${index}`} className={`civilization-skill-tile ${skill?'':'is-empty'}`} aria-pressed={!!skill&&demo?.id===skill.id} disabled={!skill} onClick={()=>skill&&onDemo(skill)} aria-label={skill?text(`${skill.name} 시연 보기`,`Watch ${t(skill.name)} demo`):text(`${category.name} ${index+1} 미등록`,`${t(category.name)} ${index+1} unavailable`)}>
          <small>{t(category.name)}<span>{String(index+1).padStart(2,'0')}</span></small>
          <span className="civilization-skill-art" aria-hidden="true">{skill?(specialPieceTypes[skill.id]?<Piece type={specialPieceTypes[skill.id]} color="w" civilization={civilization} skill={skill.id}/>:<SkillSymbol skill={skill}/>):<span>—</span>}</span>
          <strong>{skill?t(skill.name):text('미등록','Unavailable')}</strong>
          <span className="civilization-skill-preview-label">{skill?<><Play size={13}/>{text('시연 보기','Watch demo')}</>:text('등록된 스킬이 없습니다','No skill registered')}</span>
        </button>;
      }))}</div>
    </section>}
  </article>;
}

function FittedDemo({children}:{children:ReactNode}) {
  const frame=useRef<HTMLDivElement>(null), content=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    const outer=frame.current, inner=content.current;
    if(!outer||!inner)return;
    const fit=()=>{
      const scale=Math.min(1,outer.clientWidth/Math.max(1,inner.scrollWidth),outer.clientHeight/Math.max(1,inner.scrollHeight));
      inner.style.transform=`translateX(-50%) scale(${scale})`;
    };
    const observer=new ResizeObserver(fit);
    observer.observe(outer);observer.observe(inner);fit();
    return()=>observer.disconnect();
  },[]);
  return <div ref={frame} className="civilization-demo-fit"><div ref={content} className="skill-preview-slot civilization-demo-stage civilization-demo-fit-content">{children}</div></div>;
}
