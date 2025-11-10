<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="privacy-modal-overlay" @click.self="handleOverlayClick">
        <div class="privacy-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <!-- Header -->
          <div class="privacy-modal-header">
            <h2 :id="titleId" class="privacy-modal-title">{{ t('privacyPolicyTitle') }}</h2>
            <div class="privacy-modal-lang-switch">
              <button
                type="button"
                class="lang-btn"
                :class="{ active: policyLang === 'en' }"
                @click="policyLang = 'en'"
                :aria-pressed="policyLang === 'en'"
              >
                EN
              </button>
              <button
                type="button"
                class="lang-btn"
                :class="{ active: policyLang === 'id' }"
                @click="policyLang = 'id'"
                :aria-pressed="policyLang === 'id'"
              >
                ID
              </button>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="privacy-modal-content" ref="contentRef">
            <div v-if="policyLang === 'en'" class="privacy-text">
              <h3>Privacy Policy</h3>
              <p><strong>Last Updated:</strong> November 10, 2025</p>
              
              <h4>1. Information We Collect</h4>
              <p>
                When you use our delivery tracking application, we collect the following information:
              </p>
              <ul>
                <li><strong>Phone Number:</strong> We collect your mobile phone number to identify and link your scan records.</li>
                <li><strong>Location Data:</strong> With your permission, we collect your GPS coordinates when you submit delivery updates.</li>
                <li><strong>Delivery Information:</strong> DN numbers, status updates, remarks, and photos you upload.</li>
                <li><strong>Device Information:</strong> Basic device identifiers and browser information for security purposes.</li>
              </ul>

              <h4>2. How We Use Your Information</h4>
              <p>We use the collected information for the following purposes:</p>
              <ul>
                <li>To track and manage delivery records</li>
                <li>To verify delivery locations and ensure compliance</li>
                <li>To link your submissions to your phone number</li>
                <li>To participate in incentive programs like "Early Bird"</li>
                <li>To improve our service and resolve issues</li>
              </ul>

              <h4>3. Information Sharing</h4>
              <p>
                We do not sell your personal information. Your data may be shared with:
              </p>
              <ul>
                <li>Your employer or the company managing delivery operations</li>
                <li>Third-party service providers who help us operate the application</li>
                <li>Legal authorities when required by law</li>
              </ul>

              <h4>4. Data Security</h4>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h4>5. Your Rights</h4>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Withdraw consent for location tracking</li>
              </ul>

              <h4>6. Location Permissions</h4>
              <p>
                Location data is collected only when you submit a delivery update. You can deny location access, but this may affect your eligibility for certain incentive programs.
              </p>

              <h4>7. Data Retention</h4>
              <p>
                We retain your information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law.
              </p>

              <h4>8. Contact Us</h4>
              <p>
                If you have any questions about this Privacy Policy, please contact your supervisor or the application administrator.
              </p>

              <h4>9. Changes to This Policy</h4>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes through the application.
              </p>
            </div>

            <div v-else class="privacy-text">
              <h3>Kebijakan Privasi</h3>
              <p><strong>Terakhir Diperbarui:</strong> 10 November 2025</p>
              
              <h4>1. Informasi yang Kami Kumpulkan</h4>
              <p>
                Ketika Anda menggunakan aplikasi pelacakan pengiriman kami, kami mengumpulkan informasi berikut:
              </p>
              <ul>
                <li><strong>Nomor Ponsel:</strong> Kami mengumpulkan nomor ponsel Anda untuk mengidentifikasi dan mengaitkan catatan pemindaian Anda.</li>
                <li><strong>Data Lokasi:</strong> Dengan izin Anda, kami mengumpulkan koordinat GPS saat Anda mengirimkan pembaruan pengiriman.</li>
                <li><strong>Informasi Pengiriman:</strong> Nomor DN, pembaruan status, catatan, dan foto yang Anda unggah.</li>
                <li><strong>Informasi Perangkat:</strong> Pengidentifikasi perangkat dasar dan informasi browser untuk tujuan keamanan.</li>
              </ul>

              <h4>2. Bagaimana Kami Menggunakan Informasi Anda</h4>
              <p>Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:</p>
              <ul>
                <li>Untuk melacak dan mengelola catatan pengiriman</li>
                <li>Untuk memverifikasi lokasi pengiriman dan memastikan kepatuhan</li>
                <li>Untuk mengaitkan pengiriman Anda dengan nomor ponsel Anda</li>
                <li>Untuk berpartisipasi dalam program insentif seperti "Early Bird"</li>
                <li>Untuk meningkatkan layanan kami dan menyelesaikan masalah</li>
              </ul>

              <h4>3. Berbagi Informasi</h4>
              <p>
                Kami tidak menjual informasi pribadi Anda. Data Anda dapat dibagikan dengan:
              </p>
              <ul>
                <li>Pemberi kerja Anda atau perusahaan yang mengelola operasi pengiriman</li>
                <li>Penyedia layanan pihak ketiga yang membantu kami mengoperasikan aplikasi</li>
                <li>Otoritas hukum bila diperlukan oleh hukum</li>
              </ul>

              <h4>4. Keamanan Data</h4>
              <p>
                Kami menerapkan langkah-langkah teknis dan organisasi yang sesuai untuk melindungi informasi pribadi Anda dari akses, perubahan, pengungkapan, atau penghancuran yang tidak sah.
              </p>

              <h4>5. Hak Anda</h4>
              <p>Anda memiliki hak untuk:</p>
              <ul>
                <li>Mengakses informasi pribadi Anda</li>
                <li>Meminta koreksi data yang tidak akurat</li>
                <li>Meminta penghapusan data Anda (tergantung pada persyaratan hukum)</li>
                <li>Menarik persetujuan untuk pelacakan lokasi</li>
              </ul>

              <h4>6. Izin Lokasi</h4>
              <p>
                Data lokasi hanya dikumpulkan saat Anda mengirimkan pembaruan pengiriman. Anda dapat menolak akses lokasi, tetapi ini dapat memengaruhi kelayakan Anda untuk program insentif tertentu.
              </p>

              <h4>7. Penyimpanan Data</h4>
              <p>
                Kami menyimpan informasi Anda selama diperlukan untuk memenuhi tujuan yang diuraikan dalam kebijakan ini, atau sebagaimana diwajibkan oleh hukum.
              </p>

              <h4>8. Hubungi Kami</h4>
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi supervisor Anda atau administrator aplikasi.
              </p>

              <h4>9. Perubahan Kebijakan Ini</h4>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan signifikan melalui aplikasi.
              </p>
            </div>
          </div>

          <!-- Fixed Footer with Agreement Button -->
          <div class="privacy-modal-footer">
            <button
              type="button"
              class="privacy-agree-btn"
              @click="handleAgree"
              :disabled="!canAgree"
            >
              {{ t('privacyAgreeButton') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from '../i18n/useI18n';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  canDismiss: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['agree', 'update:visible']);

const i18nInstance = await useI18n({ namespaces: ['core', 'index'], fallbackLang: 'id' });
const t = (key) => i18nInstance.t(key);

const policyLang = ref('id'); // Default to Indonesian
const contentRef = ref(null);
const canAgree = ref(true);
const titleId = 'privacy-modal-title';

const handleAgree = () => {
  emit('agree');
  emit('update:visible', false);
};

const handleOverlayClick = () => {
  if (props.canDismiss) {
    emit('update:visible', false);
  }
};

// Reset scroll when language changes
watch(policyLang, async () => {
  await nextTick();
  if (contentRef.value) {
    contentRef.value.scrollTop = 0;
  }
});

// Reset scroll when modal opens
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await nextTick();
    if (contentRef.value) {
      contentRef.value.scrollTop = 0;
    }
  }
});
</script>

