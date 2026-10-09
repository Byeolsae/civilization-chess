import { useEffect, useId, useState, type CSSProperties } from 'react';
import type { Color } from 'chess.js';
import { X, Play, Pause } from 'lucide-react';
import type { Skill } from './draft';
import type { Civilization } from './civilizations';
import Piece from './Piece';
import { skillDemos } from './skillDemos';
import './skillDemo.css';

export default function SkillDemo({ skill, civilization, color, onClose }: {
  skill: Skill; civilization: Civilization; color: Color; onClose: () => void;
}) {
  const titleId = useId();
  const frames = skillDemos[skill.id];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (!playing || !frames || skill.pending) return;
    const timer = window.setInterval(() => { if (!document.hidden) setStep(s => (s + 1) % frames.length); }, 2400);
    return () => clearInterval(timer);
  }, [playing, frames, skill.pending]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [onClose]);
  const frame = frames?.[step];
  const roster = frames ? [...new Map(frames.flatMap(f => f.pieces).map(p => [p.id, p])).values()] : [];
  return <aside className="skill-demo" role="region" aria-labelledby={titleId}>
    <header><div><small>스킬 시연 · 예시 상황</small><h3 id={titleId}>{skill.name}</h3></div><button onClick={onClose} aria-label="시연 닫기"><X size={19}/></button></header>
    {frame && !skill.pending ? <>
      <div className={`skill-demo-board demo-${skill.id}`} aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => <span key={i} className={`demo-tile ${i % 2 ? 'dark' : 'light'} ${frame.area?.includes(i) ? 'affected' : ''}`}/>)}
        {roster.map(original => {
          const piece = frame.pieces.find(p => p.id === original.id);
          const shown = piece ?? original;
          const side = shown.enemy ? color === 'w' ? 'b' : 'w' : color;
          return <div key={original.id} className={`demo-unit ${piece ? '' : 'absent'}`} style={{ '--x': shown.at % 5, '--y': Math.floor(shown.at / 5) } as CSSProperties}>
            <Piece type={shown.type} color={side} civilization={civilization} skill={shown.enemy ? undefined : skill.id} lives={shown.lives} revived={shown.revived}/>
            {shown.badge && <b>{shown.badge}</b>}
          </div>;
        })}
        {frame.effect && <div key={step} className="demo-effect">{frame.effect}</div>}
      </div>
      <div className="demo-timeline"><button onClick={() => setPlaying(p => !p)} aria-label={playing ? '시연 일시정지' : '시연 재생'}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>{frames.map((_, i) => <button key={i} aria-label={`${i + 1}단계 보기`} aria-pressed={step === i} onClick={() => { setPlaying(false); setStep(i); }}>{i + 1}</button>)}<span>{playing ? '반복 재생' : '일시정지'}</span></div>
      <p className="demo-caption">{frame.text}</p>
      <p className="demo-description">{skill.description}</p>
    </> : <p className="demo-caption">아직 구현 준비 중인 스킬입니다. 현재 대전에는 효과가 적용되지 않습니다.</p>}
    <small className="demo-hint">시연은 선택을 확정하지 않습니다 · Esc로 닫기</small>
  </aside>;
}
