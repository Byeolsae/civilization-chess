import { Play } from 'lucide-react';
import type { Civilization } from './civilizations';
import { civilizations } from './civilizations';
import { civilizationIntros } from './civilizationIntros';
import { categories, skills, type Skill } from './draft';
import { translateUi as t, useLocale } from './i18n';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import CivilizationProgress from './CivilizationProgressDisplay';
import DeveloperModeToggle from './DeveloperModeToggle';
import SkillDemo from './LazySkillDemo';
import SkillSymbol from './SkillSymbol';
import Piece from './Piece';
import { specialPieceTypes } from './specialPieces';
import './civilizationDetail.css';

type HistoryNote = { ko: string; en: string; source: string };
export default function CivilizationDetail({civilization, developerMode, tab, onTab, demo, onDemo, history}: {
  civilization: Civilization; developerMode: boolean; tab: 'history'|'skills';
  onTab: (tab:'history'|'skills')=>void; demo: Skill|null; onDemo:(skill:Skill|null)=>void;
  history?:HistoryNote;
}) {
  const locale=useLocale(), text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const civ=civilizations.find(c=>c.id===civilization)!;
  if(demo) return <article className="civilization-demo-page" aria-label={text(`${demo.name} 시연`,`${t(demo.name)} demo`)}>
    <div className="civilization-demo-context"><span>{t(civ.name)}</span><span> / </span><strong>{t(demo.name)}</strong></div>
    <div className="skill-preview-slot civilization-demo-stage">
      <SkillDemo key={`${civilization}-${demo.id}`} skill={demo} civilization={civilization} color="w" onClose={()=>onDemo(null)}/>
    </div>
  </article>;
  return <article className={`civilization-detail-view detail-${tab}`}>
    <header className="civilization-identity">
      <div className="civilization-detail-emblem" aria-hidden="true">{hasCivilizationIcon(civilization)?<CivilizationIcon civilization={civilization} size={132}/>:<span>{t(civ.name).slice(0,1)}</span>}</div>
      <div><span className="home-eyebrow">{civ.english}</span><h1>{t(civ.name)}</h1></div>
      <nav className="civilization-detail-tabs" aria-label={text('문명 상세 메뉴','Civilization details')}>
        <button aria-pressed={tab==='history'} onClick={()=>onTab('history')}>{text('역사 설명','History')}</button>
        <button aria-pressed={tab==='skills'} onClick={()=>onTab('skills')}>{text('문명별 스킬','Skills')}</button>
      </nav>
      <DeveloperModeToggle/>
      {developerMode&&<CivilizationProgress civilization={civilization}/>}
    </header>
    {tab==='history'?<section className="civilization-history-panel" aria-labelledby="civilization-history-title">
      <header><small>CHRONICLES</small><h2 id="civilization-history-title">{text('역사 설명','History')}</h2></header>
      <div className="civilization-history-scroll" role="region" aria-label={text(`${civ.name} 역사 본문`,`${t(civ.name)} history text`)} tabIndex={0}>
        <p className="civilization-history-intro">{civilizationIntros[civilization][locale]}</p>
        {history&&<><h3>{text('역사와 풍경','History and landscape')}</h3><p>{history[locale]}</p><a href={history.source} target="_blank" rel="noreferrer">{text('역사 자료 보기 ↗','Read historical source ↗')}</a></>}
      </div>
    </section>:<section className="civilization-skill-panel" aria-label={text('문명 스킬 9칸','Nine civilization skill slots')}>
      <div className="civilization-skill-panel-heading"><h2>{text('문명별 스킬','Skills')}</h2><p>{text('스킬을 선택해 큰 화면으로 시연을 확인하세요.','Select a skill to explore its full-size demonstration.')}</p></div>
      <div className="civilization-skill-grid">{categories.flatMap(category=>Array.from({length:3},(_,index)=>{
        const skill=skills[civilization][category.id][index];
        return <button key={`${category.id}-${index}`} className={`civilization-skill-tile ${skill?'':'is-empty'}`} disabled={!skill} onClick={()=>skill&&onDemo(skill)} aria-label={skill?text(`${skill.name} 시연 보기`,`Watch ${t(skill.name)} demo`):text(`${category.name} ${index+1} 미등록`,`${t(category.name)} ${index+1} unavailable`)}>
          <small>{t(category.name)}<span>{String(index+1).padStart(2,'0')}</span></small>
          <span className="civilization-skill-art" aria-hidden="true">{skill?(specialPieceTypes[skill.id]?<Piece type={specialPieceTypes[skill.id]} color="w" civilization={civilization} skill={skill.id}/>:<SkillSymbol skill={skill}/>):<span>—</span>}</span>
          <strong>{skill?t(skill.name):text('미등록','Unavailable')}</strong>
          <span className="civilization-skill-preview-label">{skill?<><Play size={13}/>{text('시연 보기','Watch demo')}</>:text('등록된 스킬이 없습니다','No skill registered')}</span>
        </button>;
      }))}</div>
    </section>}
  </article>;
}
