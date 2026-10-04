/* ================================================================
   حزمة الإضافات — المرحلة الأولى
   تاريخ هجري • وضع ليلي • بحث • مشاركة • لمسات SEO
   ملف مستقل تمامًا: لا يعدّل أي ملف أساسي
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const IC = {
    wa: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.5 14.1c-.24.66-1.36 1.26-1.9 1.3-.5.06-1.13.27-3.8-.8-3.2-1.28-5.27-4.55-5.43-4.76-.16-.2-1.3-1.74-1.3-3.32s.8-2.36 1.1-2.68c.28-.32.62-.4.82-.4l.6.01c.18.01.44-.07.68.52.25.6.85 2.07.92 2.22.08.15.13.33.03.53-.1.2-.15.32-.3.5l-.45.53c-.15.15-.3.31-.13.6.17.3.75 1.24 1.62 2 1.1.99 2.05 1.3 2.34 1.45.3.15.47.13.64-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.72.81 2.01.96.3.15.49.22.56.34.07.13.07.73-.17 1.38z"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.3c0-.84.23-1.4 1.44-1.4h1.54V5.3c-.27-.04-1.18-.12-2.24-.12-2.22 0-3.74 1.36-3.74 3.85v2.08H8v2.9h2.5V21h3z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M4 4h3.4l4.6 6.2L17 4h3l-6.6 8L20.6 20h-3.4l-4.9-6.6L6.9 20h-3l7-8.4L4 4z"/></svg>',
    tg: '<svg viewBox="0 0 24 24"><path d="M21.9 4.3 18.8 19c-.23 1.06-.86 1.32-1.75.82l-4.85-3.57-2.34 2.25c-.26.26-.48.48-.98.48l.35-4.93 9-8.12c.4-.35-.08-.54-.6-.2L6.5 12.67l-4.77-1.5c-1.04-.32-1.06-1.03.21-1.53L20.6 2.5c.86-.32 1.62.2 1.3 1.8z"/></svg>'
  };

  /* ---------- 1) التاريخ الهجري والميلادي ---------- */
  (function () {
    const tb = $('.topbar'); if (!tb) return;
    tb.classList.add('tb-grid');
    const h = document.createElement('span'); h.className = 'tb-date tb-h';
    const g = document.createElement('span'); g.className = 'tb-date tb-g';
    try { h.textContent = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch (e) {}
    try { g.textContent = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch (e) {}
    tb.prepend(h); tb.appendChild(g);
  })();

  /* ---------- 2) الوضع الليلي + زر البحث ---------- */
  (function () {
    const wrap = $('.nav-wrap'); if (!wrap) return;
    const tools = document.createElement('div'); tools.className = 'nav-tools';
    tools.innerHTML = '<button id="nightBtn" title="الوضع الليلي" aria-label="الوضع الليلي">🌙</button>'
                    + '<button id="searchBtn" title="بحث (Ctrl+K)" aria-label="بحث">🔍</button>';
    wrap.insertBefore(tools, $('.nav-toggle'));
    const btn = $('#nightBtn');
    const set = n => { document.body.classList.toggle('night', n); localStorage.setItem('siteNight', n ? '1' : '0'); btn.textContent = n ? '☀️' : '🌙'; };
    set(localStorage.getItem('siteNight') === '1');
    btn.onclick = () => set(!document.body.classList.contains('night'));
  })();

  /* ---------- 3) البحث في الموقع ---------- */
  (function () {
    const ov = document.createElement('div'); ov.className = 'xsearch'; ov.id = 'xsearch'; ov.hidden = true;
    ov.innerHTML = '<div class="xsearch-box"><input id="xq" type="search" placeholder="اكتب للبحث: درس، مقال، فيديو، موعد…"><div id="xres" class="xres"></div><p class="xhint">Esc للإغلاق</p></div>';
    document.body.appendChild(ov);
    const q = $('#xq'), res = $('#xres');
    const bank = () => { const d = app.get(), b = [];
      (d.lessons || []).forEach(i => b.push({ t: i.title, s: i.category || 'درس', sec: '#lessons', x: i.desc || '' }));
      (d.articles || []).forEach(i => b.push({ t: i.title, s: 'مقال', sec: '#articles', x: i.excerpt || '' }));
      (d.videos || []).forEach(i => b.push({ t: i.title, s: 'فيديو', sec: '#videos', x: i.desc || '' }));
      (d.schedule || []).forEach(i => b.push({ t: i.topic, s: 'موعد', sec: '#schedule', x: (i.day || '') + ' ' + (i.place || '') }));
      (d.photos || []).forEach(i => b.push({ t: i.caption || 'صورة', s: 'صورة', sec: '#gallery', x: '' }));
      return b; };
    const draw = v => { const B = bank().filter(i => (i.t + ' ' + i.x + ' ' + i.s).includes(v));
      res.innerHTML = v ? (B.length ? B.map(i => '<button class="xitem" data-sec="' + i.sec + '"><span class="xbadge">' + esc(i.s) + '</span><span>' + esc(i.t) + '</span></button>').join('') : '<p class="xnone">لا توجد نتائج لـ «' + esc(v) + '»</p>') : '<p class="xnone">ابحث في كل محتوى الموقع…</p>'; };
    const open = () => { ov.hidden = false; q.value = ''; draw(''); setTimeout(() => q.focus(), 60); };
    const close = () => { ov.hidden = true; };
    q.addEventListener('input', () => draw(q.value.trim()));
    res.addEventListener('click', e => { const b = e.target.closest('.xitem'); if (!b) return; close(); location.hash = b.dataset.sec; });
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      if (e.key === 'Escape' && !ov.hidden) close();
    });
    const sb = $('#searchBtn'); if (sb) sb.onclick = open;
  })();

  /* ---------- 4) أزرار المشاركة ---------- */
  (function () {
    const pageUrl = () => encodeURIComponent(location.href.split('#')[0]);
    const pageTitle = () => encodeURIComponent(document.title);
    const links = (t, u) =>
      '<a title="واتساب" target="_blank" rel="noopener" href="https://wa.me/?text=' + t + '%0A' + u + '">' + IC.wa + '</a>'
      + '<a title="فيسبوك" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '">' + IC.fb + '</a>'
      + '<a title="إكس" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=' + u + '&text=' + t + '">' + IC.x + '</a>'
      + '<a title="تليجرام" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + u + '&text=' + t + '">' + IC.tg + '</a>';
    const bar = document.createElement('div'); bar.className = 'xshare';
    bar.innerHTML = links(pageTitle(), pageUrl()) + '<button id="xcopy" title="نسخ رابط الموقع">🔗</button>';
    document.body.appendChild(bar);
    $('#xcopy').onclick = () => { navigator.clipboard.writeText(location.href.split('#')[0]).then(() => app.toast('تم نسخ رابط الموقع ✔')); };

    /* مشاركة داخل نافذة المقال */
    const mb = $('#modalBody');
    if (mb) new MutationObserver(() => {
      const ti = mb.querySelector('.modal-title');
      if (ti && !mb.querySelector('.xshare-in')) {
        const d = document.createElement('div'); d.className = 'xshare-in';
        d.innerHTML = '<span class="xs-label">شارك الفائدة:</span>' + links(encodeURIComponent(ti.textContent + ' — ' + app.get().settings.ownerName), pageUrl());
        mb.appendChild(d);
      }
    }).observe(mb, { childList: true, subtree: true });
  })();
})();