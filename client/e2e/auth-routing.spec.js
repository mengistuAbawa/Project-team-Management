import { expect, test } from '@playwright/test';

const roles = [
  {
    role: 'system_admin',
    dashboard: 'Administrator dashboard',
    visible: ['Projects', 'Teams', 'Users', 'Public requests', 'Activity'],
    hidden: [],
  },
  {
    role: 'project_manager',
    dashboard: 'Project manager dashboard',
    visible: ['Projects', 'Teams', 'Activity'],
    hidden: ['Users', 'Public requests'],
  },
  {
    role: 'team_leader',
    dashboard: 'Team leader dashboard',
    visible: ['Projects', 'Teams', 'Tasks', 'Reviews'],
    hidden: ['Users', 'Public requests'],
  },
  {
    role: 'team_member',
    dashboard: 'My workspace',
    visible: ['Projects', 'Tasks', 'Messages'],
    hidden: ['Teams', 'Reviews', 'Users'],
  },
  {
    role: 'client',
    dashboard: 'Client portal',
    visible: ['Projects', 'Tasks', 'Messages'],
    hidden: ['Teams', 'Reviews', 'Users'],
  },
  {
    role: 'qa_reviewer',
    dashboard: 'Quality assurance dashboard',
    visible: ['Tasks', 'Reviews', 'Reports'],
    hidden: ['Projects', 'Teams', 'Users'],
  },
];

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/api/v1/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: [] }),
  }));
});

for (const { role, dashboard, visible, hidden } of roles) {
  test(`${role} reaches the correct dashboard and sees only its navigation`, async ({ page }) => {
    await page.addInitScript(({ userRole }) => {
      sessionStorage.setItem('ptms_access_token', 'e2e-placeholder-token');
      sessionStorage.setItem('ptms_auth_user', JSON.stringify({
        id: 'e2e-user',
        full_name: 'QA Role',
        name: 'QA Role',
        email: 'qa@example.invalid',
        role: userRole,
      }));
    }, { userRole: role });

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: dashboard })).toBeVisible();
    const navigation = page.getByRole('navigation', { name: 'Dashboard navigation' });
    for (const label of visible) {
      await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    for (const label of hidden) {
      await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveCount(0);
    }
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const horizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(horizontalOverflow, `${role} dashboard at ${width}px`).toBeLessThanOrEqual(1);
    }
  });
}

test('protected routes redirect unauthenticated users and reject unauthorized frontend roles', async ({ page }) => {
  await page.goto('/projects');
  await expect(page).toHaveURL(/\/login$/);

  await page.addInitScript(() => {
    sessionStorage.setItem('ptms_access_token', 'e2e-placeholder-token');
    sessionStorage.setItem('ptms_auth_user', JSON.stringify({
      id: 'e2e-client',
      full_name: 'QA Client',
      name: 'QA Client',
      email: 'client@example.invalid',
      role: 'client',
    }));
  });
  await page.goto('/users');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Client portal' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Client portal' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('link', { name: 'Accept invitation' })).toBeVisible();
});

test('project modal supports Escape, focus trapping, and focus restoration', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('ptms_access_token', 'e2e-placeholder-token');
    sessionStorage.setItem('ptms_auth_user', JSON.stringify({
      id: 'e2e-admin',
      full_name: 'QA Admin',
      name: 'QA Admin',
      email: 'admin@example.invalid',
      role: 'system_admin',
    }));
  });

  await page.goto('/projects');
  const openButton = page.getByRole('button', { name: 'New project' });
  await openButton.click();
  const dialog = page.getByRole('dialog', { name: 'Create project' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Create project' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(openButton).toBeFocused();
});
