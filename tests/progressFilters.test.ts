import test from 'node:test';
import assert from 'node:assert/strict';
import { civilizationProgress, defaultProgressFilter, matchesProgress, type Progress } from '../src/civilizationProgress';
import { filterCivilizations } from '../src/civilizationFilters';

test('quick scopes distinguish playable skills from artwork and untouched entries', () => {
  const filter={...defaultProgressFilter,scope:'playable' as const};
  assert.ok(matchesProgress(civilizationProgress('greece'),filter));
  assert.ok(matchesProgress(civilizationProgress('rome'),filter));
  assert.equal(matchesProgress(civilizationProgress('korea'),filter),false);
  assert.ok(matchesProgress(civilizationProgress('korea'),{...filter,scope:'working'}));
  assert.ok(matchesProgress(civilizationProgress('khmer'),{...filter,scope:'untouched'}));
  assert.equal(matchesProgress(civilizationProgress('khmer'),{...filter,scope:'working'}),false);
});

test('stage and individual work filters intersect without losing independently completed work', () => {
  const greece=civilizationProgress('greece');
  assert.ok(matchesProgress(greece,{...defaultProgressFilter,stage:'4',field:'bgm',state:'done'}));
  assert.equal(matchesProgress(greece,{...defaultProgressFilter,stage:'4',field:'background',state:'done'}),false);
  assert.ok(matchesProgress(greece,{...defaultProgressFilter,field:'background',state:'pending'}));
  assert.equal(matchesProgress(greece,{...defaultProgressFilter,scope:'complete'}),false);
  const complete=Object.fromEntries(Object.keys(greece).map(key=>[key,'done'])) as Progress;
  assert.ok(matchesProgress(complete,{...defaultProgressFilter,scope:'complete'}));
  assert.equal(matchesProgress(complete,{...defaultProgressFilter,scope:'working'}),false);
});

test('progress combines with search and continent, reset restores candidate results', () => {
  const candidates=filterCivilizations('', '아프리카');
  assert.deepEqual(candidates.filter(c=>matchesProgress(civilizationProgress(c.id),{...defaultProgressFilter,scope:'playable'})).map(c=>c.id),['egypt']);
  assert.equal(candidates.filter(c=>matchesProgress(civilizationProgress(c.id),defaultProgressFilter)).length,candidates.length);
  assert.equal(filterCivilizations('크메르').filter(c=>matchesProgress(civilizationProgress(c.id),{...defaultProgressFilter,field:'skills',state:'done'})).length,0);
});
