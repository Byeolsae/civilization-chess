import { translateUi } from './i18n';
import './cooldownBadge.css';
export default function CooldownBadge({ turns }: { turns: number }) {
  if (turns <= 0) return null;
  return <span className="cooldown-badge" role="img" aria-label={translateUi(`스킬 재사용까지 내 ${turns}턴`)} title={translateUi(`내 턴 기준 ${turns}턴 후 재사용`)}>
    <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="17" r="13"/><path d="M13 1h6M16 1v3M6 5 3 8M26 5l3 3M16 6v2M5 17h2M25 17h2M16 26v2"/><text x="16" y="17" textAnchor="middle" dominantBaseline="central">{translateUi(turns)}</text></svg>
  </span>;
}
