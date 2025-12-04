<template>
  <div class="wrap inventory-view">
    <div class="lang-switcher-container">
      <LanguageSwitcher v-model="state.lang" @change="setLang" />
    </div>

    <!-- Header Section -->
    <div class="inventory-header">
      <div class="pm-title-row">
        <h2 class="pm-title">{{ pmName || '-' }}</h2>
        <a-button size="small" class="pm-switch-btn" @click="goToPM">
          {{ t('switchWarehouse') }}
        </a-button>
      </div>
      <div class="mode-switcher">
        <a-button
          :type="mode === 'count' ? 'primary' : 'default'"
          @click="setMode('count')"
        >
          {{ t('inventoryCheck') }}
        </a-button>
        <a-button
          :type="mode === 'inventory' ? 'primary' : 'default'"
          @click="setMode('inventory')"
        >
          {{ t('viewInventory') }}
        </a-button>
      </div>
    </div>

    <!-- Inventory Mode -->
    <div v-if="mode === 'inventory'" class="content-section">
      <a-spin :spinning="loading">
        <div v-if="!loading && !data.ok">
          <a-alert
            v-if="data?.message && !isCameraError(data.message)"
            type="error"
            :message="data?.message || 'Failed to load'"
          />
          <div v-else class="status-box muted">({{ t('loadingError') }})</div>
        </div>

        <div v-if="!loading && data.ok">
          <div class="inventory-filter">
            <div class="total-count">{{ t('totalCount') }}: {{ data.total }}</div>
            <div class="filter-input">
              <input
                v-model="filterText"
                :placeholder="t('inventoryFilterPlaceholder')"
                class="filter-control"
              />
              <button type="button" class="filter-clear" :disabled="!filterText" @click="clearFilter">
                {{ t('clearFilter') }}
              </button>
            </div>
          </div>
          <a-table
            :columns="columns"
            :dataSource="filteredItems"
            :rowKey="rowKeyName"
            size="small"
            :pagination="{ pageSize: 10 }"
          />
        </div>
      </a-spin>
    </div>

    <!-- Manage / Count Mode -->
    <div v-else-if="mode === 'manage' || mode === 'count'" class="content-section">
      <!-- Scanner container -->
      <section
        id="container-manage"
        class="scan-area container"
        v-show="!manageState.hasDN"
      >
        <div id="div-ui-container-manage">
          <div class="dce-video-container"></div>
        </div>
      </section>

      <!-- DN input + controls -->
      <div class="dn-input-section">
        <label for="dnInputManage">{{ t('dnCode') }}</label>
        <div class="dn-input-row">
          <span v-if="!manageState.isValid" class="status-icon error">❌</span>
          <span v-if="manageState.isValid" class="status-icon success">✅</span>
          <input
            id="dnInputManage"
            ref="dnInputManage"
            maxlength="40"
            v-model="manageState.dnNumber"
            @input="onDNInputManage"
            @keyup.enter="onDNEnter"
            @focus="onDNFocus"
            @blur="onDNBlur"
            :class="{ 'dn-highlight': highlightPulse }"
          />
          <a-button
            type="primary"
            class="dn-confirm-btn"
            :disabled="!manageState.isValid"
            @click="onDNEnter"
          >
            {{ t('confirm') || '确认' }}
          </a-button>
        </div>
      </div>

      <!-- Action buttons (manage mode only) -->
      <div v-if="mode === 'manage' && manageState.isValid" class="action-section">
        <div class="action-buttons">
          <a-button
            type="primary"
            class="flex-btn inbound-btn"
            @click="performInbound"
            :loading="manageState.actionLoading === 'inbound'"
            :disabled="(manageState.actionLoading && manageState.actionLoading !== 'inbound') || !manageState.isValid"
          >
            {{ t('inbound') }}
          </a-button>

          <a-button
            type="default"
            class="flex-btn outbound-btn"
            @click="performOutbound"
            :loading="manageState.actionLoading === 'outbound'"
            :disabled="(manageState.actionLoading && manageState.actionLoading !== 'outbound') || !manageState.isValid"
          >
            {{ t('outbound') }}
          </a-button>
        </div>
      </div>

      <div
        v-if="agingMessage"
        :class="['status-box', 'aging-result', agingSuccess ? 'aging-success' : 'muted']"
      >
        {{ agingMessage }}
      </div>

      <!-- Messages -->
      <div v-if="manageState.msg" class="message-section">
        <div v-if="manageState.ok" class="success-message">{{ manageState.msg }}</div>
        <a-alert
          v-else-if="!isCameraError(manageState.msg)"
          :message="manageState.msg"
          type="error"
          show-icon
        />
        <div v-else class="status-box muted">({{ t('cameraError') }})</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getApiBase } from '../utils/env.js';
