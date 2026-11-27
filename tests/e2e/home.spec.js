import { test, expect } from '@playwright/test';
import { APPS } from '../../src/js/apps.js';

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page.errors = errors;
  await page.goto('/');
});

test('hero shows the title and CTA', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('AI Agent');
  await expect(page.getByRole('link', { name: /Open the tools/ })).toBeVisible();
  expect(page.errors).toEqual([]);
});

test('each tool has a card linking to its subdomain', async ({ page }) => {
  for (const app of APPS) {
    const card = page.locator(`.app-card[data-app="${app.name}"]`);
    await expect(card).toHaveAttribute('href', app.url);
    await expect(card).toContainText(app.name);
  }
});

test('menu opens, lists the tools and closes on Esc', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Open menu' });
  await btn.click();
  const menu = page.locator('#menu');
  await expect(menu).toBeVisible();
  for (const app of APPS) await expect(menu.getByRole('link', { name: new RegExp(app.name) })).toHaveAttribute('href', app.url);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('no horizontal scroll', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('particle canvas is painted', async ({ page }) => {
  await page.waitForTimeout(300);
  const painted = await page.evaluate(() => {
    const c = document.querySelector('.hero-canvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true;
    return false;
  });
  expect(painted).toBe(true);
});

test('404 page links back home', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('link', { name: /Back to marc.io.vn/ })).toHaveAttribute('href', '/');
});
