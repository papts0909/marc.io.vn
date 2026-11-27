import { test, expect } from '@playwright/test';
import { APPS } from '../../src/js/apps.js';

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page.errors = errors;
  await page.goto('/');
});

test('hero hiển thị tiêu đề và nút CTA', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('AI Agent');
  await expect(page.getByRole('link', { name: /Mở các công cụ/ })).toBeVisible();
  expect(page.errors).toEqual([]);
});

test('mỗi công cụ có một thẻ link đúng subdomain', async ({ page }) => {
  for (const app of APPS) {
    const card = page.locator(`.app-card[data-app="${app.name}"]`);
    await expect(card).toHaveAttribute('href', app.url);
    await expect(card).toContainText(new URL(app.url).host);
  }
});

test('menu mở, liệt kê công cụ và đóng bằng Esc', async ({ page }) => {
  const btn = page.getByRole('button', { name: 'Mở menu' });
  await btn.click();
  const menu = page.locator('#menu');
  await expect(menu).toBeVisible();
  for (const app of APPS) await expect(menu.getByRole('link', { name: new RegExp(app.name) })).toHaveAttribute('href', app.url);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('không bị cuộn ngang', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('canvas hạt được vẽ', async ({ page }) => {
  await page.waitForTimeout(300);
  const painted = await page.evaluate(() => {
    const c = document.querySelector('.hero-canvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true;
    return false;
  });
  expect(painted).toBe(true);
});

test('trang 404 có link về trang chủ', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('link', { name: /Về marc.io.vn/ })).toHaveAttribute('href', '/');
});
