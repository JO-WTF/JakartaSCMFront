import { getFindSgLpnUrl } from '../utils/env.js';

const normalizeApiCode = (value) => String(value ?? '').trim();

const extractApiError = (payload, fallback) => {
  if (payload?.errorMsg) return String(payload.errorMsg);
  if (payload?.message) return String(payload.message);
  if (payload?.detail) return String(payload.detail);
  return fallback;
};

export async function findSgLpnInfos(orderNumber, options = {}) {
  const trimmedOrderNumber = String(orderNumber || '').trim();
  if (!trimmedOrderNumber) {
    throw new Error('order_number is required');
  }

  const body = {
    order_number: trimmedOrderNumber,
    pageSize: Number(options.pageSize || 1000),
    pageNum: Number(options.pageNum || 1),
  };

  const response = await fetch(getFindSgLpnUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_err) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(extractApiError(payload, `HTTP ${response.status}`));
  }

  if (normalizeApiCode(payload?.code) !== '200') {
    throw new Error(extractApiError(payload, `API code ${payload?.code ?? 'unknown'}`));
  }

  if (!Array.isArray(payload?.list)) {
    return [];
  }

  return payload.list;
}
