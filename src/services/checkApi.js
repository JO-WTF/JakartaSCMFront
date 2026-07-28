import { getFindSgLpnUrl } from '../utils/env.js';

const normalizeApiCode = (value) => String(value ?? '').trim();

const extractApiError = (payload, fallback) => {
  if (payload?.errorMsg) return String(payload.errorMsg);
  if (payload?.message) return String(payload.message);
  if (payload?.detail) return String(payload.detail);
  return fallback;
};

const appendRequestContext = (message, { status, url } = {}) => {
  const parts = [message || 'Request failed'];
  if (status) parts.push(`status ${status}`);
  if (url) parts.push(url);
  return parts.join(' · ');
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

  const requestUrl = getFindSgLpnUrl();
  let response = null;
  try {
    response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(
      appendRequestContext(
        `Network request failed: ${err?.message || err}. Check VITE_API_BASE, backend availability, and CORS.`,
        { url: requestUrl }
      )
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (_err) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      appendRequestContext(extractApiError(payload, `HTTP ${response.status}`), {
        status: response.status,
        url: requestUrl,
      })
    );
  }

  if (normalizeApiCode(payload?.code) !== '200') {
    throw new Error(
      appendRequestContext(extractApiError(payload, `API code ${payload?.code ?? 'unknown'}`), {
        url: requestUrl,
      })
    );
  }

  if (!Array.isArray(payload?.list)) {
    return [];
  }

  return payload.list;
}
