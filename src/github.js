const GITHUB_CONFIG_KEY = 'kotsukotsu_github';
const GITHUB_SHA_KEY = 'kotsukotsu_sha';
const DATA_PATH = 'data/data.json';

export function buildGitHubPayload(data, sha, { branch = 'master', message = '' } = {}) {
  const json = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const content = btoa(binary);
  const body = {
    message: message || `kotsukotsu: update ${new Date().toISOString().slice(0, 10)}`,
    content,
    branch,
  };
  if (sha) body.sha = sha;
  return body;
}

export function parseGitHubResponse(response) {
  if (!response?.content) return null;
  if (response.encoding && response.encoding !== 'base64') return null;
  try {
    const raw = response.content.replace(/\n/g, '');
    const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return { data, sha: response.sha ?? null };
  } catch { return null; }
}

export function getGitHubConfig() {
  try { return JSON.parse(localStorage.getItem(GITHUB_CONFIG_KEY)); } catch { return null; }
}

export function setGitHubConfig(token, repo) {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify({ token, repo }));
}

export function getSha() {
  return localStorage.getItem(GITHUB_SHA_KEY) || null;
}

export function setSha(sha) {
  if (sha) localStorage.setItem(GITHUB_SHA_KEY, sha);
}

export async function syncFromGitHub() {
  const cfg = getGitHubConfig();
  if (!cfg?.token || !cfg?.repo) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.repo}/contents/${DATA_PATH}`,
      { headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github.v3+json' } }
    );
    if (!res.ok) return null;
    const raw = await res.json();
    const parsed = parseGitHubResponse(raw);
    if (!parsed) return null;
    setSha(parsed.sha);
    return parsed.data;
  } catch { return null; }
}

export async function syncToGitHub(data) {
  const cfg = getGitHubConfig();
  if (!cfg?.token || !cfg?.repo) return false;
  let sha = getSha();
  if (!sha) {
    const remote = await syncFromGitHub();
    if (!remote) return false;
    sha = getSha();
  }
  try {
    const body = buildGitHubPayload(data, sha);
    const res = await fetch(
      `https://api.github.com/repos/${cfg.repo}/contents/${DATA_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) return false;
    const json = await res.json();
    setSha(json?.content?.sha ?? sha);
    return true;
  } catch { return false; }
}
