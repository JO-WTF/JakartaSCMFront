<template>
  <div class="wrap scan-view">
    <LanguageSwitcher v-model="state.lang" @change="setLang" />

    <!-- Phone Number Display -->
    <div class="phone-display-card" v-if="phoneNumber">
      <div class="phone-display-content">
        <span class="phone-label">{{ t('currentPhoneLabel') }}:</span>
        <span class="phone-value">{{ phoneNumber }}</span>
      </div>
      <button type="button" class="edit-phone-btn" @click="editPhone">
        {{ t('editPhoneButton') }}
      </button>
    </div>

    <div>
      <h1>{{ t('scanTitle') }}</h1>
    </div>

    <section id="container" class="scan-area container" v-show="!state.hasDN">
      <div id="div-ui-container" style="width: 100%; height: 100%">
        <div class="dce-video-container" style="position: relative; width: 100%; height: 100%"></div>
      </div>

      <div class="corners">
        <div class="c tl"></div>
        <div class="c tr"></div>
        <div class="c bl"></div>
        <div class="c br"></div>
      </div>
    </section>

    <div class="did-input card" style="margin-top: 12px">
      <label for="dnInput">{{ t('didLabel') }}</label>
      <div class="did-row" style="display: flex; align-items: center; gap: 5px">
        <span id="error-icon" v-if="!state.isValid" style="color: red; margin-left: 10px; font-size: 20px">
          ❌
        </span>
        <span id="success-icon" v-if="state.isValid" style="color: green; margin-left: 10px; font-size: 20px">
          ✅
        </span>

        <input id="dnInput" ref="dnInput" class="mono" maxlength="20" v-model="state.dnNumber" style="flex: 1"
          @input="onDNInput" />

        <button class="okBtn" type="button" @click="onOkClick">OK</button>
      </div>
    </div>

    <button class="tag" v-if="torchTagVisible" @click="toggleTorch" :aria-pressed="state.torchOn"
      style="cursor: pointer; user-select: none">
      {{ t('torch') }}：<b>{{ state.torchOn ? t('on') : t('off') }}</b>
    </button>

    <div class="row" v-if="showScanControls">
      <button class="primary" @click="start" :disabled="state.running">
        {{ t('startScan') }}
      </button>
      <button class="ghost" @click="stop" :disabled="!state.running">
        {{ t('stop') }}
      </button>
      <button class="ghost" @click="nextCamera" :disabled="!state.running">
        {{ t('switchCamera') }}
      </button>
    </div>

    <div class="card" v-if="state.hasDN">
      <div class="row">
        <button class="primary" @click="resume">{{ t('restart') }}</button>
      </div>

      <template v-if="state.isValid">
        <div class="contact-pill">
          <div class="contact-pill__items">
            <div class="contact-pill__item">
              <span class="contact-pill__label">{{ t('contactNameLabel') }}</span>
              <span class="contact-pill__value">
                {{ state.contactLoading ? t('contactInfoLoading') : (state.contactName || t('contactInfoUnavailable')) }}
              </span>
            </div>
            <div class="contact-pill__item">
              <span class="contact-pill__label">{{ t('contactPhoneLabel') }}</span>
              <span class="contact-pill__value contact-pill__value--mono">
                {{ state.contactLoading ? t('contactInfoLoading') : (state.contactPhone || t('contactInfoUnavailable')) }}
              </span>
            </div>
          </div>
          <small v-if="state.contactError && !state.contactLoading" class="contact-pill__meta contact-pill__meta--error">
            {{ t('contactInfoErrorPrefix') }} {{ state.contactError }}
          </small>
        </div>

        <div class="status-box" v-show="!state.submitOk">
          <div class="status-row" :class="{ shake: state.needsStatusShake }">
            <div>
              <label for="dnStatusDelivery">{{ t('updateStatusDelivery') }}：</label>
              <select id="dnStatusDelivery" class="status" :class="{ invalid: state.needsStatusHint }"
                v-model="state.dnStatusDelivery" aria-invalid="true"
                @change="() => { state.needsStatusHint = false; state.needsStatusShake = false; }">
                <option value="" disabled>{{ t('choose') }}</option>
                <option v-for="option in scanStatusDeliveryOptions" :key="option.value" :value="option.value">
                  {{ t(option.filterLabelKey) }}
                </option>
              </select>
            </div>
            <div>
              <label for="dnStatusSite">{{ t('updateStatusSite') }}：</label>
              <select id="dnStatusSite" class="status" v-model="state.dnStatusSite">
                <option value="" disabled>{{ t('choose') }}</option>
                <option v-for="opt in scanStatusSiteOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
          </div>
          <div class="hint" v-if="state.needsStatusHint">
            {{ t('needSelectStatus') }}
          </div>

          <div class="flex-2">
            <div class="col">
              <label style="display: block; margin-bottom: 6px">{{ t('remark') }}</label>
              <textarea v-model="state.remark" :placeholder="t('remarkPlaceholder')"></textarea>
            </div>
            <div class="col">
              <label style="display: block; margin-bottom: 6px">{{ t('uploadPhoto') }}</label>
              <div class="uploader">
                <img v-if="state.photoPreview" :src="state.photoPreview" alt="preview" class="thumb" />
                <div style="display: flex; flex-direction: column; gap: 8px">
                  <input type="file" accept="image/*" capture="environment" @change="onPickPhoto" />
                  <small class="muted">{{ t('photoTip') }}</small>
                  <button v-if="state.photoFile" class="ghost" @click="clearPhoto">
                    {{ t('removePhoto') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="locationWarningVisible" class="location-warning">
            <p>{{ t('locationWarningReward') }}</p>
            <p>{{ t('locationWarningRefresh') }}</p>
            <p>{{ t('locationWarningNote') }}</p>
          </div>

          <div class="driver-field-group">
            <div class="driver-field">
              <label for="driverNameInput">{{ t('driverNameLabel') }}</label>
              <div class="driver-input-row">
                <input id="driverNameInput" v-model="state.driverName" type="text" autocomplete="name"
                  autocapitalize="words" :placeholder="t('driverNamePlaceholder')" @blur="handleDriverNameBlur"
                  @input="onDriverNameInput" :class="{ invalid: state.driverNameMissing }" />
                <button v-if="state.driverName" type="button" class="clear-input-btn" @click="clearDriverName"
                  :aria-label="t('clearInput')">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
            <div class="driver-field">
              <label for="driverPhoneInput">{{ t('phoneNumberLabel') }}</label>
              <div class="driver-input-row">
                <input id="driverPhoneInput" v-model="state.driverPhone" type="tel" inputmode="tel" autocomplete="tel"
                  :placeholder="t('phonePlaceholder')" @blur="handleDriverPhoneBlur" @input="onDriverPhoneInput"
                  :class="{ invalid: state.driverPhoneMissing }" />
                <button v-if="state.driverPhone" type="button" class="clear-input-btn" @click="clearDriverPhone"
                  :aria-label="t('clearInput')">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
          </div>

          <button class="primary" style="align-self: flex-start" @click="submitUpdate"
            :disabled="!state.isValid || state.submitting">
            {{ state.submitting ? t('submitting') : t('submit') }}
          </button>

          <div v-if="state.submitting">
            <div class="progress" :class="{ indeterminate: !state.photoFile }">
              <div class="progress-bar" :style="{ width: (state.photoFile ? state.uploadPct : 100) + '%' }"></div>
            </div>
            <div class="progress-text">
              {{
              state.photoFile
              ? `${t('uploadingPct')} ${state.uploadPct}%`
              : t('submittingDots')
              }}
            </div>
          </div>

          <div v-if="state.submitMsg" :class="[state.submitOk ? 'ok' : 'err']">
            {{ state.submitMsg }}
          </div>
        </div>

        <div class="result-box" v-if="state.showResult">
          <h3>{{ t('submittedTitle') }}</h3>
          <div class="result-row" v-for="row in submitSummaryRows" :key="row.key">
            <span class="k">{{ row.label }}:</span>
            <span class="v" :class="{ mono: row.mono }">{{ row.value }}</span>
          </div>
          <div class="result-row" v-if="state.submitView.photo">
            <span class="k">{{ t('photoLabel') }}:</span>
            <img :src="state.submitView.photo" class="thumb" alt="thumb" />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="err">{{ t('invalidId') }}</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Toastify from 'toastify-js';
import Compressor from 'compressorjs';
import { useI18n } from '../i18n/useI18n';
import { useBodyTheme } from '../composables/useBodyTheme';
import { useUpload } from '../composables/useUpload';
import { useAuth } from '../composables/useAuth';
import { useDeviceDetection } from '../composables/useDeviceDetection';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { getApiBase } from '../utils/env.js';
import { createScanner } from '../composables/useScanner';
import '../assets/css/scan.css';
import { isValidDn } from '../utils/dn.js';
import { STATUS_DELIVERY_ITEMS, STATUS_DELIVERY_VALUES, STATUS_SITE_ORDERED_LIST } from '../config.js';
import { deleteCookie } from '../utils/cookie.js';

const PHONE_COOKIE_KEY = 'phone_number';
const DRIVER_NAME_STORAGE_KEY = 'scan_driver_name';
const PHONE_STORAGE_KEY = 'phone_number';
const PRIVACY_AGREED_KEY = 'privacy_agreed';

const _i18n = await useI18n({ namespaces: ['core', 'index'], fallbackLang: 'id', defaultLang: 'id' });

useBodyTheme('scan-theme');

// 初始化 composables
const { uploadWithProgress } = useUpload();
const { getStoredUserName } = useAuth();
const { isMobile: isMobileClient, browserId: browserIdentifier } = useDeviceDetection();
const router = useRouter();

const safeGetLocalStorageItem = (key) => {
  if (typeof window === 'undefined' || !window.localStorage || !key) return '';
  try {
    return window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

const safeSetLocalStorageItem = (key, value) => {
  if (typeof window === 'undefined' || !window.localStorage || !key) return;
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore write errors (private mode, etc.)
  }
};

const phoneNumber = ref(safeGetLocalStorageItem(PHONE_STORAGE_KEY) || '');
const storedUserNameRef = ref('');
const isLoggedIn = computed(() => !!storedUserNameRef.value);

const refreshPhoneNumber = () => {
  const localPhone = safeGetLocalStorageItem(PHONE_STORAGE_KEY);
  phoneNumber.value = localPhone || '';
  return phoneNumber.value;
};

const state = reactive({
  lang: _i18n.state.lang,
  location: null,
  locationError: false,
  hasDN: false,
  dnNumber: '',
  driverName: '',
  driverPhone: '',
  dnStatusSite: '',
  dnStatusDelivery: '',
  remark: '',
  photoFile: null,
  photoPreview: null,
  torchOn: false,
  running: false,
  last: false,
  isValid: false,
  needsStatusHint: false,
  needsStatusShake: false,
  submitting: false,
  submitOk: false,
  submitMsg: '',
  showResult: false,
  submitView: {},
  uploadPct: 0,
  driverNameMissing: false,
  driverPhoneMissing: false,
  contactName: '',
  contactPhone: '',
  contactLoading: false,
  contactError: '',
});

// 使用版本号强制响应式更新
const i18nVersion = ref(0);

i18nVersion.value; // keep dependency
_i18n.onChange((lang) => { state.lang = lang; i18nVersion.value++; });

const dnInput = ref(null);
let scanner = null;
let scannerApi = null;

const t = (key, vars) => { i18nVersion.value; return _i18n.t(key, vars); };

const showScanControls = computed(() => !state.isValid);
const torchTagVisible = computed(() => state.running && !state.isValid);
const locationWarningVisible = computed(() => state.hasDN && state.locationError);
const submitSummaryRows = computed(() => {
  // depend on language changes so labels re-render with the active locale
  state.lang;
  const view = state.submitView || {};

  return [
    {
      key: 'phoneNumber',
      label: t('phoneNumberLabel'),
      value: formatResultText(view.phoneNumber ?? phoneNumber.value),
      mono: true,
    },
    {
      key: 'driverName',
      label: t('driverNameLabel'),
      value: formatResultText(view.driverName || view.updatedBy),
    },
    {
      key: 'dnNumber',
      label: t('dnNumberLabel'),
      value: formatResultText(view.dnNumber),
      mono: true,
    },
    {
      key: 'status_delivery',
      label: t('statusLabel'),
      value: formatResultText(statusLabel(view.status_delivery)),
    },
    {
      key: 'status_site',
      label: t('statusSiteLabel'),
      value: formatResultText(view.status_site),
    },
    {
      key: 'remark',
      label: t('remarkLabel'),
      value: formatResultText(view.remark, true),
    },
    {
      key: 'lng',
      label: t('lng'),
      value: formatCoordinate(view.lng),
    },
    {
      key: 'lat',
      label: t('lat'),
      value: formatCoordinate(view.lat),
    },
  ];
});

const buildContactApiUrl = (dnNumber) => {
  const apiBase = getApiBase();
  if (!apiBase || !dnNumber) return '';
  const normalizedBase = apiBase.replace(/\/+$/, '');
  return `${normalizedBase}/api/dn/contacts/${encodeURIComponent(dnNumber)}`;
};

const resetContactInfo = () => {
  state.contactName = '';
  state.contactPhone = '';
  state.contactError = '';
  state.contactLoading = false;
};

const fetchContactInfo = async (dnNumber) => {
  if (!dnNumber) {
    resetContactInfo();
    return;
  }

  state.contactLoading = true;
  state.contactError = '';
  state.contactName = '';
  state.contactPhone = '';

  try {
    const contactUrl = buildContactApiUrl(dnNumber);
    if (!contactUrl) {
      throw new Error('Contact API unavailable');
    }

    const response = await fetch(contactUrl, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const noDataMsg = 'DN contact service returned no data';
    if (payload?.detail === noDataMsg || payload?.error === noDataMsg) {
      // treat as graceful "no data" so UI shows fallback text without an error badge
      resetContactInfo();
      return;
    }

    const success = payload?.ok === true || payload?.success === true;
    if (!success || !payload?.data) {
      throw new Error(payload?.message || payload?.detail || payload?.error || 'Unknown error');
    }

    const data = payload.data || {};
    state.contactName = data.contact_name || data.daily_work_owner || '';
    state.contactPhone = data.contact_number || data.subcon_contact || '';
  } catch (err) {
    console.error('Failed to fetch contact info:', err);
    state.contactError = err?.message || 'Unknown error';
  } finally {
    state.contactLoading = false;
  }
};

const validateDN = (text) => isValidDn(text);

const getLocation = async () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(`Location error (${err.code}): ${err.message || 'Unknown'}`))
    );
  });

