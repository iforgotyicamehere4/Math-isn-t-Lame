import { test, expect } from '@playwright/test';

test('Math Pup loads only src stylesheets', async ({ page }) => {
  await page.goto('/game');

  const styles = await page.evaluate(() => {
    return Array.from(document.styleSheets).map((sheet) => {
      const node = sheet.ownerNode;
      if (node && node.dataset && node.dataset.viteDevId) return node.dataset.viteDevId;
      return sheet.href || '';
    });
  });

  const styleText = styles.join('\n');

  expect(styleText).toContain('/src/styles/game.css');
  expect(styleText).not.toContain('/src/styles/game-shell.css');
  expect(styleText).not.toContain('/public/css/game.css');
  expect(styleText).not.toContain('/css/game.css');
});

test('Math Pup uses 880px media rules from src game.css', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/game');

  const paddingLeft = await page.$eval('.game-shell', (el) => {
    return getComputedStyle(el).paddingLeft;
  });

  expect(paddingLeft).toBe('18px');
});
