// AEGIS GRC - Selenium WebDriver Manager
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class DriverService {
  constructor() {
    this.driver = null;
  }

  async initDriver() {
    if (this.driver) return this.driver;

    const browser = config.browser;
    const builder = new Builder().forBrowser(browser);

    if (browser === 'firefox') {
      const options = new firefox.Options();
      if (config.headless) {
        options.addArguments('-headless');
      }
      options.addArguments(`--width=${config.windowSize.width}`);
      options.addArguments(`--height=${config.windowSize.height}`);
      builder.setFirefoxOptions(options);

      const localGecko = path.join(__dirname, 'bin', 'geckodriver');
      if (fs.existsSync(localGecko)) {
        const service = new firefox.ServiceBuilder(localGecko);
        builder.setFirefoxService(service);
      }
    } else {
      const options = new chrome.Options();
      if (config.headless) {
        options.addArguments('--headless=new');
      }
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments('--disable-gpu');
      options.addArguments(`--window-size=${config.windowSize.width},${config.windowSize.height}`);
      builder.setChromeOptions(options);
    }

    this.driver = await builder.build();
    await this.driver.manage().setTimeouts({
      implicit: config.timeouts.implicit,
      pageLoad: config.timeouts.pageLoad,
    });

    return this.driver;
  }

  async get(routePath) {
    const url = `${config.baseUrl.replace(/\/$/, '')}${routePath}`;
    const start = Date.now();
    await this.driver.get(url);
    const duration = Date.now() - start;
    return { url, duration };
  }

  async waitFor(locator, timeout = config.timeouts.elementWait) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForVisible(locator, timeout = config.timeouts.elementWait) {
    const el = await this.waitFor(locator, timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async click(locator, timeout = config.timeouts.elementWait) {
    const el = await this.waitForVisible(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    await el.click();
    return el;
  }

  async fill(locator, text, timeout = config.timeouts.elementWait) {
    const el = await this.waitForVisible(locator, timeout);
    await el.clear();
    await el.sendKeys(text);
    return el;
  }

  async getText(locator, timeout = config.timeouts.elementWait) {
    try {
      const el = await this.waitFor(locator, timeout);
      return await el.getText();
    } catch {
      return '';
    }
  }

  async isDisplayed(locator) {
    try {
      const el = await this.driver.findElement(locator);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async getPageTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async takeScreenshot(name) {
    try {
      const screenshotsDir = path.join(config.reportsDir, 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      const data = await this.driver.takeScreenshot();
      const filePath = path.join(screenshotsDir, `${name}_${Date.now()}.png`);
      fs.writeFileSync(filePath, data, 'base64');
      return filePath;
    } catch (err) {
      console.warn(`Failed to capture screenshot: ${err.message}`);
      return null;
    }
  }

  async quit() {
    if (this.driver) {
      try {
        await this.driver.quit();
      } catch (err) {
        // ignore shutdown error
      }
      this.driver = null;
    }
  }
}

module.exports = new DriverService();
