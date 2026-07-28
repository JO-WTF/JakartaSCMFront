<template>
  <main class="check-page">
    <section class="checker-shell">
      <section class="scanner-card" :class="{ 'is-scanning': state.scanning }">
        <div class="scanner-box">
          <div class="camera-select-wrap">
            <select v-model="selectedCameraId" title="Select camera" :disabled="state.scanning" @change="selectPreferredCamera">
              <option value="">Default rear camera</option>
              <option v-for="(camera, index) in state.cameras" :key="camera.deviceId || index" :value="camera.deviceId || String(index)">
                {{ camera.label || `Camera ${index + 1}` }}
              </option>
            </select>
          </div>

          <div ref="cameraViewHost" class="camera-view-host" aria-hidden="true">
            <div class="dce-video-container"></div>
          </div>

          <div class="empty-preview">
            <div class="scanned-hint">{{ state.dnNumber ? 'Tap Scan Box to check boxes.' : 'Tap Scan DN to get box data.' }}</div>
          </div>

          <div class="scan-overlay" aria-hidden="true">
            <span class="scan-line"></span>
          </div>

          <div class="scan-tips">
            <span class="pill" :class="state.readerPillType">{{ state.readerStatus }}</span>
            <span class="pill" :class="state.cameraPillType">{{ state.cameraStatus }}</span>
          </div>
        </div>

        <div class="controls">
          <button class="primary" type="button" :disabled="state.scanning" @click="startScan(SCAN_MODE.DN)">Scan DN</button>
          <button class="secondary" type="button" :disabled="state.scanning || !state.dnNumber" @click="startScan(SCAN_MODE.BOX)">Scan Box</button>
          <button class="danger" type="button" :disabled="!state.scanning" @click="stopScan()">Stop Scanning</button>
          <button class="secondary report-control" :class="{ ready: canGenerateReport }" type="button" :disabled="state.scanning || !canGenerateReport" @click="openReportModal">
            Generate Report
          </button>
        </div>
      </section>

      <section class="info-block">
        <div class="info-label">
          <span>DN Number: <span class="dn">{{ state.dnNumber || '------' }}</span></span>
          <span class="boxes">Boxes: <strong>{{ checkedBoxCount }}</strong>/<strong>{{ groupedBoxes.length || '-' }}</strong></span>
        </div>

        <div v-if="!state.dnNumber" class="info-placeholder">
          Scan a DN barcode to get box data first.
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Box No.</th>
                <th>Item No.</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="group in groupedBoxes"
                :key="group.key"
                class="box-row"
                :class="{ checked: group.checked, 'last-checked': group.key === state.lastCheckedBoxKey }"
                @click="openBoxDetails(group.key)"
              >
                <td>
                  <span class="box-no">
                    <span class="box-prefix">{{ splitBoxNo(group.boxNo).prefix }}</span>
                    <span class="box-suffix">{{ splitBoxNo(group.boxNo).suffix || group.boxNo }}</span>
                  </span>
                </td>
                <td>
                  <template v-if="group.rows.length > 1">
                    <span class="multiple">Multiple</span>
                    <span class="sub-count">{{ group.rows.length }} items</span>
                  </template>
                  <span v-else class="item-cell">{{ group.rows[0]?.itemNo || '-' }}</span>
                </td>
                <td class="qty-cell">{{ group.rows.reduce((sum, row) => sum + getQtyNumber(row.qty), 0) }}</td>
                <td>{{ group.checked ? 'Checked' : 'Pending' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <div class="modal" :class="{ show: detailModalOpen }" aria-hidden="true" @click.self="closeBoxDetails">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-head">
          <div class="modal-title">
            <strong id="modalTitle">Box Details</strong>
            <span class="modal-summary">{{ selectedBoxSummary }}</span>
          </div>
          <button class="modal-close" type="button" aria-label="Close details" @click="closeBoxDetails">x</button>
        </div>
        <div class="modal-body" v-if="selectedBox">
          <div class="detail-boxno"><strong>Box No.</strong><br>{{ selectedBox.boxNo }}</div>
          <div class="table-wrap">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Item No.</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in selectedBox.rows" :key="row.id" :class="{ checked: row.checked }">
                  <td class="item-cell">{{ row.itemNo }}</td>
                  <td class="desc-cell">{{ row.itemDescEn || '-' }}</td>
                  <td class="qty-cell">{{ row.qty }}</td>
                  <td>{{ row.checked ? (row.checkedAt || nowTime()) : 'Pending' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="modal report-modal" :class="{ show: reportModalOpen }" aria-hidden="true" @click.self="closeReportModal">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="reportModalTitle">
        <div class="modal-head">
          <div class="modal-title">
            <strong id="reportModalTitle">Generate Report</strong>
            <span class="modal-summary">Delivery List Check Result</span>
          </div>
          <button class="modal-close" type="button" aria-label="Close report dialog" @click="closeReportModal">x</button>
        </div>
        <div class="modal-body">
          <div class="report-form">
            <label class="field-label">
              Checker Name
              <input ref="checkerNameInput" v-model.trim="checkerName" class="text-input" type="text" autocomplete="name" placeholder="Please enter checker name" @keydown.enter="generatePdfReport" />
            </label>
            <div class="report-actions">
              <button class="secondary" type="button" @click="closeReportModal">Cancel</button>
              <button class="primary" type="button" @click="generatePdfReport">Confirm</button>
            </div>
            <div class="report-feedback">{{ reportFeedback }}</div>
            <a v-if="reportDownloadUrl" class="download-link show" :href="reportDownloadUrl" :download="reportFilename">Open PDF / Save PDF</a>
          </div>
        </div>
      </div>
    </div>

    <div class="toast" :class="[toast.type, { show: toast.show, emphasis: toast.emphasis }]" :data-label="toast.label" :role="toast.type === 'error' ? 'alert' : 'status'">
      {{ toast.message }}
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { createScanner } from '../composables/useScanner.js';
import { findSgLpnInfos } from '../services/checkApi.js';

const API_BASE = 'http://aif.paas.his-beta.huawei.com/logistics-document-recognition';
const DEDUP_MS = 1200;
const SCAN_MODE = Object.freeze({ DN: 'dn', BOX: 'box' });

const cameraViewHost = ref(null);
const checkerNameInput = ref(null);
const selectedCameraId = ref('');
const detailModalOpen = ref(false);
const selectedBoxKey = ref('');
const reportModalOpen = ref(false);
const checkerName = ref('');
const reportFeedback = ref('A PDF report can be generated after all boxes are checked.');
const reportDownloadUrl = ref('');
const reportFilename = ref('delivery-list-check-result.pdf');

const state = reactive({
  scanning: false,
  mode: null,
  scanner: null,
  cameras: [],
  dnNumber: '',
  boxRows: [],
  recent: new Map(),
  lastCheckedBoxKey: '',
  readerStatus: 'DBR: Idle',
  readerPillType: 'dim',
  cameraStatus: 'Rear camera preferred',
  cameraPillType: 'dim',
});

const toast = reactive({
  show: false,
  emphasis: false,
  type: 'info',
  label: 'INFO',
  message: '',
  timer: null,
  animationTimer: null,
});

let scannerInitPromise = null;
let stopScanPromise = Promise.resolve();

const normalizeCode = (text) => String(text || '').trim().toUpperCase();
const getQtyNumber = (value) => {
  const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};
const formatQuantity = (quantity, unit = '') => {
  const raw = String(quantity ?? '').trim();
  const numeric = Number(raw);
  const value = raw && Number.isFinite(numeric) ? Number.parseFloat(numeric.toFixed(4)).toString() : raw;
  return unit ? `${value} ${unit}`.trim() : value;
};
const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
const nowDateTime = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const groupedBoxes = computed(() => {
  const map = new Map();
  state.boxRows.forEach((row) => {
    const key = normalizeCode(row.boxNo);
    if (!map.has(key)) {
      map.set(key, { key, boxNo: row.boxNo, rows: [], checked: true, checkedAt: '' });
    }
    const group = map.get(key);
    group.rows.push(row);
    group.checked = group.checked && row.checked;
    if (row.checkedAt && (!group.checkedAt || row.checkedAt > group.checkedAt)) group.checkedAt = row.checkedAt;
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    if (a.checked && b.checked) return String(b.checkedAt).localeCompare(String(a.checkedAt));
    return a.boxNo.localeCompare(b.boxNo, undefined, { numeric: true, sensitivity: 'base' });
  });
});

const checkedBoxCount = computed(() => groupedBoxes.value.filter((group) => group.checked).length);
const canGenerateReport = computed(() => state.boxRows.length > 0 && state.boxRows.every((row) => row.checked));
const selectedBox = computed(() => groupedBoxes.value.find((group) => group.key === selectedBoxKey.value));
const selectedBoxSummary = computed(() => {
  if (!selectedBox.value) return '';
  return `${selectedBox.value.rows.length} item${selectedBox.value.rows.length > 1 ? 's' : ''} · ${selectedBox.value.checked ? 'Checked' : 'Pending'}`;
});

function setPill(kind, text, type = '') {
  if (kind === 'reader') {
    state.readerStatus = text;
    state.readerPillType = type;
  } else {
    state.cameraStatus = text;
    state.cameraPillType = type;
  }
}

function showToast(message, type = 'info') {
  const labels = { info: 'INFO', success: 'SUCCESS', warning: 'WARNING', error: 'ERROR' };
  const safeType = labels[type] ? type : 'info';
  toast.message = message;
  toast.type = safeType;
  toast.label = labels[safeType];
  toast.show = true;
  toast.emphasis = false;
  nextTick(() => {
    toast.emphasis = true;
  });
  clearTimeout(toast.animationTimer);
  toast.animationTimer = setTimeout(() => {
    toast.emphasis = false;
  }, 460);
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.show = false;
  }, 1500);
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

async function ensureReportScripts() {
  await Promise.all([
    loadScript('https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js', () => window.jspdf?.jsPDF),
    loadScript('https://unpkg.com/jsbarcode@3.11.6/dist/JsBarcode.all.min.js', () => window.JsBarcode),
  ]);
}

function mapLpnInfoRows(rows) {
  return rows.map((row, index) => ({
    boxNo: row.lpn_name || row.boxNo || '',
    itemNo: row.item_code || row.itemNo || '',
    itemDescEn: row.item_desc_en || '',
    lsp: row.lsp || '',
    qty: formatQuantity(row.transaction_quantity ?? row.qty ?? '', row.unit || ''),
    id: row.id || `${row.lpn_name || row.boxNo || 'box'}-${row.item_code || row.itemNo || 'item'}-${index}`,
    checked: false,
    checkedAt: '',
  })).filter((row) => row.boxNo);
}

function shouldDedup(text) {
  const key = normalizeCode(text);
  const now = Date.now();
  const lastAt = state.recent.get(key) || 0;
  if (now - lastAt < DEDUP_MS) return true;
  state.recent.set(key, now);
  return false;
}

function splitBoxNo(boxNo) {
  const match = String(boxNo).match(/^(.*?)(B\d+)$/i);
  if (!match) return { prefix: boxNo, suffix: '' };
  return { prefix: match[1], suffix: match[2].toUpperCase() };
}

function clearLiveScanReadout() {
  setPill('reader', 'DBR: Idle', 'dim');
}

function updateLiveScanReadout(text, format) {
  const value = String(text || '').trim();
  if (!value) {
    setPill('reader', 'DBR: Scanning', 'ok');
    return;
  }
  setPill('reader', format ? `DBR: [${format}] ${value}` : `DBR: ${value}`, 'ok');
}

function withTimeout(promise, ms, label) {
  let timer = null;
  return Promise.race([
    Promise.resolve(promise).finally(() => {
      if (timer) clearTimeout(timer);
    }),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label || 'operation'} timed out`)), ms);
    }),
  ]).catch((err) => {
    console.warn(err?.message || err);
  });
}

async function ensureScanner() {
  if (scannerInitPromise) return scannerInitPromise;

  scannerInitPromise = (async () => {
    const scanner = await createScanner();
    await scanner.init();
    if (cameraViewHost.value) {
      await scanner.setUIElement(cameraViewHost.value);
    }
    scanner.setVideoFit('cover');
    scanner.setOnUniqueRead((text, result) => {
      if (!state.scanning) return;
      updateLiveScanReadout(text, result?.barcodeFormatString || '');
      handleScanResult(String(text || '').trim());
    });

    state.scanner = scanner;
    return scanner;
  })().catch((err) => {
    scannerInitPromise = null;
    throw err;
  });

  return scannerInitPromise;
}

async function loadCameras() {
  try {
    const scanner = await ensureScanner();
    state.cameras = (await scanner.getAllCameras()) || [];
  } catch (_) {}
}

async function selectPreferredCamera() {
  if (!state.scanner || !selectedCameraId.value) return;
  const camera = state.cameras.find((item, index) => (item.deviceId || String(index)) === selectedCameraId.value);
  if (!camera) return;
  try {
    await state.scanner.setCurrentCamera(camera);
  } catch (err) {
    console.warn('Failed to select camera:', err);
  }
}

async function startScan(mode) {
  if (mode === SCAN_MODE.BOX && !state.dnNumber) {
    showToast('Please scan DN first.', 'warning');
    return;
  }

  await stopScan({ silent: true });
  await withTimeout(stopScanPromise, 2500, 'previous stopScan');
  resetReportDownload();
  state.mode = mode;
  state.scanning = true;
  clearLiveScanReadout();
  setPill('reader', 'DBR: Starting', 'ok');
  setPill('camera', 'Camera starting', 'ok');

  try {
    const scanner = await ensureScanner();
    await loadCameras();
    await selectPreferredCamera();
    await scanner.show();
    setPill('reader', 'DBR: Scanning', 'ok');
    setPill('camera', 'Camera running', 'ok');
  } catch (err) {
    console.error(err);
    await stopScan({ silent: true });
    const message = /NotAllowedError|Permission/i.test(String(err?.name || err?.message || ''))
      ? 'Camera permission was denied. Please allow camera access in the browser address bar.'
      : `Failed to start: ${err?.message || err}`;
    showToast(message, 'error');
  }
}

async function stopScan(options = {}) {
  state.scanning = false;
  state.mode = null;

  stopScanPromise = (async () => {
    try {
      if (state.scanner) await withTimeout(state.scanner.stop(), 2000, 'camera stop');
    } catch (_) {}
  })();

  if (options.wait !== false) await stopScanPromise;
  if (!options.keepStatus) {
    clearLiveScanReadout();
    setPill('camera', 'Rear camera preferred', 'dim');
  }
  if (!options.silent) showToast('Scan stopped', 'info');
}

function handleScanResult(text) {
  if (!state.scanning || !text || shouldDedup(text)) return;
  if (state.mode === SCAN_MODE.DN) {
    state.scanning = false;
    void handleDnScan(text);
    return;
  }
  handleBoxScan(text);
}

async function handleDnScan(text) {
  const dnNumber = normalizeCode(text);
  if (!/^[A-Z]{2,5}\d{8,15}$/i.test(dnNumber)) {
    showToast(`Invalid DN: ${text}\nRule: 2-5 letters + 8-15 digits`, 'error');
    setPill('reader', 'DBR: Invalid DN', 'bad');
    void stopScan({ silent: true });
    return;
  }

  setPill('reader', 'DBR: Loading DN...', 'ok');
  showToast(`Loading boxes for ${dnNumber}...`, 'info');
  void stopScan({ silent: true, wait: false, keepStatus: true });

  try {
    const apiRows = await findSgLpnInfos(dnNumber);
    const matchedRows = mapLpnInfoRows(apiRows);
    if (!matchedRows.length) {
      showToast(`No box data found for DN: ${dnNumber}`, 'error');
      setPill('reader', 'DBR: DN not found', 'bad');
      return;
    }

    state.dnNumber = dnNumber;
    state.boxRows = matchedRows;
    state.lastCheckedBoxKey = '';
    state.recent.clear();
    resetReportDownload();
    closeReportModal();
    closeBoxDetails();
    setPill('reader', 'DBR: Idle', 'dim');
    setPill('camera', 'Rear camera preferred', 'dim');
    showToast(`DN recognized: ${dnNumber}\n${matchedRows.length} items loaded`, 'success');
  } catch (err) {
    console.error('Failed to load DN box data:', err);
    showToast(`Failed to load box data: ${err?.message || err}`, 'error');
    setPill('reader', 'DBR: API load failed', 'bad');
  }
}

function handleBoxScan(text) {
  const boxKey = normalizeCode(text);
  const group = groupedBoxes.value.find((item) => item.key === boxKey);
  if (!group) {
    showToast(`Box does not belong to the current DN: ${text}`, 'error');
    setPill('reader', 'DBR: Box mismatch', 'bad');
    return;
  }
  if (group.checked) {
    showToast(`Duplicate scan: ${text}`, 'warning');
    setPill('reader', 'DBR: Duplicate box', 'warn');
    return;
  }

  const checkedAt = nowDateTime();
  state.boxRows = state.boxRows.map((row) => (
    normalizeCode(row.boxNo) === boxKey ? { ...row, checked: true, checkedAt } : row
  ));
  state.lastCheckedBoxKey = boxKey;
  resetReportDownload();

  if (canGenerateReport.value) {
    setPill('reader', 'DBR: Complete · still scanning', 'ok');
    showToast(`Box confirmed: ${text}\nAll boxes for this DN have been scanned.`, 'success');
  } else {
    setPill('reader', 'DBR: Scanning next box', 'ok');
    showToast(`Box confirmed: ${text}`, 'success');
  }
}

function openBoxDetails(boxKey) {
  selectedBoxKey.value = normalizeCode(boxKey);
  detailModalOpen.value = true;
}

function closeBoxDetails() {
  detailModalOpen.value = false;
  selectedBoxKey.value = '';
}

function openReportModal() {
  if (!canGenerateReport.value) {
    showToast('A report can be generated only after all boxes are scanned.', 'warning');
    return;
  }
  reportFeedback.value = 'A PDF report can be generated after all boxes are checked.';
  reportModalOpen.value = true;
  nextTick(() => checkerNameInput.value?.focus());
}

function closeReportModal() {
  reportModalOpen.value = false;
}

function resetReportDownload() {
  if (reportDownloadUrl.value) URL.revokeObjectURL(reportDownloadUrl.value);
  reportDownloadUrl.value = '';
}

function createDnBarcodeDataUrl(value) {
  if (!window.JsBarcode || !value) return '';
  try {
    const canvas = document.createElement('canvas');
    window.JsBarcode(canvas, value, { format: 'CODE128', displayValue: false, margin: 0, width: 2, height: 50 });
    return canvas.toDataURL('image/png');
  } catch (_) {
    return '';
  }
}

function generateReportId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getReportRows() {
  return state.boxRows.map((row) => ({
    boxNo: row.boxNo,
    itemNo: row.itemNo,
    itemDescEn: row.itemDescEn || '',
    qty: row.qty,
    status: row.checked ? 'Checked' : 'Pending',
    checkedAt: row.checkedAt || '-',
  }));
}

function buildReportPayload(checker) {
  return {
    reportId: generateReportId(),
    dnNumber: state.dnNumber,
    lsp: state.boxRows[0]?.lsp || '',
    checkerName: checker,
    checkTime: nowDateTime(),
    boxCount: groupedBoxes.value.length,
    checkedCount: checkedBoxCount.value,
    status: canGenerateReport.value ? 'completed' : 'partial',
    boxes: getReportRows(),
    metadata: { generatedAt: new Date().toISOString() },
  };
}

async function postReport(payload) {
  try {
    const res = await fetch(`${API_BASE}/dn_checker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, data: await res.json().catch(() => null) };
  } catch (err) {
    console.error('Report upload failed:', err);
    return { ok: false, error: err.message };
  }
}

function drawReportTable(doc, rows, startY) {
  const margin = 42;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const columns = [
    { title: 'Box No.', width: 150, key: 'boxNo' },
    { title: 'Item No.', width: 110, key: 'itemNo' },
    { title: 'Description', width: 130, key: 'itemDescEn' },
    { title: 'Qty', width: 42, key: 'qty' },
    { title: 'Status', width: 60, key: 'status' },
    { title: 'Checked At', width: 90, key: 'checkedAt' },
  ];
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const x = Math.max(margin, (pageWidth - tableWidth) / 2);
  let y = startY;
  const rowHeight = 24;

  function drawHeader() {
    doc.setFillColor(17, 29, 52);
    doc.rect(x, y, tableWidth, rowHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let cursor = x;
    columns.forEach((col) => {
      doc.text(col.title, cursor + 5, y + 15, { maxWidth: col.width - 8 });
      cursor += col.width;
    });
    y += rowHeight;
  }

  drawHeader();
  rows.forEach((row, index) => {
    if (y + rowHeight > pageHeight - 42) {
      doc.addPage();
      y = 42;
      drawHeader();
    }
    if (index % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(x, y, tableWidth, rowHeight, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(x, y + rowHeight, x + tableWidth, y + rowHeight);
    doc.setTextColor(17, 29, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    let cursor = x;
    columns.forEach((col) => {
      doc.text(String(row[col.key] ?? ''), cursor + 5, y + 15, { maxWidth: col.width - 8 });
      cursor += col.width;
    });
    y += rowHeight;
  });
}

async function generatePdfReport() {
  const checker = checkerName.value.trim();
  if (!checker) {
    reportFeedback.value = 'Please enter Checker Name.';
    showToast('Please enter Checker Name.', 'warning');
    checkerNameInput.value?.focus();
    return;
  }
  if (!canGenerateReport.value) {
    showToast('A report can be generated only after all boxes are scanned.', 'warning');
    closeReportModal();
    return;
  }
  try {
    await ensureReportScripts();
  } catch (err) {
    showToast(err?.message || 'Failed to load report dependencies.', 'error');
    return;
  }

  if (!window.jspdf?.jsPDF) {
    showToast('jsPDF failed to load. Please check the CDN network.', 'error');
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const reportTime = nowDateTime();
    const rows = getReportRows();
    const margin = 42;

    doc.setProperties({ title: 'Delivery List Check Result' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(17, 29, 52);
    doc.text('Delivery List Check Result', margin, 48);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(54, 65, 85);
    doc.text(`DN Number: ${state.dnNumber}`, margin, 78);
    doc.text(`LSP: ${state.boxRows[0]?.lsp || '-'}`, margin, 96);
    doc.text(`Checker Name: ${checker}`, margin, 114);
    doc.text(`Check Time: ${reportTime}`, margin, 132);

    const barcodeDataUrl = createDnBarcodeDataUrl(state.dnNumber);
    const barcodeWidth = 190;
    const barcodeHeight = 54;
    const barcodeX = doc.internal.pageSize.getWidth() - margin - barcodeWidth;
    const barcodeY = 70;
    if (barcodeDataUrl) {
      doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(17, 29, 52);
      doc.text(`Barcode: ${state.dnNumber}`, barcodeX, barcodeY + 22, { maxWidth: barcodeWidth });
    }

    drawReportTable(doc, rows, 168);
    const filename = `Delivery_List_Check_Result_${state.dnNumber}_${reportTime.replace(/[\s:]/g, '-')}.pdf`;
    const blob = doc.output('blob');
    resetReportDownload();
    reportFilename.value = filename;
    reportDownloadUrl.value = URL.createObjectURL(blob);
    reportFeedback.value = 'PDF generated. You can open or save it below.';
    showToast('PDF generated. You can open or save it.', 'success');

    postReport(buildReportPayload(checker)).then((result) => {
      if (!result.ok) showToast('PDF saved locally but upload failed.', 'warning');
    });
  } catch (err) {
    console.error(err);
    showToast(`Failed to generate PDF: ${err?.message || err}`, 'error');
  }
}

function onEscape(event) {
  if (event.key === 'Escape') {
    closeBoxDetails();
    closeReportModal();
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onEscape);
  try {
    await ensureScanner();
    await loadCameras();
  } catch (err) {
    console.error(err);
    showToast(err?.message || 'Failed to load scanner dependencies.', 'error');
  }
});

onBeforeUnmount(async () => {
  window.removeEventListener('keydown', onEscape);
  clearTimeout(toast.timer);
  clearTimeout(toast.animationTimer);
  resetReportDownload();
  await stopScan({ silent: true });
  try {
    await state.scanner?.destroyContext?.();
  } catch (_) {}
});
</script>

<style scoped>
.check-page {
  min-height: 100dvh;
  color: #f4f8ff;
  background:
    radial-gradient(circle at 18% 0%, rgba(124, 140, 255, .32), transparent 30%),
    radial-gradient(circle at 92% 9%, rgba(99, 230, 190, .22), transparent 25%),
    linear-gradient(160deg, #07111f, #08111d 48%, #101a2f);
  overflow-x: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.check-page::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, .035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .035) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, .7), transparent 86%);
}

.checker-shell {
  width: min(100%, 480px);
  margin: 0 auto;
  min-height: 100dvh;
  padding: 8px 14px 22px;
  position: relative;
}

.scanner-card,
.info-block {
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .105), rgba(255, 255, 255, .06));
  box-shadow: 0 18px 55px rgba(0, 0, 0, .34);
  backdrop-filter: blur(22px);
  overflow: hidden;
}

.scanner-card {
  position: sticky;
  top: 0;
  z-index: 30;
  padding: 8px;
}

.scanner-box {
  position: relative;
  width: 100%;
  height: clamp(150px, 25dvh, 180px);
  min-height: 150px;
  max-height: 180px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, .42);
  border: 1px solid rgba(255, 255, 255, .11);
  isolation: isolate;
}

.camera-select-wrap {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.camera-view-host {
  width: 100%;
  height: 100%;
  background: #050a12;
}

.camera-view-host :deep(*) {
  max-width: 100%;
}

.camera-view-host :deep(> *) {
  width: 100% !important;
  height: 100% !important;
}

.empty-preview {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 12px;
  color: rgba(255, 255, 255, .66);
  background: rgba(0, 0, 0, .16);
  z-index: 1;
  font-size: 14px;
  line-height: 1.45;
}

.scanner-card.is-scanning .empty-preview {
  display: none;
}

.scanned-hint {
  font-weight: 700;
  font-size: 15px;
  background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcbff, #c084fc, #ff6b6b);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: glow-shift 3s ease-in-out infinite;
}

@keyframes glow-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.scan-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 18px;
  pointer-events: none;
  opacity: .65;
  transition: opacity .22s ease;
  overflow: hidden;
}

.scanner-card.is-scanning .scan-overlay {
  opacity: 1;
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #63e6be, transparent);
  box-shadow: 0 0 22px rgba(99, 230, 190, .92);
  opacity: 0;
}

.scanner-card.is-scanning .scan-line {
  opacity: 1;
  animation: scan 2.15s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% { top: 0; }
  50% { top: calc(100% - 2px); }
}

.scan-tips {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(5, 10, 22, .64);
  color: rgba(255, 255, 255, .82);
  font-size: 12px;
  backdrop-filter: blur(14px);
  white-space: nowrap;
  max-width: min(72vw, 280px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill.ok { color: #63e6be; border-color: rgba(99, 230, 190, .34); }
.pill.warn { color: #ffd166; border-color: rgba(255, 209, 102, .34); }
.pill.bad { color: #ff6b6b; border-color: rgba(255, 107, 107, .34); }
.pill.dim { color: #9eacc4; }

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

button {
  appearance: none;
  min-height: 40px;
  padding: 0 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: 12px;
  color: #f4f8ff;
  background: rgba(255, 255, 255, .08);
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  outline: none;
  cursor: pointer;
  transition: transform .18s ease, opacity .18s ease, background .18s ease;
  touch-action: manipulation;
}

button:active:not(:disabled) { transform: scale(.985); }
button:disabled { opacity: .48; cursor: not-allowed; }

select {
  appearance: none;
  border: none;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, .55);
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  outline: none;
  min-height: 28px;
  width: auto;
  max-width: 180px;
  cursor: pointer;
}

select option {
  color: #101827;
  background: #f0f2f5;
}

.primary {
  color: #07141c;
  border: none;
  background: linear-gradient(135deg, #63e6be, #9bf6d8);
  box-shadow: 0 12px 30px rgba(99, 230, 190, .22);
}

.secondary {
  color: #eef5ff;
  border-color: rgba(124, 140, 255, .35);
  background: rgba(124, 140, 255, .16);
}

.danger {
  color: #fff;
  border-color: rgba(255, 107, 107, .35);
  background: rgba(255, 107, 107, .14);
}

.report-control.ready:not(:disabled) {
  color: #07141c;
  border: none;
  background: linear-gradient(135deg, #63e6be, #9bf6d8);
  box-shadow: 0 12px 30px rgba(99, 230, 190, .18);
}

.info-block {
  padding: 16px;
  margin-top: 14px;
}

.info-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, .24);
  border: 1px solid rgba(255, 255, 255, .08);
  margin-bottom: 12px;
  font-size: 14px;
}

.info-label .dn {
  color: #b0e6ff;
  font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  text-shadow: 0 0 14px rgba(176, 230, 255, .25);
}

.info-label .boxes {
  color: #9eacc4;
}

.info-label .boxes strong {
  color: #f4f8ff;
}

.info-placeholder {
  text-align: center;
  color: #9eacc4;
  font-size: 13px;
  padding: 18px 0;
  line-height: 1.5;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 14px;
  background: rgba(0, 0, 0, .14);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 360px;
  color: #f4f8ff;
  font-size: 12px;
}

th,
td {
  padding: 9px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, .07);
  vertical-align: middle;
}

th {
  color: #9eacc4;
  font-weight: 700;
  background: rgba(255, 255, 255, .07);
}

tbody tr:last-child td {
  border-bottom: 0;
}

.box-row {
  cursor: pointer;
  transition: background .18s ease, box-shadow .18s ease;
}

.box-row:hover td { background: rgba(255, 255, 255, .04); }
.box-row.checked td {
  background: rgba(99, 230, 190, .18);
  border-bottom-color: rgba(99, 230, 190, .18);
}

.box-row.checked {
  box-shadow: inset 3px 0 0 #63e6be;
}

.box-row.checked.last-checked td {
  background: linear-gradient(90deg, rgba(96, 165, 250, .30), rgba(96, 165, 250, .15));
  border-top: 1px solid rgba(96, 165, 250, .26);
  border-bottom-color: rgba(96, 165, 250, .30);
}

.box-row.checked.last-checked {
  box-shadow:
    inset 3px 0 0 #60a5fa,
    0 0 0 1px rgba(96, 165, 250, .25),
    0 10px 26px rgba(96, 165, 250, .10);
}

.box-row.checked.last-checked .box-suffix::after {
  content: " latest";
  margin-left: 6px;
  font-size: 10px;
  font-weight: 800;
  color: #93c5fd;
  vertical-align: middle;
}

.box-no {
  display: grid;
  gap: 2px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  line-height: 1.05;
  min-width: 0;
}

.box-prefix {
  display: block;
  color: #9eacc4;
  font-size: 10px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 190px;
}

.box-suffix {
  display: block;
  color: #f7fffb;
  font-size: 20px;
  font-weight: 950;
  letter-spacing: .2px;
  text-shadow: 0 0 16px rgba(99, 230, 190, .24);
}

.item-cell {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  word-break: break-all;
}

.desc-cell {
  min-width: 160px;
  max-width: 240px;
  color: #d5deed;
  line-height: 1.35;
  word-break: break-word;
}

.multiple {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  color: #63e6be;
  border: 1px solid rgba(99, 230, 190, .32);
  background: rgba(99, 230, 190, .10);
  font-weight: 850;
}

.sub-count {
  display: block;
  margin-top: 4px;
  color: #9eacc4;
  font-size: 11px;
}

.qty-cell {
  font-weight: 900;
  font-size: 15px;
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: none;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 14px calc(16px + env(safe-area-inset-bottom));
  background: rgba(2, 6, 14, .58);
  backdrop-filter: blur(10px);
}

.modal.show {
  display: flex;
}

.modal-card {
  width: min(100%, 480px);
  max-height: min(78dvh, 620px);
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: linear-gradient(180deg, rgba(17, 29, 52, .98), rgba(8, 15, 29, .98));
  box-shadow: 0 24px 70px rgba(0, 0, 0, .48);
  animation: modalIn .18s ease-out;
}

@keyframes modalIn {
  from { transform: translateY(18px); opacity: .3; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, .08);
}

.modal-title {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.modal-title strong {
  font-size: 16px;
}

.modal-summary {
  color: #9eacc4;
  font-size: 12px;
}

.modal-close {
  width: 38px;
  height: 38px;
  min-height: 38px;
  padding: 0;
  border-radius: 50%;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, .08);
}

.modal-body {
  padding: 14px 16px 16px;
  overflow: auto;
  max-height: calc(min(78dvh, 620px) - 76px);
}

.report-modal {
  align-items: center;
  padding-top: calc(16px + env(safe-area-inset-top));
}

.report-form {
  display: grid;
  gap: 12px;
}

.field-label {
  display: grid;
  gap: 7px;
  color: #9eacc4;
  font-size: 13px;
  font-weight: 700;
}

.text-input {
  width: 100%;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, .16);
  background: rgba(0, 0, 0, .24);
  color: #f4f8ff;
  padding: 0 13px;
  font: inherit;
  outline: none;
}

.text-input:focus {
  border-color: rgba(99, 230, 190, .56);
  box-shadow: 0 0 0 3px rgba(99, 230, 190, .12);
}

.report-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 2px;
}

.report-feedback {
  min-height: 18px;
  color: #9eacc4;
  font-size: 13px;
  line-height: 1.45;
}

.download-link {
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: #07141c;
  background: linear-gradient(135deg, #63e6be, #9bf6d8);
  text-decoration: none;
  font-weight: 900;
  box-shadow: 0 12px 30px rgba(99, 230, 190, .18);
}

.download-link.show {
  display: flex;
}

.detail-table {
  min-width: 0;
  font-size: 12px;
}

.detail-table .checked td {
  background: rgba(99, 230, 190, .18);
  border-bottom-color: rgba(99, 230, 190, .16);
}

.detail-boxno {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, .08);
  background: rgba(0, 0, 0, .18);
  word-break: break-all;
}

.toast {
  position: fixed;
  left: 50%;
  top: 66.666dvh;
  transform: translate(-50%, -50%) scale(.96);
  width: min(84vw, 340px);
  min-height: 64px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(10, 16, 31, .94);
  border: 1px solid rgba(255, 255, 255, .14);
  box-shadow: 0 18px 50px rgba(0, 0, 0, .44);
  color: #f4f8ff;
  opacity: 0;
  pointer-events: none;
  transition: opacity .22s ease, transform .22s ease;
  z-index: 80;
  backdrop-filter: blur(20px);
  text-align: center;
  font-size: 15px;
  font-weight: 850;
  line-height: 1.35;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: pre-line;
}

.toast::before {
  content: attr(data-label);
  display: block;
  font-size: 10px;
  line-height: 1;
  letter-spacing: .12em;
  text-transform: uppercase;
  opacity: .92;
}

.toast.info { border-color: rgba(255, 255, 255, .16); }
.toast.info::before { color: #9eacc4; }

.toast.success {
  color: #effff9;
  border-color: rgba(99, 230, 190, .52);
  background: linear-gradient(180deg, rgba(20, 63, 57, .96), rgba(9, 28, 35, .96));
}

.toast.success::before { color: #63e6be; }

.toast.warning {
  color: #fff8dc;
  border-color: rgba(255, 209, 102, .58);
  background: linear-gradient(180deg, rgba(78, 58, 16, .96), rgba(29, 24, 12, .96));
}

.toast.warning::before { color: #ffd166; }

.toast.error {
  color: #fff2f2;
  border-color: rgba(255, 107, 107, .62);
  background: linear-gradient(180deg, rgba(78, 25, 32, .96), rgba(31, 13, 18, .96));
}

.toast.error::before { color: #ff6b6b; }

.toast.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.toast.emphasis {
  animation: toastEmphasis .42s cubic-bezier(.18, .89, .32, 1.28);
}

@keyframes toastEmphasis {
  0% {
    transform: translate(-50%, -50%) scale(.90);
    filter: brightness(1.18);
    box-shadow: 0 18px 50px rgba(0, 0, 0, .44), 0 0 0 0 rgba(255, 255, 255, .32);
  }
  42% {
    transform: translate(-50%, -50%) scale(1.06);
    filter: brightness(1.28);
    box-shadow: 0 22px 58px rgba(0, 0, 0, .50), 0 0 0 8px rgba(255, 255, 255, .12);
  }
  72% {
    transform: translate(-50%, -50%) scale(.985);
    filter: brightness(1.08);
    box-shadow: 0 18px 50px rgba(0, 0, 0, .44), 0 0 0 3px rgba(255, 255, 255, .08);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    filter: brightness(1);
    box-shadow: 0 18px 50px rgba(0, 0, 0, .44), 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast.emphasis { animation: none; }
}

@media (max-width: 360px) {
  .scanner-box {
    height: 145px;
    min-height: 145px;
    max-height: 145px;
  }

  .controls { grid-template-columns: 1fr; }
  th, td { padding: 8px 7px; }
  .box-prefix { max-width: 145px; }
  .box-suffix { font-size: 19px; }
}
</style>