<style scoped>
.privacy-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  overflow: hidden;
}

.privacy-modal {
  background: #ffffff;
  border-radius: 16px;
  width: min(640px, 100%);
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.privacy-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.privacy-modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.privacy-modal-lang-switch {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.lang-btn {
  padding: 6px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.lang-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.privacy-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  overscroll-behavior: contain;
}

.privacy-text {
  color: #334155;
  line-height: 1.7;
}

.privacy-text h3 {
  margin: 0 0 16px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.privacy-text h4 {
  margin: 24px 0 12px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.privacy-text p {
  margin: 0 0 16px;
}

.privacy-text ul {
  margin: 12px 0;
  padding-left: 24px;
}

.privacy-text li {
  margin: 8px 0;
}

.privacy-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.privacy-agree-btn {
  width: 100%;
  max-width: 360px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.privacy-agree-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
}

.privacy-agree-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Scrollbar styling */
.privacy-modal-content::-webkit-scrollbar {
  width: 8px;
}

.privacy-modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.privacy-modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.privacy-modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Modal transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .privacy-modal,
.modal-fade-leave-active .privacy-modal {
  transition: transform 0.25s ease;
}

.modal-fade-enter-from .privacy-modal {
  transform: scale(0.95) translateY(20px);
}

.modal-fade-leave-to .privacy-modal {
  transform: scale(0.95) translateY(20px);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .privacy-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .privacy-modal {
    width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }

  .privacy-modal-header {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .privacy-modal-title {
    font-size: 1.25rem;
  }

  .privacy-modal-lang-switch {
    align-self: flex-end;
  }

  .privacy-modal-content {
    padding: 20px;
  }

  .privacy-text h3 {
    font-size: 1.125rem;
  }

  .privacy-text h4 {
    font-size: 1rem;
  }

  .modal-fade-enter-from .privacy-modal {
    transform: translateY(100%);
  }

  .modal-fade-leave-to .privacy-modal {
    transform: translateY(100%);
  }
}
</style>
