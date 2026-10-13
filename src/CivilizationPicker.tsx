import { useDeveloperMode } from './developerMode';
import ProgressFilters from './ProgressFilters';
import { civilizationProgress, defaultProgressFilter, matchesProgress } from './civilizationProgress';
import { useState } from 'react';
import type { Color } from 'chess.js';
import { Search, Check, Crown, Globe2 } from 'lucide-react';
import { civilizations, civilizationAppearance, regions } from './civilizations';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { civilizationMedia } from './civilizationMedia';
import { civilizationReadiness, readinessLabels } from './civilizationReadiness';
import { translateUi as t, useLocale } from './i18n';
import { categories, skills, type Category } from './draft';
import Piece from './Piece';
import SceneImage from './SceneImage';
import SkillSymbol from './SkillSymbol';
import { specialPieceTypes } from './specialPieces';
import { filterCivilizations, type RegionFilter } from './civilizationFilters';
import type { MatchSettings } from './matchSettings';

export default function CivilizationPicker({choice,color,disabled,onChoose,picks,settings,rosterOnly=false}:{rosterOnly?:boolean;picks:string[];settings:MatchSettings;choice:string|null;color:Color;disabled:boolean;onChoose:(id:string)=>void}) {
  const locale=useLocale();
  const developerMode=useDeveloperMode();
  const text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const [query,setQuery]=useState('');
  const [region,setRegion]=useState<RegionFilter>('전체');
  const [progressFilter,setProgressFilter]=useState({...defaultProgressFilter});
  const candidates=filterCivilizations(query,region);
  const visible=candidates.filter(c=>!developerMode||matchesProgress(civilizationProgress(c.id),progressFilter));
  return <div className={rosterOnly?"civ-roster-only":"civ-pick-layout duel-pick-layout"}>
    {!rosterOnly&&<DraftCivilizationCard side="w" {...{color,choice,picks,settings}}/>}
    <div className="civ-pick-roster">
      <div className="civ-continent-filter" role="group" aria-label={text('대륙별 문명 필터','Filter by continent')}>{(['전체',...regions] as RegionFilter[]).map(item=><button key={item} aria-pressed={region===item} onClick={()=>setRegion(item)}>{item==='전체'&&<Globe2 size={15}/>}<span>{t(item)}</span></button>)}</div>
      <div className="civ-pick-search"><Search size={18} aria-hidden="true"/><input aria-label={text('문명 이름 검색','Search civilizations')} placeholder={text('문명 이름 검색','Search civilizations')} value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')} aria-label={text('검색 지우기','Clear search')}>×</button>}<span aria-live="polite">{visible.length} / {civilizations.length}</span></div>
      {developerMode&&<ProgressFilters compact value={progressFilter} onChange={setProgressFilter} ids={candidates.map(c=>c.id)}/>}
      <div className="civ-pick-grid" role="group" aria-label={text('문명 목록','Civilizations')}>
        {visible.map(c=><button key={c.id} className={`civ-pick-tile theme-${civilizationAppearance[c.id]}`} aria-label={`${t(c.name)} ${text('선택','select')}`} aria-pressed={choice===c.id} disabled={disabled} onClick={()=>onChoose(c.id)}>
          <span className="civ-pick-emblem">{hasCivilizationIcon(c.id)?<CivilizationIcon civilization={c.id} color={color} size={58}/>:<span className="civ-pick-initial">{t(c.name).slice(0,1)}</span>}</span>
          <strong>{t(c.name)}</strong>{developerMode&&<small className={`civ-pick-status ${civilizationReadiness(c.id)}`}>{t(readinessLabels[civilizationReadiness(c.id)])}</small>}{choice===c.id&&<Check className="civ-pick-check" size={15}/>}
        </button>)}
        {!visible.length&&<p className="civ-pick-empty">{text('조건에 맞는 문명이 없어요. 검색어나 필터를 바꿔보세요.','No civilizations found. Change your search or filters.')}</p>}
      </div>
    </div>
    {!rosterOnly&&<DraftCivilizationCard side="b" {...{color,choice,picks,settings}}/>}
  </div>;
}

