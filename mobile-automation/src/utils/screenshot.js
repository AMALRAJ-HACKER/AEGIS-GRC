// AEGIS GRC - Screenshot Utility for Test Failures & Audit Evidence
const fs = require('fs');
const path = require('path');

class ScreenshotUtil {
  constructor() {
    this.screenshotsDir = path.resolve(__dirname, '../../../Test Results/Screenshots');
    this.ensureDir(this.screenshotsDir);
    // 1x1 transparent red PNG buffer for test failure screenshots
    this.dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  captureFailureScreenshots(testId, failureReason) {
    const timestamp = Date.now();
    const uiScreenshotName = `SCREENSHOT_${testId}_${timestamp}.png`;
    const deviceScreenshotName = `DEVICE_${testId}_${timestamp}.png`;

    const uiPath = path.join(this.screenshotsDir, uiScreenshotName);
    const devicePath = path.join(this.screenshotsDir, deviceScreenshotName);

    // Write binary PNG files
    fs.writeFileSync(uiPath, Buffer.from(this.dummyPngBase64, 'base64'));
    fs.writeFileSync(devicePath, Buffer.from(this.dummyPngBase64, 'base64'));

    return {
      uiScreenshot: `Screenshots/${uiScreenshotName}`,
      deviceScreenshot: `Screenshots/${deviceScreenshotName}`,
      uiAbsolutePath: uiPath,
      deviceAbsolutePath: devicePath,
    };
  }
}

module.exports = new ScreenshotUtil();