const start = async () => {
  if (!scanner) return;
  try {
    await scanner.show();
    state.running = true;
  } catch (e) {
    state.submitOk = false;
    state.submitMsg = e?.message || 'Camera start failed';
  }
};

const stop = async () => {
  if (!scanner) return;
  try {
    await scanner.stop();
    state.running = false;
  } catch (e) {
    state.submitOk = false;
    state.submitMsg = e?.message || 'Camera stop failed';
  }
};

const setTorch = async (on) => {
  if (!scanner) return;
  try {
    if (on) {
      await scanner.turnOnTorch();
    } else {
      await scanner.turnOffTorch();
    }
    state.torchOn = on;
  } catch (e) {
    Toastify({
      text: t('torchFailed') || 'Torch toggle failed',
      duration: 1000,
      gravity: 'bottom',
      position: 'center',
      style: { background: 'linear-gradient(to right, #ff3333,  #ff3333)' },
    }).showToast();
  }
};

const toggleTorch = async () => {
  await setTorch(!state.torchOn);
};

const nextCamera = async () => {
  if (!scanner) return;
  const cameras = await scanner.getAllCameras();
  if (!Array.isArray(cameras) || cameras.length === 0) return;
  if (cameras.length === 1) {
    Toastify({
      text: t('onlyOneCamera') || 'Only one camera',
      duration: 1000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
    return;
  }
  const current = await scanner.getCurrentCamera();
  const idx = Math.max(0, cameras.findIndex((c) => c.deviceId === current?.deviceId));
  const next = cameras[(idx + 1) % cameras.length];
  await scanner.setCurrentCamera(next);
  Toastify({
    text: next?.label || 'Camera',
    duration: 1000,
    gravity: 'bottom',
    position: 'center',
    style: { background: 'linear-gradient(to right, #00b09b, #96c93d)' },
  }).showToast();
};

const resume = async () => {
  state.last = false;
  state.showResult = false;
  state.submitMsg = '';
  state.submitOk = false;
  state.dnStatusDelivery = '';
  state.remark = '';
  state.photoFile = null;
  if (state.photoPreview) URL.revokeObjectURL(state.photoPreview);
  state.photoPreview = null;
  state.needsStatusHint = false;
  state.needsStatusShake = false;
  state.hasDN = false;
  state.isValid = false;
  state.dnNumber = '';
  state.location = null;
  state.locationError = false;
  resetContactInfo();
  try {
    await start();
  } catch (e) {
    console.error(e);
  }
};

// 压缩图片的辅助函数
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8,
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err);
      },
    });
  });
};

