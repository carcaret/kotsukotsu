const SESSION_LABELS = {
  1: 'Gramática: punto nuevo',
  2: 'Gramática: ejercicios',
  3: 'Comodín',
};
const DAY_TYPE_LABELS = { minimum: 'Mínimo', good: 'Bueno', zero: 'Cero' };
const DAY_TYPE_CLASSES = { minimum: 'day-minimum', good: 'day-good', zero: 'day-zero' };

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function daysAgo(isoDate) {
  const today = new Date().toISOString().slice(0, 10);
  if (isoDate === today) return 'hoy';
  const diff = Math.round((new Date(today) - new Date(isoDate)) / 86400000);
  if (diff === 1) return 'ayer';
  return `hace ${diff} días`;
}

export function renderStateCard(cycle, el) {
  const session = cycle.currentSession;
  const last = cycle.lastUpdated ? daysAgo(cycle.lastUpdated) : 'nunca';
  el.innerHTML = `
    <div class="state-session">Sesión ${session}/3</div>
    <div class="state-label">${SESSION_LABELS[session]}</div>
    <div class="state-genki">Genki L${cycle.genkiLesson} · Punto ${cycle.genkiPoint}</div>
    <div class="state-last">Última actividad: ${last}</div>
  `;
}

export function renderHistory(log, el) {
  if (log.length === 0) {
    el.innerHTML = '<li class="history-empty">Sin entradas todavía.</li>';
    return;
  }
  el.innerHTML = log.map(entry => {
    const dayClass = DAY_TYPE_CLASSES[entry.dayType] ?? '';
    const sessionPart = entry.session?.completed ? ` · S${entry.session.number}` : '';
    const ankiPart = entry.anki?.done ? ` · Anki +${entry.anki.newCards}` : '';
    return `<li class="history-entry ${dayClass}">
      <span class="entry-date">${formatDate(entry.id)}</span>
      <span class="entry-type">${DAY_TYPE_LABELS[entry.dayType] ?? entry.dayType}</span>
      <span class="entry-detail">${ankiPart}${sessionPart}</span>
      ${entry.notes ? `<span class="entry-notes">${entry.notes}</span>` : ''}
    </li>`;
  }).join('');
}

export function buildLogForm(currentCycleSession, onSubmit) {
  const form = document.createElement('form');
  form.id = 'log-form';
  form.className = 'log-form';
  form.innerHTML = `
    <div class="input-group">
      <label>Tipo de día</label>
      <div class="btn-group" id="day-type-group">
        <button type="button" class="btn-option" data-value="minimum">Mínimo</button>
        <button type="button" class="btn-option" data-value="good">Bueno</button>
        <button type="button" class="btn-option" data-value="zero">Cero</button>
      </div>
      <input type="hidden" id="day-type-value" name="dayType" required>
    </div>
    <div class="input-group" id="anki-group">
      <label>Anki</label>
      <label class="checkbox-label">
        <input type="checkbox" id="anki-done" name="ankiDone"> Repasos hechos
      </label>
      <label class="number-label">
        Cartas nuevas
        <input type="number" id="anki-new" name="ankiNew" min="0" max="20" value="0">
      </label>
    </div>
    <div class="input-group" id="session-group" hidden>
      <label class="checkbox-label">
        <input type="checkbox" id="session-completed" name="sessionCompleted">
        Sesión ${currentCycleSession}/3 completada
      </label>
    </div>
    <div class="input-group">
      <label>Nota (opcional)</label>
      <textarea id="entry-notes" name="notes" rows="2"
        placeholder="Ej: Genki L3 P1 — entendí el て-form"></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn-primary">Guardar</button>
      <button type="button" id="btn-cancel" class="btn-secondary">Cancelar</button>
    </div>
  `;

  form.querySelectorAll('.btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      form.querySelector('#day-type-value').value = btn.dataset.value;
      form.querySelector('#session-group').hidden = btn.dataset.value !== 'good';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const dayType = form.querySelector('#day-type-value').value;
    if (!dayType) return;
    const ankiDone = form.querySelector('#anki-done').checked;
    const ankiNew = Number(form.querySelector('#anki-new').value) || 0;
    const sessionCompleted = form.querySelector('#session-completed').checked;
    const notes = form.querySelector('#entry-notes').value.trim();
    onSubmit({
      dayType,
      anki: { done: ankiDone, newCards: ankiNew },
      session: dayType === 'good'
        ? { number: currentCycleSession, completed: sessionCompleted }
        : undefined,
      notes: notes || undefined,
    });
  });

  return form;
}

export function showForm(container, form) {
  container.innerHTML = '';
  container.appendChild(form);
  container.hidden = false;
}

export function hideForm(container) {
  container.hidden = true;
  container.innerHTML = '';
}
