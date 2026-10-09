import { setLocale, useLocale } from './i18n';
import './languageSwitch.css';

export default function LanguageSwitch() {
  const locale = useLocale();
  return <div className="language-switch" role="group" aria-label={locale === 'ko' ? '언어 선택' : 'Choose language'}>
    <button type="button" lang="ko" aria-pressed={locale === 'ko'} onClick={() => setLocale('ko')}>한국어</button>
    <button type="button" lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button>
  </div>;
}
