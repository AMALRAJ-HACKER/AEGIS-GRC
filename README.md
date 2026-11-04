<div align="center">

# 🛡️ AEGIS GRC

### Where Compliance Meets Intelligence

Enterprise Governance, Risk & Compliance Platform powered by AI

[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)]()
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()

</div>

---

## 🚀 Overview

AEGIS GRC is a modern Governance, Risk, and Compliance (GRC) platform designed to help organizations manage compliance frameworks, cybersecurity risks, evidence, audits, remediation activities, and AI-driven compliance workflows from a single unified platform.

Built for:

- Chief Information Security Officers (CISOs)
- Compliance Teams
- GRC Analysts
- IT & Security Teams
- Auditors
- Risk Owners
- Enterprise Leadership

The platform combines compliance automation, risk intelligence, audit management, and AI-powered recommendations into a clean enterprise SaaS experience inspired by modern platforms such as Vanta, Comp AI, Drata, and Secureframe.

---

# ✨ Key Features

## 📊 Executive Dashboard

- Compliance Health Overview
- Framework Readiness Tracking
- Risk Monitoring
- Task Management
- Audit Readiness Indicators
- Evidence Coverage Metrics
- Real-time Compliance Insights
- AI Recommendations

---

## 🏛 Compliance Management

Supported Frameworks:

- ISO/IEC 27001:2022
- SOC 2
- NIST Cybersecurity Framework
- DPDP Act 2023
- CERT-In Directions
- RBI Cybersecurity Guidelines
- UGC Security Guidelines

### Capabilities

- Framework Catalog
- Control Library
- Gap Analysis
- Assessment Workflows
- Evidence Mapping
- Remediation Tracking
- Progress Monitoring

---

## ⚠️ Risk Management

### Risk Register

- Create Risks
- Risk Reviews
- Risk Ownership
- Risk Treatment Plans
- Residual Risk Tracking
- Control Linkage
- Asset Mapping

### Risk Treatment

- Mitigate
- Transfer
- Accept
- Avoid

### Severity Levels

- Critical
- High
- Medium
- Low

---

## 📁 Evidence Management

Securely store and manage compliance evidence.

Features:

- File Uploads
- Evidence Reviews
- Approval Workflows
- Expiry Tracking
- Version Management
- Secure Cloud Storage
- Control Associations

---

## ✅ Task Management

Track and manage remediation activities.

Features:

- Task Assignment
- Priorities
- Due Dates
- Comments
- Activity History
- Status Tracking
- Notifications

---

## 📝 Audit Management

Complete audit lifecycle management.

Features:

- Audit Planning
- Audit Checklists
- Findings Management
- Evidence Requests
- Corrective Actions
- Audit Reporting
- Audit History

---

## 🤖 AI Compliance Assistant

AEGIS AI Assistant helps users:

- Explain Security Controls
- Identify Compliance Gaps
- Generate Remediation Plans
- Draft Policies
- Summarize Evidence
- Prepare Audit Checklists
- Recommend Compliance Actions

Example:

```text
What are our top compliance gaps?

Create a remediation plan for critical risks.

Generate an ISO 27001 audit readiness checklist.

Summarize evidence missing for SOC 2 controls.
```

---

# 🏗 Architecture

```text
┌─────────────────────┐
│   React Native App  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│      Supabase       │
├─────────────────────┤
│ Authentication      │
│ PostgreSQL Database │
│ Storage             │
│ Edge Functions      │
│ Row Level Security  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ AI Services Layer   │
└─────────────────────┘
```

---

# 🎨 Design System

## Design Inspiration

- Vanta
- Comp AI
- Drata
- Secureframe

## Design Principles

- Enterprise First
- Mobile First
- Accessibility Focused
- Light Theme by Default
- Modern SaaS Experience
- Clean Information Hierarchy

---

## Color Palette

### Primary

| Color | Hex |
|---------|---------|
| Navy Blue | #0F172A |
| Blue | #2563EB |
| Light Blue | #DBEAFE |

---

### Status Colors

| Status | Color |
|----------|----------|
| Success | #14B86E |
| Warning | #F59E0B |
| Critical | #EF4444 |
| Info | #3B82F6 |

---

# 🛠 Technology Stack

## Mobile

- React Native
- Expo
- TypeScript
- Expo Router

## Data Layer

- TanStack Query
- React Hook Form
- Zod Validation

## Backend

- Supabase
- PostgreSQL
- Storage
- Edge Functions

## Security

- JWT Authentication
- Row Level Security (RLS)
- Secure Session Storage
- Tenant Isolation

---

# 📱 Application Modules

```text
Dashboard
│
├── Compliance
│   ├── Frameworks
│   ├── Controls
│   ├── Assessments
│   ├── Policies
│   └── Evidence
│
├── Risks
│   ├── Register
│   ├── Treatment
│   ├── Library
│   └── Reviews
│
├── Tasks
│
├── Audits
│
├── Reports
│
├── Team
│
├── Notifications
│
└── AI Assistant
```

---

# 🔐 User Roles

| Role | Access |
|--------|---------|
| Super Admin | Full Platform Access |
| Organization Admin | Organization Management |
| GRC Analyst | Compliance Operations |
| IT/Security Team | Security Controls |
| Auditor | Audit Activities |
| Management | Executive Dashboards |
| Staff | Assigned Activities |

---

# 🗄 Database Modules

### Core

- profiles
- organizations
- memberships
- roles
- permissions

### Compliance

- frameworks
- framework_controls
- assessments

### Risk

- risks
- risk_treatments

### Evidence

- evidence
- evidence_versions

### Tasks

- tasks
- task_comments

### Audits

- audits
- audit_findings

### Platform

- notifications
- activity_logs
- ai_conversations

---

# ⚙️ Environment Setup

Create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

AI_PROVIDER=
AI_API_URL=

APP_ENV=development
```

---

# 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Start Expo

```bash
npx expo start
```

### Android

```bash
npx expo run:android
```

### iOS

```bash
npx expo run:ios
```

---

# 🧪 Testing

Run Tests

```bash
npm test
```

Run Lint

```bash
npm run lint
```

Type Check

```bash
npm run type-check
```

---

# 🔒 Security

AEGIS GRC follows security-by-design principles.

### Security Features

- Role-Based Access Control
- Multi-Tenant Isolation
- Secure File Storage
- Row-Level Security
- Activity Logging
- Audit Trails
- Secure API Architecture
- Environment-Based Secrets

---

# 📈 Roadmap

### Phase 1

- Authentication
- Dashboard
- Organizations

### Phase 2

- Framework Management
- Controls
- Evidence

### Phase 3

- Risk Management
- Task Management

### Phase 4

- Audit Management
- Reports

### Phase 5

- AI Compliance Assistant
- Advanced Analytics
- Integrations

---

# ⚠ Disclaimer

AEGIS GRC assists organizations in managing governance, risk, compliance, and audit activities. The platform does not guarantee regulatory compliance, legal conformity, certification, audit success, or official approval.

Organizations remain responsible for validating controls, evidence, policies, risk treatments, and compliance outcomes.

---

<div align="center">

## 🛡️ AEGIS GRC

### Where Compliance ce Teams

</div>