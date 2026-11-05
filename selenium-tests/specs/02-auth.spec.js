// AEGIS GRC - E2E Spec: Authentication & Identity Workflows
const { By, Key } = require('selenium-webdriver');
const driverService = require('../driver');
const reporter = require('../reporters/excel-reporter');

async function run() {
  const driver = driverService.driver;

  // Scenario 1: Login Page Element Verification
  let start = Date.now();
  try {
    await driverService.get('/login');
    const emailInput = await driverService.waitFor(By.css('input[type="email"]'));
    const passwordInput = await driverService.waitFor(By.css('input[type="password"]'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    const forgotLink = await driver.findElement(By.css('a[href="/reset-password"]'));
    const signupLink = await driver.findElement(By.css('a[href="/signup"]'));

    const allPresent = emailInput && passwordInput && submitBtn && forgotLink && signupLink;

    reporter.addResult({
      id: 'AUTH-001',
      module: 'Authentication',
      scenario: 'Verify Login Form Elements & Action Controls',
      route: '/login',
      action: 'Locate email, password, submit, forgot-password, and signup links',
      expected: 'All core authentication form controls are rendered',
      actual: 'Email, password, submit button, and navigation links successfully located',
      status: allPresent ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'AUTH-001',
      module: 'Authentication',
      scenario: 'Verify Login Form Elements & Action Controls',
      route: '/login',
      action: 'Locate email, password, submit, forgot-password, and signup links',
      expected: 'All core authentication form controls are rendered',
      actual: 'Failed to locate elements',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }

  // Scenario 2: Login Form Input Interaction & Validation
  start = Date.now();
  try {
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    await emailInput.clear();
    await emailInput.sendKeys('qa.analyst@aegis-grc.internal');
    await passwordInput.clear();
    await passwordInput.sendKeys('TestSecurePass#2026');

    const emailVal = await emailInput.getAttribute('value');
    const hasPassword = (await passwordInput.getAttribute('value')).length > 0;

    reporter.addResult({
      id: 'AUTH-002',
      module: 'Authentication',
      scenario: 'Verify Login Input Handling & Data Binding',
      route: '/login',
      action: 'Fill email and password credentials',
      expected: 'Form inputs reflect entered credentials accurately',
      actual: `Email bound: "${emailVal}", Password securely filled: ${hasPassword}`,
      status: emailVal === 'qa.analyst@aegis-grc.internal' && hasPassword ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'AUTH-002',
      module: 'Authentication',
      scenario: 'Verify Login Input Handling & Data Binding',
      route: '/login',
      action: 'Fill email and password credentials',
      expected: 'Form inputs reflect entered credentials accurately',
      actual: 'Input binding failed',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }

  // Scenario 3: Verify Login Logo Navigates to Marketing Homepage
  start = Date.now();
  try {
    const logoLink = await driver.findElement(By.css('a[href="/"]'));
    await logoLink.click();
    await driver.sleep(400);

    const currentUrl = await driverService.getCurrentUrl();
    const isAtHome = !currentUrl.includes('/login');

    reporter.addResult({
      id: 'AUTH-003',
      module: 'Authentication',
      scenario: 'Verify Brand Logo Returns to Homepage',
      route: '/login',
      action: 'Click brand logo link',
      expected: 'Navigates back to marketing homepage ("/")',
      actual: `Current URL after click: ${currentUrl}`,
      status: isAtHome ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'AUTH-003',
      module: 'Authentication',
      scenario: 'Verify Brand Logo Returns to Homepage',
      route: '/login',
      action: 'Click brand logo link',
      expected: 'Navigates back to marketing homepage ("/")',
      actual: 'Navigation failed',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }

  // Scenario 4: Signup Form Multi-Step Verification
  start = Date.now();
  try {
    await driverService.get('/signup');
    const inputs = await driver.findElements(By.tagName('input'));
    const hasInputs = inputs.length >= 3;
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    const hasSignupText = bodyText.includes('workspace') || bodyText.includes('Sign') || bodyText.includes('Account');

    reporter.addResult({
      id: 'AUTH-004',
      module: 'Authentication',
      scenario: 'Verify Signup / Workspace Onboarding Form',
      route: '/signup',
      action: 'Render signup view and count input fields',
      expected: 'Signup page renders workspace registration fields',
      actual: `Found ${inputs.length} input fields. Registration context present: ${hasSignupText}`,
      status: hasInputs && hasSignupText ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'AUTH-004',
      module: 'Authentication',
      scenario: 'Verify Signup / Workspace Onboarding Form',
      route: '/signup',
      action: 'Render signup view and count input fields',
      expected: 'Signup page renders workspace registration fields',
      actual: 'Failed to render signup form',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }

  // Scenario 5: Password Reset Workflow Verification
  start = Date.now();
  try {
    await driverService.get('/reset-password');
    const emailInput = await driverService.waitFor(By.css('input[type="email"]'));
    const buttons = await driver.findElements(By.tagName('button'));
    const hasSubmitBtn = buttons.length > 0;

    reporter.addResult({
      id: 'AUTH-005',
      module: 'Authentication',
      scenario: 'Verify Password Reset Workflow Elements',
      route: '/reset-password',
      action: 'Locate reset email input and submit trigger',
      expected: 'Reset password form renders with recovery email input',
      actual: `Email input verified. Action button present: ${hasSubmitBtn}`,
      status: emailInput && hasSubmitBtn ? 'PASS' : 'FAIL',
      duration: Date.now() - start,
    });
  } catch (err) {
    reporter.addResult({
      id: 'AUTH-005',
      module: 'Authentication',
      scenario: 'Verify Password Reset Workflow Elements',
      route: '/reset-password',
      action: 'Locate reset email input and submit trigger',
      expected: 'Reset password form renders with recovery email input',
      actual: 'Reset page failed to render',
      status: 'FAIL',
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

module.exports = { run };
