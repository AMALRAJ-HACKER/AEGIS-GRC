// AEGIS GRC - E2E Spec: Security, RBAC & Route Guard Protection
const driverService = require('../driver');
const reporter = require('../reporters/excel-reporter');

const PROTECTED_ROUTES = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/frameworks', name: 'Frameworks Library' },
  { path: '/frameworks/add', name: 'Add Custom Framework' },
  { path: '/controls', name: 'Controls Directory' },
  { path: '/risks', name: 'Risk Register' },
  { path: '/risks/new', name: 'New Risk Assessment' },
  { path: '/tasks', name: 'Compliance Tasks' },
  { path: '/tasks/new', name: 'Task Form' },
  { path: '/evidence', name: 'Evidence Vault' },
  { path: '/evidence/upload', name: 'Upload Evidence' },
  { path: '/assets', name: 'Asset Management' },
  { path: '/vendors', name: 'Vendor Risk' },
  { path: '/ai', name: 'AI Compliance Assistant' },
  { path: '/reports', name: 'Audits & Reports' },
  { path: '/audit-log', name: 'Audit Trail' },
  { path: '/notifications', name: 'Notifications' },
  { path: '/profile', name: 'User Profile' },
  { path: '/settings', name: 'Organization Settings' },
];

async function run() {
  const driver = driverService.driver;

  for (let i = 0; i < PROTECTED_ROUTES.length; i++) {
    const route = PROTECTED_ROUTES[i];
    const testId = `SEC-${String(i + 1).padStart(3, '0')}`;
    const start = Date.now();

    try {
      await driverService.get(route.path);
      await driver.sleep(400);

      const currentUrl = await driverService.getCurrentUrl();
      const isRedirectedToLogin = currentUrl.includes('/login');

      reporter.addResult({
        id: testId,
        module: 'Security & Guards',
        scenario: `Route Guard Enforcement for ${route.name}`,
        route: route.path,
        action: `Attempt unauthorized GET ${route.path}`,
        expected: 'Access blocked by Protected guard, redirected to /login',
        actual: isRedirectedToLogin
          ? `Correctly redirected to ${currentUrl}`
          : `SECURITY LEAK: Allowed on ${currentUrl}`,
        status: isRedirectedToLogin ? 'PASS' : 'FAIL',
        duration: Date.now() - start,
      });
    } catch (err) {
      reporter.addResult({
        id: testId,
        module: 'Security & Guards',
        scenario: `Route Guard Enforcement for ${route.name}`,
        route: route.path,
        action: `Attempt unauthorized GET ${route.path}`,
        expected: 'Access blocked by Protected guard, redirected to /login',
        actual: `Error evaluating guard: ${err.message}`,
        status: 'FAIL',
        duration: Date.now() - start,
        error: err.message,
      });
    }
  }
}

module.exports = { run };
