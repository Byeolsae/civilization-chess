import GreekSkillIcon, { hasGreekSkillIcon } from './GreekSkillIcon';
import { translateUi } from './i18n';
import SkillDemo from './SkillDemo';
import { civilizationReadiness, readinessLabels, chooseAiDraftPick } from './civilizationReadiness';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Color } from 'chess.js';
import Piece from './Piece';
import { specialPieceTypes } from './specialPieces';
import { difficultyNames, type MatchSettings } from './matchSettings';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { regions, countries, belongsToCountry, civilizationAppearance } from './civilizations';
import { civilizationEras, eras, filterCivilizations, type CountryFilter, type EraFilter, type RegionFilter } from './civilizationFilters';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Crown, Crosshair, Fence, Flame, Heart, HelpCircle, Hourglass, Pyramid, Route, ScrollText, Shield, Scale, Skull, Sparkles, Sun, Swords, Trophy, Waves, Wind, Zap, Hammer, type LucideIcon } from 'lucide-react';
import { civilizations, colorNames, type Civilization, type Players } from './game';
import { categories, completeDraft, confirmPick, DRAFT_KEY, draftSteps, previousPick, previousHumanPick, optionsAt, restoreDraft, skills, type Loadouts, type Skill } from './draft';

const icons: Record<string, LucideIcon> = { crown: Crown, hourglass: Hourglass, trophy: Trophy, zap: Zap, waves: Waves, skull: Skull, scale: Scale, shield: Shield, hammer: Hammer, wind: Wind, pyramid: Pyramid, sun: Sun, heart: Heart, question: HelpCircle, route: Route, scroll: ScrollText, fence: Fence, flame: Flame, swords: Swords, crosshair: Crosshair };
const civilizationCopy: Partial<Record<string, { headline: string; detail: string; traits: string }>> = {
  joseon: { headline: '진홍과 금빛, 조선의 색', detail: '백은 흰색·진홍·황색, 흑은 진홍·흰색·황색 순서로 배색했습니다.', traits: '스킬 구현 중 · 기본 체스 대전' },
  aztec: { headline: '청록과 진홍, 선명한 황금빛', detail: '백은 황금 바탕·진홍 띠·청록 받침, 흑은 청록 바탕·황금 띠·진홍 받침으로 배색했습니다.', traits: '스킬 구현 중 · 기본 체스 대전' },
  qing: { headline: '황룡기의 황색과 청색', detail: '백은 황색, 흑은 청색 바탕에 붉은 여의주를 닮은 장식을 더했습니다.', traits: '스킬 구현 중 · 기본 체스 대전' },
  china: { headline: '백옥과 비취, 은은한 금빛', detail: '백옥과 비취 바탕에 금색 장식을 더한 기물로 대전을 시작하세요.', traits: '스킬 준비 중 · 기본 체스 대전' },
  korea: { headline: '옥빛 하늘색, 고운 꽃분홍', detail: '옥빛 하늘색과 연한 꽃분홍을 교차 배색한 기물로 대전을 시작하세요.', traits: '스킬 준비 중 · 기본 체스 대전' },
  japan: { headline: '하얀 꽃잎, 벚꽃의 분홍', detail: '흰색과 벚꽃 분홍으로 물든 기물로 대전을 시작하세요.', traits: '스킬 준비 중 · 기본 체스 대전' },
  greece: { headline: '신들의 힘, 인간의 지혜', detail: '번개와 파도를 부르고, 영광으로 한 번 더 전진하세요.', traits: '영광 · 신의 권능 · 추가 생존' },
  egypt: { headline: '모래 아래 잠든 영원', detail: '사막으로 전장을 바꾸고, 쓰러진 기물을 다시 일으키세요.', traits: '부활 · 지형 · 매혹' },
  rome: { headline: '질서로 완성하는 승리', detail: '군단의 진형을 갖추고, 포위와 결투로 전장을 장악하세요.', traits: '진형 · 보호 · 결투' },
};

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

