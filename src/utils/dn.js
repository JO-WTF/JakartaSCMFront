const DN_ZERO_WIDTH_RE = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
export const DN_VALID_RE = /^[A-Z]{3,5}\d{9,15}$/;
const DN_VALID_WITH_SUFFIX_RE = /^([A-Z]{3,5}\d{9,15})B\d{2,3}$/;

export function normalizeDnSoft(raw) {
  return (raw || '').replace(DN_ZERO_WIDTH_RE, '').toUpperCase();
}

// Remove trailing "B" plus 2-3 digits if it follows a valid DN base.
export function normalizeDnWithSuffix(raw) {
  const normalized = normalizeDnSoft(raw);
  const suffixMatch = normalized.match(DN_VALID_WITH_SUFFIX_RE);
  if (suffixMatch && suffixMatch[1]) return suffixMatch[1];
  return normalized;
}

export function isValidDn(raw) {
  if (raw === undefined || raw === null) return false;
  const trimmed = normalizeDnWithSuffix(raw);
  return DN_VALID_RE.test(trimmed);
}

export { DN_ZERO_WIDTH_RE };
