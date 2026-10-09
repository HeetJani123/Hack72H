import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, visibleState, hasConflict, summaryFor, hoursSince } from '../dist/engine.js';
const now = new Date('2026-10-09T12:00:00');
test('caregiver receives only assigned patients, visits and events', () => {
  const s=seed(now), v=visibleState(s,{role:'caregiver',personId:'c1'});
  assert.deepEqual(v.patients.map(p=>p.id),['p1','p3']);
  assert.ok(v.visits.every(visit=>['p1','p3'].includes(visit.patientId)));
  assert.ok(v.events.every(event=>['p1','p3'].includes(event.patientId)));
  assert.equal(v.alerts.length,0);
});
test('patient view shows only the individual record', () => {
  const v=visibleState(seed(now),{role:'patient',personId:'p4'});
  assert.equal(v.patients.length,1);assert.equal(v.patients[0].id,'p4');assert.equal(v.alerts.length,1);
});
test('overlap detection includes partial overlaps but allows adjacent visits', () => {
  const s=seed(now),d=s.visits[0].date;
  assert.equal(hasConflict(s,'c1',d,'09:30'),true);
  assert.equal(hasConflict(s,'c1',d,'08:30'),true);
  assert.equal(hasConflict(s,'c1',d,'10:00'),false);
  assert.equal(hasConflict(s,'c2',d,'09:00'),false);
  assert.equal(hasConflict(s,'c1',d,'09:00',60,'v1'),false);
});
test('cancelled visits do not block scheduling',()=>{
  const s=seed(now);s.visits[0].status='cancelled';assert.equal(hasConflict(s,'c1',s.visits[0].date,'09:00'),false);
});
test('context summary names its actual sources and handles absent notes',()=>{
  const s=seed(now),summary=summaryFor(s,'p4');
  assert.match(summary.update,/No caregiver visit note/);assert.match(summary.next,/transport/);
  assert.deepEqual(summary.sources.map(x=>x.label),['Discharge handoff','Care team concerns']);
  assert.equal(summaryFor(s,'missing'),null);
});
test('context summary updates after visit notes and resolved concerns',()=>{
  const s=seed(now);s.visits[3].note='Transport is confirmed.';s.visits[3].updated=now.toISOString();s.alerts[0].status='resolved';
  const summary=summaryFor(s,'p4');assert.equal(summary.update,'Transport is confirmed.');assert.equal(summary.next,s.patients[3].followup);
  assert.equal(summary.sources[1].label,'Caregiver visit note');
});
test('elapsed discharge hours remain correct and never negative',()=>{
  const s=seed(now);assert.equal(hoursSince(s.patients[0],now),22);assert.equal(hoursSince(s.patients[0],new Date('2020-01-01')),0);
});
