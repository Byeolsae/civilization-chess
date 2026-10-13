import GreekSkillIcon, { hasGreekSkillIcon } from './GreekSkillIcon';
import type { Skill } from './draft';
import { Crown, Crosshair, Fence, Flame, Heart, HelpCircle, Hourglass, Pyramid, Route, ScrollText, Shield, Scale, Skull, Sparkles, Sun, Swords, Trophy, Waves, Wind, Zap, Hammer, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = { crown: Crown, hourglass: Hourglass, trophy: Trophy, zap: Zap, waves: Waves, skull: Skull, scale: Scale, shield: Shield, hammer: Hammer, wind: Wind, pyramid: Pyramid, sun: Sun, heart: Heart, question: HelpCircle, route: Route, scroll: ScrollText, fence: Fence, flame: Flame, swords: Swords, crosshair: Crosshair };

export default function SkillSymbol({ skill }: { skill: Skill }) {
  if (hasGreekSkillIcon(skill.id)) return <GreekSkillIcon skill={skill.id}/>;
  const Icon = icons[skill.symbol] ?? Sparkles;
  return skill.symbol === 'horse' ? <span className="draft-horse" aria-hidden="true">♞</span> : <Icon size={54} strokeWidth={1.15} aria-hidden="true" />;
}
