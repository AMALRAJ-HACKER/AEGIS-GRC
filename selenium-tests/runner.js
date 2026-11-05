// AEGIS GRC - Selenium E2E Test Suite Orchestrator & Excel Report Generator
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const config = require('./config');
const driverService = require('./driver');
const reporter = require('./reporters/excel-reporter');

// Specs
const marketingSpec = require('./specs/01-marketing.spec');
const authSpec = require('./specs/02-auth.spec');
const securitySpec = require('./specs/03-security-and-route-guards.spec');
const errorSpec = require('./specs/04-not-found-and-error-handling.spec');
const routeAuditSpec = require('./specs/05-complete-route-audit.spec');

async function isServerRunning(urlStr) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port || 80,
          path: '/',
          method: 'HEAD',
          timeout: 2000,
        },
        (res) => resolve(true)
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

async function startLocalServer() {
  console.log(`🌐 Checking target server at ${config.baseUrl}...`);
  const running = await isServerRunning(config.baseUrl);
  if (running) {
    console.log(`✅ Target server is already active at ${config.baseUrl}`);
    return null;
  }

  console.log(`🚀 Starting local Vite server on port 5173 for Selenium testing...`);
  const rootDir = path.resolve(__dirname, '..');
  const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: rootDir,
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', (d) => {
    // console.log(`[vite] ${d.toString()}`);
  });

  // Wait up to 20 seconds for server to come online
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isServerRunning(config.baseUrl)) {
      console.log(`✅ Local Vite dev server successfully launched at ${config.baseUrl}`);
      return server;
    }
  }

  console.warn(`⚠️ Warning: Server did not respond within 20s. Proceeding anyway...`);
  return server;
}

async function main() {
  console.log('\n=============================================================');
  console.log('🛡️  AEGIS GRC — End-to-End Selenium Automation Suite');
  console.log('=============================================================');
  console.log(`Browser: ${config.browser.toUpperCase()} | Headless: ${config.headless} | Base URL: ${config.baseUrl}\n`);

  let serverProcess = null;
  try {
    serverProcess = await startLocalServer();

    console.log('🔧 Initializing Selenium WebDriver...');
    await driverService.initDriver();
    console.log('✅ WebDriver initialized successfully.\n');

    console.log('▶️  Running Suite 1: Marketing & Landing Pages...');
    await marketingSpec.run();

    console.log('▶️  Running Suite 2: Authentication & Identity Workflows...');
    await authSpec.run();

    console.log('▶️  Running Suite 3: Security & Route Guard Enforcement...');
    await securitySpec.run();

    console.log('▶️  Running Suite 4: 404 Handling & Responsive Testing...');
    await errorSpec.run();

    console.log('▶️  Running Suite 5: Complete 24-Route Quality & Latency Audit...');
    await routeAuditSpec.run();

    console.log('\n📊 Generating Enterprise Excel Analysis Report...');
    const reportData = await reporter.generateReport();

    console.log('\n=============================================================');
    console.log('🏁  AEGIS GRC — E2E Test Execution Summary');
    console.log('=============================================================');
    console.log(`Total Scenarios Executed : ${reportData.totalTests}`);
    console.log(`Passed Scenarios         : ${reportData.passedTests} ✅`);
    console.log(`Failed Scenarios         : ${reportData.failedTests} ${reportData.failedTests > 0 ? '❌' : ''}`);
    console.log(`Overall Pass Rate        : ${reportData.passRate}%`);
    console.log(`Total Execution Time     : ${reportData.totalDurationSec} seconds`);
    console.log(`Audited Routes           : ${config.routes.length} application routes`);
    console.log('-------------------------------------------------------------');
    console.log(`📁 Excel Report Generated:`);
    console.log(`   ${reportData.fullPath}`);
    console.log(`📁 Latest Report Symlink/Copy:`);
    console.log(`   ${reportData.latestPath}`);
    console.log('=============================================================\n');

    if (reportData.failedTests > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`❌ Critical error during E2E test execution:`, err);
    process.exitCode = 1;
  } finally {
    console.log('🧹 Cleaning up Selenium driver and processes...');
    await driverService.quit();
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
    console.log('✨ Test execution finished.\n');
  }
}

main();
