export function advanceSession(cycle) {
  return { ...cycle, currentSession: (cycle.currentSession % 3) + 1 };
}

export function createEntry({ dayType, anki, session, notes }) {
  const id = new Date().toISOString().slice(0, 10);
  const entry = { id, dayType, anki };
  if (session) entry.session = session;
  if (notes) entry.notes = notes;
  return entry;
}

export function addEntry(data, entry) {
  const log = data.log
    .filter(e => e.id !== entry.id)
    .concat(entry)
    .sort((a, b) => b.id.localeCompare(a.id));

  const sessionCompleted = entry.session?.completed === true;
  const cycle = sessionCompleted
    ? { ...advanceSession(data.cycle), lastUpdated: entry.id }
    : { ...data.cycle, lastUpdated: entry.id };

  return { ...data, cycle, log };
}

export function getRecentLog(data, limit = 10) {
  return data.log.slice(0, limit);
}
