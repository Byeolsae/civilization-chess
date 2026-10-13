import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterCivilizations } from '../src/civilizationFilters';

test('expanded roster has unique identities and Korean ordering', () => {
  const names = filterCivilizations().map(c => c.name);
  assert.equal(names.length, 87);
  assert.deepEqual(names, [...names].sort((a,b) => a.localeCompare(b,'ko')));
  assert.equal(filterCivilizations('러시아 제국').length, 1);
  assert.deepEqual(filterCivilizations('비잔티움').map(c => c.id), ['byzantium']);
  assert.deepEqual(filterCivilizations('다이비엣').map(c => c.id), ['dai-viet']);
  assert.deepEqual(filterCivilizations('카트라고').map(c => c.id), ['carthage']);
  assert.deepEqual(filterCivilizations('해적 광화국').map(c => c.id), ['pirate-republic']);
  assert.deepEqual(filterCivilizations('', '오세아니아').map(c => c.id), ['maori','tonga-empire','hawaii-polynesia']);
});

test('search, continent and era intersect for the retained roster', () => {
  assert.deepEqual(filterCivilizations(' J O S E O N ', '아시아', '근세').map(c => c.id), ['korea']);
  assert.deepEqual(filterCivilizations('', '아시아', '고대').map(c => c.id), ['goguryeo', 'ancient-persia', 'gojoseon', 'maurya', 'babylon', 'baekje', 'sumer', 'silla', 'assyria', 'wu', 'wei', 'qin', 'shu', 'chola', 'phoenicia', 'han']);
  assert.deepEqual(filterCivilizations('', '유럽', '고대').map(c => c.id), ['gaul', 'greece', 'rome', 'byzantium', 'scythia', 'celts', 'macedon', 'huns']);
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
  assert.deepEqual(filterCivilizations('', '북아메리카', '근세').map(c => c.id), ['maya', 'mississippian', 'shoshone', 'aztec', 'iroquois', 'pirate-republic']);
  assert.deepEqual(filterCivilizations('', '남아메리카').map(c => c.id), ['gran-colombia', 'mapuche', 'brazil-empire', 'inca']);
  assert.deepEqual(filterCivilizations('원나라', '아시아', '중세', '중국').map(c => c.id), ['yuan']);
  assert.equal(filterCivilizations().length, 87);
});

test('modern country groups share civilization identities without duplicating filter results', () => {
  const mongolia = filterCivilizations('', '전체', '전체', '몽골');
  const china = filterCivilizations('', '전체', '전체', '중국');
  assert.ok(mongolia.some(c => c.id === 'yuan'));
  assert.equal(mongolia.find(c => c.id === 'yuan'), china.find(c => c.id === 'yuan'));
  assert.deepEqual(filterCivilizations('', '전체', '전체', '멕시코').map(c => c.id), ['maya', 'aztec']);
  assert.deepEqual(filterCivilizations('', '전체', '전체', '이라크').map(c => c.id), ['babylon','sumer','abbasid','assyria']);
  assert.ok(filterCivilizations('', '전체', '전체', '이탈리아').some(c => c.id === 'rome'));
  for (const country of ['페루', '볼리비아', '에콰도르', '칠레', '아르헨티나', '콜롬비아'] as const) {
    assert.ok(filterCivilizations('', '전체', '전체', country).some(c => c.id === 'inca'));
  }
  assert.equal(new Set(filterCivilizations().map(c => c.id)).size, 87);
});
