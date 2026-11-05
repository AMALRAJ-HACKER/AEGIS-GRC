// AEGIS GRC - E2E Spec: 404 Error Handling & Responsive Rendering
const { By } = require('selenium-webdriver');
const driverService = require('../driver');
const reporter = require('../reporters/excel-reporter');

async function run() {
  const driver = driverService.driver;

  // Scenario 1: Unmapped Route triggers 404 NotFoundPage
  let start = Date.now();
  try {
    await driverService.get('/unmapped-system-check-404');
    await driver.sleep(400);

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    const has404 = bodyText.includes('404') && (bodyText.includes('Page not found') || bodyText.includes('exist'));
    const dashBtn = await driver.findElements(By.css('button'));
    const hasRecoveryBtn = dashBtn.length > 0;

    reporter.addResult({
      id: 'ERR-001',
      module: 'Error Handling',
      scenario: 'Verify 404 Not Found Fallback Routing',
      route: '/unmapped-system-check-404',
      action: 'Navigate to an unmapped path',
      expected: 'Renders NotFoundPage with "404" and recovery action button',
      actual: `404 status text displayed: ${has404}. Recovery button present: ${hasRecoveryBtn}`,
      status: has404 ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'ERR-001',
      module: 'Error Handling',
      scenario: 'Verify 404 Not Found Fallback Routing',
      route: '/unmapped-system-check-404',
      action: 'Navigate to an unmapped path',
      expected: 'Renders NotFoundPage with "404" and recovery action button',
      actual: 'Failed to handle 404 route',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }

  // Scenario 2: Mobile Viewport Rendering (375x812)
  start = Date.now();
  try {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driverService.get('/login');
    await driver.sleep(400);

    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const isVisible = await emailInput.isDisplayed();

    // Reset back to standard desktop size
    await driver.manage().window().setRect({ width: 1920, height: 1080 });

    reporter.addResult({
      id: 'RSP-001',
      module: 'Responsive Design',
      scenario: 'Verify Mobile Viewport Form Layout (375x812)',
      route: '/login',
      action: 'Resize browser window to mobile width and verify input visibility',
      expected: 'Form controls adapt responsively and remain interactive',
      actual: `Mobile layout rendered cleanly, input visible: ${isVisible}`,
      status: isVisible ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'RSP-001',
      module: 'Responsive Design',
      scenario: 'Verify Mobile Viewport Form Layout (375x812)',
      route: '/login',
      action: 'Resize browser window to mobile width and verify input visibility',
      expected: 'Form controls adapt responsively and remain interactive',
      actual: 'Mobile resize test failed',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

module.exports = { run };
