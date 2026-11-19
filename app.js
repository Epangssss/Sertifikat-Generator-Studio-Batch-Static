(() => {
  'use strict';

  const STEP_META = [
    {
      title: 'Upload Template Sertifikat',
      desc: 'Unggah gambar sertifikat (PNG, JPG, JPEG) atau pilih template bawaan dari daftar di bawah.'
    },
    {
      title: 'Pilih Template & Konfigurasi',
      desc: 'Atur template aktif, ukuran kertas, orientasi, dan jenis sertifikat yang ingin dibuat.'
    },
    {
      title: 'Input Data Batch (Batch 1, 2, 3)',
      desc: 'Kelola daftar peserta per batch melalui input manual, tabel langsung, atau impor file CSV.'
    },
    {
      title: 'Atur Detail Sertifikat',
      desc: 'Sesuaikan judul, nomor otomatis, tanggal, pejabat penandatangan, tanda tangan, dan tata letak.'
    },
    {
      title: 'Preview & Validasi',
      desc: 'Periksa tampilan akhir sertifikat per peserta dan pastikan seluruh syarat validasi terpenuhi.'
    },
    {
      title: 'Generate & Unduh Sertifikat',
      desc: 'Render seluruh sertifikat dalam kualitas cetak lalu unduh satuan atau sekaligus dalam arsip ZIP.'
    }
  ];

  const PAPER_SIZES = {
    A4: { label: 'A4', w: 1754, h: 1240 },
    Letter: { label: 'Letter', w: 1650, h: 1275 },
    F4: { label: 'F4 / Folio', w: 1949, h: 1270 },
    A5: { label: 'A5', w: 1240, h: 874 }
  };

  const CERT_TYPE_DEFAULTS = {
    Penghargaan: {
      title: 'SERTIFIKAT PENGHARGAAN',
      subtitle: 'Diberikan dengan hormat kepada:'
    },
    Pelatihan: {
      title: 'SERTIFIKAT PELATIHAN',
      subtitle: 'Menyatakan bahwa telah menyelesaikan program pelatihan:'
    },
    Kelulusan: {
      title: 'SERTIFIKAT KELULUSAN',
      subtitle: 'Diberikan kepada peserta yang dinyatakan lulus:'
    },
    Kehadiran: {
      title: 'SERTIFIKAT KEHADIRAN',
      subtitle: 'Diberikan atas partisipasi dan kehadiran kepada:'
    },
    Kompetisi: {
      title: 'SERTIFIKAT PRESTASI',
      subtitle: 'Diberikan atas pencapaian terbaik kepada:'
    }
  };

  const TEMPLATE_NAMES = {
    'preset-classic': 'Klasik Bingkai Emas',
    'preset-navy': 'Minimalis Modern Navy',
    'preset-academic': 'Akademik Formal',
    'preset-workshop': 'Workshop Kreatif',
    custom: 'Template Upload Sendiri'
  };

  const state = {
    currentStep: 1,
    templateId: 'preset-classic',
    customTemplate: null, // { img, name, width, height, url }
    paper: 'A4',
    orientation: 'landscape',
    certType: 'Penghargaan',
    batches: [
      {
        id: 'b1',
        code: 'B1',
        label: 'Batch 1',
        participants: [
          { id: 'b1-1', name: 'Nadia Kusuma', role: 'Peserta Terbaik' },
          { id: 'b1-2', name: 'Raka Pratama', role: 'Peserta' },
          { id: 'b1-3', name: 'Dewi Lestari', role: 'Peserta' }
        ]
      },
      {
        id: 'b2',
        code: 'B2',
        label: 'Batch 2',
        participants: [
          { id: 'b2-1', name: 'Budi Santoso', role: 'Pembicara' },
          { id: 'b2-2', name: 'Siti Aminah', role: 'Moderator' },
          { id: 'b2-3', name: 'Ahmad Fauzi', role: 'Peserta' }
        ]
      },
      {
        id: 'b3',
        code: 'B3',
        label: 'Batch 3',
        participants: [
          { id: 'b3-1', name: 'Arman Mahendra', role: 'Juara 1' },
          { id: 'b3-2', name: 'Fitri Handayani', role: 'Juara 2' },
          { id: 'b3-3', name: 'Dimas Saputra', role: 'Juara 3' }
        ]
      }
    ],
    activeBatchId: 'b1',
    inputMode: 'manual',
    details: {
      org: 'Lembaga Pelatihan Nusantara',
      title: 'SERTIFIKAT PENGHARGAAN',
      subtitle: 'Diberikan dengan hormat kepada:',
      event: 'Atas partisipasi aktif dalam Kelas Desain Sistem & Dokumentasi 2026',
      numberPattern: 'CERT/{BATCH}/{YYYY}/{NNN}',
      date: new Date().toISOString().slice(0, 10),
      signer: 'Dr. Hendra Wijaya, M.Kom.',
      position: 'Direktur Program',
      font: 'serif',
      nameSize: 62,
      nameY: 48,
      showSeal: true,
      showWatermark: true,
      watermarkText: 'CONTOH / SALINAN RESMI',
      watermarkOpacity: 12
    },
    signatureImage: null,
    previewBatchId: 'b1',
    previewParticipantIndex: 0,
    generatedFiles: [] // { filename, blob, url, participantName, certNumber, batchLabel }
  };

  // DOM Elements
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    stepBtns: $$('.step-btn'),
    stepPanels: $$('.step-panel'),
    stageKicker: $('#stage-kicker'),
    stageTitle: $('#stage-title'),
    stageDesc: $('#stage-desc'),
    btnPrev: $('#btn-step-prev'),
    btnNext: $('#btn-step-next'),
    summaryTemplate: $('#summary-template'),
    summaryBatch: $('#summary-batch'),

    // Step 1
    presetDropdown: $('#preset-dropdown'),
    customOption1: $('#custom-template-option'),
    dropzone: $('#template-dropzone'),
    fileInput: $('#template-file-input'),
    btnBrowse: $('#btn-browse-template'),
    uploadFeedback: $('#upload-feedback'),
    uploadedMeta: $('#uploaded-meta'),
    uploadedThumb: $('#uploaded-thumb'),
    uploadedFilename: $('#uploaded-filename'),
    uploadedDims: $('#uploaded-dims'),
    btnRemoveUpload: $('#btn-remove-upload'),

    // Step 2
    configTemplate: $('#config-template'),
    configCustomOption: $('#config-custom-option'),
    configType: $('#config-type'),
    configPaper: $('#config-paper'),
    orientationBtns: $$('.seg-btn'),
    resolutionInfo: $('#canvas-resolution-info'),

    // Step 3
    batchTabs: $('#batch-tabs'),
    btnAddBatch: $('#btn-add-batch'),
    batchNameInput: $('#batch-name-input'),
    btnLoadSample: $('#btn-load-sample'),
    btnClearBatch: $('#btn-clear-batch'),
    modeTabs: $$('.mode-tab'),
    manualForm: $('#manual-entry-form'),
    manualName: $('#manual-name'),
    manualRole: $('#manual-role'),
    manualError: $('#manual-error'),
    csvPanel: $('#csv-entry-panel'),
    csvFileInput: $('#csv-file-input'),
    csvTextarea: $('#csv-textarea'),
    btnParseCsv: $('#btn-parse-csv'),
    csvError: $('#csv-error'),
    activeBatchCount: $('#active-batch-count'),
    batchEmptyState: $('#batch-empty-state'),
    batchTableWrap: $('#batch-table-wrap'),
    batchTableBody: $('#batch-table-body'),

    // Step 4
    detailOrg: $('#detail-org'),
    detailTitle: $('#detail-title'),
    detailSubtitle: $('#detail-subtitle'),
    detailEvent: $('#detail-event'),
    detailNumberPattern: $('#detail-number-pattern'),
    detailDate: $('#detail-date'),
    detailSigner: $('#detail-signer'),
    detailPosition: $('#detail-position'),
    sigPad: $('#signature-pad'),
    btnClearSig: $('#btn-clear-sig'),
    sigUploadInput: $('#sig-upload-input'),
    detailFont: $('#detail-font'),
    detailNameSize: $('#detail-name-size'),
    valNameSize: $('#val-name-size'),
    detailNameY: $('#detail-name-y'),
    valNameY: $('#val-name-y'),
    detailShowSeal: $('#detail-show-seal'),
    detailShowWatermark: $('#detail-show-watermark'),
    watermarkOptions: $('#watermark-options'),
    detailWatermarkText: $('#detail-watermark-text'),
    detailWatermarkOpacity: $('#detail-watermark-opacity'),
    valWatermarkOpacity: $('#val-watermark-opacity'),

    // Step 5
    validationList: $('#validation-list'),
    previewBatchSelect: $('#preview-batch-select'),
    previewParticipantSelect: $('#preview-participant-select'),
    btnPrevParticipant: $('#btn-prev-participant'),
    btnNextParticipant: $('#btn-next-participant'),

    // Step 6
    exportScope: $('#export-scope'),
    exportFormat: $('#export-format'),
    btnGenerateAll: $('#btn-generate-all'),
    btnDownloadZip: $('#btn-download-zip'),
    progressWrap: $('#generate-progress-wrap'),
    progressLabel: $('#generate-progress-label'),
    progressPct: $('#generate-progress-pct'),
    progressBar: $('#generate-progressbar'),
    progressFill: $('#generate-progress-fill'),
    generateError: $('#generate-error'),
    generatedCount: $('#generated-count'),
    generatedEmpty: $('#generated-empty-state'),
    generatedList: $('#generated-list'),

    // Preview
    certCanvas: $('#cert-canvas'),
    previewCaption: $('#preview-caption'),
    previewPaperBadge: $('#preview-paper-badge'),
    btnDownloadSinglePreview: $('#btn-download-single-preview')
  };

  // Helpers
  function getActiveBatch() {
    return state.batches.find((b) => b.id === state.activeBatchId) || state.batches[0];
  }

  function getTotalParticipants() {
    return state.batches.reduce((sum, b) => sum + b.participants.length, 0);
  }

  function formatCertNumber(batch, index) {
    const year = (state.details.date || '2026').slice(0, 4);
    const seq = String(index + 1).padStart(3, '0');
    return (state.details.numberPattern || 'CERT/{BATCH}/{YYYY}/{NNN}')
      .replace(/\{BATCH\}/g, batch.code)
      .replace(/\{YYYY\}/g, year)
      .replace(/\{NNN\}/g, seq);
  }

  function formatIndoDate(dateStr) {
    if (!dateStr) return 'Tanggal Belum Diatur';
    const d = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function getCanvasDimensions() {
    const base = PAPER_SIZES[state.paper] || PAPER_SIZES.A4;
    if (state.orientation === 'portrait') {
      return { width: base.h, height: base.w };
    }
    return { width: base.w, height: base.h };
  }

  function sanitizeFilename(str) {
    return str.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'sertifikat';
  }

  // Stepper Navigation
  function goToStep(stepNum) {
    state.currentStep = Math.max(1, Math.min(6, stepNum));
    const meta = STEP_META[state.currentStep - 1];

    els.stageKicker.textContent = `Tahap ${state.currentStep} dari 6`;
    els.stageTitle.textContent = meta.title;
    els.stageDesc.textContent = meta.desc;

    els.stepBtns.forEach((btn) => {
      const s = Number(btn.dataset.step);
      btn.classList.toggle('is-active', s === state.currentStep);
      btn.classList.toggle('is-done', s < state.currentStep);
      if (s === state.currentStep) {
        btn.setAttribute('aria-current', 'step');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    els.stepPanels.forEach((panel, idx) => {
      const active = idx + 1 === state.currentStep;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    els.btnPrev.disabled = state.currentStep === 1;
    if (state.currentStep === 6) {
      els.btnNext.disabled = true;
      els.btnNext.textContent = 'Tahap Akhir';
    } else {
      els.btnNext.disabled = false;
      const nextLabels = [
        'Lanjut ke Konfigurasi',
        'Lanjut ke Data Batch',
        'Lanjut ke Detail Sertifikat',
        'Lanjut ke Preview & Validasi',
        'Lanjut ke Generate & Unduh'
      ];
      els.btnNext.textContent = nextLabels[state.currentStep - 1];
    }

    if (state.currentStep === 5) {
      renderValidationChecklist();
      syncPreviewSelectors();
    }

    renderLivePreview();
  }

  // Summary Header
  function updateTopSummary() {
    const tName = state.templateId === 'custom' && state.customTemplate
      ? state.customTemplate.name
      : (TEMPLATE_NAMES[state.templateId] || 'Klasik Bingkai Emas');
    els.summaryTemplate.textContent = `Template: ${tName}`;
    els.summaryBatch.textContent = `Total: ${getTotalParticipants()} peserta (${state.batches.length} batch)`;
  }

  // Step 1: Upload & Preset Sync
  function setTemplateId(id) {
    if (id === 'custom' && !state.customTemplate) return;
    state.templateId = id;
    els.presetDropdown.value = id;
    els.configTemplate.value = id;
    updateTopSummary();
    renderLivePreview();
  }

  function showUploadFeedback(msg, isError) {
    els.uploadFeedback.textContent = msg;
    els.uploadFeedback.hidden = false;
    els.uploadFeedback.classList.toggle('is-error', isError);
    els.uploadFeedback.classList.toggle('is-ok', !isError);
  }

  function handleTemplateFile(file) {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      showUploadFeedback('Format file tidak didukung. Gunakan gambar PNG, JPG, atau JPEG.', true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showUploadFeedback('Ukuran file melebihi batas 10 MB. Pilih gambar yang lebih kecil.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        state.customTemplate = {
          img,
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          url: reader.result
        };
        els.customOption1.disabled = false;
        els.customOption1.textContent = `Template Upload: ${file.name}`;
        els.configCustomOption.disabled = false;
        els.configCustomOption.textContent = `Upload: ${file.name}`;

        els.uploadedThumb.src = reader.result;
        els.uploadedFilename.textContent = file.name;
        els.uploadedDims.textContent = `${img.naturalWidth} x ${img.naturalHeight} px`;
        els.uploadedMeta.hidden = false;

        setTemplateId('custom');
        showUploadFeedback(`Template "${file.name}" berhasil dimuat dan siap digunakan.`, false);
      };
      img.onerror = () => {
        showUploadFeedback('Gagal membaca gambar. Pastikan file tidak rusak.', true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function removeCustomUpload() {
    state.customTemplate = null;
    els.fileInput.value = '';
    els.uploadedMeta.hidden = true;
    els.uploadFeedback.hidden = true;
    els.customOption1.disabled = true;
    els.customOption1.textContent = 'Template Upload Anda (Belum diunggah)';
    els.configCustomOption.disabled = true;
    els.configCustomOption.textContent = 'Template Upload Sendiri';
    if (state.templateId === 'custom') {
      setTemplateId('preset-classic');
    }
  }

  // Step 2: Configuration
  function updateResolutionInfo() {
    const dims = getCanvasDimensions();
    const orientLabel = state.orientation === 'landscape' ? 'Landscape' : 'Portrait';
    const text = `${state.paper} ${orientLabel}`;
    els.resolutionInfo.textContent = `${text}: ${dims.width} x ${dims.height} px (siap cetak 150 DPI)`;
    els.previewPaperBadge.textContent = text;
  }

  // Step 3: Batch Management
  function renderBatchTabs() {
    els.batchTabs.innerHTML = '';
    state.batches.forEach((batch) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'batch-tab' + (batch.id === state.activeBatchId ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(batch.id === state.activeBatchId));
      btn.textContent = `${batch.label} (${batch.participants.length})`;
      btn.addEventListener('click', () => {
        state.activeBatchId = batch.id;
        state.previewBatchId = batch.id;
        state.previewParticipantIndex = 0;
        renderBatchTabs();
        renderBatchTable();
        renderLivePreview();
      });
      els.batchTabs.appendChild(btn);
    });

    const active = getActiveBatch();
    els.batchNameInput.value = active.label;
  }

  function renderBatchTable() {
    const batch = getActiveBatch();
    els.activeBatchCount.textContent = String(batch.participants.length);
    updateTopSummary();

    if (batch.participants.length === 0) {
      els.batchEmptyState.hidden = false;
      els.batchTableWrap.hidden = true;
      els.batchTableBody.innerHTML = '';
      return;
    }

    els.batchEmptyState.hidden = true;
    els.batchTableWrap.hidden = false;
    els.batchTableBody.innerHTML = '';

    batch.participants.forEach((p, idx) => {
      const tr = document.createElement('tr');

      const tdNo = document.createElement('td');
      tdNo.textContent = String(idx + 1);

      const tdName = document.createElement('td');
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'cell-input';
      nameInput.value = p.name;
      nameInput.setAttribute('aria-label', `Nama peserta baris ${idx + 1}`);
      nameInput.addEventListener('input', (e) => {
        p.name = e.target.value;
        renderLivePreview();
      });
      tdName.appendChild(nameInput);

      const tdRole = document.createElement('td');
      const roleInput = document.createElement('input');
      roleInput.type = 'text';
      roleInput.className = 'cell-input';
      roleInput.value = p.role;
      roleInput.setAttribute('aria-label', `Peran peserta baris ${idx + 1}`);
      roleInput.addEventListener('input', (e) => {
        p.role = e.target.value;
        renderLivePreview();
      });
      tdRole.appendChild(roleInput);

      const tdNum = document.createElement('td');
      tdNum.textContent = formatCertNumber(batch, idx);

      const tdAct = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-ghost btn-sm';
      delBtn.textContent = 'Hapus';
      delBtn.addEventListener('click', () => {
        batch.participants.splice(idx, 1);
        renderBatchTabs();
        renderBatchTable();
        renderLivePreview();
      });
      tdAct.appendChild(delBtn);

      tr.append(tdNo, tdName, tdRole, tdNum, tdAct);
      els.batchTableBody.appendChild(tr);
    });
  }

  function addParticipantToActiveBatch(name, role) {
    const cleanName = name.trim();
    if (!cleanName) return false;
    const batch = getActiveBatch();
    batch.participants.push({
      id: `${batch.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      role: (role || '').trim() || 'Peserta'
    });
    return true;
  }

  function parseCsvText(rawText) {
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { count: 0, error: 'Teks CSV masih kosong.' };

    let added = 0;
    lines.forEach((line, idx) => {
      const parts = line.split(/[;,]/).map((s) => s.trim().replace(/^"|"$/g, ''));
      const first = parts[0] || '';
      if (idx === 0 && /^nama(\s|$)/i.test(first)) return; // Skip header row
      if (first) {
        addParticipantToActiveBatch(first, parts[1] || 'Peserta');
        added += 1;
      }
    });

    if (added === 0) {
      return { count: 0, error: 'Tidak ditemukan nama peserta yang valid pada CSV.' };
    }
    return { count: added, error: null };
  }

  // Step 4: Signature Pad
  function initSignaturePad() {
    const canvas = els.sigPad;
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let hasInk = false;

    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1B365D';

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('pointerdown', (e) => {
      drawing = true;
      hasInk = true;
      canvas.setPointerCapture(e.pointerId);
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });

    function endStroke() {
      if (!drawing) return;
      drawing = false;
      if (hasInk) {
        const img = new Image();
        img.onload = () => {
          state.signatureImage = img;
          renderLivePreview();
        };
        img.src = canvas.toDataURL('image/png');
      }
    }

    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);

    els.btnClearSig.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      state.signatureImage = null;
      els.sigUploadInput.value = '';
      renderLivePreview();
    });

    els.sigUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
          const dw = img.width * ratio;
          const dh = img.height * ratio;
          ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
          state.signatureImage = img;
          renderLivePreview();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Step 5: Validation & Preview Selectors
  function renderValidationChecklist() {
    const total = getTotalParticipants();
    const checks = [
      {
        ok: Boolean(state.templateId),
        text: state.templateId === 'custom' && state.customTemplate
          ? `Template upload siap (${state.customTemplate.name})`
          : `Template bawaan aktif (${TEMPLATE_NAMES[state.templateId]})`
      },
      {
        ok: total > 0,
        text: total > 0
          ? `Data peserta tersedia: ${total} peserta di ${state.batches.length} batch`
          : 'Belum ada peserta di batch manapun (tambahkan di Tahap 3)'
      },
      {
        ok: Boolean(state.details.title.trim() && state.details.signer.trim()),
        text: state.details.title.trim() && state.details.signer.trim()
          ? 'Judul sertifikat dan penandatangan sudah terisi'
          : 'Judul sertifikat atau nama penandatangan masih kosong'
      },
      {
        ok: Boolean(state.details.date),
        text: state.details.date
          ? `Tanggal terbit diatur: ${formatIndoDate(state.details.date)}`
          : 'Tanggal terbit belum dipilih'
      }
    ];

    els.validationList.innerHTML = '';
    checks.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'validation-item ' + (item.ok ? 'is-pass' : 'is-fail');
      li.textContent = (item.ok ? '[Siap] ' : '[Perlu Diisi] ') + item.text;
      els.validationList.appendChild(li);
    });
  }

  function syncPreviewSelectors() {
    els.previewBatchSelect.innerHTML = '';
    state.batches.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.label} (${b.participants.length})`;
      els.previewBatchSelect.appendChild(opt);
    });
    els.previewBatchSelect.value = state.previewBatchId;

    const batch = state.batches.find((b) => b.id === state.previewBatchId) || state.batches[0];
    els.previewParticipantSelect.innerHTML = '';
    if (batch.participants.length === 0) {
      const opt = document.createElement('option');
      opt.value = '0';
      opt.textContent = 'Contoh (Batch kosong)';
      els.previewParticipantSelect.appendChild(opt);
      state.previewParticipantIndex = 0;
    } else {
      batch.participants.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = `${idx + 1}. ${p.name}`;
        els.previewParticipantSelect.appendChild(opt);
      });
      if (state.previewParticipantIndex >= batch.participants.length) {
        state.previewParticipantIndex = 0;
      }
      els.previewParticipantSelect.value = String(state.previewParticipantIndex);
    }
  }

  // Canvas Drawing Engine
  function drawPresetBackground(ctx, w, h, presetId) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    if (presetId === 'preset-classic') {
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#B48A3E';
      ctx.lineWidth = Math.max(8, w * 0.008);
      ctx.strokeRect(w * 0.035, h * 0.045, w * 0.93, h * 0.91);

      ctx.strokeStyle = '#1B365D';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.048, h * 0.062, w * 0.904, h * 0.876);

      // Corner ornaments
      const cSize = w * 0.04;
      ctx.fillStyle = '#B48A3E';
      [
        [w * 0.035, h * 0.045],
        [w * 0.965 - cSize, h * 0.045],
        [w * 0.035, h * 0.955 - cSize],
        [w * 0.965 - cSize, h * 0.955 - cSize]
      ].forEach(([x, y]) => ctx.fillRect(x, y, cSize * 0.35, cSize * 0.35));
    } else if (presetId === 'preset-navy') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#1B365D';
      ctx.fillRect(0, 0, w * 0.045, h);
      ctx.fillStyle = '#B45309';
      ctx.fillRect(w * 0.045, 0, w * 0.008, h);

      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.075, h * 0.05, w * 0.89, h * 0.9);
    } else if (presetId === 'preset-academic') {
      ctx.fillStyle = '#FAF8F3';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#1E3A5F';
      ctx.fillRect(0, 0, w, h * 0.075);

      ctx.strokeStyle = '#1E3A5F';
      ctx.lineWidth = 3;
      ctx.strokeRect(w * 0.04, h * 0.1, w * 0.92, h * 0.84);
    } else if (presetId === 'preset-workshop') {
      ctx.fillStyle = '#FFFDF9';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.16, 0);
      ctx.lineTo(0, h * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1B365D';
      ctx.beginPath();
      ctx.moveTo(w, h);
      ctx.lineTo(w * 0.84, h);
      ctx.lineTo(w, h * 0.78);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#D6CFC2';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.04, h * 0.05, w * 0.92, h * 0.9);
    }
  }

  function wrapCenteredText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currY = y;
    for (let i = 0; i < words.length; i += 1) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, currY);
        line = words[i] + ' ';
        currY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currY);
  }

  function renderCertificate(canvas, participant, batch, indexInBatch) {
    const dims = getCanvasDimensions();
    canvas.width = dims.width;
    canvas.height = dims.height;

    const ctx = canvas.getContext('2d');
    const w = dims.width;
    const h = dims.height;
    const scale = w / 1754;

    if (state.templateId === 'custom' && state.customTemplate) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(state.customTemplate.img, 0, 0, w, h);
    } else {
      drawPresetBackground(ctx, w, h, state.templateId);
    }

    const d = state.details;
    const certNumber = formatCertNumber(batch, indexInBatch);
    const centerX = w * 0.5;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Organization
    ctx.fillStyle = '#57534E';
    ctx.font = `600 ${Math.round(24 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText((d.org || '').toUpperCase(), centerX, h * 0.14);

    // Title
    ctx.fillStyle = '#1B365D';
    ctx.font = `700 ${Math.round(52 * scale)}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillText(d.title || 'SERTIFIKAT', centerX, h * 0.22);

    // Cert Number
    ctx.fillStyle = '#78716C';
    ctx.font = `500 ${Math.round(20 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(`Nomor: ${certNumber}  |  ${batch.label}`, centerX, h * 0.28);

    // Subtitle
    ctx.fillStyle = '#44403C';
    ctx.font = `500 ${Math.round(24 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(d.subtitle || '', centerX, h * 0.36);

    // Participant Name
    const nameY = h * (d.nameY / 100);
    const nameFontSize = Math.round(d.nameSize * scale * 1.15);
    let nameFont = `700 ${nameFontSize}px "Cormorant Garamond", Georgia, serif`;
    if (d.font === 'sans') {
      nameFont = `700 ${nameFontSize}px "Plus Jakarta Sans", sans-serif`;
    } else if (d.font === 'italic') {
      nameFont = `italic 700 ${nameFontSize}px "Cormorant Garamond", Georgia, serif`;
    }
    ctx.fillStyle = '#1C1917';
    ctx.font = nameFont;
    ctx.fillText(participant.name || '[Nama Peserta]', centerX, nameY);

    // Underline under name
    const nameWidth = Math.min(w * 0.65, Math.max(w * 0.28, ctx.measureText(participant.name || '[Nama Peserta]').width + 60 * scale));
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = Math.max(2, 2.5 * scale);
    ctx.beginPath();
    ctx.moveTo(centerX - nameWidth / 2, nameY + nameFontSize * 0.65);
    ctx.lineTo(centerX + nameWidth / 2, nameY + nameFontSize * 0.65);
    ctx.stroke();

    // Role / Predikat
    if (participant.role) {
      ctx.fillStyle = '#1B365D';
      ctx.font = `700 ${Math.round(24 * scale)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(`Sebagai: ${participant.role}`, centerX, nameY + nameFontSize * 1.05);
    }

    // Event description
    ctx.fillStyle = '#44403C';
    ctx.font = `400 ${Math.round(23 * scale)}px "Plus Jakarta Sans", sans-serif`;
    wrapCenteredText(ctx, d.event || '', centerX, h * 0.68, w * 0.72, Math.round(32 * scale));

    // Bottom Left: Date
    const bottomY = h * 0.83;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#57534E';
    ctx.font = `500 ${Math.round(20 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText('Diterbitkan pada:', w * 0.12, bottomY - 26 * scale);
    ctx.fillStyle = '#1C1917';
    ctx.font = `700 ${Math.round(22 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(formatIndoDate(d.date), w * 0.12, bottomY + 8 * scale);

    // Bottom Right: Signature & Signer
    const sigCenterX = w * 0.76;
    ctx.textAlign = 'center';
    if (state.signatureImage) {
      const sigW = 220 * scale;
      const sigH = 78 * scale;
      ctx.drawImage(state.signatureImage, sigCenterX - sigW / 2, bottomY - sigH - 12 * scale, sigW, sigH);
    }
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 130 * scale, bottomY - 6 * scale);
    ctx.lineTo(sigCenterX + 130 * scale, bottomY - 6 * scale);
    ctx.stroke();

    ctx.fillStyle = '#1C1917';
    ctx.font = `700 ${Math.round(22 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(d.signer || 'Penandatangan', sigCenterX, bottomY + 20 * scale);
    ctx.fillStyle = '#57534E';
    ctx.font = `500 ${Math.round(19 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(d.position || '', sigCenterX, bottomY + 48 * scale);

    // Optional Seal
    if (d.showSeal) {
      const sealX = centerX;
      const sealY = bottomY + 12 * scale;
      const sealR = 44 * scale;
      ctx.save();
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = Math.max(2, 3 * scale);
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR * 0.78, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#B45309';
      ctx.textAlign = 'center';
      ctx.font = `700 ${Math.round(13 * scale)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('TERVERIFIKASI', sealX, sealY - 6 * scale);
      ctx.font = `600 ${Math.round(12 * scale)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(batch.code + '-' + String(indexInBatch + 1).padStart(3, '0'), sealX, sealY + 12 * scale);
      ctx.restore();
    }

    // Watermark Protection (Anti-Misuse)
    if (d.showWatermark && d.watermarkText) {
      ctx.save();
      ctx.translate(centerX, h * 0.5);
      ctx.rotate(-Math.PI / 7);
      const alpha = Math.max(0.04, Math.min(0.4, (d.watermarkOpacity || 12) / 100));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const wmFontSize = Math.round(86 * scale);
      ctx.font = `800 ${wmFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = `rgba(27, 54, 93, ${alpha})`;
      ctx.fillText(d.watermarkText.toUpperCase(), 0, 0);

      const subWmFontSize = Math.round(36 * scale);
      ctx.font = `700 ${subWmFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = `rgba(180, 83, 9, ${alpha * 0.9})`;
      ctx.fillText('PROTECTED CERTIFICATE DOCUMENT', 0, -wmFontSize * 1.35);
      ctx.fillText('TIDAK BERLAKU TANPA PENGESAHAN RESMI', 0, wmFontSize * 1.35);
      ctx.restore();
    }
  }

  function renderLivePreview() {
    const batch = state.batches.find((b) => b.id === state.previewBatchId) || getActiveBatch();
    const list = batch.participants;
    let participant = { name: 'Nadia Kusuma', role: 'Peserta Terbaik' };
    let idx = 0;

    if (list.length > 0) {
      idx = Math.min(state.previewParticipantIndex, list.length - 1);
      participant = list[idx];
      els.previewCaption.textContent = `${batch.label}: ${participant.name} (${idx + 1} dari ${list.length})`;
    } else {
      els.previewCaption.textContent = `Contoh tampilan untuk ${batch.label} (data masih kosong)`;
    }

    renderCertificate(els.certCanvas, participant, batch, idx);
  }

  // Pure-JS Uncompressed ZIP Builder (works 100% offline)
  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  async function buildZipBlob(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const f of files) {
      const nameBytes = encoder.encode(f.filename);
      const dataBytes = new Uint8Array(await f.blob.arrayBuffer());
      const crc = crc32(dataBytes);

      const localHeader = new ArrayBuffer(30 + nameBytes.length);
      const lv = new DataView(localHeader);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true); // STORE
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, dataBytes.length, true);
      lv.setUint32(22, dataBytes.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      new Uint8Array(localHeader, 30).set(nameBytes);

      localParts.push(localHeader, dataBytes);

      const centralHeader = new ArrayBuffer(46 + nameBytes.length);
      const cv = new DataView(centralHeader);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, dataBytes.length, true);
      cv.setUint32(24, dataBytes.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      new Uint8Array(centralHeader, 46).set(nameBytes);

      centralParts.push(centralHeader);
      offset += localHeader.byteLength + dataBytes.length;
    }

    const centralSize = centralParts.reduce((s, p) => s + p.byteLength, 0);
    const eocd = new ArrayBuffer(22);
    const ev = new DataView(eocd);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, eocd], { type: 'application/zip' });
  }

  // Step 6: Generate & Download
  function triggerBlobDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  }

  async function generateAllCertificates() {
    els.generateError.hidden = true;
    const scope = els.exportScope.value;
    const format = els.exportFormat.value;
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    const targetBatches = scope === 'active' ? [getActiveBatch()] : state.batches;
    const queue = [];
    targetBatches.forEach((b) => {
      b.participants.forEach((p, idx) => {
        queue.push({ batch: b, participant: p, index: idx });
      });
    });

    if (queue.length === 0) {
      els.generateError.textContent = 'Tidak ada peserta untuk digenerate. Tambahkan data peserta terlebih dahulu di Tahap 3.';
      els.generateError.className = 'status-banner is-error';
      els.generateError.hidden = false;
      return;
    }

    // Revoke previous object URLs
    state.generatedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    state.generatedFiles = [];

    els.btnGenerateAll.disabled = true;
    els.btnDownloadZip.disabled = true;
    els.progressWrap.hidden = false;

    const offscreen = document.createElement('canvas');

    for (let i = 0; i < queue.length; i += 1) {
      const item = queue[i];
      renderCertificate(offscreen, item.participant, item.batch, item.index);
      const blob = await canvasToBlob(offscreen, mime, 0.92);
      const url = URL.createObjectURL(blob);
      const certNum = formatCertNumber(item.batch, item.index);
      const filename = `${item.batch.code}_${String(item.index + 1).padStart(3, '0')}_${sanitizeFilename(item.participant.name)}.${ext}`;

      state.generatedFiles.push({
        filename,
        blob,
        url,
        participantName: item.participant.name,
        certNumber,
        batchLabel: item.batch.label
      });

      const pct = Math.round(((i + 1) / queue.length) * 100);
      els.progressLabel.textContent = `Merender ${i + 1} dari ${queue.length}: ${item.participant.name}`;
      els.progressPct.textContent = `${pct}%`;
      els.progressBar.setAttribute('aria-valuenow', String(pct));
      els.progressFill.style.width = `${pct}%`;
    }

    els.btnGenerateAll.disabled = false;
    els.btnDownloadZip.disabled = false;
    renderGeneratedList();
  }

  function renderGeneratedList() {
    const count = state.generatedFiles.length;
    els.generatedCount.textContent = String(count);

    if (count === 0) {
      els.generatedEmpty.hidden = false;
      els.generatedList.hidden = true;
      els.generatedList.innerHTML = '';
      return;
    }

    els.generatedEmpty.hidden = true;
    els.generatedList.hidden = false;
    els.generatedList.innerHTML = '';

    state.generatedFiles.forEach((file) => {
      const li = document.createElement('li');
      li.className = 'generated-item';

      const info = document.createElement('div');
      info.className = 'generated-item-info';

      const nameEl = document.createElement('span');
      nameEl.className = 'generated-item-name';
      nameEl.textContent = file.participantName;

      const subEl = document.createElement('span');
      subEl.className = 'generated-item-sub';
      subEl.textContent = `${file.batchLabel} | ${file.certNumber} | ${file.filename}`;

      info.append(nameEl, subEl);

      const dlBtn = document.createElement('button');
      dlBtn.type = 'button';
      dlBtn.className = 'btn btn-secondary btn-sm';
      dlBtn.textContent = 'Unduh Satuan';
      dlBtn.addEventListener('click', () => triggerBlobDownload(file.url, file.filename));

      li.append(info, dlBtn);
      els.generatedList.appendChild(li);
    });
  }

  // Event Bindings
  function bindEvents() {
    els.stepBtns.forEach((btn) => {
      btn.addEventListener('click', () => goToStep(Number(btn.dataset.step)));
    });
    els.btnPrev.addEventListener('click', () => goToStep(state.currentStep - 1));
    els.btnNext.addEventListener('click', () => goToStep(state.currentStep + 1));

    // Step 1
    els.presetDropdown.addEventListener('change', (e) => setTemplateId(e.target.value));
    els.btnBrowse.addEventListener('click', (e) => {
      e.stopPropagation();
      els.fileInput.click();
    });
    els.dropzone.addEventListener('click', () => els.fileInput.click());
    els.dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        els.fileInput.click();
      }
    });
    els.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.dropzone.classList.add('is-dragover');
    });
    els.dropzone.addEventListener('dragleave', () => els.dropzone.classList.remove('is-dragover'));
    els.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.dropzone.classList.remove('is-dragover');
      handleTemplateFile(e.dataTransfer.files[0]);
    });
    els.fileInput.addEventListener('change', (e) => handleTemplateFile(e.target.files[0]));
    els.btnRemoveUpload.addEventListener('click', removeCustomUpload);

    // Step 2
    els.configTemplate.addEventListener('change', (e) => setTemplateId(e.target.value));
    els.configType.addEventListener('change', (e) => {
      state.certType = e.target.value;
      const def = CERT_TYPE_DEFAULTS[state.certType];
      if (def) {
        state.details.title = def.title;
        state.details.subtitle = def.subtitle;
        els.detailTitle.value = def.title;
        els.detailSubtitle.value = def.subtitle;
      }
      renderLivePreview();
    });
    els.configPaper.addEventListener('change', (e) => {
      state.paper = e.target.value;
      updateResolutionInfo();
      renderLivePreview();
    });
    els.orientationBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.orientation = btn.dataset.orientation;
        els.orientationBtns.forEach((b) => {
          const sel = b.dataset.orientation === state.orientation;
          b.classList.toggle('is-selected', sel);
          b.setAttribute('aria-pressed', String(sel));
        });
        updateResolutionInfo();
        renderLivePreview();
      });
    });

    // Step 3
    els.btnAddBatch.addEventListener('click', () => {
      const nextNum = state.batches.length + 1;
      const newBatch = {
        id: `b${nextNum}`,
        code: `B${nextNum}`,
        label: `Batch ${nextNum}`,
        participants: []
      };
      state.batches.push(newBatch);
      state.activeBatchId = newBatch.id;
      renderBatchTabs();
      renderBatchTable();
    });

    els.batchNameInput.addEventListener('input', (e) => {
      const batch = getActiveBatch();
      batch.label = e.target.value.trim() || `Batch ${state.batches.indexOf(batch) + 1}`;
      renderBatchTabs();
      renderLivePreview();
    });

    els.btnLoadSample.addEventListener('click', () => {
      const batch = getActiveBatch();
      const samples = {
        b1: [
          { name: 'Nadia Kusuma', role: 'Peserta Terbaik' },
          { name: 'Raka Pratama', role: 'Peserta' },
          { name: 'Dewi Lestari', role: 'Peserta' }
        ],
        b2: [
          { name: 'Budi Santoso', role: 'Pembicara' },
          { name: 'Siti Aminah', role: 'Moderator' },
          { name: 'Ahmad Fauzi', role: 'Peserta' }
        ],
        b3: [
          { name: 'Arman Mahendra', role: 'Juara 1' },
          { name: 'Fitri Handayani', role: 'Juara 2' },
          { name: 'Dimas Saputra', role: 'Juara 3' }
        ]
      };
      const list = samples[batch.id] || [
        { name: 'Peserta Contoh 1', role: 'Peserta' },
        { name: 'Peserta Contoh 2', role: 'Peserta' }
      ];
      list.forEach((item) => addParticipantToActiveBatch(item.name, item.role));
      renderBatchTabs();
      renderBatchTable();
      renderLivePreview();
    });

    els.btnClearBatch.addEventListener('click', () => {
      const batch = getActiveBatch();
      batch.participants = [];
      renderBatchTabs();
      renderBatchTable();
      renderLivePreview();
    });

    els.modeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        state.inputMode = tab.dataset.inputMode;
        els.modeTabs.forEach((t) => {
          const active = t.dataset.inputMode === state.inputMode;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });
        els.manualForm.hidden = state.inputMode !== 'manual';
        els.csvPanel.hidden = state.inputMode !== 'csv';
      });
    });

    els.manualForm.addEventListener('submit', (e) => {
      e.preventDefault();
      els.manualError.hidden = true;
      const ok = addParticipantToActiveBatch(els.manualName.value, els.manualRole.value);
      if (!ok) {
        els.manualError.textContent = 'Nama lengkap peserta wajib diisi.';
        els.manualError.hidden = false;
        els.manualName.focus();
        return;
      }
      els.manualName.value = '';
      els.manualRole.value = '';
      els.manualName.focus();
      renderBatchTabs();
      renderBatchTable();
      renderLivePreview();
    });

    els.csvFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        els.csvTextarea.value = reader.result;
      };
      reader.readAsText(file);
    });

    els.btnParseCsv.addEventListener('click', () => {
      els.csvError.hidden = true;
      const res = parseCsvText(els.csvTextarea.value);
      if (res.error) {
        els.csvError.textContent = res.error;
        els.csvError.hidden = false;
        return;
      }
      els.csvTextarea.value = '';
      renderBatchTabs();
      renderBatchTable();
      renderLivePreview();
    });

    // Step 4
    const detailBindings = [
      [els.detailOrg, 'org'],
      [els.detailTitle, 'title'],
      [els.detailSubtitle, 'subtitle'],
      [els.detailEvent, 'event'],
      [els.detailNumberPattern, 'numberPattern'],
      [els.detailDate, 'date'],
      [els.detailSigner, 'signer'],
      [els.detailPosition, 'position'],
      [els.detailFont, 'font']
    ];
    detailBindings.forEach(([el, key]) => {
      el.addEventListener('input', (e) => {
        state.details[key] = e.target.value;
        if (key === 'numberPattern' || key === 'date') renderBatchTable();
        renderLivePreview();
      });
    });

    els.detailNameSize.addEventListener('input', (e) => {
      state.details.nameSize = Number(e.target.value);
      els.valNameSize.textContent = e.target.value;
      renderLivePreview();
    });

    els.detailNameY.addEventListener('input', (e) => {
      state.details.nameY = Number(e.target.value);
      els.valNameY.textContent = e.target.value;
      renderLivePreview();
    });

    els.detailShowSeal.addEventListener('change', (e) => {
      state.details.showSeal = e.target.checked;
      renderLivePreview();
    });

    els.detailShowWatermark.addEventListener('change', (e) => {
      state.details.showWatermark = e.target.checked;
      els.watermarkOptions.hidden = !e.target.checked;
      renderLivePreview();
    });

    els.detailWatermarkText.addEventListener('input', (e) => {
      state.details.watermarkText = e.target.value.trim();
      renderLivePreview();
    });

    els.detailWatermarkOpacity.addEventListener('input', (e) => {
      state.details.watermarkOpacity = Number(e.target.value);
      els.valWatermarkOpacity.textContent = e.target.value;
      renderLivePreview();
    });

    // Step 5
    els.previewBatchSelect.addEventListener('change', (e) => {
      state.previewBatchId = e.target.value;
      state.previewParticipantIndex = 0;
      syncPreviewSelectors();
      renderLivePreview();
    });
    els.previewParticipantSelect.addEventListener('change', (e) => {
      state.previewParticipantIndex = Number(e.target.value);
      renderLivePreview();
    });
    els.btnPrevParticipant.addEventListener('click', () => {
      const batch = state.batches.find((b) => b.id === state.previewBatchId) || state.batches[0];
      if (batch.participants.length === 0) return;
      state.previewParticipantIndex = (state.previewParticipantIndex - 1 + batch.participants.length) % batch.participants.length;
      els.previewParticipantSelect.value = String(state.previewParticipantIndex);
      renderLivePreview();
    });
    els.btnNextParticipant.addEventListener('click', () => {
      const batch = state.batches.find((b) => b.id === state.previewBatchId) || state.batches[0];
      if (batch.participants.length === 0) return;
      state.previewParticipantIndex = (state.previewParticipantIndex + 1) % batch.participants.length;
      els.previewParticipantSelect.value = String(state.previewParticipantIndex);
      renderLivePreview();
    });

    // Step 6
    els.btnGenerateAll.addEventListener('click', generateAllCertificates);
    els.btnDownloadZip.addEventListener('click', async () => {
      if (state.generatedFiles.length === 0) return;
      els.btnDownloadZip.disabled = true;
      els.btnDownloadZip.textContent = 'Mengemas ZIP...';
      const zipBlob = await buildZipBlob(state.generatedFiles);
      const zipUrl = URL.createObjectURL(zipBlob);
      triggerBlobDownload(zipUrl, `sertifikat-batch-${state.details.date || 'export'}.zip`);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 3000);
      els.btnDownloadZip.disabled = false;
      els.btnDownloadZip.textContent = 'Unduh Sekaligus (ZIP)';
    });

    // Preview Quick Download
    els.btnDownloadSinglePreview.addEventListener('click', async () => {
      const blob = await canvasToBlob(els.certCanvas, 'image/png', 1);
      const url = URL.createObjectURL(blob);
      triggerBlobDownload(url, 'pratinjau-sertifikat.png');
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    });
  }

  // Init
  function init() {
    els.detailDate.value = state.details.date;
    updateResolutionInfo();
    renderBatchTabs();
    renderBatchTable();
    initSignaturePad();
    bindEvents();
    updateTopSummary();
    goToStep(1);
  }

  init();
})();
