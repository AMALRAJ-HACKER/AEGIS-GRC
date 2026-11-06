# 🛡️ AEGIS GRC — Android Appium E2E Automation Framework

An enterprise-grade Android mobile test automation framework for AEGIS GRC built with **Node.js, Appium 2.x (UiAutomator2), ExcelJS**, and automated **GitHub Pages Reporting**.

---

## 📑 Table of Contents
1. [Framework Overview](#framework-overview)
2. [Folder Structure](#folder-structure)
3. [Page Object Model (POM)](#page-object-model-pom)
4. [Test Data Framework](#test-data-framework)
5. [400+ Test Cases & Coverage](#400-test-cases--coverage)
6. [Excel Report Specifications (7 Worksheets)](#excel-report-specifications)
7. [HTML Reports & Dashboards](#html-reports--dashboards)
8. [GitHub Pages Deployment & History Archiving](#github-pages-deployment)
9. [Artifact Management (30-Day Retention)](#artifact-management)
10. [Local Execution Guide](#local-execution-guide)
11. [CI/CD Execution Guide](#cicd-execution-guide)
12. [Troubleshooting Guide](#troubleshooting-guide)
13. [Repository Configuration Guide](#repository-configuration-guide)

---

## 1. Framework Overview

- **Engine:** Appium 2.x with `UiAutomator2` Driver
- **Platform:** Android 14.0 (API 34)
- **Target App:** AEGIS GRC Mobile (`com.aegisgrc.mobile`)
- **Reporting:** 
  - 4 Excel Workbooks including 7-Sheet Master Report (`.xlsx`)
  - 3 Interactive HTML Reports (`execution-report.html`, `dashboard.html`, `trends.html`)
  - JSON Telemetry & CI Markdown Summaries
- **Quality Gate:** Automated pass/fail enforcement (Minimum **&ge; 95.0%** pass percentage)

---

## 2. Folder Structure

```
mobile-automation/
├── config/
│   └── appium.config.js               # Appium server, capabilities & device settings
├── package.json                       # Automation dependencies
├── index.js                           # Main orchestrator & quality gate checker
├── src/
│   ├── pages/                         # Page Object Model (POM)
│   │   ├── BasePage.js                # Core touch & gesture interactions
│   │   └── AppPages.js                # Login, Dashboard, Frameworks, Controls, Risks, Tasks, Evidence, Settings
│   ├── utils/
│   │   ├── test-data.js               # Multi-tenant test accounts & fixture registry
│   │   ├── logger.js                  # Device logcat, Appium logs & execution traces
│   │   └── screenshot.js              # Failure screenshots & device frames
│   ├── tests/
│   │   └── test-suite.js              # 400+ Executable Test Cases across 19 modules
│   └── reports/
│       ├── excel-generator.js         # 7-Sheet Master + Auxiliary Excel generator
│       ├── html-generator.js          # Interactive HTML reports & visual charts
│       └── json-summary-generator.js  # JSON telemetry & GitHub summary
└── README.md                          # Comprehensive documentation

Test Results/                          # Generated test deliverables
├── Excel/
│   ├── Automation_Test_Report.xlsx    # Master report (7 Worksheets)
│   ├── Passed_Test_Cases.xlsx         # Filtered passed test cases
│   ├── Failed_Test_Cases.xlsx         # Defect breakdown with stack traces
│   └── Execution_Summary.xlsx         # Executive metrics workbook
├── HTML/
│   ├── execution-report.html          # Searchable, filterable detailed execution report
│   ├── dashboard.html                 # Executive quality dashboard with SVG donut chart
│   └── trends.html                    # Multi-build historical pass rate progression
├── JSON/
│   └── execution-results.json         # Raw machine-readable test telemetry
├── Screenshots/                       # UI & device screenshot evidence
├── Logs/
│   ├── execution.log                  # Runner timeline log
│   ├── device-logcat.log              # Android logcat capture
│   └── appium-session.log             # Appium HTTP command traffic
└── Summary/
    └── summary.md                     # Markdown summary for CI/CD job summary
```

---

## 3. Page Object Model (POM)

All mobile views are abstracted into reusable Page Objects:
- **`LoginPage`**: Email/password authentication, biometric login, session persistence.
- **`DashboardPage`**: Compliance ring score, framework quick-cards, active risks carousel.
- **`FrameworksPage`**: Framework library catalog, category filter, framework activation.
- **`ControlsPage`**: Mirroring the web controls design (`MOBILE_PROMPT_CONTROLS.md`), status chips (`not_started`, `implemented`, `in_progress`, `needs_review`, `non_compliant`).
- **`RisksPage`**: Risk register, likelihood & impact score calculation, treatment tracking.
- **`TasksPage`**: Task cards, assignees, due date picker, status transitions.
- **`EvidencePage`**: Vault storage, camera snapshot, document attachment.
- **`SettingsPage`**: Profile edit, MFA configuration, RBAC permissions.

---

## 4. Test Data Framework

Located in `mobile-automation/src/utils/test-data.js`:
- Multi-role credentials: `super_admin`, `org_admin`, `grc_analyst`, `it_security`, `auditor`, `management`, `staff`.
- Regulatory standards: SOC 2 Type II, ISO 27001:2022, HIPAA Security Rule, NIST CSF 2.0, PCI-DSS v4.0, GDPR.
- Input validation matrices: Empty inputs, boundary values (50MB uploads), invalid OTPs, SQL/XSS payloads.

---

## 5. 400+ Test Cases & Coverage

The test suite contains **530 total test cases** spanning 19 functional modules:

| Module Code | Functional Domain | Total Cases |
|---|---|---|
| `AUTH` | Authentication & Biometric Sessions | 45 |
| `DASH` | Dashboard & Executive Telemetry | 35 |
| `FRWK` | Frameworks Library & Import | 50 |
| `CTRL` | Controls Directory & Assessments | 50 |
| `RISK` | Risk Register & Scoring Matrix | 45 |
| `TASK` | Compliance Tasks & Remediation | 40 |
| `EVID` | Evidence Vault & Media Attachments | 35 |
| `ASST` | Asset Inventory & Categorization | 30 |
| `VNDR` | Third-Party Vendor Risk Reviews | 30 |
| `AIGR` | AI Regulatory Assistant & Chat | 25 |
| `AUDT` | Audit Logs & Governance Trails | 25 |
| `NOTF` | Push Notifications & Realtime Sync | 20 |
| `REPT` | Compliance Reports & PDF Export | 25 |
| `PROF` | Profile & Role-Based Access Control | 25 |
| `FORM` | Forms & Mandatory Field Validations | 10 |
| `FILE` | File Upload & Buffer Boundaries | 10 |
| `SEARCH` | Global Indexing & Search Filters | 10 |
| `PROFILE` | User Profile Mutators | 10 |
| `NOTIFICATION` | Messaging Subsystem Channels | 10 |

---

## 6. Excel Report Specifications

The primary workbook **`Automation_Test_Report.xlsx`** contains **7 distinct analytical worksheets**:

1. **Sheet 1 — `Executed Test Cases`**: Complete list of executed test cases (`Test ID`, `Module`, `Test Name`, `Priority`, `Status`, `Execution Time`).
2. **Sheet 2 — `Passed Tests`**: Filtered view of all successful tests with execution durations.
3. **Sheet 3 — `Failed Tests`**: Failed test details with exact failure reasons, stack traces, and screenshot references.
4. **Sheet 4 — `Skipped Tests`**: Skipped and blocked test cases with dependency explanations.
5. **Sheet 5 — `Execution Metrics`**: Executive telemetry card with total counts, pass percentage, device information, and APK version.
6. **Sheet 6 — `Defect Summary`**: Root cause categorization (App Stability, UI/Validation, Network/Backend), severity ratings, and defect IDs.
7. **Sheet 7 — `Pass Rate Summary`**: Module-by-module compliance pass rate table against the 95% target.

Auxiliary workbooks generated:
- `Passed_Test_Cases.xlsx`
- `Failed_Test_Cases.xlsx`
- `Execution_Summary.xlsx`

---

## 7. HTML Reports & Dashboards

- **`execution-report.html`**: Complete interactive test report with real-time search, filter tabs, failure details, stack traces, and device telemetry.
- **`dashboard.html`**: Executive dashboard featuring an SVG compliance ring chart, release readiness status, and high-level KPIs.
- **`trends.html`**: Historical build progression comparing recent build runs.

---

## 8. GitHub Pages Deployment

The GitHub Actions workflow [`.github/workflows/appium-e2e-pages.yml`](file:///home/parrot/aegis-grc-web/.github/workflows/appium-e2e-pages.yml) automatically deploys reports to GitHub Pages on every push or manual dispatch.

### Directory Structure on GitHub Pages:
```
https://<github-username>.github.io/<repository-name>/
├── index.html                       # Auto-redirects to reports/latest/execution-report.html
└── reports/
    ├── latest/
    │   ├── execution-report.html    # Live latest execution report
    │   ├── dashboard.html           # Live latest executive dashboard
    │   ├── summary.md               # Live markdown summary
    │   ├── screenshots/             # Live failure screenshot captures
    │   └── logs/                    # Live logcat and Appium logs
    └── history/
        ├── build-001/               # Archived build runs
        ├── build-002/
        └── build-N/
```

### Live Report URL:
`https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`

---

## 9. Artifact Management

Every run (even if tests fail) uploads a comprehensive artifact package retained for **30 days**:
- `Automation_Test_Report.xlsx`
- `Passed_Test_Cases.xlsx`
- `Failed_Test_Cases.xlsx`
- `Execution_Summary.xlsx`
- `execution-report.html`
- `dashboard.html`
- `execution-results.json`
- `screenshots/`
- `logs/`
- `summary.md`

---

## 10. Local Execution Guide

### Prerequisites
- Node.js &ge; 18
- (Optional for live device) Appium 2.x & Android SDK with platform-tools (`adb`)

### Quick Run
```bash
# From repository root:
npm run test:mobile

# Or from mobile-automation directory:
cd mobile-automation
npm install
npm test
```

All reports will immediately populate in `Test Results/`.

---

## 11. CI/CD Execution Guide

1. Navigate to **Actions** in your GitHub repository.
2. Select **"Android Appium E2E Automation & GitHub Pages Reporting"**.
3. Click **"Run workflow"** (parameters for Device Model, Android OS, and Publish Pages can be configured).
4. Review the formatted **Job Summary** table with pass/fail metrics.
5. Download artifacts from the bottom of the run page.

---

## 12. Troubleshooting Guide

- **Appium Session Timeout:** Increase `newCommandTimeout` in `config/appium.config.js`.
- **Permission Denied for Logcat:** Ensure `appium:autoGrantPermissions` is set to `true`.
- **Pass Rate Below 95%:** Inspect `Test Results/Excel/Failed_Test_Cases.xlsx` or `Test Results/HTML/execution-report.html` to review failure reasons and stack traces.

---

## 13. Repository Configuration Guide

To enable live GitHub Pages hosting:
1. In your GitHub repository, go to **Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**, select **"Deploy from a branch"**.
3. Choose the branch **`gh-pages`** and folder **`/ (root)`**.
4. Click **Save**.
5. After the first workflow run completes, your live reports will be available at:
   `https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`
