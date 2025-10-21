import { getApiBase, getImageBaseUrl } from './env.js';

const IMAGE_BASE = getImageBaseUrl();
const API_BASE_FALLBACK = getApiBase();

const normalizeBase = (base) => {
  if (!base) return '';
  return String(base).replace(/\/+$/, '');
};

const FALLBACK_BASE = normalizeBase(IMAGE_BASE) || normalizeBase(API_BASE_FALLBACK);

export const resolvePhotoUrl = (value) => {
  if (value === null || value === undefined) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!FALLBACK_BASE) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${FALLBACK_BASE}${path}`;
};
