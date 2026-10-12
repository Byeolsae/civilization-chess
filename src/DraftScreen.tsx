import GreekSkillIcon, { hasGreekSkillIcon } from './GreekSkillIcon';
import { translateUi } from './i18n';
import SkillDemo from './LazySkillDemo';
import { civilizationReadiness, readinessLabels, chooseAiDraftPick } from './civilizationReadiness';
import { useEffect, useRef, useState } from 'react';
import type { Color } from 'chess.js';
import Piece from './Piece';
import { specialPieceTypes } from './specialPieces';
import { difficultyNames, type MatchSettings } from './matchSettings';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { civilizationAppearance } from './civilizations';
import CivilizationPicker, { DraftCivilizationCard } from './CivilizationPicker';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Crown, Crosshair, Fence, Flame, Heart, HelpCircle, Hourglass, Pyramid, Route, ScrollText, Shield, Scale, Skull, Sparkles, Sun, Swords, Trophy, Waves, Wind, Zap, Hammer, type LucideIcon } from 'lucide-react';
import { civilizations, colorNames, type Civilization, type Players } from './game';
import { categories, completeDraft, confirmPick, DRAFT_KEY, draftSteps, previousPick, previousHumanPick, optionsAt, restoreDraft, skills, type Loadouts, type Skill } from './draft';

const icons: Record<string, LucideIcon> = { crown: Crown, hourglass: Hourglass, trophy: Trophy, zap: Zap, waves: Waves, skull: Skull, scale: Scale, shield: Shield, hammer: Hammer, wind: Wind, pyramid: Pyramid, sun: Sun, heart: Heart, question: HelpCircle, route: Route, scroll: ScrollText, fence: Fence, flame: Flame, swords: Swords, crosshair: Crosshair };

function SkillSymbol({ skill }: { skill: Skill }) {
  if (hasGreekSkillIcon(skill.id)) return <GreekSkillIcon skill={skill.id}/>;
  const Icon = icons[skill.symbol] ?? Sparkles;
  return skill.symbol === 'horse' ? <span className="draft-horse" aria-hidden="true">♞</span> : <Icon size={54} strokeWidth={1.15} aria-hidden="true" />;
}

export function LoadoutList({ players, loadouts }: { players: Players; loadouts: Loadouts | null }) {
  if (!loadouts) return <p className="legacy-loadout">{translateUi("이전 버전에서 시작한 대전입니다. 새 대전에서 스킬을 선택할 수 있어요.")}</p>;
  return <div className="loadout-list">{translateUi((['w', 'b'] as Color[]).map(color => <section key={color}>
    <h4><span className={`side-dot ${color}`} />{translateUi(colorNames[color])} · {translateUi(civilizations.find(c => c.id === players[color])?.name)}</h4>
    {translateUi(categories.map(category => {
      const skill = skills[players[color]][category.id].find(s => s.id === loadouts[color][category.id]);
      return <div className="loadout-line" key={category.id}><span>{translateUi(category.name)}</span><strong title={translateUi(skill ? `${skill.description} ${skill.detail}` : '추후 추가됩니다. 현재는 기본 체스 규칙으로 진행합니다.')}>{translateUi(skill?.name ?? '준비 중')}</strong></div>;
    }))}
  </section>))}</div>;
}

