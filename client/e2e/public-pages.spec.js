import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/about',
  '/features',
  '/how-it-works',
  '/roles',
  '/contact',
  '/request-access',
  '/login',
  '/register',
];

test('public and authentication routes render without broken image assets', async ({ page }) => {
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('h1:visible, h2:visible').first(), route).toBeVisible();
    expect(
      await page.locator('img').evaluateAll((images) =>
        images.filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute('src'))
      ),
      route
    ).toEqual([]);
  }

  await expect(page.getByRole('alert')).toContainText('invitation link is missing its token');
});

test('mobile navigation and public CTAs reach their destinations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('button', { name: 'Close navigation menu' }))
    .toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'About', exact: true })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Better coordination.');

  await page.getByRole('contentinfo').getByRole('link', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('link', { name: 'Accept invitation' })).toHaveAttribute('href', '/register');

  await page.goto('/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page).toHaveURL(/\/request-access$/);
});

test('public layout fits mobile, tablet, and desktop viewports', async ({ page }) => {
  await page.goto('/');
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(horizontalOverflow, `public page at ${width}px`).toBeLessThanOrEqual(1);
    if (width <= 820) {
      await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeHidden();
    }
  }
});

test('contact and access forms reject empty and malformed inputs in the browser', async ({ page }) => {
  for (const route of ['/contact', '/request-access']) {
    await page.goto(route);
    const form = page.locator('form');
    expect(await form.evaluate((node) => node.checkValidity())).toBe(false);

    await page.getByLabel('Full name').fill('QA Example');
    await page.getByLabel('Email address').fill('not-an-email');
    await page.getByLabel('Organization').fill('QA Organization');
    if (route === '/contact') {
      await page.getByLabel('Subject').selectOption('information');
      await page.getByLabel('Message').fill('A sufficiently long test message.');
    } else {
      await page.getByLabel('Job title').fill('QA Engineer');
      await page.getByLabel('Why are you requesting access?')
        .fill('A sufficiently long test request reason.');
    }

    expect(await form.evaluate((node) => node.checkValidity())).toBe(false);
  }
});
