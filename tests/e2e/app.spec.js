import { test, expect } from '@playwright/test';

test.describe('kotsukotsu MVP', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('muestra estado inicial — Sesión 1/3', async ({ page }) => {
    await expect(page.locator('.state-session')).toContainText('Sesión 1/3');
    await expect(page.locator('.state-label')).toContainText('Gramática: punto nuevo');
    await expect(page.locator('#btn-register')).toBeVisible();
    await expect(page.locator('.history-empty')).toBeVisible();
  });

  test('día mínimo no avanza el ciclo', async ({ page }) => {
    await page.click('#btn-register');
    await page.click('[data-value="minimum"]');
    await page.check('#anki-done');
    await page.fill('#anki-new', '3');
    await page.click('button[type="submit"]');

    await expect(page.locator('.state-session')).toContainText('Sesión 1/3');
    await expect(page.locator('.history-entry')).toHaveCount(1);
    await expect(page.locator('.history-entry')).toContainText('Mínimo');
  });

  test('día bueno con sesión completada avanza a Sesión 2/3', async ({ page }) => {
    await page.click('#btn-register');
    await page.click('[data-value="good"]');
    await page.check('#anki-done');
    await page.fill('#anki-new', '4');
    await page.check('#session-completed');
    await page.click('button[type="submit"]');

    await expect(page.locator('.state-session')).toContainText('Sesión 2/3');
    await expect(page.locator('.history-entry')).toHaveCount(1);
    await expect(page.locator('.history-entry')).toContainText('Bueno');
  });

  test('día cero aparece en historial sin avanzar ciclo', async ({ page }) => {
    await page.click('#btn-register');
    await page.click('[data-value="zero"]');
    await page.click('button[type="submit"]');

    await expect(page.locator('.state-session')).toContainText('Sesión 1/3');
    await expect(page.locator('.history-entry')).toHaveCount(1);
    await expect(page.locator('.history-entry')).toContainText('Cero');
  });

  test('cancelar oculta el formulario', async ({ page }) => {
    await page.click('#btn-register');
    await expect(page.locator('#form-container')).toBeVisible();
    await page.click('#btn-cancel');
    await expect(page.locator('#form-container')).toBeHidden();
    await expect(page.locator('#btn-register')).toBeVisible();
  });

  test('sesión 3 vuelve a sesión 1 (wrap)', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('kotsukotsu_data', JSON.stringify({
        cycle: { currentSession: 3, genkiLesson: 1, genkiPoint: 1, lastUpdated: '2026-06-21' },
        log: [],
      }));
    });
    await page.reload();

    await expect(page.locator('.state-session')).toContainText('Sesión 3/3');
    await expect(page.locator('.state-label')).toContainText('Comodín');

    await page.click('#btn-register');
    await page.click('[data-value="good"]');
    await page.check('#session-completed');
    await page.click('button[type="submit"]');

    await expect(page.locator('.state-session')).toContainText('Sesión 1/3');
  });

  test('estado persiste tras recargar', async ({ page }) => {
    await page.click('#btn-register');
    await page.click('[data-value="good"]');
    await page.check('#session-completed');
    await page.click('button[type="submit"]');

    await expect(page.locator('.state-session')).toContainText('Sesión 2/3');

    await page.reload();
    await expect(page.locator('.state-session')).toContainText('Sesión 2/3');
    await expect(page.locator('.history-entry')).toHaveCount(1);
  });
});
