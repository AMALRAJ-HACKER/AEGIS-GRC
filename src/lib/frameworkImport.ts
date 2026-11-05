// Framework import helpers — pure, dependency-free (CSV / JSON).
// Excel users: export/save as CSV (columns below) — no runtime dependency added.
export interface ImportRow {
  framework: string; domain: string; controlId: string; controlName: string;
  description: string; evidence: string; risk: string; question: string;
}
export const IMPORT_HEADERS = ['Framework','Domain','Control ID','Control Name','Description','Evidence','Risk','Question'];
export const IMPORT_TEMPLATE = IMPORT_HEADERS.join(',') + '\nMy Company ISO Program,Governance,CTRL-001,"Access control policy",,Policy document,Unauthorized Access,"Is MFA enabled?"\n';

function splitCsvLine(line: string): string[] {
  const out: string[] = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim()); return out;
}

export function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string) => headers.findIndex((h) => h === name.toLowerCase());
  const iF = idx('Framework'), iD = idx('Domain'), iC = idx('Control ID'), iN = idx('Control Name'),
        iDe = idx('Description'), iE = idx('Evidence'), iR = idx('Risk'), iQ = idx('Question');
  if (iF < 0 || iN < 0) throw new Error('CSV must contain "Framework" and "Control Name" columns.');
  return lines.slice(1).map((line) => {
    const c = splitCsvLine(line);
    return {
      framework: (c[iF] ?? '').trim(), domain: iD >= 0 ? (c[iD] ?? '').trim() : 'General',
      controlId: iC >= 0 ? (c[iC] ?? '').trim() : '', controlName: (c[iN] ?? '').trim(),
      description: iDe >= 0 ? (c[iDe] ?? '').trim() : '', evidence: iE >= 0 ? (c[iE] ?? '').trim() : '',
      risk: iR >= 0 ? (c[iR] ?? '').trim() : '', question: iQ >= 0 ? (c[iQ] ?? '').trim() : '',
    };
  }).filter((r) => r.framework && r.controlName);
}

export function parseJson(text: string): ImportRow[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.frameworks ?? data.rows ?? [];
  if (!Array.isArray(arr)) throw new Error('JSON must be an array (or { frameworks: [...] }).');
  return arr.map((r: any) => ({
    framework: String(r.framework ?? r.name ?? '').trim(), domain: String(r.domain ?? 'General').trim(),
    controlId: String(r.controlId ?? r.control_id ?? '').trim(), controlName: String(r.controlName ?? r.title ?? r.name ?? '').trim(),
    description: String(r.description ?? ''), evidence: String(r.evidence ?? ''), risk: String(r.risk ?? ''), question: String(r.question ?? ''),
  })).filter((r: ImportRow) => r.framework && r.controlName);
}

export function groupByFramework(rows: ImportRow[]): Map<string, ImportRow[]> {
  const m = new Map<string, ImportRow[]>();
  rows.forEach((r) => { const k = r.framework; m.set(k, [...(m.get(k) ?? []), r]); });
  return m;
}

export function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}

export const STANDARD_NAMES = ['ISO 27001','SOC 2','NIST CSF','NIST 800-53','PCI DSS','GDPR','HIPAA','DPDPA','CERT-In','RBI CSF','SEBI CSCRF','DPDP'];
export function isStandardFramework(name: string): boolean {
  const n = (name ?? '').toLowerCase();
  return STANDARD_NAMES.some((s) => n.includes(s.toLowerCase()));
}
