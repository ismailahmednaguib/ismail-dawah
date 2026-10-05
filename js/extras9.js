/* ================================================================
   المرحلة 6: اقتباس يومي + خرائط + تقييم + تسجيل + ثيمات + إحصائيات
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const d = app.get();

  /* ================= 1) الاقتباس اليومي ================= */
  const QUOTES = [
    { t: '﴿قُلْ هَٰذِهِ سَبِيلِي أَدْعُو إِلَى اللَّهِ ۚ عَلَىٰ بَصِيرَةٍ﴾', s: 'يوسف: 108' },
    { t: '«لَئِنْ يَهْدِيَ اللَّهُ بِكَ رَجُلًا وَاحِدًا خَيْرٌ لَكَ مِنْ حُمْرِ النَّعَمِ»', s: 'متفق عليه' },
    { t: '﴿ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ﴾', s: 'النحل: 125' },
    { t: '«مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ»', s: 'رواه مسلم' },
    { t: '﴿وَمَنْ أَحْسَنُ قَوْلًا مِمَّنْ دَعَا إِلَى اللَّهِ وَعَمِلَ صَالِحًا﴾', s: 'فصلت: 33' },
    { t: '«الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ»', s: 'رواه مسلم' },
    { t: '﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾', s: 'المائدة: 2' },
    { t: '«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»', s: 'رواه البخاري' },
    { t: '﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾', s: 'طه: 114' },
    { t: '«إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ»', s: 'متفق عليه' },
    { t: '﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾', s: 'النحل: 90' },
    { t: '«لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»', s: 'متفق عليه' },
    { t: '﴿وَبَشِّرِ الصَّابِرِينَ﴾', s: 'البقرة: 155' },
    { t: '«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ»', s: 'متفق عليه' },
    { t: '﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ﴾', s: 'البقرة: 201' },
    { t: '«اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ»', s: 'رواه الترمذي' },
    { t: '﴿وَالْعَصْرِ إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ﴾', s: 'العصر: 1-3' },
    { t: '«الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ»', s: 'متفق عليه' },
    { t: '﴿وَقُولُوا لِلنَّاسِ حُسْنًا﴾', s: 'البقرة: 83' },
    { t: '«أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ»', s: 'رواه الطبراني' },
    { t: '﴿وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا﴾', s: 'الطلاق: 2' },
    { t: '«تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ»', s: 'رواه الترمذي' },
    { t: '﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾', s: 'الشرح: 6' },
    { t: '«خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ»', s: 'رواه الطبراني' },
    { t: '﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾', s: 'آل عمران: 103' },
    { t: '«مَنْ لَا يَرْحَمُ النَّاسَ لَا يَرْحَمُهُ اللَّهُ»', s: 'متفق عليه' },
    { t: '﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا﴾', s: 'الشرح: 5' },
    { t: '«الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ»', s: 'متفق عليه' },
    { t: '﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ﴾', s: 'التوبة: 105' },
    { t: '«أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»', s: 'متفق عليه' },
    { t: '﴿رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي﴾', s: 'طه: 25-26' },
    { t: '«لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا»', s: 'رواه مسلم' },
    { t: '﴿وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا﴾', s: 'العنكبوت: 69' },
    { t: '«مَنْ سَرَّهُ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ فَلْيَصِلْ رَحِمَهُ»', s: 'متفق عليه' },
    { t: '﴿حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ﴾', s: 'آل عمران: 173' },
    { t: '«الطُّهُورُ شَطْرُ الْإِيمَانِ»', s: 'رواه مسلم' },
    { t: '﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ عَلَيْهِ تَوَكَّلْتُ﴾', s: 'هود: 88' },
    { t: '«مَنْ عَمِلَ صَالِحًا مِنْ ذَكَرٍ أَوْ أُنْثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً»', s: 'النحل: 97' },
    { t: '﴿إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ﴾', s: 'التوبة: 120' },
    { t: '«الدِّينُ النَّصِيحَةُ»', s: 'رواه مسلم' },
    { t: '﴿وَقُلْ رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ﴾', s: 'المؤمنون: 97' },
    { t: '«مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا»', s: 'رواه مسلم' },
    { t: '﴿وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ﴾', s: 'فصلت: 34' },
    { t: '«بَشِّرُوا وَلَا تُنَفِّرُوا»', s: 'متفق عليه' },
    { t: '﴿رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ﴾', s: 'الفرقان: 74' },
    { t: '«أَنَا عِنْدَ ظَنِّ عَبْدِي بِي»', s: 'متفق عليه' },
    { t: '﴿وَالسَّابِقُونَ السَّابِقُونَ أُولَٰئِكَ الْمُقَرَّبُونَ﴾', s: 'الواقعة: 10-11' },
    { t: '«خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ»', s: 'رواه الترمذي' },
    { t: '﴿فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ﴾', s: 'البقرة: 152' },
    { t: '«مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ»', s: 'رواه أبو داود' }
  ];

  function buildQuote() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const q = QUOTES[dayOfYear % QUOTES.length];
    const sec = document.createElement('section');
    sec.className = 'quote-banner';
    sec.innerHTML = '<span class="quote-day">📅 اقتباس اليوم</span>'
      + '<p class="quote-text">' + esc(q.t) + '</p>'
      + '<span class="quote-src">' + esc(q.s) + '</span>';
    const hero = $('.hero');
    if (hero) hero.insertAdjacentElement('afterend', sec);
    else document.body.prepend(sec);
  }

  /* ================= 2) الخرائط التفاعلية ================= */
  function buildMap() {
    const events = d.events || [];
    if (!events.length) return;
    const sec = document.createElement('section');
    sec.className = 'section'; sec.id = 'map';
    sec.innerHTML = '<div class="container"><header class="sec-head"><p class="kicker">مواقعنا</p><h2 class="sec-title">خريطة الفعاليات</h2><div class="orn"><span>✦</span></div></header>'
      + '<div class="map-wrap" id="leaflet-map"><div class="map-fallback">🗺️ جاري تحميل الخريطة…</div></div>'
      + '<div class="loc-list" id="loc-list"></div></div>';
    const hijri = $('#hijri');
    if (hijri) hijri.insertAdjacentElement('afterend', sec);
    else { const c = $('#contact'); if (c) c.insertAdjacentElement('beforebegin', sec); }

    // إحداثيات افتراضية (يمكن تعديلها من لوحة التحكم لاحقاً)
    const coords = [[30.0444, 31.2357], [31.2001, 29.9187], [27.1899, 31.1851], [30.0635, 31.2568]];
    const list = $('#loc-list');
    list.innerHTML = events.map((e, i) =>
      '<div class="loc-chip" data-i="' + i + '"><b>📍 ' + esc(e.place || 'غير محدد') + '</b><small>' + esc(e.title) + '</small></div>'
    ).join('');

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    script.onload = () => {
      try {
        const map = L.map('leaflet-map').setView([29.5, 31.0], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        events.forEach((e, i) => {
          const c = coords[i % coords.length];
          const m = L.marker(c).addTo(map);
          m.bindPopup('<b>' + esc(e.title) + '</b><br>' + esc(e.place || '') + '<br><small>' + esc(e.date || '') + ' — ' + esc(e.time || '') + '</small>');
        });
        list.querySelectorAll('.loc-chip').forEach(chip => {
          chip.onclick = () => {
            const i = +chip.dataset.i;
            const c = coords[i % coords.length];
            map.setView(c, 13);
            map.eachLayer(l => { if (l instanceof L.Marker) l.openPopup(); });
          };
        });
      } catch (e) {
        $('#leaflet-map').innerHTML = '<div class="map-fallback">تعذر تحميل الخريطة — تحقق من الاتصال</div>';
      }
    };
    document.head.appendChild(script);
  }

  /* ================= 3) تقييم الدروس ================= */
  function buildRating() {
    const KEY = 'siteRatings_v1';
    let R; try { R = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { R = {}; }
    const save = () => localStorage.setItem(KEY, JSON.stringify(R));

    document.addEventListener('click', e => {
      const star = e.target.closest('.star'); if (!star) return;
      const id = star.dataset.id, val = +star.dataset.v;
      R[id] = val; save();
      const row = star.closest('.rate-row');
      $$('.star', row).forEach(s => s.classList.toggle('on', +s.dataset.v <= val));
      row.querySelector('.rate-avg').textContent = '✓ شكراً لتقييمك';
      row.querySelector('.rate-avg').classList.add('rate-done');
    });

    const observer = new MutationObserver(() => {
      $$('.card').forEach(card => {
        const title = card.querySelector('.card-title');
        if (!title || card.querySelector('.rate-row')) return;
        const id = 'r_' + title.textContent.trim().slice(0, 30);
        const avg = R[id] || 0;
        const row = document.createElement('div');
        row.className = 'rate-row';
        row.innerHTML = '<div class="stars">' + [1,2,3,4,5].map(v =>
          '<button class="star' + (v <= avg ? ' on' : '') + '" data-id="' + id + '" data-v="' + v + '">★</button>'
        ).join('') + '</div><span class="rate-avg">' + (avg ? 'تقييمك: ' + avg + '/5' : 'قيّم الدرس') + '</span>';
        const foot = card.querySelector('.card-foot') || card.querySelector('.card-body');
        if (foot) foot.appendChild(row);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.takeRecords(), 500);
  }

  /* ================= 4) نموذج التسجيل في الدورات ================= */
  function buildReg() {
    const courses = (d.lessons || []).filter(l => l.title);
    if (!courses.length) return;
    const sec = document.createElement('section');
    sec.className = 'section band-white'; sec.id = 'register';
    sec.innerHTML = '<div class="container"><header class="sec-head"><p class="kicker">سجّل الآن</p><h2 class="sec-title">التسجيل في الدورات</h2><div class="orn"><span>✦</span></div></header>'
      + '<div class="reg-box"><form id="regForm">'
      + '<div class="reg-grid">'
      + '<div><label>الاسم الكامل *</label><input name="name" required></div>'
      + '<div><label>رقم الموبايل *</label><input name="phone" required></div>'
      + '<div><label>البريد الإلكتروني</label><input type="email" name="email"></div>'
      + '<div><label>الدورة المطلوبة *</label><select name="course" required><option value="">— اختر —</option>'
      + courses.map(c => '<option>' + esc(c.title) + '</option>').join('')
      + '</select></div>'
      + '<div style="grid-column:1/-1"><label>ملاحظات</label><textarea name="notes" rows="3"></textarea></div>'
      + '</div>'
      + '<button type="submit" class="reg-submit">📩 إرسال التسجيل</button>'
      + '</form></div></div>';
    const mapSec = $('#map');
    if (mapSec) mapSec.insertAdjacentElement('afterend', sec);
    else { const c = $('#contact'); if (c) c.insertAdjacentElement('beforebegin', sec); }

    $('#regForm').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      const data = { name: f.name.value, phone: f.phone.value, email: f.email.value, course: f.course.value, notes: f.notes.value };
      const ep = d.settings.formspree;
      if (ep) {
        try {
          const r = await fetch(ep, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          r.ok ? (app.toast('تم تسجيلك بنجاح ✔ سنتواصل معك'), f.reset()) : app.toast('تعذر الإرسال، جرّب واتساب', 'err');
        } catch (err) { app.toast('تعذر الإرسال', 'err'); }
      } else {
        const wa = (d.settings.wa || '').replace(/\D/g, '');
        if (wa) {
          location.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('📋 تسجيل دورة جديدة\nالاسم: ' + data.name + '\nالموبايل: ' + data.phone + '\nالدورة: ' + data.course + '\nملاحظات: ' + data.notes);
        } else { app.toast('أضف رقم واتساب من لوحة التحكم', 'err'); }
      }
    });
  }

  /* ================= 5) الثيمات ================= */
  function buildThemes() {
    const THEMES = [
      { id: 'default', c: '#0b2e22', n: 'أزهري' },
      { id: 'blue', c: '#0f2440', n: 'سماوي' },
      { id: 'purple', c: '#2d1440', n: 'بنفسجي' },
      { id: 'brown', c: '#2d1f0f', n: 'ترابي' },
      { id: 'crimson', c: '#2d0f0f', n: 'عنابي' }
    ];
    const nav = $('.nav-tools'); if (!nav) return;
    const wrap = document.createElement('div');
    wrap.className = 'theme-picker';
    wrap.title = 'الثيمات';
    wrap.innerHTML = THEMES.map(t => '<span class="theme-dot' + (t.id === (localStorage.getItem('siteTheme') || 'default') ? ' on' : '') + '" data-t="' + t.id + '" style="background:' + t.c + '" title="' + t.n + '"></span>').join('');
    nav.appendChild(wrap);
    wrap.addEventListener('click', e => {
      const dot = e.target.closest('.theme-dot'); if (!dot) return;
      const t = dot.dataset.t;
      t === 'default' ? document.body.removeAttribute('data-theme') : document.body.setAttribute('data-theme', t);
      localStorage.setItem('siteTheme', t);
      $$('.theme-dot', wrap).forEach(x => x.classList.toggle('on', x.dataset.t === t));
    });
    const saved = localStorage.getItem('siteTheme');
    if (saved && saved !== 'default') document.body.setAttribute('data-theme', saved);
  }

  /* ================= 6) لوحة إحصائيات الشيخ ================= */
  function buildStats() {
    if (sessionStorage.getItem('siteAdminAuth_v1') !== '1') return;
    const KEY = 'siteStats_v1';
    let st; try { st = JSON.parse(localStorage.getItem(KEY)) || { views: 0, days: {}, sections: {} }; } catch (e) { st = { views: 0, days: {}, sections: {} }; }
    const last7 = Object.keys(st.days).sort().slice(-7);
    const maxVal = Math.max(...last7.map(k => st.days[k]), 1);
    const topSections = Object.entries(st.sections || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const d2 = app.get();

    const b = document.createElement('button');
    b.textContent = '📊'; b.title = 'لوحة الإحصائيات';
    b.style.cssText = 'position:fixed;bottom:84px;left:24px;width:48px;height:48px;border-radius:50%;border:0;background:var(--gold);color:#241c04;font-size:1.2rem;z-index:150;box-shadow:0 10px 24px rgba(201,162,39,.4);cursor:pointer';
    document.body.appendChild(b);
    b.onclick = () => {
      $('#modalBody').innerHTML = '<h3 class="modal-title">📊 لوحة إحصائيات الموقع</h3>'
        + '<div class="stat-big"><div><b>' + st.views + '</b><small>إجمالي الزيارات</small></div>'
        + '<div><b>' + (st.days[new Date().toISOString().slice(0, 10)] || 0) + '</b><small>زيارات اليوم</small></div>'
        + '<div><b>' + (d2.lessons || []).length + '</b><small>الدروس</small></div>'
        + '<div><b>' + (d2.videos || []).length + '</b><small>الفيديوهات</small></div>'
        + '<div><b>' + (d2.audio || []).length + '</b><small>الصوتيات</small></div>'
        + '<div><b>' + (d2.articles || []).length + '</b><small>المقالات</small></div></div>'
        + '<h4 style="margin:16px 0 8px">📈 آخر 7 أيام:</h4>'
        + '<div class="chart-bars">' + last7.map(k => '<div class="chart-bar" style="height:' + Math.max(4, (st.days[k] / maxVal) * 100) + '%"><span>' + st.days[k] + '</span><b>' + k.slice(5) + '</b></div>').join('') + '</div>'
        + '<h4 style="margin:24px 0 8px">🔥 الأقسام الأكثر زيارة:</h4>'
        + (topSections.length ? topSections.map(t => '<p>• ' + t[0] + ' — ' + t[1] + ' مرة</p>').join('') : '<p>لا بيانات بعد</p>')
        + '<p style="margin-top:14px;color:var(--muted);font-size:.85rem">🌍 إحصائيات كل الزوار: لوحة Cloudflare ← Analytics</p>';
      $('#modal').hidden = false; document.body.classList.add('lock');
    };
  }

  /* ================= تشغيل ================= */
  buildQuote(); buildMap(); buildRating(); buildReg(); buildThemes(); buildStats();

  const nav = $('#mainNav .nav-cta');
  if (nav) nav.insertAdjacentHTML('beforebegin', '<a href="#map">الخريطة</a><a href="#register">التسجيل</a>');
  const fl = $('.foot-links');
  if (fl) fl.insertAdjacentHTML('beforeend', '<a href="#map">الخريطة</a><a href="#register">التسجيل</a>');
})();