<div align="center">

# 🛡️ AEGIS GRC

### Where Compliance Meets Intelligence

Enterprise Governance, Risk & Compliance Platform Powered by AI

![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A modern, AI-powered Governance, Risk, Compliance, Audit, and Security Management platform designed for organizations of all sizes.

</div>

---

## 📋 Overview

AEGIS GRC is a comprehensive Governance, Risk, and Compliance platform that enables organizations to manage compliance frameworks, risk assessments, audits, evidence, remediation activities, and AI-assisted compliance operations from a unified platform.

Built for:

- Chief Information Security Officers (CISOs)
- GRC Analysts
- Compliance Officers
- Auditors
- IT Administrators
- Security Teams
- Risk Managers
- Executive Leadership
- Enterprise Staff

AEGIS GRC combines compliance automation, risk intelligence, audit readiness, and AI-powered guidance into a modern enterprise SaaS experience inspired by industry-leading compliance platforms.

---

# ✨ Key Features

## 📊 Executive Dashboard

Gain complete visibility into your organization's compliance and security posture.

### Features

- Overall Compliance Score
- Framework Compliance Overview
- Risk Monitoring Dashboard
- Audit Readiness Tracking
- Evidence Coverage Metrics
- Task Management Insights
- Upcoming Compliance Deadlines
- AI-Powered Recommendations
- Organizational KPIs
- Security Activity Monitoring

---

## 🏛 Compliance Management

Manage compliance programs across multiple standards and regulations.

### Supported Frameworks

- ISO/IEC 27001:2022
- SOC 2
- NIST Cybersecurity Framework (CSF)
- Digital Personal Data Protection Act (DPDP Act 2023)
- CERT-In Directions
- RBI Cybersecurity Guidelines
- UGC Information Technology Guidelines

### Compliance Capabilities

- Framework Catalog
- Control Library
- Gap Analysis
- Compliance Assessments
- Evidence Mapping
- Remediation Tracking
- Policy Management
- Control Ownership
- Review Workflows
- Compliance Reporting

### Control Statuses

- Not Started
- In Progress
- Implemented
- Needs Review
- Non-Compliant

---

## ⚠️ Risk Management

Create, assess, track, and remediate organizational risks.

### Features

- Enterprise Risk Register
- Risk Assessment Workflows
- Risk Heat Maps
- Risk Treatment Planning
- Residual Risk Tracking
- Risk Ownership Management
- Asset Mapping
- Control Mapping
- Risk Reviews
- Risk Change History

### Risk Severity Levels

- Critical
- High
- Medium
- Low

### Risk Treatment Methods

- Mitigate
- Accept
- Transfer
- Avoid

---

## 📁 Evidence Management

Securely collect, manage, and review compliance evidence.

### Features

- Secure File Uploads
- Evidence Categorization
- Approval Workflows
- Version Control
- Evidence Expiry Tracking
- Control Associations
- Framework Mapping
- Review History
- Audit Support
- File Preview Support

### Supported Evidence Sources

- Documents
- Screenshots
- Policies
- Reports
- Audit Artifacts
- Compliance Records
- System Evidence

---

## ✅ Task & Remediation Management

Track compliance and risk actions from assignment to completion.

### Features

- Task Creation
- Task Assignment
- Priority Management
- Due Date Tracking
- Task Comments
- Activity History
- Notifications
- Progress Tracking
- Team Collaboration

### Task Statuses

- Open
- In Progress
- Completed
- Blocked
- Overdue

---

## 📝 Audit Management

Manage the complete audit lifecycle.

### Features

- Audit Planning
- Scope Definition
- Audit Scheduling
- Auditor Assignment
- Evidence Requests
- Audit Checklists
- Findings Tracking
- Corrective Action Plans
- Audit Progress Monitoring
- Audit Reporting

### Finding Severity Levels

- Critical
- Major
- Minor
- Observation

---

## 📈 Reports & Analytics

Generate actionable compliance and security insights.

### Report Types

- Compliance Posture Report
- Framework Compliance Report
- Risk Register Report
- Audit Findings Report
- Evidence Coverage Report
- Remediation Progress Report
- Task Performance Report
- Executive Summary Report

### Export Formats

- PDF
- CSV
- Excel

---

## 🤖 AI Compliance Assistant

The AEGIS AI Assistant helps compliance teams accelerate governance and compliance activities.

### AI Capabilities

- Explain Security Controls
- Identify Compliance Gaps
- Generate Remediation Plans
- Draft Policies and Procedures
- Summarize Evidence
- Prepare Audit Checklists
- Recommend Corrective Actions
- Answer Compliance Questions
- Support Audit Readiness Activities

### Example Prompts

```text
What are our top compliance gaps?

Generate an ISO 27001 audit readiness checklist.

Create a remediation plan for critical risks.

Summarize overdue compliance tasks.

Recommend controls for privileged access management.

Identify missing evidence for SOC 2 compliance.
```

### AI Security Principles

- Secure Backend Processing
- Organization-Aware Access Control
- Role-Based Authorization
- No Client-Side API Keys
- Source Attribution
- Human Review Required

---

# 🏗 Architecture

```text
┌─────────────────────────────┐
│      React Native App       │
│    Expo + TypeScript        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Supabase           │
├─────────────────────────────┤
│ Authentication              │
│ PostgreSQL Database         │
│ Row Level Security (RLS)    │
│ Storage Buckets             │
│ Edge Functions              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      AI Service Layer       │
│    Compliance Intelligence  │
└─────────────────────────────┘
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
- Security Focused
- Mobile First
- Accessibility Driven
- Simple and Modern
- Clean Information Hierarchy
- Light Theme by Default

---

## Color Palette

### Primary Colors

| Name | Hex |
|--------|--------|
| Navy Blue | #0F172A |
| Primary Blue | #2563EB |
| Light Blue | #DBEAFE |

### Status Colors

| State | Color |
|---------|---------|
| Success | #14B86E |
| Warning | #F59E0B |
| Critical | #EF4444 |
| Information | #3B82F6 |

### Neutral Colors

| Name | Hex |
|--------|--------|
| Background | #F8FAFC |
| Surface | #FFFFFF |
| Border | #E5E7EB |
| Primary Text | #0F172A |
| Secondary Text | #64748B |

---

# 🛠 Technology Stack

## Frontend

- React Native
- Expo
- TypeScript
- Expo Router

## State Management

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
- Role-Based Access Control
- Row Level Security (RLS)
- Tenant Isolation
- Secure Session Storage

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
│   ├── Risk Register
│   ├── Risk Treatment
│   ├── Risk Reviews
│   └── Risk Library
│
├── Tasks
│
├── Audits
│
├── Reports
│
├── Notifications
│
├── Team
│
├── Settings
│
└── AI Assistant
```

---

# 🔐 User Roles

| Role | Responsibilities |
|--------|--------|
| Super Admin | Full Platform Administration |
| Organization Admin | Organization Management |
| GRC Analyst | Compliance Operations |
| IT/Security Team | Security Controls and Remediation |
| Auditor | Audit Activities and Reporting |
| Management | Executive Reporting and Visibility |
| Staff | Assigned Tasks and Evidence Submission |

---

# 🗄 Database Modules

## Core Tables

- profiles
- organizations
- organization_memberships
- roles
- permissions

## Compliance

- frameworks
- framework_controls
- assessments

## Risk Management

- risks
- risk_treatments

## Evidence Management

- evidence
- evidence_versions

## Task Management

- tasks
- task_comments

## Audit Management

- audits
- audit_findings

## Platform Services

- notifications
- activity_logs
- ai_conversations

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

AI_PROVIDER=
AI_API_URL=

APP_ENV=development

**Never commit production secrets or API keys to source control.**
```

---

# 🚀 Getting Started

## Install Dependencies

```bash
npm install
```

## Start the Development Server

```bash
npx expo start
```

## Run on Android

```bash
npx expo run:android
```

## Run on iOS

```bash
npx expo run:ios
```

## Run Linting

```bash
npm run lint
```

## Run Type Checking

```bash
npm run type-check
```

## Run Tests

```bash
npm run test
```

---

# 🧪 Testing Strategy

### Unit Tests

- Risk Scoring Logic
- Compliance Calculations
- Permission Validation
- Utility Functions

### Integration Tests

- Authentication
- Authorization
- Database Operations
- API Workflows

### End-to-End Tests

- User Registration
- Organization Audit Lifecycle

---

# 🔒 Security Principles

AEGIS GRC follows a security-by-design approach.

### Security Controls

- Multi-Tenant Isolation
- Row Level Security (RLS)
- Role-Based Access Control (RBAC)
- Secure File Storage
- Audit Logging
- Activity Tracking
- Encrypted Communications
- Secure Session Management
- Backend Authorization Enforcement

### Security Guidelines

- Never expose service-role keys to the client.
- Never trust client-supplied role claims.
- Validate authorization on every backend operation.
- Store sensitive files in private storage buckets.
- Log security events without exposing confidential information.

---

# 🗺 Roadmap

### Phase 1

- Authentication
- Organization Management
- Dashboard

### Phase 2

- Compliance Frameworks
- Controls
- Evidence

### Phase 3

- Risk Management
- Task Management

### Phase 4

- Audits
- Reports
- Notifications

### Phase 5

- AI Compliance Assistant
- Advanced Analytics
- Enterprise Integrations

---

# ⚠️ Compliance Disclaimer

AEGIS GRC assists organizations in managing governance, risk, compliance, audit, and security activities.

The platform does not guarantee compliance, certification, regulatory approval, legal advice, audit success, or official accreditation.

Organizations remain responsible for validating controls, policies, evidence, risk decisions, compliance outcomes, and regulatory obligations.

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

## 🛡️ AEGIS GRC

### Where Compliance Meets Intelligence

Modern Governance • Risk Management • Compliance • Audit Readiness • AI-Powered Operations

Built for Security Teams, Compliance Professionals, and Enterprise Organizations.

</div>