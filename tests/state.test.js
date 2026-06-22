import { describe, it, expect, beforeEach } from 'vitest';
import { loadData, saveData, mergeData, DEFAULT_DATA, STORAGE_KEY } from '../src/state.js';

beforeEach(() => localStorage.clear());

describe('loadData', () => {
  it('returns default data when storage empty', () => {
    const data = loadData();
    expect(data.cycle.currentSession).toBe(1);
    expect(data.log).toEqual([]);
  });
  it('returns parsed data when storage has valid JSON', () => {
    const stored = { cycle: { currentSession: 3, genkiLesson: 5, genkiPoint: 2, lastUpdated: '2026-06-01' }, log: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const data = loadData();
    expect(data.cycle.currentSession).toBe(3);
  });
  it('returns default data when storage has corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{');
    const data = loadData();
    expect(data.cycle.currentSession).toBe(1);
  });
  it('returns independent copies (no shared mutation)', () => {
    const a = loadData();
    const b = loadData();
    a.cycle.currentSession = 99;
    expect(b.cycle.currentSession).toBe(1);
  });
});

describe('saveData', () => {
  it('persists data retrievable via loadData', () => {
    const data = { cycle: { currentSession: 2, genkiLesson: 3, genkiPoint: 1, lastUpdated: '2026-06-20' }, log: [] };
    saveData(data);
    const loaded = loadData();
    expect(loaded.cycle.currentSession).toBe(2);
    expect(loaded.cycle.genkiLesson).toBe(3);
  });
});

describe('mergeData', () => {
  const older = { cycle: { lastUpdated: '2026-06-01' }, log: [] };
  const newer = { cycle: { lastUpdated: '2026-06-20' }, log: [] };

  it('returns remote when remote is newer', () => {
    expect(mergeData(older, newer)).toBe(newer);
  });
  it('returns local when local is newer', () => {
    expect(mergeData(newer, older)).toBe(newer);
  });
  it('returns local when both have same date', () => {
    const same = { cycle: { lastUpdated: '2026-06-20' }, log: [] };
    expect(mergeData(newer, same)).toBe(newer);
  });
  it('returns remote when local has null lastUpdated', () => {
    const noDate = { cycle: { lastUpdated: null }, log: [] };
    expect(mergeData(noDate, newer)).toBe(newer);
  });
  it('returns local when remote has null lastUpdated', () => {
    const noDate = { cycle: { lastUpdated: null }, log: [] };
    expect(mergeData(newer, noDate)).toBe(newer);
  });
});
