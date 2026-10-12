import { useState } from 'react';
import type { Color } from 'chess.js';
import { Search, Check, Crown } from 'lucide-react';
import { civilizations, civilizationAppearance } from './civilizations';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { civilizationMedia } from './civilizationMedia';
import { civilizationReadiness, readinessLabels } from './civilizationReadiness';
import { translateUi as t, useLocale } from './i18n';
import { categories, skills } from './draft';
import Piece from './Piece';

export default function CivilizationPicker({choice,color,disabled,onChoose}:{choice:string|null;color:Color;disabled:boolean;onChoose:(id:string)=>void}) {
  const locale=useLocale();
  const text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const [query,setQuery]=useState('');
  const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().replace(/\s/g,'');
  const visible=[...civilizations].sort((a,b)=>t(a.name).localeCompare(t(b.name),locale)).filter(c=>normalize(`${c.name} ${c.english} ${t(c.name)}`).includes(normalize(query)));
  const selected=civilizations.find(c=>c.id===choice);
  const background=selected&&civilizationMedia[selected.id]?.background;
  return <div className="civ-pick-layout">
    <div className="civ-pick-roster">
      <div className="civ-pick-search"><Search size={18} aria-hidden="true"/><input aria-label={text('문명 이름 검색','Search civilizations')} placeholder={text('문명 이름 검색','Search civilizations')} value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')} aria-label={text('검색 지우기','Clear search')}>×</button>}<span aria-live="polite">{visible.length} / {civilizations.length}</span></div>
      <div className="civ-pick-grid" role="group" aria-label={text('문명 목록','Civilizations')}>
        {visible.map(c=><button key={c.id} className={`civ-pick-tile theme-${civilizationAppearance[c.id]}`} aria-label={`${t(c.name)} ${text('선택','select')}`} aria-pressed={choice===c.id} disabled={disabled} onClick={()=>onChoose(c.id)}>
          <span className="civ-pick-emblem">{hasCivilizationIcon(c.id)?<CivilizationIcon civilization={c.id} color={color} size={58}/>:<span className="civ-pick-initial">{t(c.name).slice(0,1)}</span>}</span>
          <strong>{t(c.name)}</strong><small className={`civ-pick-status ${civilizationReadiness(c.id)}`}>{t(readinessLabels[civilizationReadiness(c.id)])}</small>{choice===c.id&&<Check className="civ-pick-check" size={15}/>}
        </button>)}
        {!visible.length&&<p className="civ-pick-empty">{text('일치하는 문명이 없어요. 다른 이름으로 검색해 보세요.','No civilizations found. Try another name.')}</p>}
      </div>
    </div>
    <aside className={`civ-pick-preview ${selected?`theme-${civilizationAppearance[selected.id]}`:''}`} aria-label={text('선택한 문명 미리보기','Selected civilization preview')}>
      {background&&<img className="civ-pick-scenery" src={background} alt=""/>}
      <span className="civ-pick-preview-label">{text('당신의 문명','YOUR CIVILIZATION')}</span>
      <div className="civ-pick-hero">{selected&&hasCivilizationIcon(selected.id)?<CivilizationIcon civilization={selected.id} color={color} size={130}/>:<Crown size={90} strokeWidth={1}/>}</div>
      <small>{selected?.english??'CHOOSE YOUR CIVILIZATION'}</small>
      <h2>{selected?t(selected.name):text('문명을 선택하세요','Choose a civilization')}</h2>
      {selected?<><span className={`readiness-badge ${civilizationReadiness(selected.id)}`}>{t(readinessLabels[civilizationReadiness(selected.id)])}</span><div className="civ-pick-pieces" aria-label={text('선택 진영 기물 미리보기','Your pieces')}>{(['r','n','b','q','k','p'] as const).map(type=><Piece key={type} type={type} color={color} civilization={selected.id}/>)}</div><p>{text('두 진영의 문명을 확정한 뒤, 스킬을 번갈아 선택합니다.','Lock in both civilizations, then take turns choosing skills.')}</p><div className="civ-pick-skill-summary">{categories.map(category=><span key={category.id}><b>{t(category.name)}</b><small>{skills[selected.id][category.id].map(skill=>t(skill.name)).join(' · ')||text('준비 중','Coming soon')}</small></span>)}</div></>:<p>{text('왼쪽 목록에서 문명을 고르세요. 같은 문명끼리도 대전할 수 있습니다.','Choose from the roster. Both players can use the same civilization.')}</p>}
    </aside>
  </div>;
}
