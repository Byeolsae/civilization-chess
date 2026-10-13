import type { Civilization } from './civilizations';
import { useLocale } from './i18n';
import { civilizationProgress, progressFields, progressStage, progressStages } from './civilizationProgress';
import './civilizationProgress.css';

const states={done:{ko:'완료',en:'Done',mark:'✓'},progress:{ko:'작업 중',en:'In progress',mark:'◐'},pending:{ko:'준비 중',en:'Pending',mark:'—'}};
export function ProgressLegend(){
  const locale=useLocale();
  return <details className="progress-legend" open><summary>{locale==='ko'?'테두리 색상 안내':'Border color guide'}</summary>
    <p>{locale==='ko'?'테두리는 아래 조건을 순서대로 모두 충족한 단계를 나타냅니다. BGM·효과음·연출·검수는 각각 따로 표시하며, 모두 완료해야 금색이 됩니다.':'Borders show the highest consecutive set of completed requirements. BGM, sound effects, animation and QA are tracked separately; gold requires every item.'}</p>
    <div className="progress-legend-items">{progressStages.map((stage,i)=><span key={stage.ko}><i style={{background:stage.color}} aria-hidden="true"/><b>{i+1}. {stage[locale]}</b><small>{locale==='ko'?stage.koRule:stage.enRule}</small></span>)}</div>
    <p>{locale==='ko'?'✓ 완료 · ◐ 작업 중 · — 준비 중. 공유 색상·로고는 개별 문명 디자인이 확정되기 전까지 작업 중으로 표시합니다. 현재 배경은 모두 삭제된 상태입니다.':'✓ Done · ◐ In progress · — Pending. Shared dynasty art stays in progress until individually finalized. All backgrounds are currently removed.'}</p>
  </details>;
}
export default function CivilizationProgress({civilization,compact=false}:{civilization:Civilization;compact?:boolean}){
  const locale=useLocale(),progress=civilizationProgress(civilization),stage=progressStages[progressStage(progress)];
  return <span className={`civ-progress ${compact?'is-compact':''}`}>
    <span className="civ-progress-stage" style={{color:stage.color}}>{stage[locale]}</span>
    <span className="civ-progress-items">{progressFields.map(([key,ko,en])=>{
      const state=states[progress[key]];
      return <span className={`progress-item ${progress[key]}`} key={key} title={`${locale==='ko'?ko:en}: ${state[locale]}`}><i aria-hidden="true">{state.mark}</i><span>{locale==='ko'?ko:en}</span>{!compact&&<small>{state[locale]}</small>}<span className="progress-sr-only">{compact?state[locale]:''}</span></span>;
    })}</span>
  </span>;
}
