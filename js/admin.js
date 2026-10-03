/* ================================================================
   لوحة تحكم المالك — تعديل كل محتوى الموقع بدون لمس أي كود
   الدخول: زر «لوحة التحكم» في الفوتر، أو أضف #admin لرابط الموقع
   كلمة المرور الافتراضية: ismail123  (غيّرها فورًا من الإعدادات)
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const adminEl = document.getElementById('admin');
  const AUTH = 'siteAdminAuth_v1';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let tab = 'settings', editId = null;

  const TABS = [
    { id: 'settings', t: '⚙️ الإعدادات العامة' },
    { id: 'lessons', t: '📖 الدروس' },
    { id: 'videos', t: '🎬 الفيديوهات' },
    { id: 'articles', t: '✍️ المقالات' },
    { id: 'photos', t: '🖼️ الصور' },
    { id: 'schedule', t: '🗓️ الجدول' },
    { id: 'backup', t: '💾 الحفظ والنشر' }
  ];

  const SCHEMA = {
    lessons: { label: 'درس', titleKey: 'title', fields: [
      { k: 'title', l: 'عنوان الدرس', t: 'text', req: 1 },
      { k: 'category', l: 'التصنيف', t: 'text', h: 'مثال: عقيدة، فقه، سيرة، مقارنة أديان…' },
      { k: 'date', l: 'التاريخ', t: 'text', h: 'مثال: 2024' },
      { k: 'link', l: 'رابط الاستماع', t: 'url', h: 'رابط يوتيوب أو جوجل درايف (اتركه فارغًا إن لم يتوفر)' },
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
      { k: 'src', l: 'رابط الصورة أو مسارها', t: 'text', req: 1, h: 'مثال: assets/img/1.jpg أو رابط صورة من الإنترنت' },
      { k: 'caption', l: 'تعليق الصورة', t: 'text' } ] },
    schedule: { label: 'موعد', titleKey: 'topic', fields: [
      { k: 'day', l: 'اليوم', t: 'text', req: 1, h: 'مثال: السبت' },
      { k: 'time', l: 'الوقت', t: 'text', h: 'مثال: بعد صلاة المغرب' },
      { k: 'topic', l: 'موضوع الدرس', t: 'text' },
      { k: 'place', l: 'المكان', t: 'text' } ] }
  };

  /* ---------- فتح/إغلاق ---------- */
  document.addEventListener('click', e => { if (e.target.closest('[data-open-admin]')) location.hash = 'admin'; });
  window.addEventListener('hashchange', syncHash);
  function syncHash() { location.hash === '#admin' ? open() : close(); }
  if (location.hash === '#admin') open();

  function open() {
    adminEl.hidden = false; document.body.classList.add('lock');
    sessionStorage.getItem(AUTH) === '1' ? shell() : gate();
  }
  function close() { adminEl.hidden = true; document.body.classList.remove('lock'); }

  /* ---------- بوابة كلمة المرور ---------- */
  function gate() {
    adminEl.innerHTML =
      '<div class="gate"><form class="gate-box" data-form="gate">'
      + '<div class="lock">🔐</div><h2>لوحة تحكم المالك</h2>'
      + '<input type="password" id="gatePass" placeholder="كلمة المرور" autocomplete="off" required>'
      + '<div style="margin-top:16px;display:flex;gap:10px;justify-content:center">'
      + '<button class="btn-save" type="submit">دخول</button>'
      + '<button class="mini-btn" type="button" data-act="close">رجوع للموقع</button></div></form></div>';
    const i = adminEl.querySelector('#gatePass'); if (i) i.focus();
  }

  /* ---------- الهيكل ---------- */
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

  function fieldHtml(f, val) {
    const v = esc(val ?? '');
    const inner = f.t === 'textarea'
      ? '<textarea name="' + f.k + '" rows="' + (f.rows || 3) + '" placeholder="">' + v + '</textarea>'
      : '<input type="' + f.t + '" name="' + f.k + '" value="' + v + '"' + (f.req ? ' required' : '') + '>';
    return '<label class="fld"><span>' + f.l + (f.req ? ' *' : '') + '</span>' + inner + (f.h ? '<em class="hint">' + f.h + '</em>' : '') + '</label>';
  }

  /* ---------- تبويب الإعدادات ---------- */
  function renderSettings() {
    const s = app.get().settings;
    const simple = [
      ['ownerName', 'اسم الشيخ'], ['siteName', 'اسم الموقع'], ['jobTitle', 'اللقب / المسمى الوظيفي'],
      ['heroKicker', 'السطر التعريفي أعلى الاسم'], ['heroTitle', 'الشعار (مقولة تحت الاسم)'],
      ['cred1', 'شارة المؤهل الأولى'], ['cred2', 'شارة المؤهل الثانية'], ['archCap', 'التعليق تحت الصورة'],
      ['portraitSrc', 'رابط الصورة الشخصية (اختياري)'],
      ['wa', 'رقم واتساب (بصيغة دولية بدون +)'], ['phone', 'رقم الهاتف'], ['email', 'البريد الإلكتروني'], ['address', 'العنوان / الدولة'],
      ['facebook', 'رابط فيسبوك (اختياري)'], ['youtube', 'رابط قناة يوتيوب (اختياري)'], ['telegram', 'رابط تليجرام (اختياري)'],
      ['adminPass', 'كلمة مرور لوحة التحكم']
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
      + '<div class="a-card"><h3>الإحصائيات (كل سطر: الرقم | الوصف — مثال: +10 | سنوات في الدعوة)</h3>'
      + '<textarea data-p="__stats" rows="4">' + esc((s.stats || []).map(x => x.num + ' | ' + x.label).join('\n')).replace(/&amp;/g, '&') + '</textarea></div>'
      + '<div class="a-card"><h3>بيانات التواصل والروابط</h3>'
      + '<div class="frow">' + simple.slice(9).map(x => '<label class="fld"><span>' + x[1] + '</span><input data-p="' + x[0] + '" value="' + esc(s[x[0]]) + '"></label>').join('') + '</div></div>'
      + '<button class="btn-save" type="submit">💾 حفظ الإعدادات</button>'
      + '</form>';
  }

  /* ---------- تبويبات المحتوى ---------- */
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

  /* ---------- تبويب الحفظ والنشر ---------- */
  function renderBackup() {
    $('#adminView').innerHTML =
      '<div class="a-head"><h2>النسخ الاحتياطي والنشر</h2></div>'
      + '<div class="a-card"><h3>١ — تنزيل ملف البيانات الجديد</h3>'
      + '<p style="margin-bottom:14px;color:#4a5a50">بعد أي تعديل واحفظ، نزِّل هذا الملف واستبدل به <b>js/data.js</b> في مجلد موقعك، ثم أعد رفع الموقع للاستضافة.</p>'
      + '<div class="btn-row"><button class="btn-save" data-act="export">⬇️ تنزيل data.js</button>'
      + '<button class="mini-btn edit" data-act="copyjson">📋 نسخ البيانات JSON</button></div></div>'
      + '<div class="a-card"><h3>٢ — استيراد نسخة محفوظة</h3>'
      + '<label class="fld"><span>اختر ملف data.js أو JSON سابق</span><input type="file" id="importFile" accept=".js,.json"></label></div>'
      + '<div class="a-card"><h3>٣ — خطوات النشر المجاني</h3><ol class="steps">'
      + '<li><b>الأسهل — نيتفلاي:</b> افتح <a href="https://app.netlify.com/drop" target="_blank">app.netlify.com/drop</a> واسحب مجلد الموقع كاملًا وأفلته. انتهى! ستحصل على رابط مباشر.</li>'
      + '<li><b>جيت هب:</b> أنشئ مستودعًا جديدًا على <a href="https://github.com" target="_blank">github.com</a> وارفع الملفات، ثم من Settings ← Pages اختر الفرع main.</li>'
      + '<li><b>فيرسل:</b> من <a href="https://vercel.com/new" target="_blank">vercel.com/new</a> اربط المستودع أو اسحب المجلد.</li>'
      + '<li><b>لتحديث الموقع مستقبلًا:</b> استبدل ملف data.js ثم أعد السحب والإفلات (نيتفلاي) أو ارفع التعديل للمستودع.</li>'
      + '</ol></div>'
      + '<div class="a-card"><h3>إعادة الضبط</h3>'
      + '<button class="btn-save btn-danger" data-act="reset">🗑️ استعادة البيانات الافتراضية</button></div>';
  }

  function renderTab() {
    editId = null;
    if (tab === 'settings') renderSettings();
    else if (tab === 'backup') renderBackup();
    else renderCrud(tab);
  }

  /* ---------- معالجة النقرات ---------- */
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
      app.save(d); app.renderAll(); renderCrud(tab); app.toast('تم الحذف ✔');
    }
    else if (act === 'export') {
      const d = app.get();
      const c = '/* ملف بيانات موقع ' + d.settings.siteName + ' — أُنشئ من لوحة التحكم.\n   استبدل به ملف js/data.js القديم ثم أعد رفع الموقع للاستضافة. */\nwindow.SITE_DATA = ' + JSON.stringify(d, null, 2) + ';\n';
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

  /* ---------- معالجة النماذج ---------- */
  adminEl.addEventListener('submit', e => {
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
      app.save(d); app.renderAll(); app.toast('تم حفظ الإعدادات ✔');
    }

    else if (type === 'crud') {
      const coll = f.dataset.coll;
      const vals = {};
      SCHEMA[coll].fields.forEach(x => { const el = f.elements[x.k]; vals[x.k] = el ? el.value.trim() : ''; });
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
      app.save(d); app.renderAll(); renderCrud(coll);
    }
  });

  /* ---------- الاستيراد ---------- */
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
      } catch (_) { app.toast('تعذر قراءة الملف — تأكد أنه ملف data.js صحيح', 'err'); }
    };
    r.readAsText(e.target.files[0]);
  });
})();