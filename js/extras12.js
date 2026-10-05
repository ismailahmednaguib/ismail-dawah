/* ================================================================
   المرحلة 8.5: تحكم كامل في كل قسم من لوحة التحكم
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // نضيف حقول جديدة في schema اللوحة
  setTimeout(() => {
    if (!window.__adminSchema) return;
    const S = window.__adminSchema;

    // حقول جديدة للإعدادات
    S.settings = S.settings || {};
    S.settings.extra = [
      { k: 'eventsTitle', l: 'عنوان قسم الفعاليات', t: 'text' },
      { k: 'audioTitle', l: 'عنوان قسم الصوتيات', t: 'text' },
      { k: 'booksTitle', l: 'عنوان قسم الكتب', t: 'text' },
      { k: 'faqTitle', l: 'عنوان قسم الأسئلة', t: 'text' },
      { k: 'quizTitle', l: 'عنوان قسم المسابقات', t: 'text' },
      { k: 'memTitle', l: 'عنوان متتبع الحفظ', t: 'text' },
      { k: 'mapTitle', l: 'عنوان الخريطة', t: 'text' },
      { k: 'regTitle', l: 'عنوان التسجيل', t: 'text' },
      { k: 'footerNote', l: 'ملاحظة الفوتر', t: 'textarea', rows: 2 },
      { k: 'heroBg', l: 'رابط خلفية الهيرو (اختياري)', t: 'url' },
      { k: 'showTicker', l: 'إظهار شريط الآيات', t: 'checkbox' },
      { k: 'showStats', l: 'إظهار الإحصائيات', t: 'checkbox' },
      { k: 'showQuote', l: 'إظهار اقتباس اليوم', t: 'checkbox' }
    ];

    // نضيف الحقول دي في نموذج الإعدادات
    const origRender = window.__renderSettings;
    if (origRender) {
      window.__renderSettings = function () {
        origRender.call(this);
        const view = $('#adminView');
        if (!view) return;
        const card = document.createElement('div');
        card.className = 'a-card';
        card.innerHTML = '<h3>🎛️ التحكم في الأقسام والعناوين</h3>'
          + (S.settings.extra || []).map(f => {
            const val = app.get().settings[f.k];
            if (f.t === 'checkbox') {
              return '<label class="fld" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" data-p="' + f.k + '"' + (val ? ' checked' : '') + '><span>' + f.l + '</span></label>';
            }
            if (f.t === 'textarea') {
              return '<label class="fld"><span>' + f.l + '</span><textarea data-p="' + f.k + '" rows="' + (f.rows || 2) + '">' + esc(val || '') + '</textarea></label>';
            }
            return '<label class="fld"><span>' + f.l + '</span><input data-p="' + f.k + '" value="' + esc(val || '') + '"></label>';
          }).join('');
        view.querySelector('form').insertBefore(card, view.querySelector('.btn-save'));
      };
    }
  }, 1000);

  // نطبق العناوين الجديدة على الأقسام
  function applyTitles() {
    const s = app.get().settings;
    const map = {
      '#events .sec-title': s.eventsTitle, '#audio .sec-title': s.audioTitle,
      '#books .sec-title': s.booksTitle, '#fatwa .sec-title': s.faqTitle,
      '#quiz .sec-title': s.quizTitle, '#memorize .sec-title': s.memTitle,
      '#map .sec-title': s.mapTitle, '#register .sec-title': s.regTitle
    };
    Object.entries(map).forEach(([sel, val]) => {
      if (val) { const el = $(sel); if (el) el.textContent = val; }
    });
    // إخفاء/إظهار
    const ticker = $('.ticker'); if (ticker) ticker.style.display = s.showTicker === false ? 'none' : '';
    const stats = $('.stats-strip'); if (stats) stats.style.display = s.showStats === false ? 'none' : '';
    const quote = $('.quote-banner'); if (quote) quote.style.display = s.showQuote === false ? 'none' : '';
    // خلفية الهيرو
    if (s.heroBg) { const hero = $('.hero'); if (hero) hero.style.backgroundImage = 'url(' + s.heroBg + ')'; }
    // ملاحظة الفوتر
    if (s.footerNote) { const fn = $('.foot-note'); if (fn) fn.textContent = s.footerNote; }
  }

  // نراقب التغييرات
  const mo = new MutationObserver(() => applyTitles());
  mo.observe(document.body, { childList: true, subtree: true });
  applyTitles();
})();