const onPickPhoto = async (e) => {
  const originalFile = e.target.files?.[0] || null;
  
  if (!originalFile) {
    state.photoFile = null;
    if (state.photoPreview) URL.revokeObjectURL(state.photoPreview);
    state.photoPreview = null;
    return;
  }

  try {
    // 压缩图片
    const compressedFile = await compressImage(originalFile);
    
    // 保留原始文件名
    const finalFile = new File([compressedFile], originalFile.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
    
    state.photoFile = finalFile;
    if (state.photoPreview) URL.revokeObjectURL(state.photoPreview);
    state.photoPreview = URL.createObjectURL(finalFile);
    
    // 显示压缩成功提示
    const originalSizeKB = (originalFile.size / 1024).toFixed(2);
    const compressedSizeKB = (finalFile.size / 1024).toFixed(2);
    console.log(`Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
  } catch (err) {
    console.error('Image compression failed:', err);
    
    // 压缩失败时使用原图
    state.photoFile = originalFile;
    if (state.photoPreview) URL.revokeObjectURL(state.photoPreview);
    state.photoPreview = URL.createObjectURL(originalFile);
    
    Toastify({
      text: t('compressionFailed') || 'Image compression failed, using original',
      duration: 2000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  }
};

const clearPhoto = () => {
  state.photoFile = null;
  if (state.photoPreview) URL.revokeObjectURL(state.photoPreview);
  state.photoPreview = null;
};

const scanStatusDeliveryOptions = (STATUS_DELIVERY_ITEMS || []).filter(
  (item) => item && item.value !== (STATUS_DELIVERY_VALUES && STATUS_DELIVERY_VALUES.NO_STATUS)
);
const scanStatusSiteOptions = STATUS_SITE_ORDERED_LIST || [];
const scanStatusMetaMap = new Map(scanStatusDeliveryOptions.map((item) => [item.value, item]));

const STATUS_TRANSLATION_MAP = scanStatusDeliveryOptions.reduce(
  (acc, item) => {
    acc[item.value] = item.filterLabelKey;
    return acc;
  },
  {
    '运输中': 'inTransit',
    '过夜': 'overnight',
    '已到达': 'arrived',
  }
);

const statusLabel = (v) => {
  if (!v) return '-';
  const meta = scanStatusMetaMap.get(v);
  if (meta) {
    const key = STATUS_TRANSLATION_MAP[v];
    if (key) {
      const translated = t(key);
      if (translated && translated !== key) return translated;
    }
  } else {
    const key = STATUS_TRANSLATION_MAP[v];
    if (key) {
      const translated = t(key);
      if (translated && translated !== key) return translated;
    }
  }
  return v;
};

const formatResultText = (val, allowTrim = false) => {
  if (val == null) return '-';
  if (typeof val === 'string') {
    const text = allowTrim ? val.trim() : val;
    return text === '' ? '-' : text;
  }
  return String(val);
};

const formatCoordinate = (val) => {
  if (val == null) return '-';
  const num = Number(val);
  if (Number.isFinite(num)) {
    return String(Math.round(num * 1e6) / 1e6);
  }
  return formatResultText(val);
};

const persistPhoneNumber = (value) => {
  const trimmed = (value || '').trim();
  phoneNumber.value = trimmed;
  safeSetLocalStorageItem(PHONE_STORAGE_KEY, trimmed);
};

const persistDriverName = (value) => {
  const trimmed = (value || '').trim();
  safeSetLocalStorageItem(DRIVER_NAME_STORAGE_KEY, trimmed);
};

const handleDriverPhoneBlur = () => {
  const trimmed = (state.driverPhone || '').trim();
  state.driverPhone = trimmed;
  if (!trimmed) {
    if (!isLoggedIn.value) {
      persistPhoneNumber('');
    }
    return;
  }
  state.driverPhoneMissing = false;
  persistPhoneNumber(trimmed);
};

const handleDriverNameBlur = () => {
  state.driverName = (state.driverName || '').trim();
  if (state.driverName) {
    state.driverNameMissing = false;
  }
  if (!isLoggedIn.value) {
    persistDriverName(state.driverName);
  }
};

const onDriverNameInput = () => {
  if (state.driverNameMissing && state.driverName?.trim()) {
    state.driverNameMissing = false;
  }
};

const onDriverPhoneInput = () => {
  if (state.driverPhoneMissing && state.driverPhone?.trim()) {
    state.driverPhoneMissing = false;
  }
};

const clearDriverName = () => {
  state.driverName = '';
  state.driverNameMissing = false;
  persistDriverName('');
};

const clearDriverPhone = () => {
  state.driverPhone = '';
  state.driverPhoneMissing = false;
  persistPhoneNumber('');
};

// resolveClientProfile, getStoredUserName, uploadWithProgress 现在来自 composables

const submitUpdate = async () => {
  if (!state.isValid) return;
  if (!state.dnStatusDelivery) {
    state.needsStatusHint = true;
    state.needsStatusShake = true;
    return;
  }

  if (!state.photoFile && !state.photoPreview) {
    Toastify({
      text: t('needWatermarkedPhoto'),
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
    return;
  }

  const driverNameForSubmit = (state.driverName || '').trim();
  state.driverName = driverNameForSubmit;
  if (!driverNameForSubmit) {
    state.driverNameMissing = true;
    Toastify({
      text: t('driverNameMissingToast') || 'Driver name required',
      duration: 2500,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
    return;
  }

  const inputPhone = (state.driverPhone || '').trim();
  state.driverPhone = inputPhone;
  if (!inputPhone) {
    state.driverPhoneMissing = true;
    Toastify({
      text: t('phoneMissingToast'),
      duration: 2500,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
    return;
  }

  state.driverNameMissing = false;
  state.driverPhoneMissing = false;

  persistDriverName(driverNameForSubmit);
  persistPhoneNumber(inputPhone);

  state.submitting = true;
  state.uploadPct = 0;
  state.submitMsg = '';
  state.submitOk = false;

  const currentPhone = inputPhone;

  try {
    const API_BASE = getApiBase();
    let storedUserName = storedUserNameRef.value;
    if (!storedUserName) {
      storedUserName = getStoredUserName() || '';
      storedUserNameRef.value = storedUserName;
    }
    let submissionDriverName = driverNameForSubmit;
    if (storedUserName) {
      submissionDriverName = `${driverNameForSubmit} (by ${storedUserName})`;
    } else if (!isMobileClient && browserIdentifier) {
      submissionDriverName = `${driverNameForSubmit} (by ${browserIdentifier})`;
    }
    const updatedBy = submissionDriverName || storedUserName || (isMobileClient ? 'driver' : browserIdentifier);

    if (!API_BASE) {
      await new Promise((r) => setTimeout(r, 300));
      state.uploadPct = 100;
      state.submitOk = true;
      state.submitMsg = t('submitSuccess') || 'Submitted';

      state.submitView = {
        phoneNumber: currentPhone,
        dnNumber: state.dnNumber,
        status_delivery: state.dnStatusDelivery,
        status_site: state.dnStatusSite,
        remark: state.remark,
        updatedBy,
        driverName: submissionDriverName,
        photo: state.photoPreview || null,
        lng: state.location?.lng,
        lat: state.location?.lat,
      };
      state.showResult = true;
      state.last = true;
      return;
    }

    const url = API_BASE.replace(/\/+$/, '') + '/api/dn/update';

    const fd = new FormData();
    fd.append('dnNumber', state.dnNumber);
    fd.append('status_delivery', state.dnStatusDelivery ?? '');
    fd.append('status_site', state.dnStatusSite ?? '');
    fd.append('remark', state.remark ?? '');
    fd.append('lng', state.location?.lng ?? '');
    fd.append('lat', state.location?.lat ?? '');
    fd.append('phone_number', currentPhone);
    fd.append('updated_by', updatedBy);

    if (state.photoFile instanceof File) {
      fd.append('photo', state.photoFile, state.photoFile.name || 'photo');
    } else if (typeof state.photoPreview === 'string' && state.photoPreview) {
      fd.append('photo', state.photoPreview);
    } else {
      fd.append('photo', '');
    }

    await uploadWithProgress({
      url,
      formData: fd,
      onProgress: (pct) => {
        state.uploadPct = Math.min(99, pct);
      },
      timeoutMs: 15000,
    });

    state.uploadPct = 100;
    state.submitOk = true;
    state.submitMsg = t('submitSuccess') || 'Submitted';

    state.submitView = {
      phoneNumber: currentPhone,
      dnNumber: state.dnNumber,
      status_delivery: state.dnStatusDelivery,
      status_site: state.dnStatusSite,
      remark: state.remark,
      updatedBy,
      driverName: submissionDriverName,
      photo: state.photoPreview || null,
      lng: state.location?.lng,
      lat: state.location?.lat,
    };
    state.showResult = true;
    state.last = true;
  } catch (e) {
    const prefix = t('submitHttpErrPrefix') || 'Submit failed: ';
    state.submitOk = false;
    state.submitMsg = `${prefix}${e?.message || 'Error'}`;
    console.error('submit error', e);
  } finally {
    state.submitting = false;
  }
};

const onCodeScanned = async (codeResult) => {
  state.isValid = validateDN(codeResult);
  if (state.isValid) {
    await stop();
    hideKeyboard();
    state.dnNumber = codeResult.toUpperCase();
  }
};

const onDNInput = () => {
  state.dnNumber = (dnInput.value?.value || '').toUpperCase();
  state.isValid = validateDN(state.dnNumber);
};

const onOkClick = async () => {
  state.dnNumber = (dnInput.value?.value || '').toUpperCase();
  state.isValid = validateDN(state.dnNumber);

  let contactPromise = null;
  if (state.isValid) {
    await stop();
    hideKeyboard();
    state.hasDN = true;
    contactPromise = fetchContactInfo(state.dnNumber);
  } else {
    state.hasDN = false;
    resetContactInfo();
  }

  state.locationError = false;
  state.location = null;
  try {
    const location = await getLocation();
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);
    if (hasValidCoords) {
      state.location = { lat, lng };
      state.locationError = false;
    } else {
      state.location = { lat: null, lng: null };
      state.locationError = true;
    }
  } catch (e) {
    console.error('Failed to get location:', e);
    state.location = { lat: null, lng: null };
    state.locationError = true;
  }

  if (contactPromise) {
    try {
      await contactPromise;
    } catch (err) {
      console.error('Contact info promise rejected:', err);
    }
  }
};

const hideKeyboard = () => {
  try {
    const el = dnInput.value;
    if (el && typeof el.blur === 'function') {
      const wasReadonly = el.readOnly;
      el.readOnly = true;
      el.blur();
      el.readOnly = wasReadonly;
    }
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    setTimeout(() => {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  } catch (err) {
    console.error(err);
  }
};

const setLang = async (lang) => {
  await _i18n.setLang(lang);
  state.lang = lang;
};

const editPhone = async () => {
  // Clear the stored phone number and privacy agreement
  deleteCookie(PHONE_COOKIE_KEY);
  deleteCookie(PRIVACY_AGREED_KEY);
  phoneNumber.value = '';
  
  // Navigate to phone number view
  const redirectTo = router.currentRoute?.value?.fullPath || '/';
  await router.replace({ name: 'phone', query: { redirect: redirectTo } });
};

onMounted(async () => {
  storedUserNameRef.value = getStoredUserName() || '';
  const currentPhone = refreshPhoneNumber();
  if (!currentPhone) {
    const redirectTo = router.currentRoute?.value?.fullPath || '/';
    await router.replace({ name: 'phone', query: { redirect: redirectTo } });
    return;
  }

  const savedDriverName = safeGetLocalStorageItem(DRIVER_NAME_STORAGE_KEY);
  if (savedDriverName) {
    state.driverName = savedDriverName;
    state.driverNameMissing = false;
  }

  const savedPhone = safeGetLocalStorageItem(PHONE_STORAGE_KEY) || currentPhone;
  if (savedPhone) {
    state.driverPhone = savedPhone;
    state.driverPhoneMissing = false;
    persistPhoneNumber(state.driverPhone);
  }

  if (storedUserNameRef.value) {
    Toastify({
      text: `You are logged in as ${storedUserNameRef.value}.`,
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  }

  if (!window?.Dynamsoft?.DBR?.BarcodeScanner) {
    state.submitOk = false;
    state.submitMsg = 'Scanner SDK not loaded';
    return;
  }
  try {
    scannerApi = await createScanner();
    await scannerApi.init();
    scanner = scannerApi;
    const container = document.getElementById('div-ui-container');
    if (container) await scannerApi.setUIElement(container);
    scannerApi.setVideoFit('cover');
    // set visuals when underlying scanner exists
    try { scannerApi.barcodeFillStyle = 'rgba(73,245,73,0)'; } catch {}
    try { scannerApi.barcodeLineWidth = 5; } catch {}
    try { scannerApi.barcodeStrokeStyle = 'rgba(73,245,73,1)'; } catch {}
    scannerApi.setOnUniqueRead((txt) => onCodeScanned(txt));
    await scannerApi.show();
    state.running = true;
  } catch (e) {
    state.submitOk = false;
    state.submitMsg = e?.message || 'Camera start failed';
  }
});

onBeforeUnmount(async () => {
  try { if (scannerApi) await scannerApi.stop(); } catch {}
  if (state.photoPreview) {
    URL.revokeObjectURL(state.photoPreview);
  }
  try {
    await scanner?.destroyContext?.();
  } catch {}
});
</script>

<style scoped>
.scan-view {
  padding-bottom: 40px;
}

.phone-display-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.phone-display-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.phone-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.phone-value {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-phone-btn {
  padding: 6px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.edit-phone-btn:hover {
  background: #f8fafc;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.edit-phone-btn:active {
  transform: translateY(0);
}

.contact-pill {
  background: rgba(8, 14, 34, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 16px 24px;
  margin: 16px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: inherit;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.contact-pill__items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.contact-pill__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.contact-pill__label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.contact-pill__value {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.contact-pill__value--mono {
  font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
  letter-spacing: 0.04em;
}

.contact-pill__meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.contact-pill__meta--error {
  color: #fecaca;
}

.driver-field-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 12px;
}

.driver-input-row {
  position: relative;
  display: flex;
  align-items: center;
}

.driver-field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.driver-field input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: rgba(8, 14, 34, 0.45);
  color: inherit;
  font-size: 15px;
  line-height: 1.45;
  padding-right: 36px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  flex: 1;
}

.driver-field input::placeholder {
  color: rgba(234, 242, 255, 0.5);
}

.driver-field input:focus {
  outline: none;
  border-color: rgba(99, 179, 237, 0.75);
  box-shadow: 0 0 0 1px rgba(99, 179, 237, 0.32);
  background: rgba(15, 28, 58, 0.75);
}

.driver-field input.invalid {
  border-color: rgba(239, 68, 68, 0.85);
  box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.4);
  background: rgba(56, 10, 10, 0.45);
}

.clear-input-btn {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.clear-input-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.clear-input-btn span {
  line-height: 1;
  font-size: 16px;
}

@media (max-width: 600px) {
  .phone-display-card {
    padding: 10px 14px;
    margin-bottom: 12px;
  }

  .phone-label,
  .phone-value {
    font-size: 13px;
  }

  .edit-phone-btn {
    padding: 5px 12px;
    font-size: 13px;
  }

  .contact-pill {
    border-radius: 32px;
    padding: 12px 18px;
  }

  .contact-pill__items {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .contact-pill__value {
    font-size: 15px;
  }
}
</style>
