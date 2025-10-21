<template>
  <div class="early-bird-page">
    <div class="page-toolbar">
      <h2 class="page-title">{{ t('title') }}</h2>
      <LanguageSwitcher v-model="state.lang" @change="setLang" />
    </div>

    <div class="filters-card">
      <div class="filters-grid">
        <div class="filter-field">
          <label>{{ t('filters.startDate') }}</label>
          <a-date-picker
            v-model:value="startDate"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            allow-clear
            :disabled="loading"
            style="width: 100%"
          />
        </div>
        <div class="filter-field">
          <label>{{ t('filters.endDate') }}</label>
          <a-date-picker
            v-model:value="endDate"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            allow-clear
            :disabled="loading"
            style="width: 100%"
          />
        </div>
        <div class="filter-field">
          <label>{{ t('filters.region') }}</label>
          <a-select
            v-model:value="regionFilter"
            mode="tags"
            :options="regionOptions"
            :disabled="loading"
            allow-clear
            style="width: 100%"
            :max-tag-count="3"
          />
        </div>
        <div class="filter-field">
          <label>{{ t('filters.area') }}</label>
          <a-select
            v-model:value="areaFilter"
            mode="tags"
            :options="areaOptions"
            :disabled="loading"
            allow-clear
            style="width: 100%"
            :max-tag-count="3"
          />
        </div>
        <div class="filter-field">
          <label>{{ t('filters.lsp') }}</label>
          <a-select
            v-model:value="lspFilter"
            mode="tags"
            :options="lspOptions"
            :disabled="loading"
            allow-clear
            style="width: 100%"
            :max-tag-count="3"
          />
        </div>
        <div class="filter-actions">
          <a-button type="primary" :loading="loading" :disabled="!startDate || !endDate" @click="fetchData">
            {{ t('filters.fetch') }}
          </a-button>
          <a-button :disabled="loading" @click="resetToDefaults">
            {{ t('filters.reset') }}
          </a-button>
          <a-button
            :loading="exportPdfLoading"
            :disabled="loading || exportPdfLoading || !cardItems.length"
            @click="handleExportPdf"
          >
            {{ t('filters.exportPdf') }}
          </a-button>
        </div>
      </div>
      <p class="filters-hint">{{ t('filters.hint') }}</p>
    </div>

    <a-alert
      v-if="error"
      type="error"
      :message="error"
      show-icon
      closable
      class="error-alert"
      @close="error = ''"
    />

    <div v-if="cardItems.length || summary.total" class="summary-bar">
      <span>{{ t('summary.total') }}: {{ summary.total }}</span>
      <span v-if="summary.start && summary.end">
        {{ t('summary.range') }}: {{ summary.start }} ~ {{ summary.end }}
      </span>
    </div>

    <div v-if="cardItems.length" class="cards-grid">
      <article v-for="item in cardItems" :key="item.key" class="early-card">
        <div class="card-body">
          <section class="info-column">
            <div class="card-title-row">
              <div class="card-title">
                <span class="card-label">{{ t('table.dnNumber') }}:</span>
                <span class="card-value">{{ item.dn_number || '-' }}</span>
              </div>
              <div class="card-region">
                <span class="card-label">{{ t('table.region') }}:</span>
                <span class="card-value">{{ item.region || '-' }}</span>
              </div>
            </div>
            <dl class="card-details">
              <div v-for="detail in item.details" :key="detail.key" class="detail-row">
                <dt>{{ detail.label }}</dt>
                <dd>{{ detail.value || '-' }}</dd>
              </div>
            </dl>
          </section>
          <section class="map-column">
            <span class="media-title">{{ t('table.location') }}</span>
            <img
              v-if="item.mapImage"
              :src="item.mapImage"
              :alt="mapAlt(item)"
              class="map-thumb"
              loading="lazy"
            />
            <span v-else class="muted">{{ t('map.unavailable') }}</span>
          </section>
          <section class="photo-column">
            <span class="media-title">{{ t('table.photo') }}</span>
            <button
              v-if="item.photoFull"
              type="button"
              class="photo-button"
              :aria-label="t('photo.preview')"
              @click="openPhoto(item.photoFull)"
            >
              <img :src="item.photoThumb" :alt="t('photo.preview')" class="photo-thumb" loading="lazy" />
            </button>
            <span v-else class="muted">-</span>
          </section>
        </div>
      </article>
    </div>
    <div v-else-if="!loading" class="empty-state">
      {{ t('table.empty') }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { api as viewerApi } from 'v-viewer';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { useI18n } from '../i18n/useI18n';
import { getApiBase, getMapboxAccessToken } from '../utils/env.js';
import { fetchWithPayload, showToast } from './admin/utils.js';
import { resolvePhotoUrl } from '../utils/photo.js';
import { useBodyTheme } from '../composables/useBodyTheme';

useBodyTheme('admin-theme');
dayjs.extend(customParseFormat);

const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
const defaultEnd = dayjs().format('YYYY-MM-DD');

const startDate = ref(defaultStart);
const endDate = ref(defaultEnd);
const loading = ref(false);
const items = ref([]);
const error = ref('');
const summary = reactive({
  total: 0,
  start: '',
  end: '',
});
const regionFilter = ref([]);
const areaFilter = ref([]);
const lspFilter = ref([]);
const regionOptions = ref([]);
const areaOptions = ref([]);
const lspOptions = ref([]);
const exportPdfLoading = ref(false);

const apiBase = getApiBase();
const mapboxToken = getMapboxAccessToken();
const mapboxStyle = 'mapbox/streets-v12';

const _i18n = await useI18n({
  namespaces: ['core', 'early-bird'],
  fallbackLang: 'en',
});
const i18nVersion = ref(0);
const state = reactive({
  lang: _i18n.state.lang || 'zh',
});
_i18n.onChange((lang) => {
  state.lang = lang;
  i18nVersion.value += 1;
});

const t = (key, vars) => {
  i18nVersion.value;
  try {
    return _i18n.t(key, vars);
  } catch (_err) {
    return key;
  }
};

const setLang = async (lang) => {
  if (!lang) return;
  await _i18n.setLang(lang);
};

const normalizeTimePrecision = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/(\.\d{3})\d+/, '$1');
};

