import test from 'node:test';
import assert from 'node:assert/strict';
import { civilizationProgress, progressStage, progressFields, type Progress } from '../src/civilizationProgress';

const complete = ():Progress=>Object.fromEntries(progressFields.map(([key])=>[key,'done'])) as Progress;
test('gold requires separate sound, animation and QA completion',()=>{
  assert.equal(progressStage(complete()),0);
  for(const key of ['bgm','sfx','animation','qa','intro','history'] as const){
    const p=complete();p[key]='progress';assert.equal(progressStage(p),1,key);
  }
});
test('missing background caps the border without hiding implemented skills or BGM',()=>{
  const p=complete();p.background='pending';assert.equal(progressStage(p),4);
  const greece=civilizationProgress('greece');
  assert.equal(greece.background,'pending');assert.equal(greece.bgm,'done');
  assert.equal(greece.skills,'done');assert.equal(progressStage(greece),4);
});
test('border follows each consecutive prerequisite',()=>{
  const fields=['palette','logo','background','icons','skills'] as const;
  fields.forEach((field,index)=>{const p=complete();p[field]='pending';assert.equal(progressStage(p),6-index);});
});
test('shared dynasty designs and existing prose drafts are not signed off',()=>{
  const p=civilizationProgress('ming');assert.equal(p.palette,'progress');assert.equal(p.logo,'progress');
  assert.equal(p.intro,'pending');assert.equal(p.qa,'pending');assert.equal(progressStage(p),6);
});

 test('new roster entries have no invented completion or skills', () => {
  for (const id of ['dai-viet','khmer','byzantium','hawaii-polynesia','pirate-republic'] as const) {
    assert.ok(Object.values(civilizationProgress(id)).every(value => value === 'pending'));
    assert.equal(progressStage(civilizationProgress(id)), 6);
  }
});
