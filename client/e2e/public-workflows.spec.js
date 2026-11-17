import { expect, test } from '@playwright/test';

test('contact form displays loading and success states for a successful response', async ({ page }) => {
  let markRequestSeen;
  let releaseResponse;
  const requestSeen = new Promise((resolve) => { markRequestSeen = resolve; });
  const responseGate = new Promise((resolve) => { releaseResponse = resolve; });
  await page.route('**/api/v1/public/contact', async (route) => {
    markRequestSeen();
    await responseGate;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Your message has been received for administrator review.',
        data: {},
      }),
    });
  });

  await page.goto('/contact');
  await page.getByLabel('Full name').fill('QA Example');
  await page.getByLabel('Email address').fill('qa@example.invalid');
  await page.getByLabel('Organization').fill('QA Organization');
  await page.getByLabel('Subject').selectOption('information');
  await page.getByLabel('Message').fill('Please review this test message.');

  const submit = page.locator('form button[type="submit"]');
  const clickPromise = submit.click();
  await requestSeen;
  await expect(submit).toBeDisabled();
  await expect(submit).toContainText('Sending');
  releaseResponse();
  await clickPromise;
  await expect(page.getByRole('status')).toContainText('received for administrator review');
});

test('access-request form displays the API rejection without creating an account', async ({ page }) => {
  await page.route('**/api/v1/public/access-requests', (route) => route.fulfill({
    status: 409,
    contentType: 'application/json',
    body: JSON.stringify({
      success: false,
      message: 'An access request for this email is already pending.',
    }),
  }));

  await page.goto('/request-access');
  await page.getByLabel('Full name').fill('QA Example');
  await page.getByLabel('Email address').fill('qa@example.invalid');
  await page.getByLabel('Organization').fill('QA Organization');
  await page.getByLabel('Job title').fill('QA Engineer');
  await page.getByLabel('Why are you requesting access?')
    .fill('A sufficiently long test request reason.');
  await page.getByRole('button', { name: /submit access request/i }).click();

  await expect(page.getByRole('alert'))
    .toContainText('An access request for this email is already pending.');
});
