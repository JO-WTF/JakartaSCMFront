<template>
  <main class="check-result-page">
    <header class="result-header">
      <div>
        <h1>Check Result</h1>
        <p>Delivery list check records</p>
      </div>
      <div class="result-filters">
        <a-date-picker
          v-model:value="selectedDate"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          :allow-clear="false"
          :disabled="loading"
        />
        <a-input
          v-model:value="dnFilter"
          class="dn-filter-input"
          allow-clear
          placeholder="DN Number"
          :disabled="loading"
          @press-enter="applyFilters"
        />
        <a-button type="primary" :loading="loading" @click="applyFilters">Search</a-button>
        <a-button :disabled="loading || (!dnFilter && !appliedDnFilter)" @click="resetFilters">Reset</a-button>
      </div>
    </header>

    <a-alert
      v-if="error"
      class="result-alert"
      type="error"
      :message="error"
      show-icon
      closable
      @close="error = ''"
    />

    <section class="summary-strip">
      <div>
        <span class="summary-label">Date</span>
        <strong>{{ selectedDate }}</strong>
      </div>
      <div>
        <span class="summary-label">Records</span>
        <strong>{{ total }}</strong>
      </div>
      <div>
        <span class="summary-label">Completed</span>
        <strong>{{ completedCount }}</strong>
      </div>
      <div>
        <span class="summary-label">DN Filter</span>
        <strong>{{ appliedDnFilter || '-' }}</strong>
      </div>
      <div>
        <span class="summary-label">Last Refresh</span>
        <strong>{{ lastRefreshText || '-' }}</strong>
      </div>
    </section>

    <section class="desktop-table">
      <a-table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :row-class-name="resolveRowClassName"
        size="middle"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'dn_number'">
            <button class="link-button" type="button" @click="openDetail(record)">
              {{ record.dn_number || '-' }}
            </button>
          </template>
          <template v-else-if="column.key === 'progress'">
            <span class="progress-text">{{ record.checked_count || 0 }}/{{ record.box_count || 0 }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <span :class="['status-pill', normalizeStatus(record.status)]">{{ record.status || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="row-actions">
              <a-button size="small" @click="openDetail(record)">View</a-button>
              <a-button size="small" :loading="printLoadingId === record.id" @click="printRecord(record)">Print</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </section>

    <section class="mobile-list">
      <a-spin :spinning="loading">
        <article
          v-for="item in items"
          :key="item.id"
          :class="['result-card', { refreshed: isHighlighted(item) }]"
          @click="openDetail(item)"
        >
          <div class="card-top">
            <strong>{{ item.dn_number || '-' }}</strong>
            <span :class="['status-pill', normalizeStatus(item.status)]">{{ item.status || '-' }}</span>
          </div>
          <dl>
            <div>
              <dt>LSP</dt>
              <dd>{{ item.lsp || '-' }}</dd>
            </div>
            <div>
              <dt>Checker</dt>
              <dd>{{ item.checker_name || '-' }}</dd>
            </div>
            <div>
              <dt>Progress</dt>
              <dd>{{ item.checked_count || 0 }}/{{ item.box_count || 0 }}</dd>
            </div>
            <div>
              <dt>Check Time</dt>
              <dd>{{ item.check_time || '-' }}</dd>
            </div>
          </dl>
          <div class="card-actions">
            <a-button size="small" :loading="printLoadingId === item.id" @click.stop="printRecord(item)">Print</a-button>
          </div>
        </article>
        <div v-if="!loading && !items.length" class="empty-state">No check result records</div>
      </a-spin>
    </section>

    <div v-if="items.length" class="mobile-pager">
      <a-button :disabled="loading || page <= 1" @click="goPage(page - 1)">Previous</a-button>
      <span>{{ page }} / {{ totalPages }}</span>
      <a-button :disabled="loading || page >= totalPages" @click="goPage(page + 1)">Next</a-button>
    </div>

    <a-modal
      v-model:open="detailOpen"
      title="Check Result Detail"
      :footer="null"
      width="1200px"
      class="check-detail-modal"
      wrap-class-name="check-detail-modal-wrap"
    >
      <a-spin :spinning="detailLoading">
        <template v-if="detail">
          <div class="detail-actions">
            <a-button type="primary" :loading="pdfExporting" @click="exportDetailPdf">Export PDF</a-button>
          </div>
          <section class="detail-grid">
            <div v-for="field in detailFields" :key="field.key" class="detail-field">
              <span>{{ field.label }}</span>
              <strong>{{ field.value || '-' }}</strong>
            </div>
          </section>

          <section class="box-section">
            <h2>Boxes</h2>
            <div class="box-table-wrap">
              <table class="box-table">
                <thead>
                  <tr>
                    <th>Box No.</th>
                    <th>Item No.</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Checked At</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(box, index) in detailBoxes" :key="`${box.boxNo || box.box_no || 'box'}-${index}`">
                    <td>{{ box.boxNo || box.box_no || '-' }}</td>
                    <td>{{ box.itemNo || box.item_no || '-' }}</td>
                    <td>{{ box.itemDescEn || box.item_desc_en || '-' }}</td>
                    <td>{{ box.qty || '-' }}</td>
                    <td>{{ box.status || '-' }}</td>
                    <td>{{ box.checkedAt || box.checked_at || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!detailBoxes.length" class="empty-state compact">No box details</div>
            </div>
          </section>
        </template>
      </a-spin>
    </a-modal>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getApiBase } from '../utils/env.js';

const API_BASE = getApiBase().replace(/\/+$/, '');
const AUTO_REFRESH_MS = 15000;
const HIGHLIGHT_MS = 9000;
const DN_FILTER_DEBOUNCE_MS = 400;

const loading = ref(false);
const detailLoading = ref(false);
const error = ref('');
const items = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const selectedDate = ref(formatJakartaDate(new Date()));
const dnFilter = ref('');
const appliedDnFilter = ref('');
const detailOpen = ref(false);
const detail = ref(null);
const pdfExporting = ref(false);
const printLoadingId = ref(null);
const highlightedKeys = ref(new Set());
const lastRefreshText = ref('');

let lastListSignature = '';
let highlightTimer = null;
let autoRefreshTimer = null;
let dnFilterTimer = null;

const columns = [
  { title: 'DN Number', dataIndex: 'dn_number', key: 'dn_number', width: 170 },
  { title: 'LSP', dataIndex: 'lsp', key: 'lsp', width: 140 },
  { title: 'Checker', dataIndex: 'checker_name', key: 'checker_name', width: 140 },
  { title: 'Check Time', dataIndex: 'check_time', key: 'check_time', width: 180 },
  { title: 'Progress', key: 'progress', width: 110 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
  { title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 190 },
  { title: 'Action', key: 'action', width: 150, fixed: 'right' },
];

const pagination = computed(() => ({
  current: page.value,
  pageSize: pageSize.value,
  total: total.value,
  showSizeChanger: true,
  showTotal: (value) => `Total ${value}`,
}));

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
const completedCount = computed(() => items.value.filter((item) => normalizeStatus(item.status) === 'completed').length);
const detailBoxes = computed(() => Array.isArray(detail.value?.boxes) ? detail.value.boxes : []);
const detailFields = computed(() => {
  const item = detail.value || {};
  return [
    { key: 'report_id', label: 'Report ID', value: item.report_id },
    { key: 'dn_number', label: 'DN Number', value: item.dn_number },
    { key: 'lsp', label: 'LSP', value: item.lsp },
    { key: 'checker_name', label: 'Checker', value: item.checker_name },
    { key: 'check_time', label: 'Check Time', value: item.check_time },
    { key: 'status', label: 'Status', value: item.status },
    { key: 'progress', label: 'Progress', value: `${item.checked_count || 0}/${item.box_count || 0}` },
    { key: 'created_at', label: 'Created At', value: item.created_at },
  ];
});

function formatJakartaDate(date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch (_) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}

function normalizeStatus(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text === 'completed') return 'completed';
  if (text === 'partial') return 'partial';
  return 'unknown';
}

function extractError(payload, fallback) {
  return payload?.detail || payload?.message || payload?.error || fallback;
}

async function fetchJson(url) {
  const res = await fetch(url);
  const payload = await res.json().catch(() => null);
  if (!res.ok || payload?.ok === false) {
    throw new Error(extractError(payload, `HTTP ${res.status}`));
  }
  return payload;
}

function buildListUrl() {
  const url = new URL(`${API_BASE}/api/dn/check_result`);
  url.searchParams.set('date', selectedDate.value);
  url.searchParams.set('page', String(page.value));
  url.searchParams.set('page_size', String(pageSize.value));
  if (appliedDnFilter.value) {
    url.searchParams.set('dn_number', appliedDnFilter.value);
  }
  return url.toString();
}

function getRecordKey(record) {
  return String(record?.id ?? record?.report_id ?? record?.dn_number ?? '');
}

function getRecordSignature(record) {
  return JSON.stringify({
    id: record?.id,
    report_id: record?.report_id,
    dn_number: record?.dn_number,
    lsp: record?.lsp,
    checker_name: record?.checker_name,
    check_time: record?.check_time,
    status: record?.status,
    box_count: record?.box_count,
    checked_count: record?.checked_count,
    created_at: record?.created_at,
  });
}

function getListSignature(nextItems, nextTotal) {
  return JSON.stringify({
    total: nextTotal,
    page: page.value,
    pageSize: pageSize.value,
    date: selectedDate.value,
    dn: appliedDnFilter.value,
    items: nextItems.map((item) => [getRecordKey(item), getRecordSignature(item)]),
  });
}

function getChangedVisibleKeys(previousItems, nextItems) {
  const previousMap = new Map(previousItems.map((item) => [getRecordKey(item), getRecordSignature(item)]));
  return nextItems
    .filter((item) => previousMap.get(getRecordKey(item)) !== getRecordSignature(item))
    .map(getRecordKey)
    .filter(Boolean);
}

function setHighlightedKeys(keys) {
  if (highlightTimer) {
    clearTimeout(highlightTimer);
    highlightTimer = null;
  }
  highlightedKeys.value = new Set(keys);
  if (keys.length) {
    highlightTimer = setTimeout(() => {
      highlightedKeys.value = new Set();
      highlightTimer = null;
    }, HIGHLIGHT_MS);
  }
}

function formatRefreshTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function fetchResults(options = {}) {
  const silent = Boolean(options.silent);
  const highlightChanges = Boolean(options.highlightChanges);
  if (!silent) {
    loading.value = true;
    error.value = '';
  }
  try {
    const payload = await fetchJson(buildListUrl());
    const nextItems = Array.isArray(payload.items) ? payload.items : [];
    const nextTotal = Number(payload.total || 0);
    const nextSignature = getListSignature(nextItems, nextTotal);

    if (!highlightChanges || !lastListSignature) {
      setHighlightedKeys([]);
    } else if (nextSignature !== lastListSignature) {
      setHighlightedKeys(getChangedVisibleKeys(items.value, nextItems));
    }

    items.value = nextItems;
    total.value = nextTotal;
    lastListSignature = nextSignature;
    lastRefreshText.value = formatRefreshTime();
  } catch (err) {
    if (!silent) {
      error.value = `Failed to load check results: ${err?.message || err}`;
      items.value = [];
      total.value = 0;
      lastListSignature = '';
      setHighlightedKeys([]);
    }
  } finally {
    if (!silent) {
      loading.value = false;
    }
  }
}

async function openDetail(record) {
  if (!record?.id) return;
  detailOpen.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    detail.value = await fetchDetail(record.id);
  } catch (err) {
    error.value = `Failed to load check result detail: ${err?.message || err}`;
    detailOpen.value = false;
  } finally {
    detailLoading.value = false;
  }
}

async function fetchDetail(id) {
  const payload = await fetchJson(`${API_BASE}/api/dn/check_result/${encodeURIComponent(id)}`);
  return payload.item || null;
}

function handleTableChange(nextPagination) {
  page.value = Number(nextPagination?.current || 1);
  pageSize.value = Number(nextPagination?.pageSize || 20);
  fetchResults();
}

function applyFilters() {
  if (dnFilterTimer) {
    clearTimeout(dnFilterTimer);
    dnFilterTimer = null;
  }
  appliedDnFilter.value = String(dnFilter.value || '').trim().toUpperCase();
  page.value = 1;
  lastListSignature = '';
  fetchResults();
}

function resetFilters() {
  if (dnFilterTimer) {
    clearTimeout(dnFilterTimer);
    dnFilterTimer = null;
  }
  dnFilter.value = '';
  appliedDnFilter.value = '';
  page.value = 1;
  lastListSignature = '';
  fetchResults();
}

function goPage(nextPage) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value);
  lastListSignature = '';
  fetchResults();
}

function isHighlighted(record) {
  return highlightedKeys.value.has(getRecordKey(record));
}

function resolveRowClassName(record) {
  return isHighlighted(record) ? 'refreshed-row' : '';
}

function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => {
    if (!loading.value) {
      fetchResults({ silent: true, highlightChanges: true });
    }
  }, AUTO_REFRESH_MS);
}

