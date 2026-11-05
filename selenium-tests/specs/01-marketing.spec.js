// AEGIS GRC - E2E Spec: Marketing & Public Pages
const { By } = require('selenium-webdriver');
const driverService = require('../driver');
const reporter = require('../reporters/excel-reporter');

async function run() {
  const driver = driverService.driver;

  // Scenario 1: Load Homepage
  let start = Date.now();
  try {
    const nav = await driverService.get('/');
    const title = await driverService.getPageTitle();
    const hasAegisText = (await driver.getPageSource()).includes('AEGIS');

    reporter.addResult({
      id: 'MKT-001',
      module: 'Marketing',
      scenario: 'Verify Homepage Loading & Brand Title',
      route: '/',
      action: 'GET /',
      expected: 'Page loads with AEGIS branding',
      actual: `Loaded in ${nav.duration}ms. Title: "${title}". Brand text present: ${hasAegisText}`,
      status: hasAegisText ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'MKT-001',
      module: 'Marketing',
      scenario: 'Verify Homepage Loading & Brand Title',
      route: '/',
      action: 'GET /',
      expected: 'Page loads with AEGIS branding',
      actual: 'Failed to load',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }

  // Scenario 2: Verify Hero CTA & Navigation Elements
  start = Date.now();
  try {
    const pageSource = await driver.getPageSource();
    const hasComplianceText = pageSource.includes('Compliance') || pageSource.includes('Governance');
    const links = await driver.findElements(By.tagName('a'));
    const linkCount = links.length;

    reporter.addResult({
      id: 'MKT-002',
      module: 'Marketing',
      scenario: 'Verify Core Value Proposition & Navigation Links',
      route: '/',
      action: 'Inspect DOM headers and navigation links',
      expected: 'Compliance value proposition and navigation links found',
      actual: `Found ${linkCount} links. Compliance messaging verified: ${hasComplianceText}`,
      status: hasComplianceText && linkCount > 0 ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'MKT-002',
      module: 'Marketing',
      scenario: 'Verify Core Value Proposition & Navigation Links',
      route: '/',
      action: 'Inspect DOM headers and navigation links',
      expected: 'Compliance value proposition and navigation links found',
      actual: 'Failed to inspect links',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }

  // Scenario 3: Navigate from Landing to Login via CTA
  start = Date.now();
  try {
    const loginLinks = await driver.findElements(By.css('a[href="/login"]'));
    let clicked = false;
    if (loginLinks.length > 0) {
      await loginLinks[0].click();
      await driver.sleep(500);
      clicked = true;
    }
    const currentUrl = await driverService.getCurrentUrl();
    const onLogin = currentUrl.includes('/login');

    reporter.addResult({
      id: 'MKT-003',
      module: 'Marketing',
      scenario: 'Verify Navigation from Landing CTA to Login Page',
      route: '/',
      action: 'Click "Sign In" link / CTA',
      expected: 'User redirected to /login route',
      actual: `Redirected to ${currentUrl} (Link clicked: ${clicked})`,
      status: onLogin ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'MKT-003',
      module: 'Marketing',
      scenario: 'Verify Navigation from Landing CTA to Login Page',
      route: '/',
      action: 'Click "Sign In" link / CTA',
      expected: 'User redirected to /login route',
      actual: 'Navigation failed',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

module.exports = { run };
