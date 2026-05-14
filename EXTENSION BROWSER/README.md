# EduOverlay AI

Browser extension berbasis Chrome Manifest V3 yang menyediakan asisten belajar AI berbasis dokumen untuk mahasiswa. Extension ini muncul sebagai overlay di halaman pembelajaran, memungkinkan mahasiswa mengupload materi kuliah dan bertanya kepada AI berdasarkan isi file tersebut.

## Tujuan Akademik

EduOverlay AI dirancang untuk membantu mahasiswa dalam:

- Memahami konsep dari materi kuliah
- Membuat ringkasan dan flashcard
- Mempraktikkan pemahaman dengan latihan soal
- Menjelajahi konsep yang sulit dengan penjelasan sederhana

### Batasan Penggunaan

**PENTING:** Extension ini BUKAN untuk:

- Menjawab soal ujian, kuis, atau simulasi
- Mem-bypass sistem keamanan website
- Mengambil contekan saat ujian
- Menyalin jawaban langsung tanpa memahami materi

Extension secara otomatis **dinonaktifkan** di halaman yang terdeteksi sebagai halaman evaluasi, ujian, kuis, atau aktivitas akademik yang dilarang.

## Fitur Utama

1. **Overlay di dalam Halaman**
   - Floating button di kanan bawah halaman
   - Panel responsif (desktop: 420px, mobile: bottom sheet)
   - Tema dark mode modern dengan Shadow DOM untuk isolasi style

2. **Upload File**
   - Mendukung PDF, DOCX, TXT, MD, CSV
   - Maksimal 20MB per file
   - Parsing otomatis menggunakan pdfjs-dist dan mammoth

3. **AI Study Assistant**
   - RAG (Retrieval Augmented Generation) untuk jawaban berbasis materi
   - Chunking teks otomatis (800-1000 kata per chunk)
   - Ranking chunk relevan untuk pertanyaan user

4. **Provider AI**
   - Google Gemini
   - OpenAI GPT
   - Anthropic Claude

5. **Mode Belajar Cepat**
   - Ringkas materi
   - Jelaskan sederhana
   - Buat flashcard
   - Tanya konsep
   - Latihan pemahaman

6. **Keyboard Shortcuts**
   - `Alt+1`: Toggle overlay
   - `1`: Toggle overlay (jika tidak mengetik, perlu aktivasi di settings)

## Tech Stack

- **Chrome Extension** Manifest V3
- **Vite** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@crxjs/vite-plugin** - CRX/Chrome extension support
- **pdfjs-dist** - PDF parsing
- **mammoth** - DOCX parsing
- **idb** - IndexedDB wrapper
- **lucide-react** - Icons

## Instalasi

### Prerequisites

- Node.js 18+
- npm atau pnpm

### Steps

```bash
# Clone atau download project
cd "EXTENSION BROWSER"

# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Build untuk produksi
npm run build
```

## Load Extension di Chrome

1. Buka `chrome://extensions`
2. Aktifkan **Developer Mode** (toggle di kanan atas)
3. Klik **Load unpacked**
4. Pilih folder `dist` dari project ini
5. Extension akan muncul di toolbar Chrome

## Cara Penggunaan

### 1. Konfigurasi API Key

1. Klik ikon EduOverlay AI di toolbar Chrome
2. Pilih **Settings** atau buka Options Page
3. Pilih provider AI (Gemini/OpenAI/Claude)
4. Masukkan API key
5. Pilih model yang diinginkan
6. Klik **Save Settings**

**Catatan:** Untuk demo lokal, API key disimpan di browser (`chrome.storage.local`). Untuk production, gunakan backend proxy agar API key tidak diekspos ke halaman website.

### 2. Menggunakan Overlay

1. Buka forum pembelajaran atau halaman materi kuliah
2. Tekan `Alt+1` atau klik floating button
3. Upload file materi (PDF, DOCX, TXT, MD, CSV)
4. Tunggu hingga file diproses
5. Pilih mode belajar atau ajukan pertanyaan

### 3. Mode Belajar

- **Ringkas materi**: Buat ringkasan dalam poin-poin
- **Jelaskan sederhana**: Penjelasan dengan analogi
- **Buat flashcard**: 10 flashcard tanya-jawab
- **Tanya konsep**: Pahami konsep penting
- **Latihan pemahaman**: 5 pertanyaan latihan

## Struktur Project

```
EXTENSION BROWSER/
├── public/
│   └── icons/           # Extension icons
├── src/
│   ├── manifest.ts      # Manifest V3 configuration
│   ├── background/
│   │   └── serviceWorker.ts  # Background service worker
│   ├── content/
│   │   ├── index.tsx    # Content script entry
│   │   ├── StudyOverlay.tsx  # Main overlay component
│   │   ├── overlayRoot.ts   # Shadow DOM setup
│   │   └── content.css  # Overlay styles
│   ├── options/
│   │   ├── OptionsPage.tsx  # Settings page
│   │   ├── main.tsx    # Options entry
│   │   └── options.html # Options HTML
│   ├── components/      # Reusable UI components
│   ├── lib/
│   │   ├── ai/         # AI providers
│   │   ├── document/   # File parsing
│   │   ├── rag/        # Retrieval & ranking
│   │   ├── storage/    # IndexedDB & chrome storage
│   │   ├── safety/     # Page classification & integrity
│   │   └── utils/      # Utilities
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Troubleshooting

### Overlay tidak muncul

1. Pastikan extension sudah di-load dengan benar di `chrome://extensions`
2. Cek console browser (`F12`) untuk error messages
3. Refresh halaman dan coba lagi
4. Pastikan tidak ada konflik dengan extension lain

### File gagal dibaca

1. Pastikan format file didukung (PDF, DOCX, TXT, MD, CSV)
2. Pastikan file tidak lebih dari 20MB
3. Pastikan file tidak corrupt atau password-protected
4. Coba gunakan file lain untuk testing

### API key salah

1. Buka Settings
2. Pastikan API key sudah benar dan tidak ada spasi extra
3. Pastikan provider sudah benar (Gemini/OpenAI/Claude)
4. Pastikan model yang dipilih didukung oleh provider

### Halaman terdeteksi sebagai ujian

1. Extension secara otomatis mendeteksi halaman evaluasi
2. Jika merasa salah deteksi, buka issue di GitHub
3. Fitur terbatas di halaman yang terdeteksi untuk menjaga integritas akademik

### Error "No response from AI"

1. Cek koneksi internet
2. Pastikan API key valid dan masih aktif
3. Coba gunakan provider lain
4. Periksa batas rate API

## Keamanan

- API key tidak pernah diekspos ke content script
- Semua request AI melalui background service worker
- Page classifier mencegah penggunaan di halaman evaluasi
- Academic integrity checker mendeteksi pertanyaan cheating

## License

MIT License - untuk tujuan edukasi dan pembelajaran

---

**EduOverlay AI** - Asisten Belajar untuk Mahasiswa Indonesia