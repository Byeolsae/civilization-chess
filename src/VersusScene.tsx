import { createPortal } from 'react-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { Crown } from 'lucide-react';
import { civilizations, type Players } from './game';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { civilizationMedia } from './civilizationMedia';
import { categories, skills, type Loadouts } from './draft';
import { translateUi as t } from './i18n';
import './versusScene.css';

export const MATCH_ENTRY_MS = 2400;
export default function VersusScene({players,loadouts,opening=false,children}:{players:Players;loadouts:Loadouts|null;opening?:boolean;children?:ReactNode}) {
  const [arriving,setArriving]=useState(()=>!opening&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{if(!arriving)return;const timer=setTimeout(()=>setArriving(false),1200);return()=>clearTimeout(timer);},[arriving]);
  useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
  return createPortal(<section className={`versus-scene ${opening?'is-opening':'is-arriving'}`} aria-label={t('대전 준비')}>
    {(['w','b'] as const).map(side=>{
      const id=players[side],civ=civilizations.find(c=>c.id===id)!;
      const background=civilizationMedia[id]?.background;
      return <div className={`versus-half versus-${side}`} key={side}>
        {background&&<img className="versus-landscape" src={background} alt=""/>}
        <div className="versus-identity">
          <span className="versus-side">{t(side==='w'?'백':'흑')}</span>
          {hasCivilizationIcon(id)?<CivilizationIcon civilization={id} color={side} size={132}/>:<Crown size={112}/>}
          <small>{civ.english}</small><h2>{t(civ.name)}</h2>
          {loadouts&&<div className="versus-loadout">{categories.map(category=><span key={category.id}><small>{t(category.name)}</small><strong>{t(skills[id][category.id].find(s=>s.id===loadouts[side][category.id])?.name??'준비 중')}</strong></span>)}</div>}
        </div>
      </div>;
    })}
    <div className="versus-seam" aria-hidden="true"/><div className="versus-mark" aria-hidden="true">VS</div>
    <div className="versus-heading"><small>CIVILIZATION CHESS</small><h1>{t('두 문명, 하나의 전장')}</h1></div>
    {children&&<div className="versus-actions" inert={arriving}>{children}</div>}
  </section>,document.body);
}
