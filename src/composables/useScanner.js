// Lightweight wrapper around Dynamsoft BarcodeScanner to reuse scanner logic
import { getDynamsoftLicenseKey } from '../utils/env.js';

export async function createScanner() {
  let scanner = null;
  let licenseConfigured = false;

  const ensureAvailable = () => {
    if (!window?.Dynamsoft?.DBR?.BarcodeScanner) {
      throw new Error('Dynamsoft BarcodeScanner SDK not available');
    }
  };

  const ensureLicense = () => {
    if (licenseConfigured) return;
    try {
      const license = getDynamsoftLicenseKey();
      if (license && window?.Dynamsoft?.DBR) {
        window.Dynamsoft.DBR.BarcodeScanner.license = license;
      }
    } catch (err) {
      console.warn('Failed to configure Dynamsoft license', err);
    }
    licenseConfigured = true;
  };

  const init = async () => {
    ensureAvailable();
    ensureLicense();
    if (!scanner) {
      scanner = await window.Dynamsoft.DBR.BarcodeScanner.createInstance();
    }
    return scanner;
  };

  const setUIElement = async (el) => {
    await init();
    if (el && typeof scanner.setUIElement === 'function') await scanner.setUIElement(el);
  };

  const setVideoFit = (v) => { if (scanner && typeof scanner.setVideoFit === 'function') scanner.setVideoFit(v); };
  const show = async () => { if (!scanner) await init(); if (typeof scanner.show === 'function') return scanner.show(); };
  const stop = async () => { if (scanner && typeof scanner.stop === 'function') return scanner.stop(); };
  const hide = async () => { if (!scanner) await init(); if (typeof scanner.hide === 'function') return scanner.hide(); };
  const destroyContext = async () => { if (scanner && typeof scanner.destroyContext === 'function') return scanner.destroyContext(); };
  const setOnUniqueRead = (fn) => { if (scanner) scanner.onUniqueRead = fn; };
  const getAllCameras = async () => { if (!scanner) await init(); return (typeof scanner.getAllCameras === 'function') ? scanner.getAllCameras() : []; };
  const getCurrentCamera = async () => { if (!scanner) await init(); return (typeof scanner.getCurrentCamera === 'function') ? scanner.getCurrentCamera() : null; };
  const setCurrentCamera = async (cam) => { if (!scanner) await init(); if (typeof scanner.setCurrentCamera === 'function') return scanner.setCurrentCamera(cam); };
  const turnOnTorch = async () => { if (!scanner) await init(); if (typeof scanner.turnOnTorch === 'function') return scanner.turnOnTorch(); };
  const turnOffTorch = async () => { if (!scanner) await init(); if (typeof scanner.turnOffTorch === 'function') return scanner.turnOffTorch(); };

  return {
    init,
    setUIElement,
    setVideoFit,
    show,
    stop,
    hide,
    destroyContext,
    setOnUniqueRead,
    getAllCameras,
    getCurrentCamera,
    setCurrentCamera,
    turnOnTorch,
    turnOffTorch,
  };
}