import { useI18n } from '../i18n/useI18n';
import { isValidDn } from '../utils/dn.js';
import { createScanner } from '../composables/useScanner';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import '../assets/css/scan.css';

const pmName = ref('');
const mode = ref('count');
const loading = ref(false);
const data = ref({ ok: false, pm_name: '', total: 0, items: [] });
const filterText = ref('');

// small shared i18n helper (cached instance)
const _i18n = await useI18n({ namespaces: ['core', 'index', 'pm', 'inventory'], fallbackLang: 'en' });
const i18nVersion = ref(0);

// state for language switcher
const state = reactive({
  lang: _i18n.state.lang || 'en',
});
const router = useRouter();

// Setup onChange listener after state is defined
_i18n.onChange((lang) => { state.lang = lang; i18nVersion.value++; });
const t = (key, vars) => { i18nVersion.value; return _i18n.t(key, vars); };

// manage mode state (scan + inbound/outbound)
const manageState = ref({
  dnNumber: '',
  isValid: false,
  hasDN: false,
  running: false,
  // actionLoading: '' | 'inbound' | 'outbound'
  actionLoading: '',
  msg: '',
  ok: false,
});

// filter camera/scanner related errors so they are not shown in <a-alert>
const isCameraError = (m) => {
  try {
    const s = String(m || '');
    return /\b(camera|摄像头|scanner|dynamsoft|getUserMedia|NotAllowedError|NotFoundError|NotReadableError|OverconstrainedError|Camera start failed|Scanner SDK not loaded|Camera stop failed|Scanner init failed)\b/i.test(s);
  } catch (e) { return false; }
};