const formatDateForApi = (value) => {
  if (!value) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
};

const toAbsUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const sep = url.startsWith('/') ? '' : '/';
  return `${apiBase}${sep}${url}`;
};

const buildMapImageUrl = (lat, lng) => {
  if (!mapboxToken || !lat || !lng) return '';
  const zoom = 13;
  const width = 360;
  const height = 220;
  const marker = `pin-s+ff0000(${lng},${lat})`;
  return `https://api.mapbox.com/styles/v1/${mapboxStyle}/static/${marker}/${lng},${lat},${zoom},0/${width}x${height}@2x?access_token=${encodeURIComponent(
    mapboxToken
  )}`;
};

let viewerInstance = null;

const cleanupViewer = () => {
  if (!viewerInstance) return;
  try {
    if (typeof viewerInstance.destroy === 'function') {
      viewerInstance.destroy();
    }
  } catch (_err) {
    // no-op
  }
  viewerInstance = null;
};

const openPhoto = (url) => {
  if (!url) return;
  cleanupViewer();
  try {
    viewerInstance = viewerApi({
      options: {
        navbar: false,
        title: false,
        toolbar: false,
        fullscreen: false,
        movable: true,
        zoomRatio: 0.4,
        loading: true,
        backdrop: true,
        hidden() {
          cleanupViewer();
        },
      },
      images: [url],
    });
  } catch (_err) {
    cleanupViewer();
  }
};

const buildQueryParams = (start, end) => {
  const params = new URLSearchParams();
  params.set('start_date', start);
  params.set('end_date', end);
  const appendValues = (values, key) => {
    values.forEach((value) => {
      const normalized = String(value || '').trim();
      if (normalized) params.append(key, normalized);
    });
  };
  appendValues(regionFilter.value, 'region');
  appendValues(areaFilter.value, 'area');
  appendValues(lspFilter.value, 'lsp');
  return params;
};

const fetchData = async () => {
  const start = formatDateForApi(startDate.value);
  const end = formatDateForApi(endDate.value);
  if (!start || !end) {
    showToast(t('errors.missingRange'), 'error');
    return;
  }
  if (dayjs(start).isAfter(dayjs(end))) {
    showToast(t('errors.invalidRange'), 'error');
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const base = (apiBase || '').replace(/\/+$/, '');
    const requestBase = base ? `${base}/api/dn/list/early-bird` : '/api/dn/list/early-bird';
    const params = buildQueryParams(start, end);
    const requestUrl = `${requestBase}?${params.toString()}`;
    const { resp, data, message } = await fetchWithPayload(requestUrl, { method: 'GET' });
    if (!resp.ok) {
      throw new Error(message || t('errors.fetchFailed'));
    }
    if (!data?.ok) {
      throw new Error(data?.message || t('errors.fetchFailed'));
    }
    items.value = Array.isArray(data?.data) ? data.data : [];
    summary.total = Number.isFinite(Number(data?.total)) ? Number(data.total) : items.value.length;
    summary.start = data?.start_date || start;
    summary.end = data?.end_date || end;
    fetchFilterOptions();
  } catch (err) {
    error.value = err?.message || String(err);
    items.value = [];
    summary.total = 0;
    summary.start = start;
    summary.end = end;
  } finally {
    loading.value = false;
  }
};

