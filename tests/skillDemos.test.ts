import test from 'node:test';
import assert from 'node:assert/strict';
import { skills } from '../src/draft';
import { skillDemos } from '../src/skillDemos';

test('every implemented selectable skill has a complete visual demonstration', () => {
  for (const categories of Object.values(skills)) for (const list of Object.values(categories)) for (const skill of list) {
    if (skill.pending) { assert.equal(skillDemos[skill.id], undefined); continue; }
    const frames = skillDemos[skill.id];
    assert.ok(frames?.length >= 3, skill.id);
    for (const frame of frames) {
      assert.ok(frame.text.length > 0);
      assert.equal(new Set(frame.pieces.map(p => p.id)).size, frame.pieces.length);
      for (const at of [...frame.pieces.map(p => p.at), ...(frame.area ?? [])]) assert.ok(Number.isInteger(at) && at >= 0 && at < 25, skill.id);
    }
  }
});
