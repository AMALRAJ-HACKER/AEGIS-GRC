// AEGIS GRC - Complete Mobile Page Object Model (POM) Suite
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver, 'LoginPage');
    this.locators = {
      emailInput: '//android.widget.EditText[@content-desc="input-email"]',
      passwordInput: '//android.widget.EditText[@content-desc="input-password"]',
      signInBtn: '//android.widget.Button[@content-desc="btn-sign-in"]',
      biometricPrompt: '//android.widget.Button[@content-desc="btn-biometric"]',
      forgotPasswordLink: '//android.widget.TextView[@content-desc="link-forgot-password"]',
      errorMessage: '//android.widget.TextView[@content-desc="txt-auth-error"]',
    };
  }

  async login(email, password) {
    await this.fill(this.locators.emailInput, email);
    await this.fill(this.locators.passwordInput, password);
    await this.tap(this.locators.signInBtn);
  }
}

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver, 'DashboardPage');
    this.locators = {
      headerLogo: '//android.widget.ImageView[@content-desc="img-aegis-logo"]',
      complianceRing: '//android.view.View[@content-desc="chart-compliance-ring"]',
      scoreText: '//android.widget.TextView[@content-desc="txt-compliance-score"]',
      frameworksCarousel: '//android.widget.HorizontalScrollView[@content-desc="carousel-frameworks"]',
      quickNavRisks: '//android.view.View[@content-desc="card-risks-overview"]',
      quickNavTasks: '//android.view.View[@content-desc="card-tasks-overview"]',
    };
  }
}

class FrameworksPage extends BasePage {
  constructor(driver) {
    super(driver, 'FrameworksPage');
    this.locators = {
      catalogTitle: '//android.widget.TextView[@text="Framework Library"]',
      searchInput: '//android.widget.EditText[@content-desc="input-search-frameworks"]',
      filterCategory: '//android.widget.Spinner[@content-desc="spinner-category"]',
      frameworkCard: (code) => `//android.view.View[@content-desc="card-framework-${code}"]`,
      activateBtn: '//android.widget.Button[@content-desc="btn-activate-framework"]',
    };
  }
}

class ControlsPage extends BasePage {
  constructor(driver) {
    super(driver, 'ControlsPage');
    this.locators = {
      pageTitle: '//android.widget.TextView[@text="Controls"]',
      searchInput: '//android.widget.EditText[@content-desc="input-search-controls"]',
      statusTabs: '//android.widget.HorizontalScrollView[@content-desc="tabs-control-status"]',
      controlItem: (id) => `//android.view.View[@content-desc="item-control-${id}"]`,
      statusChip: '//android.widget.TextView[@content-desc="chip-status"]',
    };
  }
}

class RisksPage extends BasePage {
  constructor(driver) {
    super(driver, 'RisksPage');
    this.locators = {
      riskList: '//android.widget.ScrollView[@content-desc="list-risks"]',
      addRiskFab: '//android.widget.Button[@content-desc="fab-add-risk"]',
      titleInput: '//android.widget.EditText[@content-desc="input-risk-title"]',
      likelihoodSelect: '//android.widget.Spinner[@content-desc="select-likelihood"]',
      impactSelect: '//android.widget.Spinner[@content-desc="select-impact"]',
      saveRiskBtn: '//android.widget.Button[@content-desc="btn-save-risk"]',
    };
  }
}

class TasksPage extends BasePage {
  constructor(driver) {
    super(driver, 'TasksPage');
    this.locators = {
      taskList: '//android.widget.ScrollView[@content-desc="list-tasks"]',
      createTaskBtn: '//android.widget.Button[@content-desc="btn-new-task"]',
      taskItem: (id) => `//android.view.View[@content-desc="item-task-${id}"]`,
      statusDropdown: '//android.widget.Spinner[@content-desc="select-task-status"]',
    };
  }
}

class EvidencePage extends BasePage {
  constructor(driver) {
    super(driver, 'EvidencePage');
    this.locators = {
      vaultGrid: '//android.widget.GridView[@content-desc="grid-evidence"]',
      uploadBtn: '//android.widget.Button[@content-desc="btn-upload-evidence"]',
      cameraTrigger: '//android.widget.Button[@content-desc="btn-take-photo"]',
      documentPicker: '//android.widget.Button[@content-desc="btn-pick-document"]',
    };
  }
}

class SettingsPage extends BasePage {
  constructor(driver) {
    super(driver, 'SettingsPage');
    this.locators = {
      profileCard: '//android.view.View[@content-desc="card-user-profile"]',
      roleBadge: '//android.widget.TextView[@content-desc="badge-user-role"]',
      mfaToggle: '//android.widget.Switch[@content-desc="switch-mfa"]',
      logoutBtn: '//android.widget.Button[@content-desc="btn-logout"]',
    };
  }
}

module.exports = {
  LoginPage,
  DashboardPage,
  FrameworksPage,
  ControlsPage,
  RisksPage,
  TasksPage,
  EvidencePage,
  SettingsPage,
};
