import { describe, it, expect } from 'vitest';
import { advanceSession, createEntry, addEntry, getRecentLog } from '../src/log.js';

const baseCycle = { currentSession: 1, genkiLesson: 2, genkiPoint: 3, lastUpdated: null };
const baseData = () => ({ cycle: { ...baseCycle }, log: [] });

describe('advanceSession', () => {
  it('advances 1 → 2', () => {
    expect(advanceSession({ currentSession: 1 }).currentSession).toBe(2);
  });
  it('advances 2 → 3', () => {
    expect(advanceSession({ currentSession: 2 }).currentSession).toBe(3);
  });
  it('advances 3 → 1', () => {
    expect(advanceSession({ currentSession: 3 }).currentSession).toBe(1);
  });
  it('does not mutate input', () => {
    const cycle = { currentSession: 1 };
    advanceSession(cycle);
    expect(cycle.currentSession).toBe(1);
  });
});

describe('createEntry', () => {
  it('creates entry with required fields', () => {
    const entry = createEntry({ dayType: 'minimum', anki: { done: true, newCards: 3 } });
    expect(entry.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(entry.dayType).toBe('minimum');
    expect(entry.anki).toEqual({ done: true, newCards: 3 });
  });
  it('omits session when not provided', () => {
    const entry = createEntry({ dayType: 'minimum', anki: { done: false, newCards: 0 } });
    expect(entry.session).toBeUndefined();
  });
  it('includes session when provided', () => {
    const entry = createEntry({ dayType: 'good', anki: { done: true, newCards: 4 }, session: { number: 2, completed: true } });
    expect(entry.session).toEqual({ number: 2, completed: true });
  });
  it('omits notes when empty string', () => {
    const entry = createEntry({ dayType: 'zero', anki: { done: false, newCards: 0 }, notes: '' });
    expect(entry.notes).toBeUndefined();
  });
  it('includes notes when non-empty', () => {
    const entry = createEntry({ dayType: 'good', anki: { done: true, newCards: 3 }, notes: 'て-form' });
    expect(entry.notes).toBe('て-form');
  });
});

describe('addEntry', () => {
  it('adds entry to log', () => {
    const data = baseData();
    const entry = createEntry({ dayType: 'minimum', anki: { done: true, newCards: 2 } });
    const result = addEntry(data, entry);
    expect(result.log).toHaveLength(1);
  });
  it('advances cycle when session completed', () => {
    const data = baseData();
    const entry = createEntry({ dayType: 'good', anki: { done: true, newCards: 3 }, session: { number: 1, completed: true } });
    const result = addEntry(data, entry);
    expect(result.cycle.currentSession).toBe(2);
  });
  it('does not advance cycle for minimum day (no session)', () => {
    const data = baseData();
    const entry = createEntry({ dayType: 'minimum', anki: { done: true, newCards: 2 } });
    const result = addEntry(data, entry);
    expect(result.cycle.currentSession).toBe(1);
  });
  it('does not advance cycle when session not completed', () => {
    const data = baseData();
    const entry = createEntry({ dayType: 'good', anki: { done: true, newCards: 3 }, session: { number: 1, completed: false } });
    const result = addEntry(data, entry);
    expect(result.cycle.currentSession).toBe(1);
  });
  it('replaces same-day entry', () => {
    const data = baseData();
    const entry1 = createEntry({ dayType: 'minimum', anki: { done: true, newCards: 1 } });
    const entry2 = { ...createEntry({ dayType: 'good', anki: { done: true, newCards: 3 } }), id: entry1.id };
    const result = addEntry(addEntry(data, entry1), entry2);
    expect(result.log).toHaveLength(1);
    expect(result.log[0].dayType).toBe('good');
  });
  it('does not mutate input data', () => {
    const data = baseData();
    const entry = createEntry({ dayType: 'zero', anki: { done: false, newCards: 0 } });
    addEntry(data, entry);
    expect(data.log).toHaveLength(0);
  });
  it('updates cycle.lastUpdated', () => {
    const data = baseData();
    const entry = createEntry({ dayType: 'minimum', anki: { done: true, newCards: 2 } });
    const result = addEntry(data, entry);
    expect(result.cycle.lastUpdated).toBe(entry.id);
  });
  it('log is sorted newest-first', () => {
    let data = baseData();
    const e1 = { id: '2026-06-01', dayType: 'minimum', anki: { done: true, newCards: 1 } };
    const e2 = { id: '2026-06-10', dayType: 'minimum', anki: { done: true, newCards: 1 } };
    data = addEntry(addEntry(data, e1), e2);
    expect(data.log[0].id).toBe('2026-06-10');
  });
});

describe('getRecentLog', () => {
  it('returns up to limit entries', () => {
    let data = baseData();
    for (let i = 1; i <= 15; i++) {
      const entry = { id: `2026-01-${String(i).padStart(2, '0')}`, dayType: 'minimum', anki: { done: true, newCards: 1 } };
      data = addEntry(data, entry);
    }
    expect(getRecentLog(data, 10)).toHaveLength(10);
  });
  it('returns all when fewer than limit', () => {
    const data = baseData();
    const entry = createEntry({ dayType: 'zero', anki: { done: false, newCards: 0 } });
    const result = addEntry(data, entry);
    expect(getRecentLog(result, 10)).toHaveLength(1);
  });
  it('defaults to 10 entries', () => {
    let data = baseData();
    for (let i = 1; i <= 12; i++) {
      const entry = { id: `2026-01-${String(i).padStart(2, '0')}`, dayType: 'minimum', anki: { done: true, newCards: 1 } };
      data = addEntry(data, entry);
    }
    expect(getRecentLog(data)).toHaveLength(10);
  });
});
