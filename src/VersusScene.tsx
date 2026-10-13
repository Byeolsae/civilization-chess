import { createPortal } from 'react-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { Crown } from 'lucide-react';
import { civilizations, type Players } from './game';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { civilizationMedia } from './civilizationMedia';
import { categories, skills, type Loadouts } from './draft';
import { translateUi as t } from './i18n';
import SkillSymbol from './SkillSymbol';
import Piece from './Piece';
import { specialPieceTypes } from './specialPieces';
import './versusScene.css';

// Both clipped backgrounds and their divider use the same viewport coordinates.
const seam = { top: 56, bottom: 44 };
const halfClips = {
  w: `polygon(0 0,${seam.top}% 0,${seam.bottom}% 100%,0 100%)`,
  b: `polygon(${seam.top}% 0,100% 0,100% 100%,${seam.bottom}% 100%)`,
};

export const MATCH_ENTRY_MS = 2400;
export default function VersusScene({players,loadouts,opening=false,children}:{players:Players;loadouts:Loadouts|null;opening?:boolean;children?:ReactNode}) {
  const [arriving,setArriving]=useState(()=>!opening&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{if(!arriving)return;const timer=setTimeout(()=>setArriving(false),1200);return()=>clearTimeout(timer);},[arriving]);
  useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
  return createPortal(<section className={`versus-scene ${opening?'is-opening':'is-arriving'}`} aria-label={t('대전 준비')}>
    {(['w','b'] as const).map(side=>{
      const id=players[side],civ=civilizations.find(c=>c.id===id)!;
      const background=civilizationMedia[id]?.background;
      return <div className={`versus-half versus-${side}`} key={side} style={{clipPath:halfClips[side]}}>
        {background&&<img className="versus-landscape" src={background} alt=""/>}
        <div className="versus-identity">
          <span className="versus-side">{t(side==='w'?'백':'흑')}</span>
          {hasCivilizationIcon(id)?<CivilizationIcon civilization={id} color={side} size={132}/>:<Crown size={112}/>}
          <small>{civ.english}</small><h2>{t(civ.name)}</h2>
          {loadouts&&<div className="versus-loadout">{categories.map(category=>{
            const skill=skills[id][category.id].find(s=>s.id===loadouts[side][category.id]);
            const label=`${t(category.name)} · ${t(skill?.name??'준비 중')}`;
            return <button type="button" className="versus-skill" key={category.id} aria-label={label}>
              <span className="versus-skill-symbol" aria-hidden="true">{skill?(specialPieceTypes[skill.id]?<Piece type={specialPieceTypes[skill.id]} color={side} civilization={id} skill={skill.id}/>:<SkillSymbol skill={skill}/>):<Crown/>}</span>
              <span className="versus-skill-tooltip" aria-hidden="true"><small>{t(category.name)}</small><strong>{t(skill?.name??'준비 중')}</strong></span>
            </button>;
          })}</div>}
        </div>
      </div>;
    })}
    <svg className="versus-seam" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={seam.top} y1="0" x2={seam.bottom} y2="100" vectorEffect="non-scaling-stroke"/></svg>
    <div className="versus-heading"><small>CIVILIZATION CHESS</small><h1>{t('두 문명, 하나의 전장')}</h1></div>
    {children&&<div className="versus-actions" inert={arriving}>{children}</div>}
  </section>,document.body);
}
