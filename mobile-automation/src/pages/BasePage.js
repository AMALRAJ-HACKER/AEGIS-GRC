// AEGIS GRC - Base Page Object (UiAutomator2 Mobile Interactions)
class BasePage {
  constructor(driver, pageName) {
    this.driver = driver;
    this.pageName = pageName;
  }

  async findElement(locator) {
    if (this.driver && typeof this.driver.$ === 'function') {
      return await this.driver.$(locator);
    }
    // Simulation / headless mock element
    return {
      click: async () => true,
      setValue: async () => true,
      getText: async () => 'Sample Value',
      isDisplayed: async () => true,
    };
  }

  async tap(locator) {
    const el = await this.findElement(locator);
    await el.click();
    return true;
  }

  async fill(locator, value) {
    const el = await this.findElement(locator);
    await el.setValue(value);
    return true;
  }

  async isVisible(locator) {
    const el = await this.findElement(locator);
    return await el.isDisplayed();
  }

  async getText(locator) {
    const el = await this.findElement(locator);
    return await el.getText();
  }

  async swipeUp() {
    return true;
  }

  async swipeDown() {
    return true;
  }
}

module.exports = BasePage;
