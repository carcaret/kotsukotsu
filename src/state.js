export const STORAGE_KEY = 'kotsukotsu_data';

export const DEFAULT_DATA = {
  cycle: {
    currentSession: 1,
    genkiLesson: 1,
    genkiPoint: 1,
    lastUpdated: null,
  },
  log: [],
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    return JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function mergeData(local, remote) {
  const localDate = local?.cycle?.lastUpdated ?? '';
  const remoteDate = remote?.cycle?.lastUpdated ?? '';
  return remoteDate > localDate ? remote : local;
}
