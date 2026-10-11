import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterCivilizations } from '../src/civilizationFilters';

test('only the thirty-two updated civilizations appear in Korean order', () => {
  assert.deepEqual(filterCivilizations().map(c => c.name), ["가마쿠라","갈리아","고구려","고대 그리스","고대 로마","고대 이집트","고려","고조선","당나라","러시아 제국","마야","메이지","명나라","몽골제국","바빌론","백제","센고쿠","송나라","신라","아즈텍","에도","오","원나라","위","잉카","조선","진나라","청나라","촉","프로이센","한나라","헤이안"]);
  for (const search of ['비잔티움']) assert.deepEqual(filterCivilizations(search), []);
});

test('search, continent and era intersect for the retained roster', () => {
  assert.deepEqual(filterCivilizations(' J O S E O N ', '아시아', '근세').map(c => c.id), ['korea']);
  assert.deepEqual(filterCivilizations('', '아시아', '고대').map(c => c.id), ['goguryeo', 'gojoseon', 'babylon', 'baekje', 'silla', 'wu', 'wei', 'qin', 'shu', 'han']);
  assert.deepEqual(filterCivilizations('', '유럽', '고대').map(c => c.id), ['gaul', 'greece', 'rome']);
  assert.deepEqual(filterCivilizations('이집트', '아프리카', '고대').map(c => c.id), ['egypt']);
  assert.deepEqual(filterCivilizations(' H E I A N ', '아시아', '중세').map(c => c.id), ['heian']);
  assert.deepEqual(filterCivilizations('메이지', '아시아', '근대').map(c => c.id), ['meiji']);
  assert.deepEqual(filterCivilizations('에도', '아시아', '근세').map(c => c.id), ['edo']);
  assert.deepEqual(filterCivilizations('센고쿠', '아시아', '중세').map(c => c.id), ['sengoku']);
  assert.deepEqual(filterCivilizations(' G O R Y E O ', '아시아', '중세').map(c => c.id), ['goryeo']);
  assert.deepEqual(filterCivilizations('신라', '아시아', '중세').map(c => c.id), ['silla']);
  assert.deepEqual(filterCivilizations('한국').map(c => c.id), ['goguryeo', 'goryeo', 'gojoseon', 'baekje', 'silla', 'korea']);
  assert.deepEqual(filterCivilizations('', '아시아', '고대', '한국').map(c => c.id), ['goguryeo', 'gojoseon', 'baekje', 'silla']);
  assert.deepEqual(filterCivilizations('', '유럽', '전체', '한국'), []);
  assert.equal(filterCivilizations('중국').length, 10);
  assert.equal(filterCivilizations('일본').length, 5);
  assert.deepEqual(filterCivilizations('가마쿠라', '아시아', '중세', '일본').map(c => c.id), ['kamakura']);
  for (const name of ['위', '촉', '오']) assert.equal(filterCivilizations(name, '아시아', '고대', '중국').length, 1);
  assert.deepEqual(filterCivilizations('', '북아메리카', '근세').map(c => c.id), ['maya', 'aztec']);
  assert.deepEqual(filterCivilizations('', '남아메리카').map(c => c.id), ['inca']);
  assert.deepEqual(filterCivilizations('원나라', '아시아', '중세', '중국').map(c => c.id), ['yuan']);
  assert.equal(filterCivilizations().length, 32);
});

test('modern country groups share civilization identities without duplicating filter results', () => {
  const mongolia = filterCivilizations('', '전체', '전체', '몽골');
  const china = filterCivilizations('', '전체', '전체', '중국');
  assert.ok(mongolia.some(c => c.id === 'yuan'));
  assert.equal(mongolia.find(c => c.id === 'yuan'), china.find(c => c.id === 'yuan'));
  assert.deepEqual(filterCivilizations('', '전체', '전체', '멕시코').map(c => c.id), ['maya', 'aztec']);
  assert.deepEqual(filterCivilizations('', '전체', '전체', '이라크').map(c => c.id), ['babylon']);
  assert.ok(filterCivilizations('', '전체', '전체', '이탈리아').some(c => c.id === 'rome'));
  for (const country of ['페루', '볼리비아', '에콰도르', '칠레', '아르헨티나', '콜롬비아'] as const) {
    assert.ok(filterCivilizations('', '전체', '전체', country).some(c => c.id === 'inca'));
  }
  assert.equal(new Set(filterCivilizations().map(c => c.id)).size, 32);
});
