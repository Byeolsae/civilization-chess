import { lazy, Suspense, type ComponentProps } from 'react';
import { translateUi } from './i18n';
import './skillDemo.css';

const SkillDemo = lazy(() => import('./SkillDemo'));

export default function LazySkillDemo(props: ComponentProps<typeof SkillDemo>) {
  return <Suspense fallback={<div className="skill-preview-empty" role="status">{translateUi('스킬 시연')}…</div>}><SkillDemo {...props}/></Suspense>;
}
