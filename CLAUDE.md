# kotsukotsu — CLAUDE.md

## Project

PWA for personal Japanese learning tracking. No backend. Vanilla HTML/CSS/JS, no framework, no build step.

## Workflow

- **Issues and specs live in GitHub Issues**, not in the repo. Use `gh issue` for planning, specs, and tasks.
- No `docs/` folder for specs or plans.
- Serve locally with `serve` (port 4321). Test with vitest (unit) + Playwright (e2e).

## Stack

- Vanilla JS (ES modules), HTML, CSS
- vitest for unit tests
- Playwright for e2e tests
- GitHub Pages for deployment
- localStorage + `data/data.json` (commited to repo) for persistence

## Key domain concepts

See `rutina-japones.md` for the full learning routine. Summary:

- **Base diaria**: Anki reviews + 3-5 new cards (~10 min)
- **Ciclo de 3 sesiones** (avanza por sesión, no por día de calendario):
  - Sesión 1: nuevo punto de gramática (Genki)
  - Sesión 2: ejercicios del workbook de ese punto
  - Sesión 3: comodín (recuperación / Tae Kim / etc.)
- **Tipos de día**: mínimo (solo Anki), bueno (Anki + sesión), cero (descanso — no es un fallo)

## GitHub CLI

`gh` is available. Authenticate with `gh auth login` if needed.
