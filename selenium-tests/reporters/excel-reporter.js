// AEGIS GRC - Enterprise Excel Analysis Report Generator
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const config = require('../config');

class ExcelReporter {
  constructor() {
    this.results = [];
    this.routeAnalysis = [];
    this.startTime = Date.now();
  }

  addResult(result) {
    this.results.push({
      id: result.id || `TEST-${String(this.results.length + 1).padStart(3, '0')}`,
      module: result.module || 'General',
      scenario: result.scenario || '',
      route: result.route || '',
      action: result.action || '',
      expected: result.expected || '',
      actual: result.actual || '',
      status: result.status || 'PASS',
      duration: result.duration || 0,
      error: result.error || '',
    });
  }

  addRouteAudit(audit) {
    this.routeAnalysis.push(audit);
  }

  async generateReport() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AEGIS GRC Automation Framework';
    workbook.created = new Date();

    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.status === 'PASS').length;
    const failedTests = this.results.filter((r) => r.status === 'FAIL').length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    const totalDurationSec = ((Date.now() - this.startTime) / 1000).toFixed(1);

    // =========================================================================
    // SHEET 1: Executive Dashboard & Quality KPIs
    // =========================================================================
    const summarySheet = workbook.addWorksheet('Executive Summary', {
      views: [{ showGridLines: true }],
    });

    // Brand Palette
    const NAVY_HEADER = '0F172A';
    const GOLD_ACCENT = 'D97706';
    const GREEN_PASS = '10B981';
    const RED_FAIL = 'EF4444';
    const LIGHT_BG = 'F8FAFC';

    // Title Banner
    summarySheet.mergeCells('B2:H3');
    const titleCell = summarySheet.getCell('B2');
    titleCell.value = '🛡️ AEGIS GRC — End-to-End Test Automation & Quality Report';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Subtitle
    summarySheet.mergeCells('B4:H4');
    const subCell = summarySheet.getCell('B4');
    subCell.value = `Automated Selenium E2E Suite • Generated on ${new Date().toUTCString()}`;
    subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: '334155' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // System Under Test Card
    summarySheet.getCell('B6').value = 'Test Execution Context';
    summarySheet.getCell('B6').font = { bold: true, size: 12, color: { argb: NAVY_HEADER } };

    const envInfo = [
      ['Target URL', config.baseUrl],
      ['Tested Browser', `${config.browser.toUpperCase()} (Headless: ${config.headless})`],
      ['Total Scenarios', totalTests],
      ['Total Duration', `${totalDurationSec}s`],
      ['Overall Quality Status', failedTests === 0 ? 'READY FOR PRODUCTION' : 'NEEDS REMEDIATION'],
    ];

    envInfo.forEach((row, idx) => {
      const r = 7 + idx;
      summarySheet.getCell(`B${r}`).value = row[0];
      summarySheet.getCell(`B${r}`).font = { bold: true, color: { argb: '475569' } };
      summarySheet.getCell(`C${r}`).value = row[1];
      summarySheet.getCell(`C${r}`).font = { bold: row[0] === 'Overall Quality Status', color: { argb: row[0] === 'Overall Quality Status' ? (failedTests === 0 ? GREEN_PASS : RED_FAIL) : '0F172A' } };
    });

    // KPI Cards
    const kpis = [
      { col: 'E', title: 'PASS RATE', val: `${passRate}%`, color: failedTests === 0 ? GREEN_PASS : GOLD_ACCENT },
      { col: 'F', title: 'PASSED', val: passedTests, color: GREEN_PASS },
      { col: 'G', title: 'FAILED', val: failedTests, color: failedTests === 0 ? '64748B' : RED_FAIL },
      { col: 'H', title: 'TOTAL TESTS', val: totalTests, color: NAVY_HEADER },
    ];

    kpis.forEach((kpi) => {
      summarySheet.getCell(`${kpi.col}7`).value = kpi.title;
      summarySheet.getCell(`${kpi.col}7`).font = { bold: true, size: 9, color: { argb: '64748B' } };
      summarySheet.getCell(`${kpi.col}7`).alignment = { horizontal: 'center' };

      summarySheet.getCell(`${kpi.col}8`).value = kpi.val;
      summarySheet.getCell(`${kpi.col}8`).font = { bold: true, size: 18, color: { argb: kpi.color } };
      summarySheet.getCell(`${kpi.col}8`).alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getCell(`${kpi.col}8`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BG } };
      summarySheet.getCell(`${kpi.col}8`).border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } },
      };
    });

    // Module Breakdown Table
    summarySheet.getCell('B14').value = 'Module Quality Breakdown';
    summarySheet.getCell('B14').font = { bold: true, size: 12, color: { argb: NAVY_HEADER } };

    const moduleHeaderRow = summarySheet.getRow(15);
    moduleHeaderRow.values = ['', 'Module', 'Total Scenarios', 'Passed', 'Failed', 'Pass Rate (%)', 'Avg Latency (ms)'];
    moduleHeaderRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    for (let c = 2; c <= 7; c++) {
      moduleHeaderRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
    }

    // Group by module
    const modules = [...new Set(this.results.map((r) => r.module))];
    modules.forEach((mod, idx) => {
      const modResults = this.results.filter((r) => r.module === mod);
      const modTotal = modResults.length;
      const modPass = modResults.filter((r) => r.status === 'PASS').length;
      const modFail = modResults.filter((r) => r.status === 'FAIL').length;
      const modRate = ((modPass / modTotal) * 100).toFixed(0);
      const modAvgLat = (modResults.reduce((acc, r) => acc + (r.duration || 0), 0) / modTotal).toFixed(0);

      const r = summarySheet.getRow(16 + idx);
      r.values = ['', mod, modTotal, modPass, modFail, `${modRate}%`, `${modAvgLat} ms`];
      r.getCell(6).font = { bold: true, color: { argb: modFail === 0 ? GREEN_PASS : RED_FAIL } };
      if (idx % 2 === 1) {
        for (let c = 2; c <= 7; c++) {
          r.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BG } };
        }
      }
    });

    summarySheet.columns = [
      { width: 4 },
      { width: 28 },
      { width: 26 },
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 18 },
      { width: 18 },
    ];

    // =========================================================================
    // SHEET 2: Detailed Test Execution Matrix
    // =========================================================================
    const detailSheet = workbook.addWorksheet('Test Execution Matrix', {
      views: [{ showGridLines: true }],
    });

    const headers = [
      'Test ID',
      'Module',
      'Test Scenario / Objective',
      'Target Route',
      'Action Performed',
      'Expected Outcome',
      'Actual Outcome',
      'Status',
      'Duration (ms)',
      'Error / Details',
    ];

    const hRow = detailSheet.getRow(1);
    hRow.values = headers;
    hRow.height = 26;
    hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    for (let c = 1; c <= headers.length; c++) {
      hRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
      hRow.getCell(c).alignment = { vertical: 'middle', horizontal: 'center' };
    }

    this.results.forEach((res, idx) => {
      const row = detailSheet.getRow(idx + 2);
      row.values = [
        res.id,
        res.module,
        res.scenario,
        res.route,
        res.action,
        res.expected,
        res.actual,
        res.status,
        res.duration,
        res.error || 'N/A',
      ];

      // Status Pill styling
      const statusCell = row.getCell(8);
      statusCell.alignment = { horizontal: 'center' };
      if (res.status === 'PASS') {
        statusCell.font = { bold: true, color: { argb: '065F46' } };
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
      } else {
        statusCell.font = { bold: true, color: { argb: '991B1B' } };
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
      }

      if (idx % 2 === 1) {
        for (let c = 1; c <= headers.length; c++) {
          if (c !== 8) {
            row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BG } };
          }
        }
      }
    });

    detailSheet.columns = [
      { width: 14 },
      { width: 20 },
      { width: 34 },
      { width: 18 },
      { width: 28 },
      { width: 32 },
      { width: 32 },
      { width: 12 },
      { width: 14 },
      { width: 40 },
    ];

    // =========================================================================
    // SHEET 3: Route Coverage & Latency Analysis
    // =========================================================================
    const routeSheet = workbook.addWorksheet('Route Coverage Analysis', {
      views: [{ showGridLines: true }],
    });

    const routeHeaders = [
      'Route Path',
      'Page / Feature Name',
      'Auth Required',
      'Render Status',
      'Elements Validated',
      'Initial Latency (ms)',
      'E2E Coverage',
    ];

    const rHRow = routeSheet.getRow(1);
    rHRow.values = routeHeaders;
    rHRow.height = 26;
    rHRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    for (let c = 1; c <= routeHeaders.length; c++) {
      rHRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } };
      rHRow.getCell(c).alignment = { vertical: 'middle', horizontal: 'center' };
    }

    this.routeAnalysis.forEach((audit, idx) => {
      const row = routeSheet.getRow(idx + 2);
      row.values = [
        audit.path,
        audit.name,
        audit.authRequired ? 'YES' : 'NO',
        audit.renderStatus,
        audit.elementsValidated,
        audit.latency,
        audit.coverage,
      ];

      const covCell = row.getCell(7);
      covCell.alignment = { horizontal: 'center' };
      covCell.font = { bold: true, color: { argb: '065F46' } };
      covCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };

      if (idx % 2 === 1) {
        for (let c = 1; c <= routeHeaders.length; c++) {
          if (c !== 7) {
            row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BG } };
          }
        }
      }
    });

    routeSheet.columns = [
      { width: 22 },
      { width: 30 },
      { width: 16 },
      { width: 22 },
      { width: 36 },
      { width: 20 },
      { width: 18 },
    ];

    // Write file to disk
    if (!fs.existsSync(config.reportsDir)) {
      fs.mkdirSync(config.reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `AEGIS_GRC_E2E_Test_Report_${timestamp}.xlsx`;
    const fullPath = path.join(config.reportsDir, filename);
    const latestPath = path.join(config.reportsDir, 'AEGIS_GRC_Latest_E2E_Report.xlsx');

    await workbook.xlsx.writeFile(fullPath);
    await workbook.xlsx.writeFile(latestPath);

    return { fullPath, latestPath, totalTests, passedTests, failedTests, passRate, totalDurationSec };
  }
}

module.exports = new ExcelReporter();