export default function Draft({ onStart, settings, onSettings, network, initialPicks, onBackgroundChange }: { onBackgroundChange?:(civilization:Civilization|null)=>void; initialPicks?:string[]; network?: {picks:string[];color:Color;busy:boolean;connected:boolean;onPick:(choice:string)=>Promise<boolean>}; settings: MatchSettings; onSettings: () => void; onStart: (players: Players, loadouts: Loadouts) => void }) {
  const [localPicks, setPicks] = useState<string[]>(() => { if(initialPicks)return [...initialPicks]; try { return restoreDraft(localStorage.getItem(DRAFT_KEY)); } catch { return []; } });
  const picks = network?.picks ?? localPicks;
  const [preview, setPreview] = useState<Skill | null>(null);
  useEffect(() => setPreview(null), [picks.length]);
  const [choice, setChoice] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const step = draftSteps[picks.length];
  const complete = completeDraft(picks);
  const aiTurn = settings.mode === 'ai' && !!step && step.color !== settings.humanColor;
  const onlineWaiting = !!network && (!network.connected || network.busy || step?.color !== network.color);
  const previous = network ? null : settings.mode === 'ai' ? previousHumanPick(picks, settings.humanColor) : picks.length ? previousPick(picks) : null;
  const category = categories.find(c => c.id === step?.category);
  const civilization = step && step.category !== 'civilization' ? picks[step.color === 'w' ? 0 : 1] as Civilization : null;
  const currentCards = civilization && category ? skills[civilization][category.id] : null;
  const stageIndex = !step ? 4 : step.category === 'civilization' ? 0 : categories.findIndex(c => c.id === step.category) + 1;
  const backgroundCivilization = step?.category==='civilization' ? civilizations.find(c=>c.id===choice)?.id ?? civilizations.find(c=>c.id===picks[picks.length-1])?.id ?? null : civilization;
  useEffect(()=>{onBackgroundChange?.(backgroundCivilization);},[backgroundCivilization,onBackgroundChange]);
  const currentCivilization = civilizations.find(c => c.id === civilization);

  useEffect(() => {
    try { if (!network) localStorage.setItem(DRAFT_KEY, JSON.stringify(picks)); setSaveFailed(false); }
    catch { setSaveFailed(true); }
    titleRef.current?.focus({ preventScroll: true });
  }, [picks]);

  useEffect(() => {
    if (!locking || !choice) return;
    const timer = window.setTimeout(async () => {
      if (network) await network.onPick(choice);
      else setPicks(previous => confirmPick(previous, choice));
      setChoice(null); setLocking(false);
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550);
    return () => window.clearTimeout(timer);
  }, [locking, choice]);

  useEffect(() => {
    if (!aiTurn || locking) return;
    const timer = window.setTimeout(() => {
      const options = optionsAt(picks);
      if (!options.length) return;
      setChoice(chooseAiDraftPick(picks) ?? null);
      setLocking(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [aiTurn, picks, locking]);

  function back() {
    if (!previous || locking || aiTurn || onlineWaiting) return;
    setChoice(picks[previous.length]);
    setPicks(previous);
  }

  return <section className={`draft-screen draft-selection-room ${step?.category==='civilization'?'is-civilization-picking':category?'is-passive-picking':''} ${civilization ? `theme-${civilizationAppearance[civilization]}` : 'theme-neutral'}`} aria-label={translateUi("대전 준비")}>
    <div className="draft-mode-bar"><span>{translateUi(network ? `온라인 PvP · 나 ${colorNames[network.color]}` : settings.mode === 'ai' ? `AI 대전 · ${difficultyNames[settings.difficulty]} · 나 ${colorNames[settings.humanColor]}` : '로컬 2인 대전')}</span><button onClick={onSettings}>{translateUi(network ? '방 나가기' : '대전 설정 변경')}</button></div>
    <nav className="draft-progress" aria-label={translateUi("선택 진행 상황")}>{translateUi(['문명', '패시브', '액티브', '기물 스킬', '대전 준비'].map((name, index) => <div key={name} aria-current={stageIndex === index ? 'step' : undefined} className={`${index === stageIndex ? 'current' : ''} ${index < stageIndex ? 'done' : ''}`}><span>{translateUi(index < stageIndex ? <Check size={12} /> : `0${index + 1}`)}</span><b>{translateUi(name)}</b>{translateUi(index < 4 && <ChevronRight size={14} />)}</div>))}</nav>
    <div className="draft-players">{translateUi((['w', 'b'] as Color[]).map((color, index) => {
      const chosenCivilization = civilizations.find(c => c.id === picks[index]);
      const active = step?.color === color;
      return <div key={color} className={`draft-player ${active ? 'is-picking' : ''} ${chosenCivilization ? `theme-${civilizationAppearance[chosenCivilization.id]}` : ''}`}>
        {translateUi(chosenCivilization && hasCivilizationIcon(chosenCivilization.id) && <span className="draft-player-emblem"><CivilizationIcon civilization={chosenCivilization.id} color={color} size={40} /></span>)}
        <div className="draft-player-info"><span className="draft-player-label"><span className={`side-dot ${color}`} />{translateUi(settings.mode === 'ai' ? color === settings.humanColor ? '나' : 'AI' : `플레이어 ${index + 1}`)} · {translateUi(colorNames[color])}{translateUi(active && <b>{translateUi("선택 중")}</b>)}</span><strong>{translateUi(chosenCivilization?.name ?? '문명을 선택하세요')}</strong>
          <div className="picked-skills">{translateUi(categories.map((item, categoryIndex) => {
            const skillId = picks[2 + categoryIndex * 2 + index];
            const skill = chosenCivilization && skills[chosenCivilization.id][item.id].find(s => s.id === skillId);
            return <span key={item.id} className={skill ? 'filled' : ''}>{translateUi(skill ? <Check size={10} /> : null)}{translateUi(skill?.name ?? (chosenCivilization && !skills[chosenCivilization.id][item.id].length ? `${item.name} 준비 중` : item.name))}</span>;
          }))}</div>
        </div>
      </div>;
    }))}</div>

    {translateUi(complete ? <div className="draft-complete">
      <div className="draft-intro"><span className="draft-eyebrow">READY TO PLAY</span><h1 ref={titleRef} tabIndex={-1}>{translateUi("두 문명, 하나의 전장")}</h1><p>{translateUi("선택이 끝났습니다. 서로의 조합을 확인하세요.")}</p></div>
      <LoadoutList players={complete.players} loadouts={complete.loadouts} />
      <p className="draft-disclaimer"><Shield size={15} />{translateUi("선택한 능력이 실제 대전에 적용됩니다. 자세한 규칙은 카드와 대전 도움말에서 확인하세요.")}</p>
      <div className="draft-controls"><button className="draft-back" onClick={back} disabled={!previous}><ArrowLeft size={16} />{translateUi(" 이전 선택")}</button><button className="primary-button" onClick={() => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* Match saving reports storage failures. */ } onStart(complete.players, complete.loadouts); }}>{translateUi("체스 대전 시작 ")}<Swords size={18} /></button></div>
    </div> : <>
      <div className="draft-intro" aria-live="polite"><span className="draft-eyebrow">{translateUi(currentCivilization ? `${currentCivilization.english} / ${category?.english}` : 'CHOOSE YOUR CIVILIZATION')}</span><h1 key={`title-${picks.length}`} ref={titleRef} tabIndex={-1}>{translateUi(colorNames[step.color])}, {translateUi(category ? `${category.name}${category.id === 'piece' ? '을' : '를'} 선택하세요` : '문명을 선택하세요')}</h1><p>{translateUi(onlineWaiting ? '상대의 선택 또는 서버 연결을 기다리고 있어요.' : aiTurn ? 'AI가 문명과 스킬을 고르고 있어요.' : category?.description ?? '당신의 문명이 전투의 시작을 결정합니다.')}</p></div>
      {category && civilization && currentCards ? <div className="civ-pick-layout duel-pick-layout passive-pick-layout">
        <DraftCivilizationCard side="w" color={step.color} choice={null} picks={picks} settings={settings} skillStage={category.id}/>
        <div className="passive-pick-center">
          <div className="passive-symbol-options" role="group" aria-label={translateUi(`${colorNames[step.color]} ${category.name} 선택`)}>
            {currentCards.map(skill=><button key={skill.id} className={`passive-symbol-option ${choice===skill.id?'is-selected':''}`} aria-pressed={choice===skill.id} aria-label={translateUi(`${skill.name} 선택`)} disabled={locking||aiTurn||onlineWaiting} onPointerEnter={event=>{if(event.pointerType==='mouse'&&!locking)setPreview(skill);}} onFocus={()=>{if(!locking)setPreview(skill);}} onClick={()=>{setChoice(skill.id);setPreview(skill);}}>
              <span className="passive-option-symbol">{specialPieceTypes[skill.id]?<Piece type={specialPieceTypes[skill.id]} color={step.color} civilization={civilization} skill={skill.id}/>:<SkillSymbol skill={skill}/>}</span><strong>{translateUi(skill.name)}</strong><span className="passive-choice-indicator">{choice===skill.id?<Check size={14}/>:null}{translateUi(choice===skill.id?'선택됨':'시연 보기')}</span>
            </button>)}
          </div>
          <div className="skill-preview-slot passive-demo-slot">{preview?<SkillDemo compact key={`${picks.length}-${preview.id}`} skill={preview} civilization={civilization} color={step.color} onClose={()=>setPreview(null)}/>:<div className="passive-demo-placeholder"><Sparkles size={32}/><strong>{translateUi('스킬 시연')}</strong><p>{translateUi('카드에 마우스를 올리거나')}<br/>{translateUi('시연 보기를 누르세요.')}</p></div>}</div>
        </div>
        <DraftCivilizationCard side="b" color={step.color} choice={null} picks={picks} settings={settings} skillStage={category.id}/>
      </div> : <div className="civilization-picker-host" key={`civilizations-${picks.length}`}><CivilizationPicker picks={picks} settings={settings} choice={choice} color={step.color} disabled={locking || aiTurn || onlineWaiting} onChoose={setChoice}/></div>}


      <div className="draft-controls"><button className="draft-back" onClick={back} disabled={!previous || locking || aiTurn || onlineWaiting}><ArrowLeft size={16} />{translateUi(" 이전 선택")}</button><span className="draft-counter">{translateUi(picks.length + 1)} / 8<span>{translateUi(category ? '카드 3장 중 하나를 선택하세요' : '같은 문명도 선택할 수 있습니다')}</span></span><button className="primary-button" disabled={!choice || locking || aiTurn || onlineWaiting} onClick={() => setLocking(true)}>{translateUi(onlineWaiting ? '상대 선택 대기' : aiTurn ? 'AI 선택 중' : locking ? '선택 확정 중' : '선택 확정')}{translateUi(locking ? <Check size={18} /> : <ArrowRight size={18} />)}</button></div>
      <p className="draft-disclaimer"><Shield size={14} />{translateUi("그리스·이집트·로마의 선택한 능력이 적용됩니다. 카드의 자세한 규칙을 확인하세요.")}</p>
    </>)}
    {translateUi(saveFailed && <p className="storage-warning" role="alert">{translateUi("선택 내용을 저장할 수 없습니다. 새로고침하면 다시 선택해야 합니다.")}</p>)}
  </section>;
}
