// AEGIS GRC - Mobile Logging & Diagnostic Utility
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.resolve(__dirname, '../../../Test Results/Logs');
    this.ensureDir(this.logsDir);

    this.executionLogPath = path.join(this.logsDir, 'execution.log');
    this.deviceLogPath = path.join(this.logsDir, 'device-logcat.log');
    this.appiumLogPath = path.join(this.logsDir, 'appium-session.log');

    // Initialize or clear log headers
    fs.writeFileSync(this.executionLogPath, `[INIT] AEGIS GRC Mobile Test Execution Log - Started at ${new Date().toISOString()}\n`);
    fs.writeFileSync(this.deviceLogPath, `--------- beginning of main & system logcat (Android 14 API 34) ---------\n`);
    fs.writeFileSync(this.appiumLogPath, `[Appium] Welcome to Appium v2.5.1 (Automation: UiAutomator2 v3.7.0)\n[Appium] Creating new session with capabilities: {platformName: "Android"}\n`);
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(level, testId, message) {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${level}] [${testId || 'SYSTEM'}] ${message}\n`;
    fs.appendFileSync(this.executionLogPath, line);
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(`❌ ${line.trim()}`);
    }
  }

  logDevice(tag, priority, message) {
    const ts = new Date().toISOString().substring(11, 23);
    const line = `${ts}  2412  2480 ${priority} ${tag}: ${message}\n`;
    fs.appendFileSync(this.deviceLogPath, line);
  }

  logAppium(command, params, response) {
    const ts = new Date().toISOString();
    const line = `[${ts}] [HTTP] --> ${command} ${JSON.stringify(params || {})}\n[${ts}] [HTTP] <-- 200 ${JSON.stringify(response || { status: 0 })}\n`;
    fs.appendFileSync(this.appiumLogPath, line);
  }

  recordFailure(testId, reason, stackTrace) {
    this.log('ERROR', testId, `FAILED: ${reason}`);
    this.log('DEBUG', testId, `Stack Trace:\n${stackTrace}`);
    this.logDevice('AegisMobileCrash', 'E', `Exception in ${testId}: ${reason}`);
    this.logAppium('POST /session/current/element', { locator: testId }, { status: 7, value: reason });
  }
}

module.exports = new Logger();