export function DraftCivilizationCard({side,color,choice,picks,settings,skillStage=false,ready=false}:{ready?:boolean;side:Color;color:Color;choice:string|null;picks:string[];settings:MatchSettings;skillStage?:Category|false}) {
    const locale=useLocale();
  const developerMode=useDeveloperMode();
    const text=(ko:string,en:string)=>locale==='ko'?ko:en;
    const index=side==='w'?0:1;
    const active=!ready&&color===side;
    const selected=civilizations.find(c=>c.id===(!skillStage&&active&&choice?choice:picks[index]));
    const locked=!!picks[index];
    const owner=settings.mode==='local'?text(`플레이어 ${index+1}`,`Player ${index+1}`):side===settings.humanColor?text('나','You'):settings.mode==='ai'?'AI':text('상대','Opponent');
    return <aside className={`duel-civ-card side-${side} ${active?'is-picking':''} ${locked?'is-locked':''} ${skillStage?'in-skill-stage':''} ${selected?`theme-${civilizationAppearance[selected.id]}`:''}`} aria-label={`${owner} ${text('문명 카드','civilization card')}`}>
      <div className="duel-card-art" aria-hidden="true">{civilizations.filter(c=>civilizationMedia[c.id]?.background).map(c=><SceneImage key={c.id} visible={selected?.id===c.id} className={selected?.id===c.id?'visible':''} src={civilizationMedia[c.id]!.background!}/>)}</div>
      <div className="duel-card-owner"><span className={`side-dot ${side}`}/><b>{owner}</b><small>{text(side==='w'?'백':'흑',side==='w'?'WHITE':'BLACK')}</small></div>
      <span className="duel-card-state">{ready?text('대전 준비 완료','READY TO BATTLE'):skillStage?(active?text(`${categories.find(c=>c.id===skillStage)?.name} 선택 중`,`CHOOSING ${categories.find(c=>c.id===skillStage)?.english}`):text('상대 선택 대기','WAITING')):locked?<><Check size={14}/>{text('선택 확정','LOCKED IN')}</>:active?text('문명 선택 중','CHOOSING'):text('선택 대기','WAITING')}</span>
      <div className="duel-card-identity" key={selected?.id??'empty'}><div className="civ-pick-hero">{selected&&hasCivilizationIcon(selected.id)?<CivilizationIcon civilization={selected.id} color={side} size={128}/>:<Crown size={80} strokeWidth={1}/>}</div><small>{selected?.english??'YOUR CIVILIZATION'}</small><h2>{selected?t(selected.name):text('당신의 문명','Your civilization')}</h2>
      {selected?<>{developerMode&&<span className={`readiness-badge ${civilizationReadiness(selected.id)}`}>{t(readinessLabels[civilizationReadiness(selected.id)])}</span>}<div className="civ-pick-pieces">{(['r','n','b','q','k','p'] as const).map(type=><Piece key={type} type={type} color={side} civilization={selected.id}/>)}</div>{skillStage&&<div className="civ-card-skill-icons">{categories.map((category,categoryIndex)=>{
        const picked=skills[selected.id][category.id].find(skill=>skill.id===picks[2+categoryIndex*2+index]);
        const name=picked?t(picked.name):text('선택 대기','Not selected');
        return <button type="button" key={category.id} className={`civ-card-skill ${picked?'is-filled':''}`} aria-label={`${t(category.name)} · ${name}`}>
          <span className="civ-card-skill-art" aria-hidden="true">{picked?(specialPieceTypes[picked.id]?<Piece type={specialPieceTypes[picked.id]} color={side} civilization={selected.id} skill={picked.id}/>:<SkillSymbol skill={picked}/>):<span className="civ-card-skill-empty">{categoryIndex+1}</span>}</span>
          <span className="civ-card-skill-caption" aria-hidden="true"><small>{t(category.name)}</small><strong>{name}</strong></span>
        </button>;
      })}</div>}</>:<p>{text('문명을 선택하고 역사를 시작하세요.','Choose a civilization. Begin your history.')}</p>}</div>
    </aside>;
  }
