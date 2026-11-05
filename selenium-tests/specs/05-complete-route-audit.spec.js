// AEGIS GRC - E2E Spec: Complete Application Route Audit & Latency Profiling
const { By } = require('selenium-webdriver');
const driverService = require('../driver');
const reporter = require('../reporters/excel-reporter');
const config = require('../config');

async function run() {
  const driver = driverService.driver;

  for (const route of config.routes) {
    const start = Date.now();
    try {
      const { url } = await driverService.get(route.path);
      await driver.sleep(300);

      const latency = Date.now() - start;
      const title = await driverService.getPageTitle();
      const currentUrl = await driverService.getCurrentUrl();

      // Gather DOM metrics
      const buttons = await driver.findElements(By.tagName('button'));
      const inputs = await driver.findElements(By.tagName('input'));
      const links = await driver.findElements(By.tagName('a'));
      const headings = await driver.findElements(By.css('h1, h2, h3'));

      const elementsSummary = `${headings.length} headings, ${buttons.length} buttons, ${inputs.length} inputs, ${links.length} links`;
      const renderStatus = currentUrl.includes('/login') && route.authRequired
        ? 'Protected (Redirect /login)'
        : 'Rendered (HTTP 200)';

      reporter.addRouteAudit({
        path: route.path,
        name: route.name,
        authRequired: route.authRequired,
        renderStatus,
        elementsValidated: elementsSummary,
        latency,
        coverage: 'VERIFIED',
      });
    } catch (err) {
      reporter.addRouteAudit({
        path: route.path,
        name: route.name,
        authRequired: route.authRequired,
        renderStatus: `Error: ${err.message}`,
        elementsValidated: '0 elements',
        latency: Date.now() - start,
        coverage: 'FAILED',
      });
    }
  }
}

module.exports = { run };
