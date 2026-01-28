import { test, expect } from '@playwright/test';

test('home and decimal pages load', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Do you even math bro/i)).toBeVisible();

  await page.goto('/decimal');
  await expect(page.getByRole('heading', { name: 'Deci-What?' })).toBeVisible();
});

test('game pages render core controls and canvas', async ({ page }) => {
  await page.goto('/game');
  await expect(page.getByRole('heading', { name: 'Math Pup' })).toBeVisible();
  await expect(page.locator('#gameCanvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();

  await page.goto('/capture');
  await expect(page.getByRole('heading', { name: 'Capture' })).toBeVisible();
  await expect(page.locator('#gameCanvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();

  await page.goto('/decimal');
  await expect(page.getByRole('heading', { name: 'Deci-What?' })).toBeVisible();
  await expect(page.locator('#canvasAnchor')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
});

test('decimal mobile layout keeps controls visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/decimal');

  await expect(page.getByRole('heading', { name: 'Deci-What?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  await expect(page.locator('#colsInput')).toBeVisible();
  await expect(page.locator('#rowsInput')).toBeVisible();
});

test('app navigation routes work', async ({ page }) => {
  await page.goto('/game');
  await page.getByRole('link', { name: 'Capture' }).click();
  await expect(page.getByRole('heading', { name: 'Capture' })).toBeVisible();

  await page.getByRole('link', { name: 'Deci-What?' }).click();
  await expect(page.getByRole('heading', { name: 'Deci-What?' })).toBeVisible();

  await page.getByRole('link', { name: 'Games' }).click();
  await expect(page.getByRole('heading', { name: 'Available Games' })).toBeVisible();
});
