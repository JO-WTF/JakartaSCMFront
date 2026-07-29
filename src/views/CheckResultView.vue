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
        <a-button type="primary" :loading="loading" @click="fetchResults">Refresh</a-button>
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
    </section>

    <section class="desktop-table">
      <a-table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
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
            <a-button size="small" @click="openDetail(record)">View</a-button>
          </template>
        </template>
      </a-table>
    </section>

    <section class="mobile-list">
      <a-spin :spinning="loading">
        <article v-for="item in items" :key="item.id" class="result-card" @click="openDetail(item)">
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
      width="min(920px, calc(100vw - 32px))"
      class="check-detail-modal"
    >
      <a-spin :spinning="detailLoading">
        <template v-if="detail">
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
import { computed, onMounted, ref, watch } from 'vue';
import { getApiBase } from '../utils/env.js';

const API_BASE = getApiBase().replace(/\/+$/, '');

const loading = ref(false);
const detailLoading = ref(false);
const error = ref('');
const items = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const selectedDate = ref(formatJakartaDate(new Date()));
const detailOpen = ref(false);
const detail = ref(null);

const columns = [
  { title: 'DN Number', dataIndex: 'dn_number', key: 'dn_number', width: 170 },
  { title: 'LSP', dataIndex: 'lsp', key: 'lsp', width: 140 },
  { title: 'Checker', dataIndex: 'checker_name', key: 'checker_name', width: 140 },
  { title: 'Check Time', dataIndex: 'check_time', key: 'check_time', width: 180 },
  { title: 'Progress', key: 'progress', width: 110 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
  { title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 190 },
  { title: 'Action', key: 'action', width: 90, fixed: 'right' },
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
  return url.toString();
}

async function fetchResults() {
  loading.value = true;
  error.value = '';
  try {
    const payload = await fetchJson(buildListUrl());
    items.value = Array.isArray(payload.items) ? payload.items : [];
    total.value = Number(payload.total || 0);
  } catch (err) {
    error.value = `Failed to load check results: ${err?.message || err}`;
    items.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

async function openDetail(record) {
  if (!record?.id) return;
  detailOpen.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    const payload = await fetchJson(`${API_BASE}/api/dn/check_result/${encodeURIComponent(record.id)}`);
    detail.value = payload.item || null;
  } catch (err) {
    error.value = `Failed to load check result detail: ${err?.message || err}`;
    detailOpen.value = false;
  } finally {
    detailLoading.value = false;
  }
}

function handleTableChange(nextPagination) {
  page.value = Number(nextPagination?.current || 1);
  pageSize.value = Number(nextPagination?.pageSize || 20);
  fetchResults();
}

function goPage(nextPage) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value);
  fetchResults();
}

watch(selectedDate, () => {
  page.value = 1;
  fetchResults();
});

onMounted(fetchResults);
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
  gap: 10px;
}

.result-alert {
  margin-bottom: 16px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
}

.desktop-table {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  }

  .result-filters :deep(.ant-picker) {
    flex: 1;
  }

  .summary-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
}
</style>