const resetToDefaults = () => {
  startDate.value = defaultStart;
  endDate.value = defaultEnd;
  regionFilter.value = [];
  areaFilter.value = [];
  lspFilter.value = [];
};

const buildSelectOptions = (incoming = [], selected = []) => {
  const map = new Map();
  const add = (value, label) => {
    const normalized = String(value ?? '').trim();
    if (!normalized) return;
    const display = label !== undefined && label !== null && String(label).trim()
      ? String(label).trim()
      : normalized;
    if (!map.has(normalized)) {
      map.set(normalized, { value: normalized, label: display });
    }
  };

  selected.forEach((value) => add(value, value));

  if (Array.isArray(incoming)) {
    incoming.forEach((item) => {
      if (item && typeof item === 'object') {
        add(item.value ?? item.label, item.label ?? item.value);
      } else {
        add(item, item);
      }
    });
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const applyFilterOptions = (payload = {}) => {
  regionOptions.value = buildSelectOptions(payload?.region, regionFilter.value);
  areaOptions.value = buildSelectOptions(payload?.area, areaFilter.value);
  lspOptions.value = buildSelectOptions(payload?.lsp, lspFilter.value);
};

const handleExportPdf = async () => {
  const start = formatDateForApi(startDate.value);
  const end = formatDateForApi(endDate.value);
  if (!start || !end) {
    showToast(t('errors.missingRange'), 'error');
    return;
  }
  if (dayjs(start).isAfter(dayjs(end))) {
    showToast(t('errors.invalidRange'), 'error');
    return;
  }
  if (!cardItems.value.length) {
    showToast(t('errors.noDataToExport'), 'error');
    return;
  }

  exportPdfLoading.value = true;
  try {
    const base = (apiBase || '').replace(/\/+$/, '');
    const requestBase = base ? `${base}/api/dn/early-bird/export` : '/api/dn/early-bird/export';
    const params = buildQueryParams(start, end);
    const requestUrl = `${requestBase}?${params.toString()}`;
    const resp = await fetch(requestUrl, { method: 'GET' });
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(errorText || t('errors.exportFailed'));
    }
    const blob = await resp.blob();
    if (!blob || !blob.size) {
      throw new Error(t('errors.exportFailed'));
    }
    let fileName = `early-bird-${start}-to-${end}.pdf`;
    const disposition = resp.headers.get('content-disposition');
    if (disposition) {
      const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      const rawName = match?.[1] || match?.[2];
      if (rawName) {
        try {
          fileName = decodeURIComponent(rawName);
        } catch (_err) {
          fileName = rawName;
        }
      }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    const message = err?.message || t('errors.exportFailed');
    showToast(message, 'error');
  } finally {
    exportPdfLoading.value = false;
  }
};

const fetchFilterOptions = async () => {
  try {
    const base = (apiBase || '').replace(/\/+$/, '');
    const requestBase = base ? `${base}/api/dn/filters` : '/api/dn/filters';
    const { resp, data, message } = await fetchWithPayload(requestBase, { method: 'GET' });
    if (!resp.ok) {
      throw new Error(message || `HTTP ${resp.status}`);
    }
    const payload =
      data?.data && typeof data.data === 'object' ? data.data : data;
    if (payload && typeof payload === 'object') {
      applyFilterOptions(payload);
    }
  } catch (err) {
    console.error('Failed to load Early Bird filter options', err);
  }
};

const timeFormats = [
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'YYYY-MM-DDTHH:mm:ssZ',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'MM/DD/YYYY',
  'DD/MM/YYYY',
];

const formatTimestamp = (value) => {
  if (!value) return '';
  const normalized = normalizeTimePrecision(value);
  let parsed = dayjs(normalized);
  if (!parsed.isValid()) {
    for (const fmt of timeFormats) {
      parsed = dayjs(normalized, fmt, true);
      if (parsed.isValid()) break;
    }
  }
  if (!parsed || !parsed.isValid()) return value;
  return parsed.format('MM-DD HH:mm:ss');
};

const cardItems = computed(() => {
  i18nVersion.value;
  return items.value.map((item, index) => {
    const lat = item?.record_lat;
    const lng = item?.record_lng;
    const hasCoords =
      lat !== null &&
      lat !== undefined &&
      lng !== null &&
      lng !== undefined &&
      lat !== '' &&
      lng !== '';
    const mapImage = hasCoords ? buildMapImageUrl(lat, lng) : '';
    const photoFull = item?.record_photo_url ? resolvePhotoUrl(item.record_photo_url) : '';

    const planMosDateRaw = item?.plan_mos_date || '';
    const arrivedAtDisplay = formatTimestamp(item?.arrived_at_site_time);
    const cutoffDisplay = formatTimestamp(item?.cutoff_time);

    const details = [
      { key: 'plan_mos_date', label: t('table.planMosDate'), value: planMosDateRaw },
      { key: 'area', label: t('table.area'), value: item?.area || '' },
      { key: 'lsp', label: t('table.lsp'), value: item?.lsp || item?.lsp_name || '' },
      { key: 'arrival_status', label: t('table.arrivalStatus'), value: item?.arrival_status || '' },
      { key: 'arrived_at_site_time', label: t('table.arrivedAt'), value: arrivedAtDisplay || item?.arrived_at_site_time || '' },
      { key: 'cutoff_time', label: t('table.cutoffTime'), value: cutoffDisplay || item?.cutoff_time || '' },
      { key: 'record_updated_by', label: t('table.recordUpdatedBy'), value: item?.record_updated_by || '' },
      { key: 'record_phone_number', label: t('table.recordPhone'), value: item?.record_phone_number || '' },
    ];

    return {
      ...item,
      key: item?.dn_id ?? item?.dn_number ?? `row-${index}`,
      hasCoords,
      mapImage,
      photoFull,
      photoThumb: photoFull,
      details,
      regionDisplay: item?.region || '',
      areaDisplay: item?.area || '',
      lspDisplay: item?.lsp || item?.lsp_name || '',
      planMosDateDisplay: planMosDateRaw,
      arrivalStatusDisplay: item?.arrival_status || '',
      arrivedAtDisplay,
      cutoffDisplay,
      updatedByDisplay: item?.record_updated_by || '',
      phoneDisplay: item?.record_phone_number || '',
    };
  });
});

const mapAlt = (record) => {
  if (!record?.record_lat || !record?.record_lng) return '';
  return t('map.alt', { lat: record.record_lat, lng: record.record_lng });
};

onMounted(() => {
  fetchFilterOptions().finally(fetchData);
});

onBeforeUnmount(() => {
  cleanupViewer();
});
</script>

<style scoped>
.early-bird-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filters-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.filters-grid {
  display: grid;
  gap: 16px;
  align-items: end;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.filter-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.filters-hint {
  margin: 12px 0 0;
  color: rgba(15, 23, 42, 0.6);
  font-size: 11px;
}

.summary-bar {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-weight: 500;
}

.error-alert {
  margin-bottom: 16px;
}

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-body {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: grid;
  grid-template-columns: 3.5fr 1.5fr 1fr;
  gap: 20px;
  align-items: flex-start;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.card-label {
  font-weight: 600;
  margin-right: 6px;
}

.card-value {
  font-weight: 500;
}

.card-region {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.map-column,
.photo-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-title {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.7);
  font-weight: 500;
}

.map-thumb {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #f1f5f9;
}

.photo-button {
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  align-self: flex-start;
}

.photo-thumb {
  max-height: 168px;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  object-fit: cover;
}

.photo-button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.card-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  min-width: 220px;
}

.detail-row dt {
  color: rgba(15, 23, 42, 0.55);
  font-weight: 500;
}

.detail-row dd {
  margin: 0;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.95);
  word-break: break-word;
}

.muted {
  color: rgba(71, 85, 105, 0.8);
  font-size: 11px;
}

.empty-state {
  margin-top: 32px;
  text-align: center;
  color: rgba(71, 85, 105, 0.8);
}

@media (max-width: 768px) {
  .filters-card {
    padding: 12px;
  }

  .card-body {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .photo-column {
    max-width: 100%;
  }

  .photo-thumb {
    width: 200px;
    max-width: 100%;
  }

  .card-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-details {
    flex-direction: column;
    gap: 10px;
  }

  .detail-row {
    min-width: 100%;
  }
}
</style>
