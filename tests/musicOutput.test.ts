import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusicOutput } from '../src/musicOutput';
test('audio graph is silent before connecting and uses gain rather than media volume', async () => {
  const events: string[] = [];
  let level = -1;
  const old = globalThis.AudioContext;
  class FakeContext {
    currentTime = 0; state = 'suspended'; destination = {};
    createMediaElementSource() { return { connect() { assert.equal(level, 0); events.push('source'); }, disconnect() { events.push('source off'); } }; }
    createGain() { return { gain: {
      setValueAtTime(value: number) { level = value; }, cancelScheduledValues() {},
      setTargetAtTime(value: number) { level = value; },
    }, connect() { events.push('gain'); }, disconnect() { events.push('gain off'); } }; }
    async resume() { this.state = 'running'; }
  }
  globalThis.AudioContext = FakeContext as unknown as typeof AudioContext;
  try {
    const audio = { volume: 0 } as HTMLAudioElement;
    const output = createMusicOutput(audio);
    assert.equal(level, 0);
    await output.resume(); assert.equal(output.running(), true);
    output.setLevel(.3); assert.equal(level, .3); assert.equal(audio.volume, 1);
    output.setLevel(0, true); assert.equal(level, 0);
    output.dispose(); assert.deepEqual(events, ['source', 'gain', 'source off', 'gain off']);
  } finally { globalThis.AudioContext = old; }
});
