/* ================================================================
   المرحلة A: مواقيت الصلاة + التقويم الهجري + PWA
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const HIJRI_MONTHS = ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  const HIJRI_EVENTS = {
    1: [{d:1,t:'رأس السنة الهجرية'},{d:10,t:'يوم عاشوراء'}],
    3: [{d:12,t:'المولد النبوي'}],
    7: [{d:27,t:'الإسراء والمعراج'}],
    8: [{d:15,t:'ليلة النصف من شعبان'}],
    9: [{d:1,t:'بداية رمضان'},{d:27,t:'ليلة القدر (المرجّحة)'}],
    10: [{d:1,t:'عيد الفطر'}],
    12: [{d:8,t:'يوم التروية'},{d:9,t:'يوم عرفة'},{d:10,t:'عيد الأضحى'}]
  };

  /* ---------- 1) مواقيت الصلاة ---------- */
  function buildPraybar() {
    const bar = document.createElement('div');
    bar.className = 'praybar'; bar.id = 'praybar';
    bar.innerHTML = '<span class="praybar-city"><span id="pb-city">⏳ جاري تحديد موقعك…</span></span><div class="praybar-list" id="pb-list"></div><span class="praybar-next" id="pb-next"></span>';
    const topbar = $('.topbar');
    if (topbar) topbar.insertAdjacentElement('beforebegin', bar); else document.body.prepend(bar);
  }
  async function loadPrayerTimes(lat, lon, city) {
    try {
      const r = await fetch('https://api.aladhan.com/v1/timings?latitude=' + lat + '&longitude=' + lon + '&method=5');
      const j = await r.json();
      if (j.code !== 200) throw new Error('API');
      const t = j.data.timings;
      renderPraybar(city, { 'الفجر': t.Fajr, 'الشروق': t.Sunrise, 'الظهر': t.Dhuhr, 'العصر': t.Asr, 'المغرب': t.Maghrib, 'العشاء': t.Isha });
    } catch (e) { $('#pb-city').textContent = 'تعذر جلب المواقيت'; }
  }
  function renderPraybar(city, times) {
    $('#pb-city').textContent = '🕌 ' + (city || 'موقعك');
    const list = $('#pb-list'); list.innerHTML = '';
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    let nextName = '', nextMin = Infinity;
    Object.entries(times).forEach(([name, val]) => {
      const [h, m] = val.split(':').map(Number); const mins = h * 60 + m;
      const el = document.createElement('div'); el.className = 'pray-time';
      el.innerHTML = '<b>' + esc(name) + '</b><span>' + esc(val) + '</span>';
      if (mins > nowMin && mins < nextMin) { nextMin = mins; nextName = name; }
      list.appendChild(el);
    });
    let activeDone = false;
    Array.from(list.children).reverse().forEach(el => {
      const [h, m] = el.querySelector('span').textContent.split(':').map(Number);
      if (h * 60 + m <= nowMin && !activeDone) { el.classList.add('active'); activeDone = true; }
    });
    Array.from(list.children).forEach(el => { if (el.querySelector('b').textContent === nextName) el.classList.add('next'); });
    const tick = () => {
      const n = new Date(); const nm = n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;
      const diff = nextMin - nm;
      if (diff <= 0) { location.reload(); return; }
      $('#pb-next').textContent = '⏱️ ' + nextName + ' بعد: ' + (Math.floor(diff / 60) ? Math.floor(diff / 60) + 'س ' : '') + Math.floor(diff % 60) + 'د';
    };
    tick(); setInterval(tick, 30000);
  }
  function initPrayer() {
    buildPraybar();
    const cached = localStorage.getItem('pb-loc');
    if (cached) { try { const c = JSON.parse(cached); loadPrayerTimes(c.lat, c.lon, c.city); return; } catch (e) {} }
    if (!navigator.geolocation) { loadPrayerTimes(30.04, 31.24, 'القاهرة'); return; }
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords; let city = 'موقعك';
      try {
        const r = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + latitude + '&lon=' + longitude + '&format=json&accept-language=ar');
        const j = await r.json();
        city = (j.address && (j.address.city || j.address.town || j.address.village || j.address.state)) || 'موقعك';
      } catch (e) {}
      localStorage.setItem('pb-loc', JSON.stringify({ lat: latitude, lon: longitude, city }));
      loadPrayerTimes(latitude, longitude, city);
    }, () => loadPrayerTimes(30.04, 31.24, 'القاهرة'), { timeout: 8000 });
  }

  /* ---------- 2) التقويم الهجري ---------- */
  function buildHijriPage() {
    const sec = document.createElement('section');
    sec.className = 'section band-white'; sec.id = 'hijri';
    sec.innerHTML = '<div class="container"><header class="sec-head"><p class="kicker">الأشهر المباركة</p><h2 class="sec-title">التقويم الهجري</h2><div class="orn"><span>✦</span></div></header><div class="hijri-cal"><div class="hijri-head"><div class="hijri-now" id="hijri-now"></div></div><div class="hijri-grid" id="hijri-grid"></div></div></div>';
    const contact = $('#contact');
    if (contact) contact.insertAdjacentElement('beforebegin', sec);
    try { $('#hijri-now').textContent = '📅 اليوم: ' + new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch (e) {}
    let currentMonth = -1;
    try { currentMonth = HIJRI_MONTHS.indexOf(new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { month: 'long' }).format(new Date())); } catch (e) {}
    const grid = $('#hijri-grid');
    HIJRI_MONTHS.forEach((name, i) => {
      const ev = HIJRI_EVENTS[i + 1] || [];
      const card = document.createElement('div');
      card.className = 'hijri-month' + (i === currentMonth ? ' current' : '');
      card.innerHTML = '<h4>' + esc(name) + '</h4><small>الشهر ' + (i + 1) + ' من السنة الهجرية</small>' + (ev.length ? '<div class="events">' + ev.map(e => '<span>⭐ ' + e.d + ' — ' + esc(e.t) + '</span>').join('') + '</div>' : '');
      grid.appendChild(card);
    });
  }

  /* ---------- 3) PWA ---------- */
  function buildPWA() {
    const icon = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0b2e22"/><text x="256" y="360" text-anchor="middle" font-family="serif" font-size="340" fill="#c9a227" font-weight="bold">إ</text></svg>');
    const manifest = { name: 'الشيخ إسماعيل أحمد نجيب', short_name: 'إسماعيل نجيب', description: 'الموقع الدعوي للشيخ إسماعيل أحمد نجيب', start_url: '/', display: 'standalone', background_color: '#0b2e22', theme_color: '#0b2e22', orientation: 'portrait', dir: 'rtl', lang: 'ar', icons: [{ src: icon, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }] };
    const link = document.createElement('link'); link.rel = 'manifest';
    link.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
    document.head.appendChild(link);
    const apple = document.createElement('link'); apple.rel = 'apple-touch-icon'; apple.href = icon; document.head.appendChild(apple);
    const theme = document.createElement('meta'); theme.name = 'theme-color'; theme.content = '#0b2e22'; document.head.appendChild(theme);
    if ('serviceWorker' in navigator) {
      const sw = "const C='ismail-v1';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(resp.ok&&e.request.url.startsWith(self.location.origin))c.put(e.request,resp.clone());return resp;}).catch(()=>caches.match('/'))));});";
      navigator.serviceWorker.register(URL.createObjectURL(new Blob([sw], { type: 'application/javascript' }))).catch(() => {});
    }
    if (!localStorage.getItem('pwa-dismissed') && !window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => {
        const p = document.createElement('div'); p.className = 'pwa-prompt';
        p.innerHTML = '<div><b>📱 أضف الموقع لتطبيقك</b><br><small style="color:#b9cabb">ادخل بسرعة من شاشة الموبايل</small></div><button id="pwa-install">ثبّت</button><button class="pwa-close" id="pwa-close">✕</button>';
        document.body.appendChild(p);
        $('#pwa-close').onclick = () => { p.hidden = true; localStorage.setItem('pwa-dismissed', '1'); };
        $('#pwa-install').onclick = () => { app.toast('من قائمة المتصفح (⋮) أو زر المشاركة ← "إضافة إلى الشاشة الرئيسية"'); p.hidden = true; };
        setTimeout(() => { if (!p.hidden) p.hidden = true; }, 15000);
      }, 20000);
    }
  }

  initPrayer(); buildHijriPage(); buildPWA();
  const nav = $('#mainNav .nav-cta');
  if (nav) nav.insertAdjacentHTML('beforebegin', '<a href="#hijri">التقويم</a>');
  const fl = $('.foot-links');
  if (fl) fl.insertAdjacentHTML('beforeend', '<a href="#hijri">التقويم الهجري</a>');
})();