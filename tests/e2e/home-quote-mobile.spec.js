import { test, expect } from '@playwright/test';

test('home quote chairs end centered and fully in bounds on Android viewport', async ({ page }) => {
  // Typical Android portrait viewport
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');

  const stage = page.locator('.quote-stage');
  const field = page.locator('.quote-chair-field');
  const chairs = page.locator('.quote-chair-field .chair');

  await expect(stage).toBeVisible();
  await expect(field).toBeVisible();
  await expect(chairs.first()).toBeVisible();

  // Let travel + optional post-layout transition complete.
  await page.waitForTimeout(5200);

  const layout = await page.evaluate(() => {
    const stageEl = document.querySelector('.quote-stage');
    const fieldEl = document.querySelector('.quote-chair-field');
    const chairEls = Array.from(document.querySelectorAll('.quote-chair-field .chair'));
    if (!stageEl || !fieldEl || !chairEls.length) return null;

    const stageRect = stageEl.getBoundingClientRect();
    const fieldRect = fieldEl.getBoundingClientRect();
    const centerDelta = Math.abs(
      (fieldRect.left + fieldRect.width / 2) - (stageRect.left + stageRect.width / 2)
    );
    const outOfBounds = chairEls.filter((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.left < fieldRect.left - 1 ||
        r.top < fieldRect.top - 1 ||
        r.right > fieldRect.right + 1 ||
        r.bottom > fieldRect.bottom + 1
      );
    }).length;

    return {
      chairCount: chairEls.length,
      centerDelta,
      outOfBounds
    };
  });

  expect(layout).not.toBeNull();
  expect(layout.chairCount).toBeGreaterThan(20);
  expect(layout.centerDelta).toBeLessThanOrEqual(2);
  expect(layout.outOfBounds).toBe(0);
});
