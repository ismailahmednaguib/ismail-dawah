/* ================================================================
   المرحلة 8: هيدر محسّن + رجوع + لوحة تحكم شاملة + مزامنة فورية
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const d = app.get();

  /* ================= 1) الهيدر المحسّن + زر الرجوع ================= */
  (function () {
    const header = $('.site-header');
    const btn = document.createElement('button');
    btn.className = 'back-top'; btn.id = 'backTop';
    btn.innerHTML = '↑'; btn.title = 'العودة للأعلى';
    document.body.appendChild(btn);
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (header) header.classList.toggle('scrolled', y > 80);
          btn.classList.toggle('show', y > 400);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();

  /* ================= 2) نظام المزامنة الفورية ================= */
  const SYNC_KEY = 'siteLiveSync_v1';
  const sync = {
    get: () => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } },
    set: obj => { localStorage.setItem(SYNC_KEY, JSON.stringify(obj)); },
    merge: () => {
      const base = app.get();
      const live = sync.get();
      if (live.settings) Object.assign(base.settings, live.settings);
      ['lessons','videos','articles','photos','schedule','audio','books','fatwas','events'].forEach(k => { if (live[k]) base[k] = live[k]; });
      return base;
    },
    save: patch => {
      const cur = sync.get();
      Object.assign(cur, patch);
      sync.set(cur);
      // إعادة رسم الموقع فورًا بالبيانات المدموجة
      const merged = sync.merge();
      app.save(merged);
      app.renderAll();
      showSync('✓ تم الحفظ والنشر فورًا');
    }
  };
  function showSync(msg, err) {
    let s = $('#syncStatus');
    if (!s) { s = document.createElement('div'); s.id = 'syncStatus'; s.className = 'sync-status'; document.body.appendChild(s); }
    s.textContent = msg;
    s.classList.toggle('error', !!err);
    s.classList.add('show');
    clearTimeout(s._t);
    s._t = setTimeout(() => s.classList.remove('show'), 2500);
  }

  /* ================= 3) نظام التحكم في الأقسام ================= */
  const SECTIONS = [
    { id: 'events', t: '📅 الفعاليات' }, { id: 'audio', t: '🎧 الصوتيات' }, { id: 'books', t: '📚 الكتب' },
    { id: 'fatwa', t: '🕌 الأسئلة' }, { id: 'hijri', t: '📆 التقويم الهجري' }, { id: 'quran', t: '📖 القرآن' },
    { id: 'azkar', t: '🤲 الأذكار' }, { id: 'zakat', t: '💰 الزكاة' }, { id: 'dua', t: '📿 الأدعية' },
    { id: 'quiz', t: '🏆 المسابقات' }, { id: 'memorize', t: '🎯 متتبع الحفظ' }, { id: 'map', t: '🗺️ الخريطة' },
    { id: 'register', t: '📋 التسجيل' }, { id: 'comments', t: '💬 التعليقات' }, { id: 'newsletter', t: '📬 النشرة' }
  ];
  function applySectionVisibility() {
    const hidden = d.settings.hiddenSections || [];
    SECTIONS.forEach(s => {
      const el = $('#' + s.id);
      if (el) el.style.display = hidden.includes(s.id) ? 'none' : '';
    });
  }

  /* ================= 4) توسيع لوحة التحكم ================= */
  function enhanceAdmin() {
    const origShell = window.__adminShell;
    if (!origShell) return;
    // نضيف تبويبات جديدة بعد التهيئة الأصلية
    setTimeout(() => {
      const side = $('.admin-side'); if (!side) return;
      if ($('#admin-extra-tabs')) return;

      const wrap = document.createElement('div');
      wrap.id = 'admin-extra-tabs';
      wrap.innerHTML = '<div class="admin-section"><h3>👁️ إظهار/إخفاء الأقسام <span class="admin-live-badge">فوري</span></h3>'
        + SECTIONS.map(s => {
          const hidden = (d.settings.hiddenSections || []).includes(s.id);
          return '<div class="admin-toggle' + (hidden ? '' : ' on') + '" data-sec="' + s.id + '"><span>' + s.t + '</span><div class="switch"></div></div>';
        }).join('')
        + '</div>'
        + '<div class="admin-section"><h3>⚙️ إعدادات متقدمة <span class="admin-live-badge">فوري</span></h3>'
        + '<label class="fld"><span>الخط الافتراضي</span><select id="advFont"><option value="amiri">أميري (كلاسيكي)</option><option value="cairo">كايرو (حديث)</option><option value="tajawal">تجوّل (أنيق)</option></select></label>'
        + '<label class="fld"><span>سرعة شريط الآيات</span><input type="number" id="tickSpeed" min="10" max="60" step="5" value="' + (d.settings.tickSpeed || 30) + '"></label>'
        + '<label class="fld"><span>عدد الأسئلة في المسابقة</span><input type="number" id="quizCount" min="3" max="15" value="' + (d.settings.quizCount || 10) + '"></label>'
        + '<button class="btn-save" id="advSave" style="width:100%">💾 حفظ الإعدادات المتقدمة</button>'
        + '</div>'
        + '<div class="admin-section"><h3>🔄 المزامنة</h3>'
        + '<button class="mini-btn edit" id="syncExport" style="width:100%;margin-bottom:6px">⬇️ تنزيل نسخة احتياطية (JSON)</button>'
        + '<button class="mini-btn del" id="syncClear" style="width:100%">🗑️ مسح البيانات المؤقتة</button>'
        + '</div>';
      side.insertBefore(wrap, side.querySelector('.sp'));

      // أحداث التoggles
      wrap.querySelectorAll('.admin-toggle').forEach(t => {
        t.onclick = () => {
          t.classList.toggle('on');
          const id = t.dataset.sec;
          const hidden = d.settings.hiddenSections || [];
          const idx = hidden.indexOf(id);
          if (idx >= 0) hidden.splice(idx, 1); else hidden.push(id);
          d.settings.hiddenSections = hidden;
          sync.save({ settings: d.settings });
          applySectionVisibility();
        };
      });

      $('#advSave').onclick = () => {
        d.settings.tickSpeed = +$('#tickSpeed').value || 30;
        d.settings.quizCount = +$('#quizCount').value || 10;
        d.settings.fontChoice = $('#advFont').value;
        sync.save({ settings: d.settings });
        applyFont();
        app.toast('تم حفظ الإعدادات المتقدمة ✔');
      };

      $('#syncExport').onclick = () => {
        const data = JSON.stringify(sync.merge(), null, 2);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        a.download = 'site-backup-' + new Date().toISOString().slice(0,10) + '.json';
        a.click();
        app.toast('تم تنزيل النسخة الاحتياطية ✔');
      };

      $('#syncClear').onclick = () => {
        if (confirm('سيتم مسح كل التعديلات المؤقتة والعودة لبيانات data.js الأصلية. متأكد؟')) {
          localStorage.removeItem(SYNC_KEY);
          location.reload();
        }
      };
    }, 500);
  }

  /* ================= 5) تطبيق الخطوط ================= */
  function applyFont() {
    const choice = d.settings.fontChoice || 'amiri';
    const fonts = { amiri: "'Amiri', serif", cairo: "'Cairo', sans-serif", tajawal: "'Tajawal', sans-serif" };
    document.documentElement.style.setProperty('--f-body', fonts[choice]);
    // تحميل الخط لو مش موجود
    if (!$('#font-' + choice)) {
      const l = document.createElement('link');
      l.id = 'font-' + choice;
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + (choice === 'cairo' ? 'Cairo' : choice === 'tajawal' ? 'Tajawal' : 'Amiri') + ':wght@400;700;900&display=swap';
      document.head.appendChild(l);
    }
  }

  /* ================= 6) ربط الحفظ التلقائي في اللوحة ================= */
  function interceptSave() {
    // نراقب أي حفظ بيتم من اللوحة ونطبقه فورًا على الموقع
    const origSave = app.save;
    app.save = function (data) {
      origSave.call(app, data);
      // نطبق التغييرات فورًا على DOM
      setTimeout(() => {
        app.renderAll();
        applySectionVisibility();
        applyFont();
        showSync('✓ التحديث ظهر فورًا في الموقع');
      }, 100);
    };
  }

  /* ================= تشغيل ================= */
  interceptSave();
  applyFont();
  applySectionVisibility();
  enhanceAdmin();

  // إعادة تطبيق الرؤية بعد أي تغيير في DOM (لأن الإضافات بتحقن أقسام)
  const mo = new MutationObserver(() => applySectionVisibility());
  mo.observe(document.body, { childList: true, subtree: true });

  console.log('✅ المرحلة 8 مفعّلة: هيدر محسّن + رجوع + مزامنة فورية + تحكم شامل');
})();