function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
  if (highlightTimer) {
    clearTimeout(highlightTimer);
    highlightTimer = null;
  }
  if (dnFilterTimer) {
    clearTimeout(dnFilterTimer);
    dnFilterTimer = null;
  }
}

function loadScript(src, check) {
  if (check?.()) return Promise.resolve();
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePdfScript() {
  await loadScript('https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js', () => window.jspdf?.jsPDF);
}

function sanitizeFilename(value) {
  return String(value || 'check-result').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'check-result';
}

function compactPdfText(value, maxLength = 90) {
  const text = String(value ?? '-').replace(/\s+/g, ' ').trim() || '-';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function drawPdfKeyValue(doc, label, value, x, y, width) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(23, 32, 51);
  const lines = doc.splitTextToSize(String(value || '-'), width);
  doc.text(lines, x, y + 13);
  return y + 13 + lines.length * 10;
}

function drawPdfBoxTable(doc, rows, startY) {
  const margin = 36;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const columns = [
    { title: 'Box No.', key: 'boxNo', width: 120 },
    { title: 'Item No.', key: 'itemNo', width: 92 },
    { title: 'Description', key: 'itemDescEn', width: 150 },
    { title: 'Qty', key: 'qty', width: 45 },
    { title: 'Status', key: 'status', width: 60 },
    { title: 'Checked At', key: 'checkedAt', width: 95 },
  ];
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const x = Math.max(margin, (pageWidth - tableWidth) / 2);
  let y = startY;
  const headerHeight = 22;
  const rowHeight = 28;

  function drawHeader() {
    doc.setFillColor(23, 32, 51);
    doc.rect(x, y, tableWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let cursor = x;
    columns.forEach((col) => {
      doc.text(col.title, cursor + 5, y + 14, { maxWidth: col.width - 8 });
      cursor += col.width;
    });
    y += headerHeight;
  }

  drawHeader();
  rows.forEach((row, index) => {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(x, y, tableWidth, rowHeight, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(x, y + rowHeight, x + tableWidth, y + rowHeight);
    doc.setTextColor(23, 32, 51);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    let cursor = x;
    columns.forEach((col) => {
      doc.text(String(row[col.key] ?? '-'), cursor + 5, y + 16, { maxWidth: col.width - 8 });
      cursor += col.width;
    });
    y += rowHeight;
  });
}

function getDetailFieldsForItem(item = {}) {
  return [
    { key: 'report_id', label: 'Report ID', value: item.report_id },
    { key: 'dn_number', label: 'DN Number', value: item.dn_number },
    { key: 'lsp', label: 'LSP', value: item.lsp },
    { key: 'checker_name', label: 'Checker', value: item.checker_name },
    { key: 'check_time', label: 'Check Time', value: item.check_time },
    { key: 'status', label: 'Status', value: item.status },
    { key: 'progress', label: 'Progress', value: `${item.checked_count || 0}/${item.box_count || 0}` },
    { key: 'created_at', label: 'Created At', value: item.created_at },
  ];
}

function getDetailBoxesForItem(item = {}) {
  return Array.isArray(item.boxes) ? item.boxes : [];
}

async function createCheckResultPdf(item) {
  await ensurePdfScript();
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) throw new Error('jsPDF failed to load');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 36;
  doc.setProperties({ title: `Check Result ${item.dn_number || item.report_id || ''}`.trim() });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(23, 32, 51);
  doc.text('Check Result Detail', margin, 42);

  const fields = getDetailFieldsForItem(item);
  const colWidth = (doc.internal.pageSize.getWidth() - margin * 2 - 18) / 2;
  let leftY = 72;
  let rightY = 72;
  fields.forEach((field, index) => {
    if (index % 2 === 0) {
      leftY = drawPdfKeyValue(doc, field.label, field.value, margin, leftY, colWidth) + 10;
    } else {
      rightY = drawPdfKeyValue(doc, field.label, field.value, margin + colWidth + 18, rightY, colWidth) + 10;
    }
  });

  const tableStartY = Math.max(leftY, rightY) + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(23, 32, 51);
  doc.text('Boxes', margin, tableStartY);
  const rows = getDetailBoxesForItem(item).map((box) => ({
    boxNo: compactPdfText(box.boxNo || box.box_no || '-', 45),
    itemNo: compactPdfText(box.itemNo || box.item_no || '-', 38),
    itemDescEn: compactPdfText(box.itemDescEn || box.item_desc_en || '-', 72),
    qty: compactPdfText(box.qty || '-', 16),
    status: compactPdfText(box.status || '-', 18),
    checkedAt: compactPdfText(box.checkedAt || box.checked_at || '-', 28),
  }));
  drawPdfBoxTable(doc, rows, tableStartY + 14);

  return {
    doc,
    filename: `${sanitizeFilename(item.dn_number || item.report_id)}_check_result.pdf`,
  };
}

async function exportDetailPdf() {
  if (!detail.value) return;
  pdfExporting.value = true;
  error.value = '';
  try {
    const { doc, filename } = await createCheckResultPdf(detail.value);
    doc.save(filename);
  } catch (err) {
    error.value = `Failed to export PDF: ${err?.message || err}`;
  } finally {
    pdfExporting.value = false;
  }
}

async function printRecord(record) {
  if (!record?.id) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    error.value = 'Failed to open print window. Please allow pop-ups for this site.';
    return;
  }

  printWindow.document.write('<!doctype html><title>Preparing print...</title><p style="font-family:Arial,sans-serif">Preparing PDF...</p>');
  printLoadingId.value = record.id;
  error.value = '';
  try {
    const item = String(detail.value?.id ?? '') === String(record.id) ? detail.value : await fetchDetail(record.id);
    if (!item) throw new Error('Check result detail not found');
    const { doc, filename } = await createCheckResultPdf(item);
    const blob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(blob);
    const safeTitle = filename.replace(/[<>&"]/g, '');

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${safeTitle}</title>
          <style>
            html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
            iframe { border: 0; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <iframe id="pdf-frame" src="${pdfUrl}"></iframe>
          <script>
            const frame = document.getElementById('pdf-frame');
            let printed = false;
            function doPrint() {
              if (printed) return;
              printed = true;
              try {
                frame.contentWindow.focus();
                frame.contentWindow.print();
              } catch (err) {
                window.focus();
                window.print();
              }
            }
            frame.addEventListener('load', () => setTimeout(doPrint, 350), { once: true });
            setTimeout(doPrint, 1500);
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
  } catch (err) {
    error.value = `Failed to print PDF: ${err?.message || err}`;
    printWindow.document.body.innerHTML = `<p style="font-family:Arial,sans-serif;color:#b91c1c">Failed to prepare PDF for printing.</p>`;
  } finally {
    printLoadingId.value = null;
  }
}

watch(selectedDate, () => {
  page.value = 1;
  lastListSignature = '';
  fetchResults();
});

watch(dnFilter, () => {
  if (dnFilterTimer) clearTimeout(dnFilterTimer);
  dnFilterTimer = setTimeout(() => {
    dnFilterTimer = null;
    applyFilters();
  }, DN_FILTER_DEBOUNCE_MS);
});

onMounted(() => {
  fetchResults();
  startAutoRefresh();
});

onBeforeUnmount(stopAutoRefresh);
</script>

<style scoped>
.check-result-page {
  min-height: 100vh;
  padding: 28px;
  background: #f5f7fb;
  color: #172033;
}

.result-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.result-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
}

.result-header p {
  margin: 6px 0 0;
  color: #64748b;
}

.result-filters {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.dn-filter-input {
  width: 190px;
}

.result-alert {
  margin-bottom: 16px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-strip > div {
  min-width: 0;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.summary-label {
  display: block;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.summary-strip strong {
  font-size: 22px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.desktop-table {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

:deep(.ant-table-row.refreshed-row > td) {
  animation: refreshedRowGlow 9s ease-out;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-button {
  appearance: none;
  border: 0;
  padding: 0;
  background: transparent;
  color: #1677ff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.progress-text {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-pill.completed {
  background: #dcfce7;
  color: #166534;
}

.status-pill.partial {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.unknown {
  background: #e2e8f0;
  color: #475569;
}

.mobile-list,
.mobile-pager {
  display: none;
}

:deep(.check-detail-modal-wrap .ant-modal) {
  max-width: calc(100vw - 32px);
}

:deep(.check-detail-modal-wrap .ant-modal-body) {
  max-height: calc(100vh - 170px);
  overflow: auto;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.detail-field {
  min-width: 0;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.detail-field span {
  display: block;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.detail-field strong {
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.35;
}

.box-section h2 {
  margin: 0 0 10px;
  font-size: 16px;
}

.box-table-wrap {
  overflow-x: auto;
}

.box-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.box-table th,
.box-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.box-table th {
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
}

.empty-state {
  padding: 28px 16px;
  color: #64748b;
  text-align: center;
}

.empty-state.compact {
  padding: 14px;
}

@media (max-width: 760px) {
  .check-result-page {
    padding: 16px;
  }

  .result-header {
    display: block;
  }

  .result-header h1 {
    font-size: 24px;
  }

  .result-filters {
    margin-top: 14px;
    justify-content: stretch;
  }

  .result-filters :deep(.ant-picker),
  .dn-filter-input {
    flex: 1;
    width: 100%;
    min-width: 0;
  }

  .result-filters :deep(.ant-btn) {
    flex: 1;
  }

  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .summary-strip > div {
    padding: 12px 10px;
  }

  .summary-strip strong {
    font-size: 16px;
    overflow-wrap: anywhere;
  }

  .desktop-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .result-card {
    padding: 14px;
    margin-bottom: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
  }

  .result-card.refreshed {
    animation: refreshedCardGlow 9s ease-out;
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .card-top strong {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 16px;
  }

  .result-card dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin: 0;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .result-card dt {
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
  }

  .result-card dd {
    margin: 2px 0 0;
    overflow-wrap: anywhere;
    color: #172033;
    font-size: 13px;
  }

  .mobile-pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 14px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    justify-content: stretch;
  }

  .detail-actions :deep(.ant-btn) {
    width: 100%;
  }
}

@media (min-width: 761px) and (max-width: 1100px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@keyframes refreshedRowGlow {
  0% {
    background: #dcfce7;
    box-shadow: inset 4px 0 0 #22c55e;
  }
  45% {
    background: #f0fdf4;
    box-shadow: inset 4px 0 0 #22c55e;
  }
  100% {
    background: transparent;
    box-shadow: inset 0 0 0 transparent;
  }
}

@keyframes refreshedCardGlow {
  0% {
    border-color: #22c55e;
    background: #dcfce7;
    box-shadow: 0 10px 22px rgba(34, 197, 94, 0.18);
  }
  45% {
    border-color: #86efac;
    background: #f0fdf4;
    box-shadow: 0 8px 18px rgba(34, 197, 94, 0.12);
  }
  100% {
    border-color: #e2e8f0;
    background: #ffffff;
    box-shadow: none;
  }
}
</style>