// Map backend error messages to i18n keys (simple, best-effort mapping)
const mapBackendErrorToTranslation = (raw) => {
  if (!raw) return '';
  const s = String(raw).toLowerCase();
  // common cases
  if (s.includes('dn already in inventory') || s.includes('already in inventory')) return 'pm.inventory.error.dn_already_in_inventory';
  if (s.includes('not found') && s.includes('dn')) return 'pm.inventory.error.dn_not_found';
  if (s.includes('invalid') && s.includes('dn')) return 'pm.inventory.error.dn_invalid';
  // fallback: try to normalize spaces and punctuation to form a key-like string
  const normalized = s.replace(/[\s\.\/,:]+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `pm.inventory.error.${normalized}`;
};

let scannerManage = null;
let scannerManageApi = null;
const dnInputManage = ref(null);
const successTimer = { id: null };
const highlightPulse = ref(false);
let highlightTimer = null;
const lastHighlightedDn = ref('');
let refocusTimer = null;
let lastAgingPayload = { dn: '', pm: '' };
const agingMessage = ref('');
const agingInFlight = ref(false);
const agingSuccess = ref(false);
// simple dedupe to avoid repeated handling of same code in short period
const lastScanned = ref('');
const lastScannedAt = ref(0);
const scanCooldownMs = 500; // ms
let agingMessageTimer = null;

const setMode = async (m) => {
  mode.value = m;
  if (m === 'inventory') {
    await stopManageScanner({ destroy: true });
    fetchInventory();
    return;
  }
  if (m === 'manage' || m === 'count') {
    await nextTick();
    await initManageScanner();
    focusDNInput();
  }
};

const goToPM = () => {
  router.push({ name: 'pm' }).catch(() => {});
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
};

const colTitle = (key, fallback) => {
  const txt = t(key);
  return txt && txt !== key ? txt : fallback;
};

// Table columns for inventory
const columns = computed(() => {
  // Depend on i18nVersion to re-compute when language changes
  i18nVersion.value;
  return [
    { title: colTitle('orderName', 'Order Name'), dataIndex: 'order_name', key: 'order_name' },
    { title: colTitle('shipmentNo', 'Shipment No.'), dataIndex: 'shipment_no', key: 'shipment_no' },
    {
      title: colTitle('updatedAt', 'Updated At'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      customRender: ({ text }) => formatDate(text),
      customCell: () => ({ class: 'col-updated-at' }),
      customHeaderCell: () => ({ class: 'col-updated-at' }),
    },
  ];
});

const rowKeyName = (record) =>
  record.shipment_no || record.order_name || record.id || JSON.stringify(record);

const filteredItems = computed(() => {
  const keyword = (filterText.value || '').trim().toLowerCase();
  if (!keyword) return data.value.items || [];
  return (data.value.items || []).filter((item) => {
    const dn = (item?.order_name || '').toLowerCase();
    const ship = (item?.shipment_no || '').toLowerCase();
    return dn.includes(keyword) || ship.includes(keyword);
  });
});

const fetchInventory = async () => {
  loading.value = true;
  try {
    // ensure we have a pm_name (from pmName ref or localStorage)
    const pm = getCurrentPmName();
    if (!pm) {
      data.value = { ok: false, message: 'pm_name required. 请先创建或选择 PM。', total: 0, items: [] };
      loading.value = false;
      return;
    }

    const API_BASE = getApiBase();
    const base = (API_BASE ? API_BASE.replace(/\/+$/, '') : '');
    const url = base + '/api/aging-orders/by-pm-location' + '?pm_location=' + encodeURIComponent(pm);
    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${text ? ': ' + text : ''}`);
    }

    // try parse JSON, but handle non-JSON gracefully
    let j;
    try {
      j = await res.json();
    } catch (parseErr) {
      const text = await res.text().catch(() => '');
      throw new Error('Invalid JSON response: ' + (text || parseErr.message));
    }

  // basic shape validation
    if (!j || typeof j !== 'object' || Array.isArray(j)) {
      throw new Error('Unexpected response shape');
    }

    // normalize values to expected shape
    data.value = {
      ok: !!j.ok,
      pm_name: j.pm_location || j.pm || '',
      total: typeof j.total === 'number' ? j.total : (Array.isArray(j.items) ? j.items.length : 0),
      items: Array.isArray(j.items) ? j.items : [],
      message: j.message || '',
    };

    if (data.value.pm_name) pmName.value = data.value.pm_name;
  } catch (e) {
    console.error('fetchInventory', e);
    data.value = { ok: false, message: e?.message || 'Error', total: 0, items: [] };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  try {
    const stored = localStorage.getItem('selected_pm_name');
    if (stored) pmName.value = stored;
  } catch (e) {}
  fetchInventory();
  if (mode.value === 'manage' || mode.value === 'count') {
    initManageScanner();
    focusDNInput();
  }
});

onBeforeUnmount(async () => {
  try {
    await stopManageScanner({ destroy: true });
  } catch {}
  try {
    if (successTimer.id) { clearTimeout(successTimer.id); successTimer.id = null; }
  } catch {}
  try {
    if (highlightTimer) { clearTimeout(highlightTimer); highlightTimer = null; }
  } catch {}
  try {
    if (refocusTimer) { clearTimeout(refocusTimer); refocusTimer = null; }
  } catch {}
  try {
    if (agingMessageTimer) { clearTimeout(agingMessageTimer); agingMessageTimer = null; }
  } catch {}
});

const initManageScanner = async () => {
  // initialize scanner on demand
  try {
    let container = document.getElementById('div-ui-container-manage');
    if (!container) {
      await nextTick();
      container = document.getElementById('div-ui-container-manage');
    }
    if (scannerManageApi) {
      // make sure camera is fully stopped/hidden before re-binding the UI element
      await stopManageScanner();
      if (container) await scannerManageApi.setUIElement(container);
      await scannerManageApi.show();
      manageState.value.running = true;
      return;
    }

    scannerManageApi = await createScanner();
    await scannerManageApi.init();
    scannerManage = scannerManageApi;
    if (container) await scannerManageApi.setUIElement(container);
    scannerManageApi.setVideoFit('cover');
    try { scannerManageApi.barcodeFillStyle = 'rgba(73,245,73,0)'; } catch {}
    try { scannerManageApi.barcodeLineWidth = 5; } catch {}
    try { scannerManageApi.barcodeStrokeStyle = 'rgba(73,245,73,1)'; } catch {}
    scannerManageApi.setOnUniqueRead((txt) => onCodeScannedManage(txt));
    await scannerManageApi.show();
    manageState.value.running = true;
  } catch (e) {
    // Log the error for debugging but do not show raw scanner errors in the UI
    console.error('manage scanner init', e);
    manageState.value.ok = false;
  }
};

const stopManageScanner = async (options = {}) => {
  const { destroy = false } = options;
  try {
    if (scannerManageApi && typeof scannerManageApi.stop === 'function') await scannerManageApi.stop();
    if (scannerManageApi && typeof scannerManageApi.hide === 'function') await scannerManageApi.hide();
    manageState.value.running = false;
  } catch (e) {
    console.error(e);
  } finally {
    if (destroy) {
      try {
        if (scannerManageApi && typeof scannerManageApi.destroyContext === 'function') await scannerManageApi.destroyContext();
      } catch (err) {
        console.error('destroy scanner context', err);
      }
      scannerManageApi = null;
      scannerManage = null;
    }
  }
};

const focusDNInput = async () => {
  await nextTick();
  const el = dnInputManage.value;
  try {
    if (el && typeof el.focus === 'function') {
      el.focus();
      el.select?.();
    }
  } catch (e) {
    console.error('focusDNInput', e);
  }
};

const onDNFocus = () => {
  if (refocusTimer) {
    clearTimeout(refocusTimer);
    refocusTimer = null;
  }
};

const onDNBlur = () => {
  if (refocusTimer) clearTimeout(refocusTimer);
  refocusTimer = setTimeout(() => {
    focusDNInput();
  }, 500);
};

const triggerHighlight = (dn) => {
  try {
    const val = (dn || '').trim();
    if (!val) return;
    if (lastHighlightedDn.value === val && highlightPulse.value) return;
    highlightPulse.value = false;
    if (highlightTimer) { clearTimeout(highlightTimer); highlightTimer = null; }
    setTimeout(() => { highlightPulse.value = true; }, 10);
    highlightTimer = setTimeout(() => { highlightPulse.value = false; highlightTimer = null; }, 1800);
    lastHighlightedDn.value = val;
  } catch (e) {
    console.error('triggerHighlight', e);
  }
};

const onCodeScannedManage = async (code) => {
  try {
    const v = String(code || '').toUpperCase();
    // dedupe: ignore same code within cooldown window
    const now = Date.now();
    if (v && v === lastScanned.value && (now - lastScannedAt.value) < scanCooldownMs) return;
    lastScanned.value = v;
    lastScannedAt.value = now;

    manageState.value.isValid = isValidDn(v);
    manageState.value.dnNumber = v;
    if (manageState.value.isValid) {
      onDNEnter();
      triggerHighlight(v);
    }

    // Keep scanner running so it continues to scan for new codes.
    // We intentionally do NOT stop the scanner or set hasDN here.
    // If the UI needs to explicitly pause scanning, user can press the rescan/controls.
  } catch (e) {
    console.error('onCodeScannedManage error', e);
  }
};

const onDNInputManage = () => {
  manageState.value.dnNumber = (dnInputManage.value?.value || '').toUpperCase();
  manageState.value.isValid = isValidDn(manageState.value.dnNumber);
  if (!manageState.value.isValid) {
    agingMessage.value = '';
    agingSuccess.value = false;
    if (agingMessageTimer) { clearTimeout(agingMessageTimer); agingMessageTimer = null; }
  }
};

const onDNEnter = () => {
  triggerAgingCheck();
};

// rescan removed per UI simplification: scanning now continues automatically

const performAction = async (path, actionName) => {
  if (!manageState.value.isValid) return;
  manageState.value.actionLoading = actionName;
  manageState.value.msg = '';
  try {
    const pm = getCurrentPmName();
    if (!pm) throw new Error('pm_name required');
    const API_BASE = getApiBase();
    const url = (API_BASE ? API_BASE.replace(/\/+$/, '') : '') + path;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pm_name: pm, dn_number: manageState.value.dnNumber }),
    });
    // Try to parse JSON body. If parsing fails, capture raw text.
    let j = {};
    let rawText = '';
    try {
      j = await res.json();
    } catch (parseErr) {
      try { rawText = await res.text(); } catch (tErr) { rawText = ''; }
    }

    if (!res.ok) {
      // Prefer `detail` then `message`, then raw text, then status
      let errMsg = j?.detail || j?.message || rawText || `HTTP ${res.status}`;
      if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
      manageState.value.ok = false;
      // try translate
      const transKey = mapBackendErrorToTranslation(errMsg);
      const translated = transKey ? t(transKey) : '';
      manageState.value.msg = (translated && translated !== transKey) ? translated : errMsg;
      return;
    }

    manageState.value.ok = !!j.ok || res.ok;
    if (manageState.value.ok) {
      // Use friendly i18n success message depending on action
      const successKey = actionName === 'inbound' ? 'pm.inventory.success.inbound' : actionName === 'outbound' ? 'pm.inventory.success.outbound' : 'pm.inventory.success.default';
      const translatedSuccess = t(successKey);
      // If action-specific translation missing, try generic success translation
      let finalMsg = '';
      if (translatedSuccess && translatedSuccess !== successKey) {
        finalMsg = translatedSuccess;
      } else {
        const generic = t('pm.inventory.success.default');
        if (generic && generic !== 'pm.inventory.success.default') {
          finalMsg = generic;
        } else {
          // fallback to backend-provided message/detail/rawText if available
          finalMsg = j?.message || j?.detail || rawText || '';
        }
      }
      // last resort hardcoded english
      if (!finalMsg) finalMsg = 'Success';
      manageState.value.msg = finalMsg;
      // auto-hide success message after 2s
      try { if (successTimer.id) clearTimeout(successTimer.id); } catch (e) {}
      successTimer.id = setTimeout(() => { manageState.value.msg = ''; successTimer.id = null; }, 1000);
    } else {
      // prefer backend message/detail, but try translate
      let successMsg = j?.message || j?.detail || rawText || (manageState.value.ok ? 'OK' : 'Failed');
      const transKey = mapBackendErrorToTranslation(successMsg);
      const translated = transKey ? t(transKey) : '';
      manageState.value.msg = (translated && translated !== transKey) ? translated : successMsg;
    }
  } catch (e) {
    manageState.value.ok = false;
    manageState.value.msg = e?.message || 'Error';
    console.error('performAction', e);
  } finally {
    // Ensure we always clear the specific action loading flag
    if (manageState.value.actionLoading === actionName) manageState.value.actionLoading = '';
  }
};

const performInbound = async () => performAction('/api/pm/inbound', 'inbound');
const performOutbound = async () => performAction('/api/pm/outbound', 'outbound');

const formatAgingSuccess = (dn, detail = '') => {
  const base = t('inventoryCheckSuccess') || '盘点成功';
  return detail ? `${dn} ${detail}` : `${dn} ${base}`;
};

const formatAgingError = (dn, detail = '') => {
  const base = t('inventoryCheckError') || '盘点失败';
  return detail ? `${dn} ${base} (${detail})` : `${dn} ${base}`;
};

const getCurrentPmName = () => {
  return (
    pmName.value ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('selected_pm_name') : '') ||
    ''
  );
};

const triggerAgingCheck = () => {
  const dn = (manageState.value.dnNumber || '').trim();
  const pm = getCurrentPmName();
  if (!dn || !pm || !isValidDn(dn)) {
    agingMessage.value = '';
    agingSuccess.value = false;
    if (agingMessageTimer) { clearTimeout(agingMessageTimer); agingMessageTimer = null; }
    return;
  }
  sendAgingUpdate(dn, pm);
};

const sendAgingUpdate = async (dn, pm) => {
  try {
    if (!dn || !pm) return;
    if (lastAgingPayload.dn === dn && lastAgingPayload.pm === pm) return;
    const API_BASE = getApiBase();
    if (!API_BASE) {
      agingMessage.value = formatAgingSuccess(dn);
      agingSuccess.value = true;
      if (agingMessageTimer) { clearTimeout(agingMessageTimer); agingMessageTimer = null; }
      agingMessageTimer = setTimeout(() => {
        agingMessage.value = '';
        agingSuccess.value = false;
        agingMessageTimer = null;
      }, 1000);
      return;
    }
    agingInFlight.value = true;
    lastAgingPayload = { dn, pm };
    const url = API_BASE.replace(/\/+$/, '') + '/api/aging-orders/pm-location';
    const body = { pm_location: pm, order_name: dn };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let parsed = null;
    let rawText = '';
    try {
      parsed = await res.clone().json();
    } catch (e) {}
    if (!parsed) {
      try { rawText = await res.text(); } catch (e) { rawText = ''; }
    }
    const serverMsg = parsed?.message || parsed?.detail || parsed?.error || rawText || '';
    if (!res.ok) {
      agingMessage.value = formatAgingError(dn, serverMsg);
      agingSuccess.value = false;
      if (agingMessageTimer) { clearTimeout(agingMessageTimer); agingMessageTimer = null; }
      return;
    }
    agingMessage.value = formatAgingSuccess(dn, serverMsg);
    agingSuccess.value = true;
    if (agingMessageTimer) { clearTimeout(agingMessageTimer); agingMessageTimer = null; }
    agingMessageTimer = setTimeout(() => {
      agingMessage.value = '';
      agingSuccess.value = false;
      agingMessageTimer = null;
    }, 1000);
  } catch (e) {
    agingMessage.value = formatAgingError(dn, e?.message || 'Error');
    agingSuccess.value = false;
    if (agingMessageTimer) { clearTimeout(agingMessageTimer); agingMessageTimer = null; }
    console.error('sendAgingUpdate error', e);
  } finally {
    agingInFlight.value = false;
  }
};

const clearFilter = () => {
  filterText.value = '';
};

const setLang = async (lang) => {
  if (!lang || lang === _i18n.state.lang) return;
  await _i18n.setLang(lang);
};
</script>

<style src="../assets/css/pm.css"></style>
