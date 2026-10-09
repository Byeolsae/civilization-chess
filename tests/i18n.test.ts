import test from 'node:test';
import assert from 'node:assert/strict';
import { translate, translateUi, setLocale, getLocale } from '../src/i18n';
import { filterCivilizations } from '../src/civilizationFilters';
import { skills } from '../src/draft';
import { createSkillScenario } from '../src/skillScenarios';
import { civilizations } from '../src/civilizations';

test('Korean is preserved and dynamic English labels keep numbers and chess coordinates', () => {
  const label = '백 4턴 · 흑 3턴 · 7행동';
  assert.equal(translate(label, 'ko'), label);
  assert.equal(translate(label, 'en'), 'White turn 4 · Black turn 3 · 7 actions');
  assert.equal(translate('스킬 재사용까지 내 3턴', 'en'), 'Skill available in 3 of your turns');
  assert.equal(translate('g8 흑 나이트', 'en'), 'g8 Black Knight');
  assert.equal(translate('기물 스킬을 선택하세요', 'en'), 'Choose a piece skill');
  assert.equal(translate('위', 'en'), 'Wei');
  assert.equal(translate('위쪽', 'en'), 'Up');
  assert.doesNotMatch(translate('우세 평가: 백 우세 +0.1. 기물·위치·스킬 상태에 따른 간이 평가이며 승률이 아닙니다.', 'en'), /[가-힣]/);
});
test('all civilization and skill descriptions and tutorial captions have English text', () => {
  for (const civilization of civilizations) {
    assert.doesNotMatch(translate(civilization.name, 'en'), /[가-힣]/);
    for (const list of Object.values(skills[civilization.id])) for (const skill of list) {
      for (const field of ['name', 'subtitle', 'description', 'detail'] as const) assert.doesNotMatch(translate(skill[field], 'en'), /[가-힣]/, `${skill.id}.${field}`);
      const scenario = createSkillScenario(skill.id);
      if (scenario) for (const text of [scenario.intro, ...scenario.steps.map(s => s.text)]) assert.doesNotMatch(translate(text, 'en'), /[가-힣]/, text);
    }
  }
});
test('language switching preserves game state and Korean/English search both work', () => {
  const game = createSkillScenario('zeus')!.game;
  const before = JSON.stringify(game.snapshot());
  setLocale('en');
  assert.equal(getLocale(), 'en');
  assert.equal(translateUi('제우스'), 'Zeus');
  assert.ok(filterCivilizations('Korea').some(c => c.id === 'korea'));
  assert.ok(filterCivilizations('한국').some(c => c.id === 'korea'));
  assert.ok(filterCivilizations('Egypt').some(c => c.id === 'egypt'));
  assert.ok(filterCivilizations('Joseon').some(c => c.id === 'korea'));
  setLocale('ko');
  assert.equal(translateUi('제우스'), '제우스');
  assert.equal(JSON.stringify(game.snapshot()), before);
});
