// AEGIS GRC - JSON & Markdown Summary Generator for CI/CD and GitHub Actions
const fs = require('fs');
const path = require('path');
const appiumConfig = require('../../config/appium.config');

class JsonSummaryGenerator {
  constructor() {
    this.jsonDir = path.resolve(__dirname, '../../../Test Results/JSON');
    this.summaryDir = path.resolve(__dirname, '../../../Test Results/Summary');

    if (!fs.existsSync(this.jsonDir)) fs.mkdirSync(this.jsonDir, { recursive: true });
    if (!fs.existsSync(this.summaryDir)) fs.mkdirSync(this.summaryDir, { recursive: true });
  }

  generate(runData) {
    const { tests, metrics } = runData;

    // 1. JSON Export
    const jsonPath = path.join(this.jsonDir, 'execution-results.json');
    const jsonPayload = {
      project: 'AEGIS GRC Mobile',
      timestamp: metrics.timestamp,
      deviceInfo: appiumConfig.deviceInfo,
      capabilities: appiumConfig.capabilities,
      metrics,
      tests,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2));

    // 2. Markdown Summary (summary.md) for GitHub Step Summary & Documentation
    const passedList = tests.filter((t) => t.status === 'Passed');
    const failedList = tests.filter((t) => t.status === 'Failed');
    const skippedList = tests.filter((t) => t.status === 'Skipped' || t.status === 'Blocked');

    const markdown = `# Android Appium E2E Execution Summary

**Build Number:** \`${process.env.GITHUB_RUN_NUMBER || 'LOCAL-DEV'}\`  
**Execution Date:** ${new Date(metrics.timestamp).toUTCString()}  
**Git Commit:** \`${process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 8) : 'HEAD'}\`  
**Branch:** \`${process.env.GITHUB_REF_NAME || 'main'}\`  
**APK Version:** \`${appiumConfig.deviceInfo.appVersion}\`  
**Device:** ${appiumConfig.deviceInfo.device}  
**Android Version:** ${appiumConfig.deviceInfo.androidVersion}  

---

## Execution Metrics
- **Total Test Cases:** ${metrics.total}
- **Executed:** ${metrics.executed}
- **Passed:** ${metrics.passed}
- **Failed:** ${metrics.failed}
- **Skipped:** ${metrics.skipped}
- **Blocked:** ${metrics.blocked}
- **Pass Percentage:** **${metrics.passPercentage}%**
- **Fail Percentage:** **${metrics.failPercentage}%**
- **Execution Duration:** ${metrics.durationSec}

---

## 📋 VALID TEST CASE SUMMARY

### PASSED TESTS (Sample Highlight)
${passedList.slice(0, 10).map((t) => `✓ ${t.id} - ${t.name}`).join('\n')}
*... and ${passedList.length - 10} additional verified passed test cases.*

### FAILED TESTS
${failedList.map((t) => `✗ ${t.id} - ${t.name}\n  **Reason:** ${t.failureReason}`).join('\n\n')}

### SKIPPED TESTS
${skippedList.map((t) => `- ${t.id}: ${t.name}\n  **Reason:** ${t.skipReason}`).join('\n\n')}

---

## 📁 Artifacts Generated
- **Excel Analysis:** \`Automation_Test_Report.xlsx\`, \`Passed_Test_Cases.xlsx\`, \`Failed_Test_Cases.xlsx\`, \`Execution_Summary.xlsx\`
- **Interactive Reports:** \`execution-report.html\`, \`dashboard.html\`, \`trends.html\`
- **JSON Telemetry:** \`execution-results.json\`
- **Diagnostic Media:** \`Screenshots/\`, \`Logs/\` (Logcat & Appium session)
`;

    const summaryPath = path.join(this.summaryDir, 'summary.md');
    fs.writeFileSync(summaryPath, markdown);
    return { jsonPath, summaryPath, markdown };
  }
}

module.exports = new JsonSummaryGenerator();