export default function Draft({ onStart, settings, onSettings, network }: { network?: {picks:string[];color:Color;busy:boolean;connected:boolean;onPick:(choice:string)=>Promise<boolean>}; settings: MatchSettings; onSettings: () => void; onStart: (players: Players, loadouts: Loadouts) => void }) {
  const [localPicks, setPicks] = useState<string[]>(() => { try { return restoreDraft(localStorage.getItem(DRAFT_KEY)); } catch { return []; } });
  const picks = network?.picks ?? localPicks;
  const [preview, setPreview] = useState<Skill | null>(null);
  useEffect(() => setPreview(null), [picks.length]);
  const [choice, setChoice] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [readiness,setReadiness]=useState<'all'|'ready'|'progress'|'pending'>('all');
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState<CountryFilter>('전체');
  const [region, setRegion] = useState<RegionFilter>('전체');
  const [era, setEra] = useState<EraFilter>('전체');
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
  const currentCivilization = civilizations.find(c => c.id === civilization);
  const visibleCivilizations = filterCivilizations(search, region, era, country).filter(civ=>readiness==='all'||civilizationReadiness(civ.id)===readiness);
  const readinessCounts = {ready:0,progress:0,pending:0};
  civilizations.forEach(civ=>readinessCounts[civilizationReadiness(civ.id)]++);
  const hasFilters = readiness !== 'all' || country !== '전체' || search !== '' || region !== '전체' || era !== '전체';
  function resetFilters() { setReadiness('all'); setCountry('전체'); setSearch(''); setRegion('전체'); setEra('전체'); }
  const chosenName = civilizations.find(civ => civ.id === choice)?.name;

  useEffect(() => { setCountry('전체'); setSearch(''); setRegion('전체'); setEra('전체'); }, [picks.length]);

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

  return <section className={`draft-screen ${civilization ? `theme-${civilizationAppearance[civilization]}` : 'theme-neutral'}`} aria-label={translateUi("대전 준비")}>
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
      <p className="draft-disclaimer"><Shield size={15} />{translateUi("선택한 능력이 실제 대전에 적용됩니다. 12표법은 준비 중이며, 임시 규칙은 카드와 대전 도움말에서 확인하세요.")}</p>
      <div className="draft-controls"><button className="draft-back" onClick={back} disabled={!previous}><ArrowLeft size={16} />{translateUi(" 이전 선택")}</button><button className="primary-button" onClick={() => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* Match saving reports storage failures. */ } onStart(complete.players, complete.loadouts); }}>{translateUi("체스 대전 시작 ")}<Swords size={18} /></button></div>
    </div> : <>
      <div className="draft-intro" aria-live="polite"><span className="draft-eyebrow">{translateUi(currentCivilization ? `${currentCivilization.english} / ${category?.english}` : 'CHOOSE YOUR CIVILIZATION')}</span><h1 key={`title-${picks.length}`} ref={titleRef} tabIndex={-1}>{translateUi(colorNames[step.color])}, {translateUi(category ? `${category.name}${category.id === 'piece' ? '을' : '를'} 선택하세요` : '문명을 선택하세요')}</h1><p>{translateUi(onlineWaiting ? '상대의 선택 또는 서버 연결을 기다리고 있어요.' : aiTurn ? 'AI가 문명과 스킬을 고르고 있어요.' : category?.description ?? '당신의 문명이 전투의 시작을 결정합니다.')}</p></div>
      {translateUi(!category && <div className="civilization-browser">
        <div className="readiness-filter" role="group" aria-label={translateUi("스킬 구현 여부")}><button aria-pressed={readiness==='all'} onClick={()=>setReadiness('all')}>{translateUi("전체 ")}{translateUi(civilizations.length)}</button>{translateUi((['ready','progress','pending'] as const).map(status=><button key={status} aria-pressed={readiness===status} onClick={()=>setReadiness(status)}>{translateUi(readinessLabels[status])} {translateUi(readinessCounts[status])}</button>))}</div>
        <p className="readiness-help">{translateUi("로마·조선·아즈텍·청나라는 스킬 구현 중입니다. 로마는 12표법을 제외한 기존 스킬을 사용할 수 있고, 조선·아즈텍·청나라는 현재 기본 체스로 플레이합니다.")}{translateUi(settings.mode==='ai'&&' AI는 90% 확률로 스킬이 구현된 문명을 선택합니다.')}</p>
        <div className="civilization-search"><label htmlFor="civilization-search">{translateUi("문명 검색")}</label><input id="civilization-search" type="search" placeholder={translateUi("나라 또는 문명 이름으로 검색")} value={search} disabled={locking || aiTurn || onlineWaiting} onChange={event => setSearch(event.target.value)} /><span aria-live="polite">{translateUi(visibleCivilizations.length)} / {translateUi(civilizations.length)}{translateUi("개 문명 · 중복 제외")}{translateUi(chosenName ? ` · ${chosenName} 선택됨` : '')}</span></div>
        <div className="civilization-filter-panel">
          <div className="civilization-filter-row"><span className="filter-label">{translateUi("나라")}</span><div className="civilization-filters" role="group" aria-label={translateUi("나라별 문명 필터")}>{translateUi((['전체', ...countries] as const).map(item => <button key={item} aria-pressed={country === item} disabled={locking || aiTurn || onlineWaiting} onClick={() => setCountry(item)}>{translateUi(item)}</button>))}</div></div>
          <div className="civilization-filter-row"><span className="filter-label">{translateUi("대륙")}</span><div className="civilization-filters" role="group" aria-label={translateUi("대륙별 문명 필터")}>{translateUi((['전체', ...regions] as const).map(item => <button key={item} aria-pressed={region === item} disabled={locking || aiTurn || onlineWaiting} onClick={() => setRegion(item)}>{translateUi(item)}</button>))}</div></div>
          <div className="civilization-filter-row"><span className="filter-label">{translateUi("시대")}</span><div className="civilization-filters" role="group" aria-label={translateUi("시대별 문명 필터")}>{translateUi((['전체', ...eras] as const).map(item => <button key={item} aria-pressed={era === item} disabled={locking || aiTurn || onlineWaiting} onClick={() => setEra(item)}>{translateUi(item)}</button>))}</div></div>
          <div className="civilization-filter-summary"><span aria-live="polite">{translateUi(country === '전체' ? '모든 나라' : country)} · {translateUi(region === '전체' ? '모든 대륙' : region)} · {translateUi(era === '전체' ? '모든 시대' : era)}{translateUi(search.trim() ? ` · “${search.trim()}”` : '')}</span><button disabled={locking || aiTurn || onlineWaiting || !hasFilters} onClick={resetFilters}>{translateUi("필터 초기화")}</button></div>
          <p className="civilization-era-note">{translateUi("현대 국가와 연결되는 중심지·주요 역사 문화권 기준으로 묶습니다. 여러 나라에 걸친 문명은 중복 표시되며 같은 문명으로 선택됩니다. 전체 정복 영토를 나열한 분류는 아닙니다.")}</p>
          <p className="civilization-era-note">{translateUi("위·촉·오는 삼국시대, 진은 진시황의 진나라(秦), 송은 송나라(宋)입니다. 시대는 게임 탐색용 구분이며 여러 시대에 걸친 왕조는 중복 표시합니다.")}</p>
        </div>
      </div>)}
      <div className={category ? "skill-selection-layout" : undefined}>
      <div className={`draft-card-grid ${!category ? 'civilization-grid' : ''} ${locking ? 'is-locking' : ''}`} key={`cards-${picks.length}`} role="group" aria-label={translateUi(`${colorNames[step.color]} ${category?.name ?? '문명'} 카드 ${currentCards?.length ?? visibleCivilizations.length}장`)}>
        {translateUi(currentCards ? currentCards.map((skill, index) => <div className="skill-card-wrap" key={skill.id} onPointerMove={event => { if (event.pointerType === 'mouse') setPreview(skill); }}><button onFocus={() => setPreview(skill)} className={`draft-card skill-card ${choice === skill.id ? 'is-selected' : ''} ${choice && choice !== skill.id ? 'not-selected' : ''}`} style={{ '--card-index': index } as CSSProperties} aria-pressed={choice === skill.id} aria-label={translateUi(`${skill.name} 선택`)} disabled={locking || aiTurn || onlineWaiting} onClick={() => setChoice(skill.id)}>
          <div className="card-topline"><span>{translateUi(category?.english)}</span><span>0{translateUi(index + 1)}</span></div><div className="card-symbol">{translateUi(civilization && specialPieceTypes[skill.id] ? <Piece type={specialPieceTypes[skill.id]} color={step.color} civilization={civilization} skill={skill.id} /> : <SkillSymbol skill={skill} />)}</div><span className="card-subtitle">{translateUi(skill.subtitle)}</span><h2>{translateUi(skill.name)}</h2><p className="card-description">{translateUi(skill.description)}</p><p className="card-detail">{translateUi(skill.detail)}</p>{translateUi(skill.pending && <span className="pending-tag">{translateUi("세부 효과 기획 중")}</span>)}<div className="card-select-label">{translateUi(choice === skill.id ? <><Check size={15} />{translateUi(locking ? '선택 확정' : '선택됨')}</> : <>{translateUi("카드 선택 ")}<ArrowRight size={14} /></>)}</div>
        </button><button className="skill-demo-trigger" onClick={() => setPreview(skill)}>{translateUi("▷ 시연 보기")}</button></div>) : countries.flatMap(group => {
          if (country !== '전체' && country !== group) return [];
          const members = visibleCivilizations.filter(civ => belongsToCountry(civ, group));
          if (!members.length) return [];
          return [<div className="civilization-country-heading" key={group}><h2>{translateUi(group)}</h2><span>{translateUi(members.length)}{translateUi("개 문명")}</span></div>, ...members.map((civ, index) => {
          const copy = civilizationCopy[civilizationAppearance[civ.id]] ?? { headline: civ.region, detail: '기본 백·흑 기물로 대전을 시작하세요. 문명별 색상은 추후 추가됩니다.', traits: '스킬 준비 중 · 기본 체스 대전' };
          return <button key={`${group}-${civ.id}`} className={`draft-card civilization-card theme-${civilizationAppearance[civ.id]} ${hasCivilizationIcon(civ.id) ? '' : 'no-emblem'} ${choice === civ.id ? 'is-selected' : ''} ${choice && choice !== civ.id ? 'not-selected' : ''}`} style={{ '--card-index': Math.min(index, 5) } as CSSProperties} aria-pressed={choice === civ.id} aria-label={translateUi(`${civ.name} 선택`)} disabled={locking || aiTurn || onlineWaiting} onClick={() => setChoice(civ.id)}>
            <span className="civilization-classification" title={translateUi(civ.countries.join(' · '))}>{translateUi(civ.region)} · {translateUi(civilizationEras[civ.id].join(' / '))}</span>
            <div className="card-topline"><span>{translateUi(civ.english)}</span><span>{translateUi(civ.mark)}</span></div>{translateUi(hasCivilizationIcon(civ.id) && <div className="card-symbol"><CivilizationIcon civilization={civ.id} color={step.color} size={66} /></div>)}<span className="card-subtitle">{translateUi(copy.headline)}</span><h2>{translateUi(civ.name)}</h2><span className={`readiness-badge ${civilizationReadiness(civ.id)}`}>{translateUi(readinessLabels[civilizationReadiness(civ.id)])}</span><p className="card-description">{translateUi(copy.detail)}</p><span className="civilization-traits">{translateUi(copy.traits)}</span><div className="piece-color-preview" aria-label={translateUi(`${civ.name} 백과 흑 기물 미리보기`)}>{translateUi((['w', 'b'] as Color[]).map(color => <span className="piece-color-side" key={color}><small>{translateUi(colorNames[color])}</small>{translateUi((['n', 'k', 'p'] as const).map(type => <Piece key={type} type={type} color={color} civilization={civ.id} />))}</span>))}</div><div className="card-select-label">{translateUi(choice === civ.id ? <><Check size={15} />{translateUi(locking ? '선택 확정' : '선택됨')}</> : <>{translateUi("문명 선택 ")}<ArrowRight size={14} /></>)}</div>
          </button>;
        })];
        }))}
      </div>
      {translateUi(category && <div className="skill-preview-slot">{translateUi(preview && civilization ? <SkillDemo key={preview.id} skill={preview} civilization={civilization} color={step.color} onClose={() => setPreview(null)}/> : <div className="skill-preview-empty"><Sparkles size={28}/><strong>{translateUi("스킬 시연")}</strong><p>{translateUi("카드에 마우스를 올리거나")}<br/>{translateUi("시연 보기를 누르세요.")}</p></div>)}</div>)}
      </div>
      {translateUi(!category && !visibleCivilizations.length && <div className="civilization-empty" role="status"><p>{translateUi("조건에 맞는 문명이 없습니다. 검색어·나라·대륙·시대를 바꿔보세요.")}</p><button className="draft-back" disabled={locking || aiTurn || onlineWaiting} onClick={resetFilters}>{translateUi("필터 초기화")}</button></div>)}
      <div className="draft-controls"><button className="draft-back" onClick={back} disabled={!previous || locking || aiTurn || onlineWaiting}><ArrowLeft size={16} />{translateUi(" 이전 선택")}</button><span className="draft-counter">{translateUi(picks.length + 1)} / 8<span>{translateUi(category ? '카드 3장 중 하나를 선택하세요' : '같은 문명도 선택할 수 있습니다')}</span></span><button className="primary-button" disabled={!choice || locking || aiTurn || onlineWaiting} onClick={() => setLocking(true)}>{translateUi(onlineWaiting ? '상대 선택 대기' : aiTurn ? 'AI 선택 중' : locking ? '선택 확정 중' : '선택 확정')}{translateUi(locking ? <Check size={18} /> : <ArrowRight size={18} />)}</button></div>
      <p className="draft-disclaimer"><Shield size={14} />{translateUi("그리스·이집트·로마의 선택한 능력이 적용됩니다. 12표법만 준비 중이며 카드의 임시 규칙을 확인하세요.")}</p>
    </>)}
    {translateUi(saveFailed && <p className="storage-warning" role="alert">{translateUi("선택 내용을 저장할 수 없습니다. 새로고침하면 다시 선택해야 합니다.")}</p>)}
  </section>;
}
