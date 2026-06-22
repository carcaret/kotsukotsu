import { loadData, saveData, mergeData } from './src/state.js';
import { createEntry, addEntry, getRecentLog } from './src/log.js';
import { renderStateCard, renderHistory, buildLogForm, showForm, hideForm } from './src/render.js';
import { syncFromGitHub, syncToGitHub } from './src/github.js';

let data = loadData();

const stateCardEl = document.getElementById('state-card');
const historyListEl = document.getElementById('history-list');
const formContainerEl = document.getElementById('form-container');
const btnRegister = document.getElementById('btn-register');
const btnSync = document.getElementById('btn-sync');

function render() {
  renderStateCard(data.cycle, stateCardEl);
  renderHistory(getRecentLog(data), historyListEl);
}

function setSyncStatus(status) {
  const icon = document.getElementById('sync-icon');
  btnSync.hidden = false;
  icon.className = `sync-icon sync-${status}`;
  btnSync.title = {
    ok: 'Sincronizado con GitHub',
    pending: 'Guardando...',
    error: 'Error de sync',
    none: 'Sin token de GitHub configurado',
  }[status] ?? status;
}

async function init() {
  render();

  const remote = await syncFromGitHub();
  if (remote) {
    data = mergeData(data, remote);
    saveData(data);
    render();
    setSyncStatus('ok');
  }

  btnRegister.addEventListener('click', () => {
    const form = buildLogForm(data.cycle.currentSession, handleLogSubmit);
    form.querySelector('#btn-cancel').addEventListener('click', () => {
      hideForm(formContainerEl);
      btnRegister.hidden = false;
    });
    showForm(formContainerEl, form);
    btnRegister.hidden = true;
  });
}

async function handleLogSubmit(fields) {
  const entry = createEntry(fields);
  data = addEntry(data, entry);
  saveData(data);
  hideForm(formContainerEl);
  btnRegister.hidden = false;
  render();

  setSyncStatus('pending');
  const ok = await syncToGitHub(data);
  setSyncStatus(ok ? 'ok' : 'error');
}

init();
