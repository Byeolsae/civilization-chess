import { useEffect, useId, useState } from 'react';
import type { Color } from 'chess.js';
import { X, Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import type { Skill } from './draft';
import type { Civilization } from './civilizations';
import { createSkillScenario } from './skillScenarios';
import SkillDemoBoard from './SkillDemoBoard';
import './skillDemo.css';

export default function SkillDemo({skill,civilization,onClose}:{skill:Skill;civilization:Civilization;color:Color;onClose:()=>void}) {
  const title=useId();
  const [scenario,setScenario]=useState(()=>createSkillScenario(skill.id));
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [error,setError]=useState(false);
  const restart=()=>{setScenario(createSkillScenario(skill.id));setStep(0);setError(false);};
  const next=()=>{
    if(!scenario)return;
    if(step===scenario.steps.length){restart();return;}
    try{scenario.steps[step].run(scenario.game);setStep(step+1);}catch{setError(true);setPlaying(false);}
  };
  useEffect(()=>{
    if(!playing||!scenario||error)return;
    const timer=setTimeout(()=>{if(!document.hidden)next();else setPlaying(false);},step===scenario.steps.length?6000:Math.max(3800,(step?scenario.steps[step-1].text:scenario.intro).length*90));
    return()=>clearTimeout(timer);
  },[playing,step,scenario,error]);
  useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[onClose]);
  return <aside className="skill-demo" role="region" aria-labelledby={title}>
    <header><div><small>인게임 시연 · 백 진영 예시</small><h3 id={title}>{skill.name}</h3></div><button onClick={onClose} aria-label="시연 닫기"><X size={19}/></button></header>
    {scenario?<>
      <div className="demo-visual"><SkillDemoBoard game={scenario.game} civilization={civilization} storm={skill.id==='sandstorm'}/></div><div className="demo-explanation">
      <div className="demo-timeline"><button onClick={()=>setPlaying(p=>!p)} aria-label={playing?'시연 일시정지':'시연 재생'}>{playing?<Pause size={15}/>:<Play size={15}/>}</button><button onClick={restart} aria-label="시연 처음부터"><RotateCcw size={15}/></button><button onClick={()=>{setPlaying(false);next();}} aria-label="다음 장면"><ChevronRight size={18}/></button><span>{step} / {scenario.steps.length} · {playing?'반복 재생':'일시정지'}</span></div>
      <p className="demo-caption" aria-live="polite">{error?'시연을 다시 시작해 주세요.':step?scenario.steps[step-1].text:scenario.intro}</p>
      <div className="demo-rules"><strong>사용 방법과 효과</strong><p>{skill.description}</p><p>{skill.detail}</p></div>
      <ol className="demo-chapters"><li className={step===0?'is-current':''}><span>준비</span>{scenario.intro}</li>{scenario.steps.map((scene,index)=><li key={index} className={step===index+1?'is-current':''} aria-current={step===index+1?'step':undefined}><span>{String(index+1).padStart(2,'0')}</span>{scene.text}</li>)}</ol></div>
    </>:<p className="demo-caption">구현 준비 중인 스킬입니다. 현재 대전에는 효과가 적용되지 않습니다.</p>}
    <small className="demo-hint">시연 전용 대전 · 실제 선택과 대전에 영향 없음 · Esc로 닫기</small>
  </aside>;
}
