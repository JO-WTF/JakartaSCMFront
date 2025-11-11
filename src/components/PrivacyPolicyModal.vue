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
              <h3>Huawei Indonesian Fast Track Application</h3>
              <h4>Personal Statement</h4>
              <p><strong>To the user,</strong></p>
              <p>
                The information you fill in this form will log into the Huawei Tech Investment fast track system, and/or its affiliates
                (collectively called "Huawei", "we", "us", and "ours"). We understand how important your privacy is and we respect
                your privacy. Please read carefully this Privacy Statement ("Statement") before sending your personal information to
                us. This statement applies to Huawei's websites, products, and services that display or provide links to this Statement.
                Specifically, this statement applies to Huawei Technologies Co., Ltd. whose registration is in Huawei Global HQ in
                Bantian, Longgang District, Shenzhen.
              </p>
              <p>
                The following statement explains how we process your personal information. However, this statement may not discuss all
                possible scenarios in data processing. Huawei can inform you of the collection of special data products or services
                through policies or additional notices given before collection. This statement explains:
              </p>
              <ol>
                <li>How We Collect and Use Your Personal Information</li>
                <li>How We Use cookies and Similar Technologies</li>
                <li>How We Refuse Your Personal Information</li>
                <li>How You Use Your Rights in Processing Personal Information</li>
                <li>How We Protect Your Personal Information</li>
                <li>Third Party Providers and Services</li>
                <li>How Your Personal Information Globally Transfers</li>
                <li>How's this Statement Updated</li>
                <li>How to contact us</li>
              </ol>

              <h4>1. How We Collect and Use Your Personal Information</h4>
              <p>
                <strong>1.1 The collection of personal information</strong> refers to any type of information recorded electronically
                or in any other way relating to an identified or identifiable person, excluding any information that has been
                anonymized. We may collect your personal information when you use our products or services or interact with us. Various
                types of data will be collected, depending on the products and services you use and your interactions with us. In some
                cases, you may choose not to disclose your personal information to Huawei. However, not giving any particular data to
                Huawei can mean that we cannot provide you with a particular product or service or respond to the problems you're
                proposing. We will collect and use your personal information only for the purposes described in this Statement. Here
                are some examples of personal information that we can collect:
              </p>
              <ul>
                <li><strong>(a) The data you give us directly:</strong> you may need to provide a phone number, name, and location to make it included in the application, so you can use an update on the material location.</li>
                <li><strong>(b) Information that we collect when you use our services:</strong> When you use our services, we can collect information such as your name and device versions, operating system versions, application versions, region and language settings, as well as data stored on your device as cookies.</li>
                <li><strong>(c) Data from third-party sources:</strong> If permitted by law, we can collect personal information about you from other public or commercial sources (e.g., social media).</li>
                <li><strong>(d) Data generated during activity:</strong> We may collect personal information about you during the delivery activity, including location information and delivery status.</li>
              </ul>
              <p>
                <strong>1.2 Uses:</strong> We may use your personal information for the following purposes in the status update:
              </p>
              <ul>
                <li>Manage material Location applications;</li>
                <li>Make an evaluation of the delivery and delivery status;</li>
                <li>Creates timing calculations and delivery KPI calculations.</li>
              </ul>

              <h4>2. How We Use cookies and Similar Technologies</h4>
              <h5>2.1 Cookies</h5>
              <p>
                To ensure that our website functions correctly, we sometimes store data known as cookies on your computer or device.
                cookies is a text file stored on a computer or mobile device via a web server. Only the servers allow cookies to retrieve
                or read the contents in that cookies. Every cookies has a uniqueness. cookies usually contains an identity, a site name,
                and some numbers and characters. Like many other website service providers or Internet services, we use cookies to
                improve user experience. cookies allows the site to remember users, either for a single visit (using cookies sessions) or
                repeated visits (using persistent cookies). cookies allows sites to save your settings, such as language, font size, and
                continuous preferences for your computer or mobile device. It means that you don't need to have your preferences set up
                for any visits. However, if a website does not use cookies it will think you are a new user whenever you move a new page
                on this site. This means that even after you "log in", if you navigate another page, the website won't remember you, and
                you'll get out again. Huawei does not use cookies for any purpose other than mentioned in this statement. You can manage
                or delete cookies based on your preferences. For details, please see AboutCookies.org. You can clean all the cookies
                stored on your computer and most web browsers can be set to block cookies's. However, if you do, you may have to manually
                change your user settings every time you visit our site. For more information on how to change settings, please visit the
                following links: Internet Explorer; Google Chrome; Mozilla Firefox; Safari; Opera.
              </p>
              <h5>2.2 Web beacon and pixel tags</h5>
              <p>
                In addition to cookies, we can also use other similar technologies, such as beacon web and pixel tags, on our website.
                For example, when you receive an email from Huawei, it may contain URLs that link to Huawei's webpage. If you click on
                that link, Huawei will track your visit to help us study your preferences for products and services and improve our
                customer service. The beacon Web is a transparent graphic image pinned on a website or email. Pixel tags in the email let
                us know if the email has been opened or not. You can unsubscribe from the Huawei mailing list anytime if you don't want
                to be tracked this way. By using our website, you agree to the use of cookies, beacon webs, and pixel tags as described
                above.
              </p>

              <h4>3. How We Refuse Your Personal Information</h4>
              <p>We will disclose your personal information only under the following circumstances:</p>
              <ol>
                <li><strong>3.1 disclosure with your consent:</strong> We may share your personal information with other parties after obtaining your firm consent.</li>
                <li><strong>3.2 disclosure to official partners ("Our Partners"):</strong> some Huawei services are provided by our Partners. We can share some of your personal data with our Partners to offer you better customer service and experience. Your personal data can only be processed for specified, explicit and legitimate purposes, and only data is necessary to offer discloseable services. The subsidiary or Huawei Partners are not authorized to use shared personal data for any other purpose.</li>
                <li><strong>3.3 disclosure on a reasonable or legitimate basis:</strong> we may disclose your personal information when required by applicable law or to respond to legal procedures. If Huawei is involved in restructuring, mergers &amp; acquisitions, segregation, or bankruptcy lawsuits or liquidation lawsuits in certain jurisdictions, your personal information can be disclosed to parties associated with those transactions. Huawei can also disclose your data if reasonable needs can be proven, such as to uphold our terms and conditions and to protect our customers.</li>
              </ol>

              <h4>4. How you Use your Rights in the Processing of Personal Information</h4>
              <p>
                It is your responsibility to ensure that all personal information provided to Huawei is correct. Huawei is committed to
                keeping the accuracy and integrity of your personal information as well as keeping those data up to date. As far as
                required by applicable law, you may have the right to:
              </p>
              <ol>
                <li>access and copy certain personal information that we keep about you;</li>
                <li>requesting that we update or correct the inaccuracies in that data;</li>
                <li>rejects or restricts the use of your personal information by us;</li>
                <li>requests us to remove your personal information;</li>
                <li>withdraw consent to the processing of your personal information that has been provided;</li>
                <li>Ask us to explain the rules of processing personal information.</li>
              </ol>
              <p>
                To use these rights, please
                <a
                  href="https://www.huawei.com/en/personal-data-request"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  click here
                </a>
                to provide your response online. Your request can be filed in writing to ensure
                security. We will verify your personal identity as required by local law. We can deny your request if we have reasonable
                reasons to believe that the request is fraud, unworthy, or could jeopardize the privacy of others. If permitted by
                applicable law, you have the right to withdraw your consent at any time when Huawei processes your personal information
                based on your consent. However, withdrawal does not affect the validity and effectiveness of the way we process your
                personal information based on your consent before the withdrawal is made; it also does not affect the processing of any
                information based on any other justification other than your consent.
              </p>

              <h4>5. How We Protect Your Personal Information</h4>
              <p>
                The Security of Your Personal Information is important to us. We are taking appropriate physical, organizational, and
                technical measures to protect your personal information from access, disclosure, use, modification, damage or
                unauthorized loss. For example, we use cryptographic technology to protect the security of certain personal information;
                we take protection measures to prevent malicious attacks; and we use access control mechanisms to allow only legitimate
                access to your personal information. We also provide training on data security and privacy protection for our employees
                to raise their awareness of personal information protection. We will retain your personal information as required by law
                or regulations and no longer than necessary to meet the purposes of gathering personal information. According to Huawei's
                personal information storage policy, we regularly review, archive, and remove personal information unless we have a legal
                basis for extending the storage period. Huawei is committed to protecting your personal information; however, please know
                that no security measures are perfect.
              </p>

              <h4>6. Third Party Providers and Services</h4>
              <p>
                To ensure a smooth user experience, you may receive content or web links from third parties other than Huawei and our
                Partners ("third parties"). Huawei has no control over web sites, products, or third party services, but you can choose
                to use links, view content, and/or access products or services provided by third parties. Huawei cannot control third
                party's privacy and data protection statements, because those third parties are not subject to this statement. Before
                sending your personal information to those third parties, please read carefully their privacy and data protection
                statements.
              </p>

              <h4>7. How is your Personal Information Globally transferred?</h4>
              <p>
                Huawei is a multinational company, which means that personal information collected by Huawei can be processed or accessed
                in the country or region where Huawei or its affiliates, its subsidiaries, or its service providers are located. This
                jurisdiction may have data protection laws that are different from countries or regions where your personal information
                comes from. Under such circumstances, Huawei will take measures to ensure that your personal information is processed as
                required by this Statement and the prevailing laws. For example, when transferring personal information subject data from
                the UAE to a country or region that is not yet recognized by the European Commission as a country that has an adequate
                level of data protection, we can use various legal mechanisms, such as signing standard contract clauses approved by the
                European Commission or implementing security measures such as anonymizing personal information before cross-border data
                transfers.
              </p>

              <h4>8. How’s This Statement is Updated</h4>
              <p>
                Huawei reserves the right to update or amend this statement at any time. We will release the latest Privacy Statement on
                this page in case of any change. If any major changes are made to this statement, we can notify you through various
                channels.
              </p>

              <h4>9. How To Contact Us</h4>
              <p>
                If you have privacy issues and would like to contact Huawei's DPO, please click Here. Note: Due to the different laws and
                local languages, the local version of this Privacy Statement may differ from this version. In the event of a conflict, a
                local version will apply.
              </p>
              <p>
                For the information power about job description and requirement of our current open, please click the link:
                <a
                  href="https://www.canva.com/design/DAF0CvbYRRY/gbsgO2ICoC3WZb8-ss5ZsA/edit?utm_content=DAF0CvbYRRY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Link
                </a>
              </p>
            </div>

            <div v-else class="privacy-text">
              <h3>Huawei Indonesia Fast Track Application</h3>
              <h4>Pernyataan Pribadi</h4>
              <p><strong>Kepada pengguna,</strong></p>
              <p>
                Informasi yang Anda isi dalam formulir ini akan masuk ke sistem fast track PT Huawei Tech Investment, dan/atau afiliasinya
                (secara kolektif disebut "Huawei", "kami", "kita", dan "milik kami"). Kami memahami betapa pentingnya privasi Anda dan
                kami menghormati privasi Anda. Harap baca dengan saksama Pernyataan Privasi ini ("Pernyataan") sebelum mengirimkan
                informasi pribadi Anda kepada kami. Pernyataan ini berlaku untuk situs web, produk, dan layanan Huawei yang menampilkan
                atau menyediakan tautan ke Pernyataan ini. Secara khusus, Pernyataan ini berlaku untuk situs web milik Huawei Technologies
                Co., Ltd. yang tempat pendaftarannya berada di Huawei Global HQ di Bantian, Distrik Longgang, Shenzhen.
              </p>
              <p>
                Pernyataan berikut menjelaskan cara kami memproses informasi pribadi Anda. Namun, Pernyataan ini mungkin tidak membahas
                semua kemungkinan skenario dalam pemrosesan data. Huawei dapat memberi tahu Anda tentang pengumpulan data khusus produk
                atau layanan melalui kebijakan atau pemberitahuan tambahan yang diberikan sebelum pengumpulan. Pernyataan ini menjelaskan:
              </p>
              <ol>
                <li>Bagaimana Kami Mengumpulkan dan Menggunakan Informasi Pribadi Anda</li>
                <li>Bagaimana Kami Menggunakan Cookies dan Teknologi Serupa</li>
                <li>Bagaimana Kami Mengungkapkan Informasi Pribadi Anda</li>
                <li>Bagaimana Anda Menggunakan Hak Anda dalam Pemrosesan Informasi Pribadi</li>
                <li>Bagaimana Kami Melindungi Informasi Pribadi Anda</li>
                <li>Penyedia Pihak Ketiga dan Layanannya</li>
                <li>Bagaimana Informasi Pribadi Anda Ditransfer Secara Global</li>
                <li>Bagaimana Pernyataan Ini Diperbarui</li>
                <li>Bagaimana Cara Menghubungi Kami</li>
              </ol>

              <h4>1. Bagaimana Kami Mengumpulkan dan Menggunakan Informasi Pribadi Anda</h4>
              <p>
                <strong>1.1 Pengumpulan informasi pribadi</strong> mengacu pada semua jenis informasi yang direkam secara elektronik
                atau dengan cara lain yang berkaitan dengan perseorangan yang teridentifikasi atau dapat diidentifikasi, tidak termasuk
                informasi yang telah dianonimkan. Kami dapat mengumpulkan informasi pribadi Anda saat Anda menggunakan produk atau layanan
                kami atau berinteraksi dengan kami. Berbagai jenis data akan dikumpulkan, tergantung pada produk dan layanan yang Anda
                gunakan dan interaksi Anda dengan kami. Dalam beberapa kasus, Anda dapat memilih untuk tidak mengungkapkan informasi
                pribadi Anda kepada Huawei. Namun, tidak memberikan data tertentu kepada Huawei dapat berarti bahwa kami tidak dapat
                menyediakan Anda dengan produk atau layanan tertentu atau menanggapi masalah yang Anda ajukan. Kami akan mengumpulkan dan
                menggunakan informasi pribadi Anda hanya untuk tujuan yang dijelaskan dalam Pernyataan ini. Berikut ini adalah beberapa
                contoh informasi pribadi yang dapat kami kumpulkan:
              </p>
              <ul>
                <li><strong>(a) Data yang Anda berikan langsung kepada kami:</strong> Anda mungkin perlu memberikan nomor telepon, nama, dan lokasi untuk membuat dicantumkan dalam aplikasi, sehingga Anda dapat menggunakan pembaruan terhadap lokasi material.</li>
                <li><strong>(b) Informasi yang kami kumpulkan saat Anda menggunakan layanan kami:</strong> Saat Anda menggunakan layanan kami, kami dapat mengumpulkan informasi seperti nama dan versi perangkat Anda, versi sistem operasi, versi aplikasi, pengaturan wilayah dan bahasa, serta data yang disimpan di perangkat Anda sebagai cookies.</li>
                <li><strong>(c) Data dari sumber pihak ketiga:</strong> Jika diizinkan oleh hukum, kami dapat mengumpulkan informasi pribadi tentang Anda dari sumber publik atau komersial lainnya (misalnya, media sosial).</li>
                <li><strong>(d) Data yang dihasilkan selama aktivitas:</strong> Kami dapat mengumpulkan informasi pribadi tentang Anda selama aktivitas pengiriman, termasuk informasi lokasi keberadaan dan status pengiriman.</li>
              </ul>
              <p>
                <strong>1.2 Penggunaan:</strong> Kami dapat menggunakan informasi pribadi Anda untuk tujuan berikut dalam pembaruan status:
              </p>
              <ul>
                <li>Kelola aplikasi lokasi material;</li>
                <li>Membuat evaluasi dari pengiriman dan status pengiriman;</li>
                <li>Membuat perhitungan ketepatan waktu dan perhitungan KPI pengiriman.</li>
              </ul>

              <h4>2. Bagaimana Kami Menggunakan Cookies dan Teknologi Serupa</h4>
              <h5>2.1 Cookies</h5>
              <p>
                Untuk memastikan fungsi situs web kami dengan benar, kadang kami menyimpan data yang dikenal sebagai cookies pada komputer
                atau perangkat Anda. Cookies adalah berkas teks yang disimpan pada komputer atau perangkat bergerak melalui server web.
                Hanya server yang membuat cookies dapat mengambil atau membaca isi dalam cookies tersebut. Setiap cookies memiliki
                keunikan. Cookies biasanya berisi identitas, nama situs, dan beberapa angka dan karakter. Seperti banyak penyedia layanan
                situs lain atau layanan Internet, kami menggunakan cookies untuk meningkatkan pengalaman pengguna. Cookies mengizinkan
                situs untuk mengingat pengguna, baik untuk suatu kunjungan tunggal (memakai sesi cookies) atau kunjungan berulang (memakai
                cookies yang persisten). Cookies mengizinkan situs untuk menyimpan pengaturan Anda, seperti bahasa, ukuran font, dan
                preferensi berkelanjutan untuk komputer atau perangkat bergerak Anda. Ini berarti bahwa Anda tidak perlu mengatur
                preferensi Anda untuk setiap kunjungan. Namun, bila suatu situs web tidak menggunakan cookies maka ia akan berpikir Anda
                adalah pengguna baru setiap kali memindahkan halaman baru di situs ini. Ini berarti bahwa bahkan setelah Anda "log in",
                jika Anda menavigasi halaman lain, situs web tidak akan mengingat Anda, dan Anda akan keluar lagi. Huawei tidak menggunakan
                cookies untuk tujuan apa pun selain yang disebutkan dalam Pernyataan ini. Anda dapat mengelola atau menghapus cookies
                berdasarkan preferensi Anda. Untuk rincian, silakan lihat AboutCookies.org. Anda dapat membersihkan semua cookies yang
                disimpan pada komputer Anda dan sebagian besar peramban web dapat diatur untuk memblokir cookies. Namun, jika Anda
                melakukannya, Anda mungkin harus secara manual mengubah pengaturan pengguna Anda setiap kali mengunjungi situs kami. Untuk
                informasi lebih lanjut tentang cara mengubah pengaturan, silakan kunjungi tautan berikut: Internet Explorer; Google Chrome;
                Mozilla Firefox; Safari; Opera.
              </p>
              <h5>2.2 Web beacon dan pixel tags</h5>
              <p>
                Selain cookies, kami juga dapat menggunakan teknologi serupa lainnya, seperti web beacon dan pixel tag, di situs web kami.
                Misalnya, saat Anda menerima email dari Huawei, email tersebut mungkin berisi URL klik-tayang yang tertaut ke halaman web
                Huawei. Jika Anda mengeklik tautan tersebut, Huawei akan melacak kunjungan Anda untuk membantu kami mempelajari preferensi
                Anda terhadap produk dan layanan serta meningkatkan layanan pelanggan kami. Web beacon adalah gambar grafis transparan
                yang disematkan di situs web atau email. Pixel tag dalam email memungkinkan kami mengetahui apakah email telah dibuka atau
                belum. Anda dapat berhenti berlangganan dari milis Huawei kapan saja jika Anda tidak ingin dilacak dengan cara ini. Dengan
                menggunakan situs web kami, Anda menyetujui penggunaan cookies, web beacon, dan pixel tag sebagaimana dijelaskan di atas.
              </p>

              <h4>3. Bagaimana Kami Mengungkapkan Informasi Pribadi Anda</h4>
              <p>Kami akan mengungkapkan informasi pribadi Anda hanya dalam keadaan berikut:</p>
              <ol>
                <li><strong>3.1 Pengungkapan dengan persetujuan Anda:</strong> Kami dapat membagikan informasi pribadi Anda dengan pihak lain setelah memperoleh persetujuan tegas Anda.</li>
                <li><strong>3.2 Pengungkapan kepada mitra resmi ("Mitra kami"):</strong> Beberapa layanan Huawei disediakan oleh Mitra kami. Kami dapat membagikan beberapa data pribadi Anda dengan Mitra kami untuk menawarkan layanan dan pengalaman pelanggan yang lebih baik. Data pribadi Anda hanya dapat diproses untuk tujuan yang ditentukan, eksplisit, dan sah, dan hanya data yang diperlukan untuk menawarkan layanan yang dapat diungkapkan. Anak perusahaan atau Mitra Huawei tidak berwenang untuk menggunakan data pribadi yang dibagikan untuk tujuan lain apa pun.</li>
                <li><strong>3.3 Pengungkapan atas dasar yang wajar atau sah:</strong> Kami dapat mengungkapkan informasi pribadi Anda ketika diwajibkan oleh hukum yang berlaku atau untuk menanggapi prosedur hukum yang sah. Jika Huawei terlibat dalam restrukturisasi, merger &amp; akuisisi, pemisahan, atau gugatan kebangkrutan atau likuidasi di yurisdiksi tertentu, informasi pribadi Anda dapat diungkapkan kepada pihak-pihak yang terkait dengan transaksi tersebut. Huawei juga dapat mengungkapkan data Anda jika kebutuhan yang wajar dapat dibuktikan, seperti untuk menegakkan syarat dan ketentuan kami dan untuk melindungi pelanggan kami.</li>
              </ol>

              <h4>4. Bagaimana Anda Menggunakan Hak Anda dalam Pemrosesan Informasi Pribadi</h4>
              <p>
                Ini adalah tanggung jawab Anda untuk memastikan bahwa semua informasi pribadi yang diberikan kepada Huawei adalah benar.
                Huawei berkomitmen untuk menjaga keakuratan dan integritas informasi pribadi Anda serta menjaga data tersebut tetap
                mutakhir. Sejauh yang diwajibkan oleh hukum yang berlaku, Anda mungkin memiliki hak untuk:
              </p>
              <ol>
                <li>akses dan menyalin informasi pribadi tertentu yang kami simpan tentang Anda;</li>
                <li>meminta kami memperbarui atau mengoreksi ketidakakuratan dalam data tersebut;</li>
                <li>menolak atau membatasi penggunaan informasi pribadi Anda oleh kami;</li>
                <li>meminta kami untuk menghapus informasi pribadi Anda;</li>
                <li>menarik kembali persetujuan pemrosesan informasi pribadi Anda yang telah diberikan;</li>
                <li>meminta kami untuk menjelaskan peraturan pemrosesan informasi pribadi.</li>
              </ol>
              <p>
                Untuk menggunakan hak-hak ini, silakan
                <a
                  href="https://www.huawei.com/en/personal-data-request"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  klik disini
                </a>
                untuk memberikan tanggapan Anda secara daring. Permintaan Anda dapat diajukan secara tertulis untuk memastikan keamanan.
                Kami akan memverifikasi identitas pribadi Anda sebagaimana diwajibkan oleh hukum setempat. Kami dapat menolak permintaan
                Anda jika kami memiliki alasan yang wajar untuk meyakini bahwa permintaan tersebut adalah penipuan, tidak layak, atau
                dapat membahayakan privasi orang lain. Jika diizinkan oleh hukum yang berlaku, Anda memiliki hak untuk menarik persetujuan
                Anda kapan saja ketika Huawei memproses informasi pribadi Anda berdasarkan persetujuan Anda. Namun, penarikan tidak
                memengaruhi keabsahan dan efektivitas cara kami memproses informasi pribadi Anda berdasarkan persetujuan Anda sebelum
                penarikan dilakukan; juga tidak memengaruhi pemrosesan informasi apa pun berdasarkan pembenaran lain selain persetujuan
                Anda.
              </p>

              <h4>5. Bagaimana Kami Melindungi Informasi Pribadi Anda</h4>
              <p>
                Keamanan informasi pribadi Anda penting bagi kami. Kami mengambil langkah-langkah fisik, organisasi, dan teknis yang tepat
                untuk melindungi informasi pribadi Anda dari akses, pengungkapan, penggunaan, modifikasi, kerusakan, atau kehilangan yang
                tidak sah. Misalnya, kami menggunakan teknologi kriptografi untuk melindungi keamanan informasi pribadi tertentu; kami
                mengambil langkah-langkah perlindungan untuk mencegah serangan jahat; dan kami menggunakan mekanisme kontrol akses untuk
                mengizinkan hanya akses yang sah ke informasi pribadi Anda. Kami juga menyediakan pelatihan tentang keamanan data dan
                perlindungan privasi bagi karyawan kami untuk meningkatkan kesadaran mereka tentang perlindungan informasi pribadi. Kami
                akan menyimpan informasi pribadi Anda sebagaimana diwajibkan oleh undang-undang atau peraturan yang berlaku dan tidak
                lebih lama dari yang diperlukan untuk memenuhi tujuan pengumpulan informasi pribadi. Menurut kebijakan penyimpanan
                informasi pribadi Huawei, kami secara teratur meninjau, mengarsipkan, dan menghapus informasi pribadi kecuali kami memiliki
                dasar hukum untuk memperpanjang periode penyimpanan. Huawei berkomitmen untuk melindungi informasi pribadi Anda; namun,
                perlu diketahui bahwa tidak ada tindakan keamanan yang sempurna.
              </p>

              <h4>6. Penyedia Pihak Ketiga dan Layanannya</h4>
              <p>
                Untuk memastikan pengalaman pengguna yang lancar, Anda mungkin menerima konten atau tautan web dari pihak ketiga selain
                Huawei dan Mitra kami ("pihak ketiga"). Huawei tidak memiliki kendali atas situs web, produk, atau layanan pihak ketiga,
                tetapi Anda dapat memilih untuk menggunakan tautan, melihat konten, dan/atau mengakses produk atau layanan yang disediakan
                oleh pihak ketiga. Huawei tidak dapat mengendalikan pernyataan privasi dan perlindungan data pihak ketiga, karena pihak
                ketiga tersebut tidak tunduk pada Pernyataan ini. Sebelum mengirimkan informasi pribadi Anda ke pihak ketiga tersebut,
                harap baca dengan saksama pernyataan privasi dan perlindungan data mereka.
              </p>

              <h4>7. Bagaimana Informasi Pribadi Anda Ditransfer Secara Global?</h4>
              <p>
                Huawei adalah perusahaan multinasional, yang berarti informasi pribadi yang dikumpulkan oleh Huawei dapat diproses atau
                diakses di negara atau wilayah tempat Huawei atau afiliasinya, anak perusahaannya, atau penyedia layanannya berada.
                Yurisdiksi ini mungkin memiliki undang-undang perlindungan data yang berbeda dari negara atau wilayah tempat informasi
                pribadi Anda berasal. Dalam keadaan seperti itu, Huawei akan mengambil langkah-langkah untuk memastikan bahwa informasi
                pribadi Anda diproses sebagaimana diharuskan oleh Pernyataan ini dan undang-undang yang berlaku. Misalnya, saat mentransfer
                informasi pribadi subjek data dari UE ke negara atau wilayah yang belum diakui oleh Komisi Eropa sebagai negara yang
                memiliki tingkat perlindungan data yang memadai, kami dapat menggunakan berbagai mekanisme hukum, seperti menandatangani
                klausul kontrak standar yang disetujui oleh Komisi Eropa atau menerapkan langkah-langkah keamanan seperti menganonimkan
                informasi pribadi sebelum transfer data lintas batas.
              </p>

              <h4>8. Bagaimana Pernyataan Ini Diperbarui</h4>
              <p>
                Huawei berhak memperbarui atau mengubah Pernyataan ini kapan saja. Kami akan merilis Pernyataan Privasi terbaru di halaman
                ini jika terjadi perubahan apa pun. Jika ada perubahan besar yang dilakukan pada Pernyataan ini, kami dapat memberi tahu
                Anda melalui berbagai saluran.
              </p>

              <h4>9. Bagaimana Cara Menghubungi Kami</h4>
              <p>
                Jika Anda memiliki masalah privasi dan ingin menghubungi Petugas Perlindungan Data (DPO) Huawei, silakan klik disini.
                Catatan: Karena perbedaan hukum dan bahasa setempat, versi lokal Pernyataan Privasi ini mungkin berbeda dari versi ini.
                Jika terjadi konflik, versi lokal akan berlaku.
              </p>
              <p>
                Untuk informasi lebih lanjut mengenai deskripsi pekerjaan dan persyaratan untuk posisi yang saat ini terbuka, silakan klik
                tautan di bawah ini:
                <a
                  href="https://www.canva.com/design/DAF0CvbYRRY/gbsgO2ICoC3WZb8-ss5ZsA/edit?utm_content=DAF0CvbYRRY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tautan
                </a>
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
import { ref, watch, nextTick, onUnmounted } from 'vue';
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
const langVersion = ref(0);
const unsubscribe = i18nInstance.onChange(() => {
  langVersion.value += 1;
});
const t = (key) => {
  langVersion.value; // track dependency so Vue updates on language change
  return i18nInstance.t(key);
};

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

onUnmounted(() => {
  if (typeof unsubscribe === 'function') {
    unsubscribe();
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
