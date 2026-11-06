// AEGIS GRC - Main Mobile Automation Orchestrator
const testSuite = require('./src/tests/test-suite');
const excelGen = require('./src/reports/excel-generator');
const htmlGen = require('./src/reports/html-generator');
const jsonSummaryGen = require('./src/reports/json-summary-generator');

async function main() {
  console.log('\n=============================================================');
  console.log('🛡️  AEGIS GRC — Android Appium E2E Automation Framework');
  console.log('=============================================================');
  console.log('Initializing test execution engine across 400+ scenarios...\n');

  try {
    const runData = await testSuite.executeTestSuite();

    console.log('\n📊 Generating Enterprise Excel Reports (7-Sheet & Auxiliary Workbooks)...');
    await excelGen.generateAutomationTestReport(runData);
    await excelGen.generateAuxiliaryWorkbooks(runData);
    console.log('✅ Excel reports generated successfully in "Test Results/Excel/".');

    console.log('\n🌐 Generating HTML Interactive Dashboards & Telemetry...');
    htmlGen.generateAllHtmlReports(runData);
    console.log('✅ HTML reports generated successfully in "Test Results/HTML/".');

    console.log('\n📑 Generating JSON & Markdown Summaries...');
    const { summaryPath, markdown } = jsonSummaryGen.generate(runData);
    console.log('✅ JSON & Summary files written in "Test Results/".\n');

    console.log('=============================================================');
    console.log(markdown);
    console.log('=============================================================');

    const passRate = parseFloat(runData.metrics.passPercentage);
    if (passRate >= 95.0) {
      console.log(`\n🎉 QUALITY GATE PASSED: ${passRate}% >= 95.0% threshold requirement.\n`);
      process.exitCode = 0;
    } else {
      console.error(`\n❌ QUALITY GATE FAILED: ${passRate}% is below 95.0% requirement.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Fatal error during test execution:', err);
    process.exitCode = 1;
  }
}

main();
