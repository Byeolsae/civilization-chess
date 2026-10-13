import { useLocale } from './i18n';
import { civilizationProgress, defaultProgressFilter, matchesProgress, progressFields, progressStages, type ProgressFilter, type ProgressScope, type Completion, type ProgressField } from './civilizationProgress';
import type { Civilization } from './civilizations';
import './civilizationProgress.css';

const scopes = [['all','전체','All'],['playable','플레이 가능','Playable'],['complete','전체 완료','Complete'],['working','작업 중','In progress'],['untouched','미착수','Not started']] as const;
export default function ProgressFilters({value,onChange,ids,compact=false}:{value:ProgressFilter;onChange:(next:ProgressFilter)=>void;ids:Civilization[];compact?:boolean}) {
  const locale=useLocale(), text=(ko:string,en:string)=>locale==='ko'?ko:en;
  const update=(patch:Partial<ProgressFilter>)=>onChange({...value,...patch});
  const count=(scope:ProgressScope)=>ids.filter(id=>matchesProgress(civilizationProgress(id),{...value,scope})).length;
  const active=value.scope!=='all'||value.stage!==''||value.field!=='';
  return <div className={`progress-filters ${compact?'is-small':''}`}>
    <div className="progress-filter-tabs" role="group" aria-label={text('구현 상태 필터','Implementation filters')}>
      {scopes.map(([scope,ko,en])=><button type="button" key={scope} aria-pressed={value.scope===scope} onClick={()=>update({scope})}>{text(ko,en)}<small>{count(scope)}</small></button>)}
    </div>
    <details className="progress-filter-details"><summary>{text('세부 작업 필터','Detailed progress filters')}{(value.stage!==''||value.field!=='')&&' •'}</summary>
      <div className="progress-filter-controls">
        <label>{text('테두리 단계','Border stage')}<select value={value.stage} onChange={e=>update({stage:e.target.value})}><option value="">{text('모든 단계','All stages')}</option>{progressStages.map((stage,i)=><option key={stage.ko} value={String(i)}>{stage[locale]}</option>)}</select></label>
        <label>{text('작업 항목','Work item')}<select value={value.field} onChange={e=>update({field:e.target.value as ProgressField|''})}><option value="">{text('모든 항목','All items')}</option>{progressFields.map(([id,ko,en])=><option key={id} value={id}>{text(ko,en)}</option>)}</select></label>
        <label>{text('항목 상태','Item status')}<select disabled={!value.field} value={value.state} onChange={e=>update({state:e.target.value as Completion})}><option value="done">{text('완료','Done')}</option><option value="progress">{text('작업 중','In progress')}</option><option value="pending">{text('준비 중','Pending')}</option></select></label>
      </div>
    </details>
    <div className="progress-filter-note"><span>{text('플레이 가능: 사용 가능한 스킬이 있는 문명 · 작업 중: 일부 작업이 진행되었으나 전체 완료 전','Playable: usable skills available · In progress: some work started, not fully complete')}</span>{active&&<button type="button" onClick={()=>onChange({...defaultProgressFilter})}>{text('필터 초기화','Reset filters')}</button>}</div>
  </div>;
}
