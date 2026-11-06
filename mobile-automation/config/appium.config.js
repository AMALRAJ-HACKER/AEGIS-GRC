// AEGIS GRC - Appium 2.x Android Configuration
const path = require('path');

module.exports = {
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/',
    logLevel: 'info',
  },
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Pixel_7_Pro_API_34',
    'appium:platformVersion': process.env.ANDROID_VERSION || '14.0',
    'appium:app': process.env.APK_PATH || path.resolve(__dirname, '../../android/app/build/outputs/apk/release/app-release.apk'),
    'appium:appPackage': 'com.aegisgrc.mobile',
    'appium:appActivity': 'com.aegisgrc.mobile.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:uiautomator2ServerInstallTimeout': 60000,
    'appium:adbExecTimeout': 40000,
  },
  deviceInfo: {
    device: process.env.DEVICE_MODEL || 'Google Pixel 7 Pro (Virtual Device)',
    androidVersion: process.env.ANDROID_VERSION || '14.0 (API 34)',
    appVersion: process.env.APP_VERSION || 'v1.4.2-build.204',
    apkVersion: '1.4.2-release',
    screenResolution: '1440x3120 560dpi',
  },
  timeouts: {
    implicit: 10000,
    explicit: 20000,
    command: 45000,
  },
};
