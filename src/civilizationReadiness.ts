import { skills,optionsAt,draftSteps } from './draft';
import type { Civilization } from './civilizations';
export type CivilizationReadiness = 'ready' | 'progress' | 'pending';
export function civilizationReadiness(id:Civilization):CivilizationReadiness {
  if(id==='korea'||id==='aztec'||id==='rome'||id==='qing')return 'progress';
  const cards=Object.values(skills[id]).flat();
  const available=cards.filter(card=>!card.pending).length;
  return cards.length>0&&available===cards.length ? 'ready' : 'pending';
}
export const readinessLabels = {ready:'스킬 구현',progress:'스킬 구현 중',pending:'스킬 준비 중'} as const;
// Reserve 90% of civilization picks for factions with playable skills.
export function chooseAiDraftPick(picks:string[],random= Math.random):string|undefined {
  const options=optionsAt(picks),step=draftSteps[picks.length];if(!options.length||!step)return undefined;
  let r=Math.max(0,Math.min(.999999999,random()));let pool=options;
  if(step.category==='civilization'){
    const ready=options.filter(id=>civilizationReadiness(id as Civilization)==='ready');
    const pending=options.filter(id=>civilizationReadiness(id as Civilization)!=='ready');
    if(ready.length&&pending.length){pool=r<.9?ready:pending;r=r<.9?r/.9:(r-.9)/.1;}else pool=ready.length?ready:pending;
  }else{
    const civ=picks[step.color==='w'?0:1] as Civilization;
    const available=skills[civ][step.category].filter(card=>!card.pending).map(card=>card.id);
    if(available.length)pool=available;
  }
  return pool[Math.min(pool.length-1,Math.floor(r*pool.length))];
}
