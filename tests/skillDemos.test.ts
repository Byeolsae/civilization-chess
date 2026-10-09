import test from 'node:test';
import assert from 'node:assert/strict';
import { skills } from '../src/draft';
import { createSkillScenario } from '../src/skillScenarios';
for (const categories of Object.values(skills)) for (const list of Object.values(categories)) for (const skill of list) {
  test(`live engine demo: ${skill.id}`, () => {
    const scenario=createSkillScenario(skill.id);
    if(skill.pending){assert.equal(scenario,null);return;}
    assert.ok(scenario);assert.ok(scenario.steps.length);
    for(const step of scenario.steps)step.run(scenario.game);
    const g=scenario.game;
    if(skill.id==='zeus')assert.ok(g.units().some(p=>p.effects.shock));
    if(skill.id==='minotaur')assert.ok(g.units().some(p=>p.effects.stun));
    if(skill.id==='cleopatra')assert.ok(g.units().some(p=>p.charmed));
    if(skill.id==='mummy')assert.equal(g.unit('d4')?.revived,true);
    if(skill.id==='pyramid')assert.equal(g.unit('d4')?.effects.shock,undefined);
    if(skill.id==='sandstorm')assert.ok(g.state.stormUntil.b>0);
    if(skill.id==='ballista')assert.ok(g.unit('d3')!.cooldownUntil>g.state.turns.w);
  });
}
