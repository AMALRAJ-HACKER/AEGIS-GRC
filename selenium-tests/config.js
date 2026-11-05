// AEGIS GRC - Selenium E2E Testing Configuration
const path = require('path');

module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  browser: (process.env.BROWSER || 'firefox').toLowerCase(),
  headless: process.env.HEADLESS !== 'false', // default to headless
  windowSize: { width: 1920, height: 1080 },
  timeouts: {
    implicit: 5000,
    pageLoad: 30000,
    elementWait: 8000,
  },
  reportsDir: path.join(__dirname, 'reports'),
  routes: [
    { path: '/', name: 'Marketing Homepage', authRequired: false },
    { path: '/login', name: 'Authentication - Login', authRequired: false },
    { path: '/signup', name: 'Authentication - Signup', authRequired: false },
    { path: '/reset-password', name: 'Authentication - Reset Password', authRequired: false },
    { path: '/verify', name: 'Authentication - Verify', authRequired: false },
    { path: '/dashboard', name: 'Main Dashboard', authRequired: true },
    { path: '/frameworks', name: 'Frameworks Library', authRequired: true },
    { path: '/frameworks/add', name: 'Add Framework Wizard', authRequired: true },
    { path: '/controls', name: 'Controls Directory', authRequired: true },
    { path: '/risks', name: 'Risk Register', authRequired: true },
    { path: '/risks/new', name: 'New Risk Assessment', authRequired: true },
    { path: '/tasks', name: 'Compliance Tasks', authRequired: true },
    { path: '/tasks/new', name: 'Create Task Form', authRequired: true },
    { path: '/evidence', name: 'Evidence Vault', authRequired: true },
    { path: '/evidence/upload', name: 'Upload Evidence', authRequired: true },
    { path: '/assets', name: 'Asset Management', authRequired: true },
    { path: '/vendors', name: 'Vendor Risk Management', authRequired: true },
    { path: '/ai', name: 'AI Compliance Assistant', authRequired: true },
    { path: '/reports', name: 'Compliance Reports & Analytics', authRequired: true },
    { path: '/audit-log', name: 'System Audit Trail', authRequired: true },
    { path: '/notifications', name: 'Notifications Center', authRequired: true },
    { path: '/profile', name: 'User Profile', authRequired: true },
    { path: '/settings', name: 'Organization Settings', authRequired: true },
    { path: '/non-existent-fallback-404', name: '404 Fallback Page', authRequired: false },
  ],
};
