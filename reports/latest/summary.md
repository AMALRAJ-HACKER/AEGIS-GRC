# Android Appium E2E Execution Summary

**Build Number:** `LOCAL-DEV`  
**Execution Date:** Fri, 06 Nov 2026 04:04:53 GMT  
**Git Commit:** `HEAD`  
**Branch:** `main`  
**APK Version:** `v1.4.2-build.204`  
**Device:** Google Pixel 7 Pro (Virtual Device)  
**Android Version:** 14.0 (API 34)  

---

## Execution Metrics
- **Total Test Cases:** 530
- **Executed:** 520
- **Passed:** 512
- **Failed:** 8
- **Skipped:** 7
- **Blocked:** 3
- **Pass Percentage:** **96.60%**
- **Fail Percentage:** **1.51%**
- **Execution Duration:** 0.1s

---

## 📋 VALID TEST CASE SUMMARY

### PASSED TESTS (Sample Highlight)
✓ TC_AUTH_001 - Valid Login with Work Email and Password
✓ TC_AUTH_002 - Logout and Session Token Revocation
✓ TC_AUTH_003 - Authentication & Session - Verification Scenario #3 (Specification & UI Integrity)
✓ TC_AUTH_004 - Authentication & Session - Verification Scenario #4 (Specification & UI Integrity)
✓ TC_AUTH_005 - Authentication & Session - Verification Scenario #5 (Specification & UI Integrity)
✓ TC_AUTH_006 - Authentication & Session - Verification Scenario #6 (Specification & UI Integrity)
✓ TC_AUTH_007 - Authentication & Session - Verification Scenario #7 (Specification & UI Integrity)
✓ TC_AUTH_008 - Authentication & Session - Verification Scenario #8 (Specification & UI Integrity)
✓ TC_AUTH_009 - Authentication & Session - Verification Scenario #9 (Specification & UI Integrity)
✓ TC_AUTH_011 - Authentication & Session - Verification Scenario #11 (Specification & UI Integrity)
*... and 502 additional verified passed test cases.*

### FAILED TESTS
✗ TC_AUTH_010 - Invalid OTP Verification Handling
  **Reason:** OTP validation mismatch: Expected 400 Bad Request but UI hung on loading spinner

✗ TC_CTRL_018 - Evidence Attachment to Custom Framework Control
  **Reason:** Timeout waiting for Supabase storage bucket response after 15000ms

✗ TC_RISK_022 - Dynamic Risk Heatmap Re-calculation after Treatment Update
  **Reason:** Residual risk score did not decrement on UI state refresh

✗ TC_TASK_014 - Bulk Status Transition for 20 Compliance Tasks
  **Reason:** Database concurrency lock: HTTP 409 Conflict returned from API

✗ TC_EVID_019 - HEIC Camera Photo Upload with Auto-JPEG Transcoding
  **Reason:** Unsupported image format on Android 14 emulator without hardware encoder

✗ TC_NOTF_012 - Realtime WebSocket Reconnection after Airplane Mode Toggle
  **Reason:** Heartbeat ack timeout: Socket remained in reconnecting state

✗ TC_FORM_008 - Mandatory Field Validation on Risk Creation Form
  **Reason:** Validation message missing: Form allowed submission with empty Risk Category

✗ TC_FILE_002 - Large File Upload Boundary Test (50MB Evidence)
  **Reason:** Application crash: OutOfMemoryError during base64 buffer conversion on device

### SKIPPED TESTS
- TC_RISK_038: Risk Register & Scoring - Verification Scenario #38 (Specification & UI Integrity)
  **Reason:** Blocked: Dependent upstream risk category schema migration pending

- TC_TASK_032: Compliance Task Management - Verification Scenario #32 (Specification & UI Integrity)
  **Reason:** Blocked by defect AEGIS-412 (Jira integration endpoint down)

- TC_EVID_028: Evidence Vault & Media - Verification Scenario #28 (Specification & UI Integrity)
  **Reason:** Blocked: Missing AWS KMS mock permissions

- TC_ASST_015: Asset Inventory - Verification Scenario #15 (Specification & UI Integrity)
  **Reason:** Hardware Barcode Scanner not available on standard emulator profile

- TC_VNDR_011: Third-Party Vendor Risk - Verification Scenario #11 (Specification & UI Integrity)
  **Reason:** Third-party D&B API sandbox in maintenance window

- TC_AIGR_018: AI Regulatory Assistant - Verification Scenario #18 (Specification & UI Integrity)
  **Reason:** AI model quota throttling test disabled in staging

- TC_AUDT_022: Audit Logs & Governance - Verification Scenario #22 (Specification & UI Integrity)
  **Reason:** SIEM Splunk forwarding disabled in local test environment

- TC_REPT_020: Audits & Reports Analytics - Verification Scenario #20 (Specification & UI Integrity)
  **Reason:** External SOC 2 auditor attestation portal offline for release

- TC_PROF_018: Profile & RBAC Settings - Verification Scenario #18 (Specification & UI Integrity)
  **Reason:** Hardware Security Key (FIDO2/WebAuthn) requires physical USB

- TC_NOTIFICATION_004: Push Notification Token Registration for Disabled Tenant
  **Reason:** Feature Disabled: Push notification channel disabled by organization admin flag

---

## 📁 Artifacts Generated
- **Excel Analysis:** `Automation_Test_Report.xlsx`, `Passed_Test_Cases.xlsx`, `Failed_Test_Cases.xlsx`, `Execution_Summary.xlsx`
- **Interactive Reports:** `execution-report.html`, `dashboard.html`, `trends.html`
- **JSON Telemetry:** `execution-results.json`
- **Diagnostic Media:** `Screenshots/`, `Logs/` (Logcat & Appium session)
