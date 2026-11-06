/**
 * AEGIS GRC — File Upload Security & Integrity Validation
 * Mitigates SEC-03 (Unrestricted File Upload & Stored XSS)
 * Conforms to OWASP A04:2021 & CWE-434
 */

export const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
  'text/csv',
]);

export const DANGEROUS_EXTENSIONS = new Set([
  '.svg',
  '.html',
  '.htm',
  '.xhtml',
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.js',
  '.mjs',
  '.php',
  '.py',
  '.pl',
  '.cgi',
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file size, mime-type, and extension safety before uploading to Supabase Storage.
 */
export function validateEvidenceFile(file: { name: string; size?: number; mimeType?: string }): ValidationResult {
  const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  // 1. Size constraint
  if (file.size && file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds the 25 MB maximum upload limit.' };
  }

  // 2. Prohibited dangerous extensions
  const nameParts = file.name.split('.');
  const ext = ('.' + (nameParts.pop() || '')).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Files with extension "${ext}" are prohibited for security and compliance reasons. Allowed types: PDF, PNG, JPG, DOCX, XLSX, CSV, TXT.`,
    };
  }

  // 3. MIME type whitelist check (if mimeType provided)
  if (file.mimeType && !ALLOWED_EVIDENCE_MIME_TYPES.has(file.mimeType)) {
    return {
      valid: false,
      error: `Disallowed MIME type "${file.mimeType}". Please upload standard audit artifacts (PDF, PNG, JPG, Office Documents).`,
    };
  }

  return { valid: true };
}
