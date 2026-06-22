import { loadData, saveData, mergeData } from './src/state.js';
import { createEntry, addEntry, getRecentLog } from './src/log.js';
import { renderStateCard, renderHistory, buildLogForm, showForm, hideForm } from './src/render.js';
import { syncFromGitHub, syncToGitHub, getGitHubConfig, setGitHubConfig } from './src/github.js';

let data = loadData();

const stateCardEl = document.getElementById('state-card');
const historyListEl = document.getElementById('history-list');
const formContainerEl = document.getElementById('form-container');
const btnRegister = document.getElementById('btn-register');
const btnSync = document.getElementById('btn-sync');
const btnSettings = document.getElementById('btn-settings');
const settingsPanel = document.getElementById('settings-panel');
const settingsForm = document.getElementById('settings-form');
const settingsStatus = document.getElementById('settings-status');
const inputToken = document.getElementById('input-token');
const inputRepo = document.getElementById('input-repo');
const btnClearConfig = document.getElementById('btn-clear-config');

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

function updateSettingsStatus() {
  const cfg = getGitHubConfig();
  if (cfg?.token && cfg?.repo) {
    settingsStatus.textContent = `✓ Configurado: ${cfg.repo}`;
    settingsStatus.className = 'settings-status settings-status--ok';
    inputRepo.value = cfg.repo;
  } else {
    settingsStatus.textContent = 'Sin configurar — sync desactivado';
    settingsStatus.className = 'settings-status settings-status--none';
  }
}

function initSettings() {
  updateSettingsStatus();

  btnSettings.addEventListener('click', () => {
    settingsPanel.hidden = !settingsPanel.hidden;
    if (!settingsPanel.hidden) updateSettingsStatus();
  });

  settingsForm.addEventListener('submit', e => {
    e.preventDefault();
    const token = inputToken.value.trim();
    const repo = inputRepo.value.trim();
    if (!token || !repo) return;
    setGitHubConfig(token, repo);
    inputToken.value = '';
    updateSettingsStatus();
    settingsPanel.hidden = true;
    setSyncStatus('none');
    syncFromGitHub().then(remote => {
      if (remote) {
        data = mergeData(data, remote);
        saveData(data);
        render();
        setSyncStatus('ok');
      }
    });
  });

  btnClearConfig.addEventListener('click', () => {
    localStorage.removeItem('kotsukotsu_github');
    localStorage.removeItem('kotsukotsu_sha');
    updateSettingsStatus();
    btnSync.hidden = true;
  });
}

async function init() {
  render();
  btnRegister.disabled = true;

  const remote = await syncFromGitHub();
  if (remote) {
    data = mergeData(data, remote);
    saveData(data);
    render();
    setSyncStatus('ok');
  }
  btnRegister.disabled = false;

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

initSettings();
init();
