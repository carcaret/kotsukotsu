# kotsukotsu (コツコツ)

> *Constancia tranquila.* Tracking personal de japonés para ritmo de padre.

## Qué hace

PWA minimalista para no perderme entre sesiones de estudio. Responde a "¿dónde estoy?" y "¿qué llevo?":

- **Estado del ciclo** — sesión actual (1/2/3), lección y punto de Genki en curso
- **Log rápido** — registrar la sesión de hoy en segundos
- **Historial reciente** — últimas entradas para ver el progreso

Sin backend. Sin cuenta. Datos en localStorage + backup en `data/data.json` commiteado a GitHub.

## Rutina

El ritmo está documentado en [`rutina-japones.md`](rutina-japones.md).

## Desarrollo

```bash
npm install
npx serve . -p 4321   # servidor local
npm test              # vitest (unit)
npm run test:e2e      # Playwright (e2e)
```

## Stack

Vanilla HTML + CSS + JS (ES modules). Sin framework. Sin build step. GitHub Pages para producción.
