const toTrimmedString = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.length ? trimmed : '';
};

const readImportMetaEnv = (key) => {
  if (typeof key !== 'string' || !key) return '';
  try {
    const value = import.meta.env?.[key];
    return toTrimmedString(value);
  } catch (_error) {
    return '';
  }
};

export const getApiBase = () => {
  const envValue = readImportMetaEnv('VITE_API_BASE');
  if (envValue) return envValue;

  if (typeof window !== 'undefined' && window.location?.origin) {
    return toTrimmedString(window.location.origin) || '';
  }

  return '';
};

export const getMapboxAccessToken = () => {
  const envValue = readImportMetaEnv('VITE_MAPBOX_ACCESS_TOKEN');
  if (envValue) return envValue;
  return '';
};

export const getDynamsoftLicenseKey = () => {
  const envValue = readImportMetaEnv('VITE_DYNAMSOFT_LICENSE_KEY');
  if (envValue) return envValue;
  return '';
};

export const getFindSgLpnHwId = () => {
  const envValue = readImportMetaEnv('VITE_FIND_SG_LPN_HW_ID');
  if (envValue) return envValue;
  return 'com.huawei.ipaas.roma.data.subject';
};

export const getFindSgLpnAppKey = () => {
  const envValue = readImportMetaEnv('VITE_FIND_SG_LPN_APPKEY');
  if (envValue) return envValue;
  return '';
};

export const getImageBaseUrl = () => {
  const envValue = readImportMetaEnv('VITE_IMG_BASE');
  if (envValue) {
    return envValue.replace(/\/+$/, '');
  }
  const apiBase = getApiBase();
  return apiBase ? apiBase.replace(/\/+$/, '') : '';
};
