/* ================================================================
   لوحة تحكم المالك — نسخة كاملة ومُصلَحة
   التحكم في كل حاجة من الموقع بدون لمس الكود
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const adminEl = document.getElementById('admin');
  const AUTH = 'siteAdminAuth_v1';
  const $ = s => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let tab = 'settings', editId = null;

  /* ================= التبويبات ================= */
  const TABS = [
    { id: 'settings', t: '⚙️ الإعدادات العامة' },
    { id: 'lessons', t: ' الدروس' },
    { id: 'videos', t: '🎬 الفيديوهات' },
    { id: 'audio', t: ' الصوتيات' },
    { id: 'books', t: '📚 الكتب' },
    { id: 'articles', t: '✍️ المقالات' },
    { id: 'fatwas', t: '🕌 أسئلة وأجوبة' },
    { id: 'events', t: '📅 الفعاليات' },
    { id: 'photos', t: '🖼️ الصور' },
    { id: 'schedule', t: '🗓️ الجدول' },
    { id: 'appearance', t: ' المظهر' },
    { id: 'sections', t: '👁️ الأقسام' },
    { id: 'titles', t: '️ العناوين' },
    { id: 'advanced', t: '⚡ متقدم' },
    { id: 'backup', t: '💾 الحفظ والنشر' }
  ];

  /* ================= SCHEMA — مع دعم رفع الصور ================= */
  const SCHEMA = {
    lessons: { label: 'درس', titleKey: 'title', fields: [
      { k: 'title', l: 'عنوان الدرس', t: 'text', req: 1 },
      { k: 'category', l: 'التصنيف', t: 'text', h: 'مثال: عقيدة، فقه، سيرة، مقارنة أديان…' },
      { k: 'date', l: 'التاريخ', t: 'text', h: 'مثال: 2024' },
      { k: 'link', l: 'رابط الاستماع', t: 'url', h: 'رابط يوتيوب أو جوجل درايف' },
      { k: 'desc', l: 'وصف مختصر', t: 'textarea' } ] },
    videos: { label: 'فيديو', titleKey: 'title', fields: [
      { k: 'title', l: 'عنوان الفيديو', t: 'text', req: 1 },
      { k: 'url', l: 'رابط الفيديو', t: 'url', h: 'الصق رابط يوتيوب كاملًا' },
      { k: 'desc', l: 'وصف مختصر', t: 'textarea' } ] },
    articles: { label: 'مقال', titleKey: 'title', fields: [
      { k: 'title', l: 'عنوان المقال', t: 'text', req: 1 },
      { k: 'date', l: 'التاريخ', t: 'text', h: 'مثال: 15 يناير 2024' },
      { k: 'excerpt', l: 'مقتطف يظهر في البطاقة', t: 'textarea', rows: 2 },
      { k: 'body', l: 'نص المقال كاملًا', t: 'textarea', rows: 8, h: 'اترك سطرًا فارغًا بين الفقرات' } ] },
    photos: { label: 'صورة', titleKey: 'caption', fields: [
      { k: 'src', l: 'رابط الصورة أو مسارها', t: 'text', req: 1, h: 'الصق رابط أو ارفع صورة من الزر أدناه' },
      { k: 'caption', l: 'تعليق الصورة', t: 'text' },
      { k: '__upload', l: '📤 رفع صورة من جهازك', t: 'file', accept: 'image/*' }
    ] },
    schedule: { label: 'موعد', titleKey: 'topic', fields: [
      { k: 'day', l: 'اليوم', t: 'text', req: 1, h: 'مثال: السبت' },
      { k: 'time', l: 'الوقت', t: 'text', h: 'مثال: بعد صلاة المغرب' },
      { k: 'topic', l: 'موضوع الدرس', t: 'text' },
      { k: 'place', l: 'المكان', t: 'text' } ] },
    audio: { label: 'مقطع صوتي', titleKey: 'title', fields: [
      { k: 'title', l: 'عنوان المقطع', t: 'text', req: 1 },
      { k: 'src', l: 'رابط الصوت MP3', t: 'url', h: 'رابط مباشر من archive.org أو جوجل درايف' },
      { k: 'desc', l: 'وصف مختصر', t: 'textarea' } ] },
    books: { label: 'كتاب', titleKey: 'title', fields: [
      { k: 'title', l: 'اسم الكتاب', t: 'text', req: 1 },
      { k: 'link', l: 'رابط التحميل PDF', t: 'url' },
      { k: 'desc', l: 'وصف الكتاب', t: 'textarea' } ] },
    fatwas: { label: 'سؤال', titleKey: 'q', fields: [
      { k: 'q', l: 'السؤال', t: 'text', req: 1 },
      { k: 'a', l: 'الإجابة', t: 'textarea', rows: 5, req: 1 } ] },
    events: { label: 'فعالية', titleKey: 'title', fields: [
      { k: 'title', l: 'عنوان الفعالية', t: 'text', req: 1 },
      { k: 'date', l: 'التاريخ بصيغة YYYY-MM-DD', t: 'text', req: 1, h: 'مثال: 2026-12-20' },
      { k: 'time', l: 'الوقت', t: 'text' },
      { k: 'place', l: 'المكان', t: 'text' },
      { k: 'desc', l: 'تفاصيل', t: 'textarea' } ] }
  };

  /* ================= الأقسام القابلة للإخفاء ================= */
  const SECTIONS = [
    { id: 'events', t: '📅 الفعاليات' }, { id: 'audio', t: '🎧 الصوتيات' },
    { id: 'books', t: '📚 الكتب' }, { id: 'fatwa', t: '🕌 الأسئلة' },
    { id: 'hijri', t: '📆 التقويم الهجري' }, { id: 'quran', t: ' القرآن' },
    { id: 'azkar', t: '🤲 الأذكار' }, { id: 'zakat', t: ' الزكاة' },
    { id: 'dua', t: '📿 الأدعية' }, { id: 'quiz', t: '🏆 المسابقات' },
    { id: 'memorize', t: '🎯 متتبع الحفظ' }, { id: 'map', t: '️ الخريطة' },
    { id: 'register', t: '📋 التسجيل' }, { id: 'comments', t: '💬 التعليقات' },
    { id: 'newsletter', t: '📬 النشرة البريدية' }
  ];

  /* ================= الخطوط المتاحة ================= */
  const FONTS = [
    { id: 'amiri', n: 'أميري (كلاسيكي)' },
    { id: 'cairo', n: 'كايرو (حديث)' },
    { id: 'tajawal', n: 'تجوّل (أنيق)' },
    { id: 'noto', n: 'نوتو (واضح)' }
  ];

  /* ================= الألوان المتاحة ================= */
  const THEMES = [
    { id: 'default', n: 'أزهري (أخضر + ذهبي)', c: '#0b2e22' },
    { id: 'blue', n: 'سماوي', c: '#0f2440' },
    { id: 'purple', n: 'بنفسجي', c: '#2d1440' },
    { id: 'brown', n: 'ترابي', c: '#2d1f0f' },
    { id: 'crimson', n: 'عنابي', c: '#2d0f0f' }
  ];

  /* ================= دوال مساعدة ================= */
  function fieldHtml(f, val) {
    const v = esc(val ?? '');
    let inner;
    if (f.t === 'file') {
      inner = '<input type="file" name="' + f.k + '" accept="' + (f.accept || 'image/*') + '" data-upload="1">';
    } else if (f.t === 'textarea') {
      inner = '<textarea name="' + f.k + '" rows="' + (f.rows || 3) + '">' + v + '</textarea>';
    } else if (f.t === 'checkbox') {
      inner = '<input type="checkbox" name="' + f.k + '"' + (val ? ' checked' : '') + '>';
    } else {
      inner = '<input type="' + f.t + '" name="' + f.k + '" value="' + v + '"' + (f.req ? ' required' : '') + '>';
    }
    return '<label class="fld"><span>' + f.l + (f.req ? ' *' : '') + '</span>' + inner + (f.h ? '<em class="hint">' + f.h + '</em>' : '') + '</label>';
  }

  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function showSync(msg, err) {
    let s = $('#syncStatus');
    if (!s) {
      s = document.createElement('div');
      s.id = 'syncStatus';
      s.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--green-900);color:var(--gold-2);padding:8px 18px;border-radius:99px;font-size:.82rem;font-weight:900;z-index:500;border:1px solid var(--gold);opacity:0;transition:.3s;pointer-events:none';
      document.body.appendChild(s);
    }
    s.textContent = msg;
    s.style.borderColor = err ? '#c0392b' : 'var(--gold)';
    s.style.color = err ? '#e74c3c' : 'var(--gold-2)';
    s.style.opacity = '1';
    clearTimeout(s._t);
    s._t = setTimeout(() => s.style.opacity = '0', 2500);
  }

  function applySectionVisibility() {
    const d = app.get();
    const hidden = d.settings.hiddenSections || [];
    SECTIONS.forEach(s => {
      const el = $('#' + s.id);
      if (el) el.style.display = hidden.includes(s.id) ? 'none' : '';
    });
  }

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
    const ticker = $('.ticker'); if (ticker) ticker.style.display = s.showTicker === false ? 'none' : '';
    const stats = $('.stats-strip'); if (stats) stats.style.display = s.showStats === false ? 'none' : '';
    const quote = $('.quote-banner'); if (quote) quote.style.display = s.showQuote === false ? 'none' : '';
    if (s.heroBg) { const hero = $('.hero'); if (hero) hero.style.backgroundImage = 'url(' + s.heroBg + ')'; }
    if (s.footerNote) { const fn = $('.foot-note'); if (fn) fn.textContent = s.footerNote; }
  }

  function applyFont() {
    const choice = app.get().settings.fontChoice || 'amiri';
    const fonts = { amiri: "'Amiri', serif", cairo: "'Cairo', sans-serif", tajawal: "'Tajawal', sans-serif", noto: "'Noto Naskh Arabic', serif" };
    document.documentElement.style.setProperty('--f-body', fonts[choice]);
    if (!$('#font-' + choice)) {
      const l = document.createElement('link');
      l.id = 'font-' + choice; l.rel = 'stylesheet';
      const name = choice === 'cairo' ? 'Cairo' : choice === 'tajawal' ? 'Tajawal' : choice === 'noto' ? 'Noto+Naskh+Arabic' : 'Amiri';
      l.href = 'https://fonts.googleapis.com/css2?family=' + name + ':wght@400;700;900&display=swap';
      document.head.appendChild(l);
    }
  }

  function applyTheme() {
    const t = app.get().settings.themeChoice || 'default';
    if (t === 'default') document.body.removeAttribute('data-theme');
    else document.body.setAttribute('data-theme', t);
  }

  function saveAndSync(d) {
    app.save(d);
    app.renderAll();
    setTimeout(() => {
      applySectionVisibility();
      applyTitles();
      applyFont();
      applyTheme();
    }, 100);
    showSync('✓ تم الحفظ والنشر فورًا');
  }

  /* ================= دوال اللوحة الأساسية ================= */
  document.addEventListener('click', e => { if (e.target.closest('[data-open-admin]')) location.hash = 'admin'; });
  window.addEventListener('hashchange', syncHash);
  function syncHash() { location.hash === '#admin' ? open() : close(); }
  if (location.hash === '#admin') open();

  function open() {
    adminEl.hidden = false; document.body.classList.add('lock');
    sessionStorage.getItem(AUTH) === '1' ? shell() : gate();
  }
  function close() { adminEl.hidden = true; document.body.classList.remove('lock'); }

  function gate() {
    adminEl.innerHTML =
      '<div class="gate"><form class="gate-box" data-form="gate">'
      + '<div class="lock">🔐</div><h2>لوحة تحكم المالك</h2>'
      + '<input type="password" id="gatePass" placeholder="كلمة المرور" autocomplete="off" required>'
      + '<div style="margin-top:16px;display:flex;gap:10px;justify-content:center">'
      + '<button class="btn-save" type="submit">دخول</button>'
      + '<button class="mini-btn" type="button" data-act="close">رجوع للموقع</button></div></form></div>';
    const i = $('#gatePass'); if (i) i.focus();
  }

  function shell() {
    adminEl.innerHTML =
      '<aside class="admin-side"><div class="admin-brand">لوحة التحكم ✦</div>'
      + TABS.map(t => '<button data-act="tab" data-tab="' + t.id + '"' + (t.id === tab ? ' class="on"' : '') + '>' + t.t + '</button>').join('')
      + '<div class="sp"></div>'
      + '<button data-act="view">👁️ معاينة الموقع</button>'
      + '<button data-act="close">🚪 خروج</button></aside>'
      + '<main class="admin-view" id="adminView"></main>';
    renderTab();
  }

  /* ================= renderSettings ================= */
  function renderSettings() {
    const s = app.get().settings;
    const simple = [
      ['ownerName', 'اسم الشيخ'], ['siteName', 'اسم الموقع'], ['jobTitle', 'اللقب / المسمى الوظيفي'],
      ['heroKicker', 'السطر التعريفي أعلى الاسم'], ['heroTitle', 'الشعار (مقولة تحت الاسم)'],
      ['cred1', 'شارة المؤهل الأولى'], ['cred2', 'شارة المؤهل الثانية'], ['archCap', 'التعليق تحت الصورة'],
      ['portraitSrc', 'رابط الصورة الشخصية (اختياري)'],
      ['wa', 'رقم واتساب (بصيغة دولية بدون +)'], ['phone', 'رقم الهاتف'], ['email', 'البريد الإلكتروني'], ['address', 'العنوان / الدولة'],
      ['facebook', 'رابط فيسبوك (اختياري)'], ['youtube', 'رابط قناة يوتيوب (اختياري)'], ['telegram', 'رابط تليجرام (اختياري)'],
      ['adminPass', 'كلمة مرور لوحة التحكم'],
      ['youtubePlaylist', 'رابط قائمة تشغيل يوتيوب (اختياري)'],
      ['formspree', 'رابط Formspree لاستقبال الرسائل (اختياري)'],
      ['liveUrl', 'رابط البث المباشر (YouTube Live)']
    ];
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>الإعدادات العامة</h2></div>'
      + '<form data-form="settings">'
      + '<div class="a-card"><h3>نصوص الواجهة</h3>'
      + simple.slice(0, 9).map(x => '<label class="fld"><span>' + x[1] + '</span><input data-p="' + x[0] + '" value="' + esc(s[x[0]]) + '"></label>').join('')
      + '<label class="fld"><span>نبذة «عن الشيخ» (سطر فارغ = فقرة جديدة)</span><textarea data-p="bio" rows="8">' + esc(s.bio) + '</textarea></label>'
      + '<label class="fld"><span>الاهتمامات الدعوية (افصل بينها بفاصلة ،)</span><input data-p="__interests" value="' + esc((s.interests || []).join('، ')) + '"></label>'
      + '<label class="fld"><span>آيات وأحاديث الشريط المتحرك (سطر لكل نص)</span><textarea data-p="__ticker" rows="5">' + esc((s.tickerItems || []).join('\n')) + '</textarea></label>'
      + '</div>'
      + '<div class="a-card"><h3>المؤهلات العلمية (كل سطر: الدرجة | العنوان | التفاصيل)</h3>'
      + '<textarea data-p="__quals" rows="4">' + esc((s.quals || []).map(q => q.year + ' | ' + q.title + ' | ' + q.desc).join('\n')) + '</textarea>'
      + '<label class="fld" style="margin-top:14px"><span>ملاحظة المنهج</span><input data-p="aboutNote" value="' + esc(s.aboutNote) + '"></label></div>'
      + '<div class="a-card"><h3>الإحصائيات (كل سطر: الرقم | الوصف)</h3>'
      + '<textarea data-p="__stats" rows="4">' + esc((s.stats || []).map(x => x.num + ' | ' + x.label).join('\n')) + '</textarea></div>'
      + '<div class="a-card"><h3>بيانات التواصل والروابط</h3>'
      + '<div class="frow">' + simple.slice(9).map(x => '<label class="fld"><span>' + x[1] + '</span><input data-p="' + x[0] + '" value="' + esc(s[x[0]]) + '"></label>').join('') + '</div></div>'
      + '<button class="btn-save" type="submit">💾 حفظ الإعدادات</button>'
      + '</form>';
  }

  /* ================= renderCrud (مع دعم رفع الصور) ================= */
  function renderCrud(coll) {
    const S = SCHEMA[coll];
    const items = app.get()[coll] || [];
    const editing = editId != null ? items.find(i => i.id === editId) : null;
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>إدارة ' + TABS.find(t => t.id === coll).t.replace(/^\S+\s/, '') + '</h2></div>'
      + '<div class="a-card"><h3>' + (editing ? '✏️ تعديل: ' + esc(editing[S.titleKey] || '') : '➕ إضافة ' + S.label + ' جديد') + '</h3>'
      + '<form data-form="crud" data-coll="' + coll + '">'
      + S.fields.map(f => fieldHtml(f, editing ? editing[f.k] : '')).join('')
      + '<div class="btn-row"><button class="btn-save" type="submit">' + (editing ? 'حفظ التعديل' : 'إضافة') + '</button>'
      + (editing ? '<button class="mini-btn del" type="button" data-act="cancel-edit">إلغاء التعديل</button>' : '') + '</div></form></div>'
      + '<div class="a-card"><h3>العناصر الحالية (' + items.length + ')</h3>'
      + (items.length ? items.map(i =>
          '<div class="a-item"><div><h4>' + esc(i[S.titleKey] || i.src || 'بدون عنوان') + '</h4>'
          + '<small>' + esc(i.category || i.date || i.day || '') + '</small></div>'
          + '<div class="a-btns"><button class="mini-btn edit" data-act="edit" data-id="' + i.id + '">تعديل</button>'
          + '<button class="mini-btn del" data-act="del" data-id="' + i.id + '">حذف</button></div></div>').join('')
        : '<p style="color:#8a8468">لا توجد عناصر بعد — أضِف أول ' + S.label + ' من النموذج أعلاه.</p>')
      + '</div>';
  }

  /* ================= renderAppearance ================= */
  function renderAppearance() {
    const s = app.get().settings;
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>🎨 المظهر</h2></div>'
      + '<div class="a-card"><h3>الخطوط</h3>'
      + '<label class="fld"><span>الخط الافتراضي</span><select data-p="fontChoice">'
      + FONTS.map(f => '<option value="' + f.id + '"' + ((s.fontChoice || 'amiri') === f.id ? ' selected' : '') + '>' + f.n + '</option>').join('')
      + '</select></label></div>'
      + '<div class="a-card"><h3>الألوان (الثيم)</h3>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">'
      + THEMES.map(t => '<label style="display:flex;align-items:center;gap:8px;padding:10px;border:2px solid ' + ((s.themeChoice || 'default') === t.id ? 'var(--gold)' : 'var(--line)') + ';border-radius:10px;cursor:pointer"><input type="radio" name="themeChoice" value="' + t.id + '"' + ((s.themeChoice || 'default') === t.id ? ' checked' : '') + ' style="accent-color:var(--gold)"><span style="width:24px;height:24px;border-radius:50%;background:' + t.c + ';border:2px solid var(--gold)"></span><span>' + t.n + '</span></label>').join('')
      + '</div></div>'
      + '<div class="a-card"><h3>خلفية الهيرو (اختياري)</h3>'
      + '<label class="fld"><span>رابط صورة الخلفية</span><input data-p="heroBg" value="' + esc(s.heroBg || '') + '" placeholder="https://..."></label>'
      + '<label class="fld"><span>أو ارفع صورة من جهازك</span><input type="file" id="heroBgUpload" accept="image/*"></label></div>'
      + '<button class="btn-save" id="appearanceSave" style="width:100%">💾 حفظ المظهر</button>';

    $('#appearanceSave').onclick = () => {
      const d = app.get();
      const fontSelect = $('#adminView').querySelector('[data-p="fontChoice"]');
      if (fontSelect) d.settings.fontChoice = fontSelect.value;
      const themeRadio = $('#adminView').querySelector('input[name="themeChoice"]:checked');
      if (themeRadio) d.settings.themeChoice = themeRadio.value;
      const heroBg = $('#adminView').querySelector('[data-p="heroBg"]');
      if (heroBg) d.settings.heroBg = heroBg.value.trim();
      saveAndSync(d);
    };

    $('#heroBgUpload').onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const base64 = await convertFileToBase64(file);
        const d = app.get();
        d.settings.heroBg = base64;
        saveAndSync(d);
        app.toast('تم رفع خلفية الهيرو ✔');
      } catch (err) { app.toast('تعذر رفع الصورة', 'err'); }
    };
  }

  /* ================= renderSections ================= */
  function renderSections() {
    const hidden = app.get().settings.hiddenSections || [];
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>️ إظهار/إخفاء الأقسام</h2><p style="color:var(--muted);margin-bottom:16px">اختر الأقسام اللي عايز تظهر في الموقع</p></div>'
      + '<div class="a-card">'
      + SECTIONS.map(s => {
        const isHidden = hidden.includes(s.id);
        return '<label style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--line);border-radius:10px;margin-bottom:8px;cursor:pointer;background:' + (isHidden ? 'rgba(192,57,43,.05)' : 'rgba(39,174,96,.05)') + '">'
          + '<span style="font-weight:700">' + s.t + '</span>'
          + '<input type="checkbox" data-sec="' + s.id + '"' + (isHidden ? '' : ' checked') + ' style="accent-color:var(--gold);width:20px;height:20px">'
          + '</label>';
      }).join('')
      + '</div>';

    $('#adminView').querySelectorAll('input[data-sec]').forEach(cb => {
      cb.onchange = () => {
        const d = app.get();
        const hidden = d.settings.hiddenSections || [];
        const id = cb.dataset.sec;
        const idx = hidden.indexOf(id);
        if (cb.checked) { if (idx >= 0) hidden.splice(idx, 1); }
        else { if (idx < 0) hidden.push(id); }
        d.settings.hiddenSections = hidden;
        saveAndSync(d);
        cb.closest('label').style.background = cb.checked ? 'rgba(39,174,96,.05)' : 'rgba(192,57,43,.05)';
      };
    });
  }

  /* ================= renderTitles ================= */
  function renderTitles() {
    const s = app.get().settings;
    const titles = [
      ['eventsTitle', 'عنوان قسم الفعاليات'],
      ['audioTitle', 'عنوان قسم الصوتيات'],
      ['booksTitle', 'عنوان قسم الكتب'],
      ['faqTitle', 'عنوان قسم الأسئلة'],
      ['quizTitle', 'عنوان قسم المسابقات'],
      ['memTitle', 'عنوان متتبع الحفظ'],
      ['mapTitle', 'عنوان الخريطة'],
      ['regTitle', 'عنوان التسجيل']
    ];
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>✏️ العناوين المخصصة</h2><p style="color:var(--muted);margin-bottom:16px">غيّر عنوان أي قسم في الموقع</p></div>'
      + '<form data-form="titles">'
      + '<div class="a-card">'
      + titles.map(t => '<label class="fld"><span>' + t[1] + '</span><input data-p="' + t[0] + '" value="' + esc(s[t[0]] || '') + '" placeholder="اتركه فاضي للعنوان الافتراضي"></label>').join('')
      + '</div>'
      + '<div class="a-card"><h3>ملاحظة الفوتر</h3>'
      + '<label class="fld"><span>نص يظهر في الفوتر</span><textarea data-p="footerNote" rows="2">' + esc(s.footerNote || '') + '</textarea></label></div>'
      + '<button class="btn-save" type="submit">💾 حفظ العناوين</button>'
      + '</form>';
  }

  /* ================= renderAdvanced ================= */
  function renderAdvanced() {
    const s = app.get().settings;
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>⚡ الإعدادات المتقدمة</h2></div>'
      + '<form data-form="advanced">'
      + '<div class="a-card"><h3>شريط الآيات</h3>'
      + '<label class="fld"><span>سرعة الشريط (ثانية)</span><input type="number" data-p="tickSpeed" min="10" max="60" step="5" value="' + (s.tickSpeed || 30) + '"></label>'
      + '<label class="fld" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" data-p="showTicker"' + (s.showTicker !== false ? ' checked' : '') + '><span>إظهار شريط الآيات</span></label></div>'
      + '<div class="a-card"><h3>المسابقات</h3>'
      + '<label class="fld"><span>عدد الأسئلة في كل مسابقة</span><input type="number" data-p="quizCount" min="3" max="15" value="' + (s.quizCount || 10) + '"></label></div>'
      + '<div class="a-card"><h3>إحصائيات الموقع</h3>'
      + '<label class="fld" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" data-p="showStats"' + (s.showStats !== false ? ' checked' : '') + '><span>إظهار شريط الإحصائيات</span></label></div>'
      + '<div class="a-card"><h3>اقتباس اليوم</h3>'
      + '<label class="fld" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" data-p="showQuote"' + (s.showQuote !== false ? ' checked' : '') + '><span>إظهار اقتباس اليوم</span></label></div>'
      + '<button class="btn-save" type="submit">💾 حفظ الإعدادات المتقدمة</button>'
      + '</form>';
  }

  /* ================= renderBackup ================= */
  function renderBackup() {
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>النسخ الاحتياطي والنشر</h2></div>'
      + '<div class="a-card"><h3>١ — تنزيل ملف البيانات الجديد</h3>'
      + '<p style="margin-bottom:14px;color:#4a5a50">بعد أي تعديل واحفظ، نزِّل هذا الملف واستبدل به <b>js/data.js</b> في مجلد موقعك، ثم أعد رفع الموقع للاستضافة.</p>'
      + '<div class="btn-row"><button class="btn-save" data-act="export">️ تنزيل data.js</button>'
      + '<button class="mini-btn edit" data-act="copyjson">📋 نسخ البيانات JSON</button></div></div>'
      + '<div class="a-card"><h3>٢ — استيراد نسخة محفوظة</h3>'
      + '<label class="fld"><span>اختر ملف data.js أو JSON سابق</span><input type="file" id="importFile" accept=".js,.json"></label></div>'
      + '<div class="a-card"><h3>٣ — خطوات النشر المجاني</h3><ol class="steps">'
      + '<li><b>نيتفلاي:</b> افتح <a href="https://app.netlify.com/drop" target="_blank">app.netlify.com/drop</a> واسحب مجلد الموقع كاملًا وأفلته.</li>'
      + '<li><b>جيت هب:</b> أنشئ مستودعًا جديدًا وارفع الملفات، ثم من Settings ← Pages اختر الفرع main.</li>'
      + '<li><b>لتحديث الموقع:</b> استبدل ملف data.js ثم أعد الرفع.</li>'
      + '</ol></div>'
      + '<div class="a-card"><h3>إعادة الضبط</h3>'
      + '<button class="btn-save btn-danger" data-act="reset">️ استعادة البيانات الافتراضية</button></div>';
  }

  /* ================= renderTab ================= */
  function renderTab() {
    editId = null;
    if (tab === 'settings') renderSettings();
    else if (tab === 'appearance') renderAppearance();
    else if (tab === 'sections') renderSections();
    else if (tab === 'titles') renderTitles();
    else if (tab === 'advanced') renderAdvanced();
    else if (tab === 'backup') renderBackup();
    else renderCrud(tab);
  }

  /* ================= Event Listeners ================= */
  adminEl.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'tab') { tab = b.dataset.tab; shell(); }
    else if (act === 'close') { location.hash = ''; }
    else if (act === 'view') { location.hash = ''; window.scrollTo({ top: 0 }); }
    else if (act === 'cancel-edit') { editId = null; renderCrud(tab); }
    else if (act === 'edit') { editId = +b.dataset.id; renderCrud(tab); $('#adminView').scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (act === 'del') {
      const d = app.get();
      d[tab] = (d[tab] || []).filter(i => i.id !== +b.dataset.id);
      saveAndSync(d); renderCrud(tab); app.toast('تم الحذف ✔');
    }
    else if (act === 'export') {
      const d = app.get();
      const c = '/* ملف بيانات موقع ' + d.settings.siteName + ' */\nwindow.SITE_DATA = ' + JSON.stringify(d, null, 2) + ';\n';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([c], { type: 'text/javascript;charset=utf-8' }));
      a.download = 'data.js'; a.click(); URL.revokeObjectURL(a.href);
      app.toast('تم تنزيل ملف البيانات ✔');
    }
    else if (act === 'copyjson') {
      navigator.clipboard.writeText(JSON.stringify(app.get(), null, 2)).then(() => app.toast('تم النسخ ✔'));
    }
    else if (act === 'reset') {
      if (confirm('سيتم مسح كل تعديلاتك والعودة للبيانات الافتراضية. هل أنت متأكد؟')) app.reset();
    }
  });

  adminEl.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, type = f.dataset.form;

    if (type === 'gate') {
      const v = f.querySelector('#gatePass').value;
      if (v === app.get().settings.adminPass) { sessionStorage.setItem(AUTH, '1'); shell(); app.toast('مرحبًا بك يا شيخ إسماعيل 👋'); }
      else app.toast('كلمة المرور غير صحيحة', 'err');
    }

    else if (type === 'settings') {
      const d = app.get();
      adminEl.querySelectorAll('[data-p]').forEach(inp => {
        const p = inp.dataset.p;
        if (p === '__interests') d.settings.interests = inp.value.split(/[،,]/).map(s => s.trim()).filter(Boolean);
        else if (p === '__ticker') d.settings.tickerItems = inp.value.split('\n').map(s => s.trim()).filter(Boolean);
        else if (p === '__quals') d.settings.quals = inp.value.split('\n').map(l => l.split('|').map(s => s.trim())).filter(a => a[0]).map(a => ({ year: a[0], title: a[1] || '', desc: a[2] || '' }));
        else if (p === '__stats') d.settings.stats = inp.value.split('\n').map(l => l.split('|').map(s => s.trim())).filter(a => a[0]).map(a => ({ num: a[0], label: a[1] || '' }));
        else d.settings[p] = inp.value.trim();
      });
      saveAndSync(d); app.toast('تم حفظ الإعدادات ✔');
    }

    else if (type === 'titles') {
      const d = app.get();
      adminEl.querySelectorAll('[data-p]').forEach(inp => {
        d.settings[inp.dataset.p] = inp.value.trim();
      });
      saveAndSync(d); app.toast('تم حفظ العناوين ✔');
    }

    else if (type === 'advanced') {
      const d = app.get();
      adminEl.querySelectorAll('[data-p]').forEach(inp => {
        const p = inp.dataset.p;
        if (inp.type === 'checkbox') d.settings[p] = inp.checked;
        else if (inp.type === 'number') d.settings[p] = +inp.value;
        else d.settings[p] = inp.value.trim();
      });
      saveAndSync(d); app.toast('تم حفظ الإعدادات المتقدمة ✔');
    }

    else if (type === 'crud') {
      const coll = f.dataset.coll;
      const vals = {};
      let hasFile = false;

      for (const field of SCHEMA[coll].fields) {
        if (field.t === 'file') {
          const fileInput = f.elements[field.k];
          if (fileInput && fileInput.files && fileInput.files[0]) {
            hasFile = true;
            try {
              const base64 = await convertFileToBase64(fileInput.files[0]);
              vals.src = base64;
            } catch (err) {
              app.toast('تعذر رفع الصورة', 'err');
              return;
            }
          }
        } else {
          const el = f.elements[field.k];
          vals[field.k] = el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : '';
        }
      }

      const d = app.get();
      if (editId != null) {
        const i = (d[coll] || []).find(x => x.id === editId);
        if (i) Object.assign(i, vals);
        editId = null; app.toast('تم حفظ التعديل ✔');
      } else {
        d[coll] = d[coll] || [];
        d[coll].unshift(Object.assign({ id: Date.now() }, vals));
        app.toast('تمت الإضافة ✔');
      }
      saveAndSync(d); renderCrud(coll);
    }
  });

  adminEl.addEventListener('change', e => {
    if (e.target.id !== 'importFile' || !e.target.files[0]) return;
    const r = new FileReader();
    r.onload = () => {
      let txt = String(r.result);
      try {
        let obj = null;
        try { obj = JSON.parse(txt); } catch (_) {
          const m = txt.match(/window\.SITE_DATA\s*=\s*([\s\S]*);?\s*$/);
          if (m) obj = JSON.parse(m[1]);
        }
        if (obj && obj.settings) { app.save(obj); app.renderAll(); app.toast('تم الاستيراد بنجاح ✔'); renderTab(); }
        else app.toast('الملف غير صالح', 'err');
      } catch (_) { app.toast('تعذر قراءة الملف', 'err'); }
    };
    r.readAsText(e.target.files[0]);
  });

  /* ================= نقاط ربط للمرحلة 8 ================= */
  window.__adminSchema = SCHEMA;
  window.__adminShell = shell;
  window.__renderSettings = renderSettings;

  /* ================= مراقبة DOM لتطبيق التغييرات ================= */
  const mo = new MutationObserver(() => {
    applySectionVisibility();
    applyTitles();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  console.log('✅ لوحة التحكم الكاملة مُحمَّلة');
})();