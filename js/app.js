/* ================================================================
   محرك الموقع — يعرض البيانات ويتحكم في الحركات والتفاعل
   ================================================================ */
(function () {
  'use strict';
  const LS_KEY = 'siteData_v1';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- البيانات ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function deepMerge(base, over) {
    if (!over || typeof over !== 'object') return base;
    const out = {};
    const keys = new Set([...Object.keys(base || {}), ...Object.keys(over)]);
    keys.forEach(k => {
      const b = base ? base[k] : undefined, o = over[k];
      if (o === undefined) { out[k] = clone(b); return; }
      out[k] = (b && typeof b === 'object' && !Array.isArray(b) && o && typeof o === 'object' && !Array.isArray(o))
        ? deepMerge(b, o) : clone(o);
    });
    return out;
  }
  let data;
  try {
    const raw = localStorage.getItem(LS_KEY);
    data = raw ? deepMerge(clone(window.SITE_DATA), JSON.parse(raw)) : clone(window.SITE_DATA);
  } catch (e) { data = clone(window.SITE_DATA); }

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ytId = u => { const m = String(u || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/); return m ? m[1] : ''; };
  const PH = 'data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'><rect width='600' height='800' fill='#0f3b2c'/><text x='300' y='390' font-size='120' text-anchor='middle' fill='#c9a227'>✦</text><text x='300' y='470' font-size='26' text-anchor='middle' fill='#e3c766'>ضع صورتك في</text><text x='300' y='508' font-size='26' text-anchor='middle' fill='#e3c766'>assets/img/photo.jpg</text></svg>");

  /* ---------- أيقونات ---------- */
  const IC = {
    play: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#241c04"><path d="M8 5v14l11-7z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 12H5m6-6l-6 6 6 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.5 14.1c-.24.66-1.36 1.26-1.9 1.3-.5.06-1.13.27-3.8-.8-3.2-1.28-5.27-4.55-5.43-4.76-.16-.2-1.3-1.74-1.3-3.32s.8-2.36 1.1-2.68c.28-.32.62-.4.82-.4l.6.01c.18.01.44-.07.68.52.25.6.85 2.07.92 2.22.08.15.13.33.03.53-.1.2-.15.32-.3.5l-.45.53c-.15.15-.3.31-.13.6.17.3.75 1.24 1.62 2 1.1.99 2.05 1.3 2.34 1.45.3.15.47.13.64-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.72.81 2.01.96.3.15.49.22.56.34.07.13.07.73-.17 1.38z"/></svg>',
    loc: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    fb: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.3c0-.84.23-1.4 1.44-1.4h1.54V5.3c-.27-.04-1.18-.12-2.24-.12-2.22 0-3.74 1.36-3.74 3.85v2.08H8v2.9h2.5V21h3z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.6 7.2s-.2-1.4-.8-2c-.75-.8-1.6-.8-2-.85C16.1 4.2 12 4.2 12 4.2s-4.1 0-6.8.15c-.4.05-1.24.05-2 .85-.6.6-.8 2-.8 2S2.2 8.84 2.2 10.5v1.55c0 1.65.2 3.3.2 3.3s.2 1.4.8 2c.75.8 1.73.77 2.17.86 1.57.15 6.83.18 6.83.18s4.1-.01 6.8-.16c.4-.05 1.24-.05 2-.85.6-.6.8-2 .8-2s.2-1.65.2-3.3v-1.55c0-1.66-.2-3.3-.2-3.3zM9.8 14.5v-5l5.7 2.5-5.7 2.5z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.9 4.3 18.8 19c-.23 1.06-.86 1.32-1.75.82l-4.85-3.57-2.34 2.25c-.26.26-.48.48-.98.48l.35-4.93 9-8.12c.4-.35-.08-.54-.6-.2L6.5 12.67l-4.77-1.5c-1.04-.32-1.06-1.03.21-1.53L20.6 2.5c.86-.32 1.62.2 1.3 1.8z"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 4h3.4l4.6 6.2L17 4h3l-6.6 8L20.6 20h-3.4l-4.9-6.6L6.9 20h-3l7-8.4L4 4z"/></svg>'
  };

  /* ---------- تنبيهات ---------- */
  let toastTimer;
  function toast(msg, type) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.className = 'toast show' + (type === 'err' ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- عناصر عامة ---------- */
  function paintChrome() {
    const s = data.settings;
    document.title = s.siteName + ' | موقع دعوي';
    $('#logoName').textContent = s.ownerName;
    $('#logoSub').textContent = s.jobTitle;
    $('#heroKicker').textContent = s.heroKicker;
    $('#heroName').textContent = s.ownerName;
    $('#heroTitle').textContent = s.heroTitle;
    $('#heroText').textContent = s.heroText;
    $('#archCap').textContent = s.archCap;
    $('#aboutNote').textContent = s.aboutNote || '';
    $('#credRow').innerHTML = [s.cred1, s.cred2].filter(Boolean).map(c => '<span class="cred">' + esc(c) + '</span>').join('');
    const img = $('#portrait');
    img.onerror = () => { img.onerror = null; img.src = PH; };
    img.src = s.portraitSrc || 'assets/img/photo.jpg';
    $('#footName').textContent = s.siteName;
    $('#footCopy').textContent = '© ' + new Date().getFullYear() + ' ' + s.ownerName + ' — جميع الحقوق محفوظة';
  }

  function paintTicker() {
    const items = (data.settings.tickerItems || []).filter(Boolean);
    const half = items.map(t => '<span>' + esc(t) + '</span>').join('');
    $('#tickerTrack').innerHTML = half + half;
    $('.ticker').style.display = items.length ? '' : 'none';
  }

  let quoteIdx = 0;
  function startRotator() {
    const q = $('#heroQuote');
    const items = (data.settings.tickerItems || []).filter(Boolean);
    if (!items.length) { q.parentElement.style.display = 'none'; return; }
    q.textContent = items[0];
    if (REDUCED || items.length < 2) return;
    setInterval(() => {
      q.classList.add('fade');
      setTimeout(() => { quoteIdx = (quoteIdx + 1) % items.length; q.textContent = items[quoteIdx]; q.classList.remove('fade'); }, 450);
    }, 6000);
  }

  function paintStats() {
    $('#statsRow').innerHTML = (data.settings.stats || []).map(s => {
      const m = String(s.num || '').match(/^(\D*)(\d+)(\D*)$/);
      const val = m ? +m[2] : 0, suf = m ? (m[1] + m[3]) : String(s.num);
      return '<div class="stat"><b><span class="count" data-val="' + val + '">0</span><i class="suf">' + esc(suf) + '</i></b><span>' + esc(s.label) + '</span></div>';
    }).join('');
  }
  function animateCounters() {
    $$('.count').forEach(el => {
      const target = +el.dataset.val || 0;
      if (REDUCED) { el.textContent = target; return; }
      const t0 = performance.now(), dur = 1400;
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  function paintAbout() {
    const s = data.settings;
    $('#aboutText').innerHTML = String(s.bio || '').split(/\n{2,}/).map(p => '<p>' + esc(p) + '</p>').join('');
    $('#interestChips').innerHTML = (s.interests || []).map(i => '<span class="chip">' + esc(i) + '</span>').join('');
    $('#qualList').innerHTML = (s.quals || []).map(q =>
      '<li><b>' + esc(q.year) + '</b><strong>' + esc(q.title) + '</strong><p>' + esc(q.desc) + '</p></li>').join('');
  }

  /* ---------- الدروس ---------- */
  function lessonCard(l, i) {
    return '<article class="card lesson in-anim" style="animation-delay:' + (i * 70) + 'ms"><div class="card-body">'
      + '<div class="lesson-top"><span class="cat-chip">' + esc(l.category || 'عام') + '</span><span class="lesson-date">' + esc(l.date || '') + '</span></div>'
      + '<h3 class="card-title">' + esc(l.title) + '</h3>'
      + '<p class="card-desc">' + esc(l.desc || '') + '</p>'
      + '<div class="card-foot">' + (l.link
        ? '<a class="go" href="' + esc(l.link) + '" target="_blank" rel="noopener">استمع الآن ' + IC.arrow + '</a>'
        : '<span class="soon">🔒 الرابط متاح قريبًا</span>') + '</div></div></article>';
  }
  function drawLessons(list) {
    $('#lessonsGrid').innerHTML = list.length ? list.map(lessonCard).join('')
      : '<div class="empty-note">لا توجد دروس في هذا التصنيف بعد — أضِفها من لوحة التحكم ✦</div>';
  }
  function paintLessons() {
    const items = data.lessons || [];
    const cats = ['الكل', ...new Set(items.map(l => l.category).filter(Boolean))];
    const bar = $('#lessonFilters');
    bar.innerHTML = cats.map((c, i) => '<button class="chip' + (i === 0 ? ' on' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>').join('');
    bar.onclick = e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', bar).forEach(x => x.classList.toggle('on', x === b));
      drawLessons(b.dataset.cat === 'الكل' ? items : items.filter(i => i.category === b.dataset.cat));
    };
    drawLessons(items);
  }

  /* ---------- المرئيات ---------- */
  function paintVideos() {
    const g = $('#videosGrid');
    const items = data.videos || [];
    if (!items.length) { g.innerHTML = '<div class="empty-note">لا توجد فيديوهات بعد — أضِفها من لوحة التحكم ✦</div>'; return; }
    g.innerHTML = items.map((v, i) => {
      const id = ytId(v.url);
      return '<article class="card video in-anim" data-i="' + i + '" style="animation-delay:' + (i * 70) + 'ms">'
        + '<div class="vthumb">' + (id ? '<img loading="lazy" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" onerror="this.remove()">' : '')
        + '<span class="play">' + IC.play + '</span></div>'
        + '<div class="vbody"><h3>' + esc(v.title) + '</h3><p>' + esc(v.desc || '') + '</p></div></article>';
    }).join('');
    g.onclick = e => {
      const c = e.target.closest('.card.video'); if (!c) return;
      const v = items[+c.dataset.i]; if (!v) return;
      const id = ytId(v.url);
      if (id) openModal('<h3 class="modal-title">' + esc(v.title) + '</h3><div class="video-wrap"><iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>');
      else if (v.url) window.open(v.url, '_blank');
      else toast('ضع رابط الفيديو (يوتيوب) من لوحة التحكم ✦');
    };
  }

  /* ---------- المقالات ---------- */
  function paintArticles() {
    const g = $('#articlesGrid');
    const items = data.articles || [];
    if (!items.length) { g.innerHTML = '<div class="empty-note">لا توجد مقالات بعد ✦</div>'; return; }
    g.innerHTML = items.map((a, i) =>
      '<article class="card in-anim" style="animation-delay:' + (i * 70) + 'ms"><div class="card-body">'
      + '<span class="a-date">' + esc(a.date || '') + '</span><h3 class="card-title">' + esc(a.title) + '</h3>'
      + '<p class="card-desc">' + esc(a.excerpt || '') + '</p>'
      + '<div class="card-foot"><button class="go" data-art="' + i + '">اقرأ المزيد ' + IC.arrow + '</button></div></div></article>').join('');
    g.onclick = e => {
      const b = e.target.closest('[data-art]'); if (!b) return;
      const a = items[+b.dataset.art]; if (!a) return;
      openModal('<span class="modal-meta">' + esc(a.date || '') + '</span><h3 class="modal-title">' + esc(a.title) + '</h3>'
        + String(a.body || '').split(/\n{2,}/).map(p => '<p>' + esc(p) + '</p>').join(''));
    };
  }

  /* ---------- الجدول ---------- */
  function paintSchedule() {
    const box = $('#scheduleList');
    const items = data.schedule || [];
    box.innerHTML = items.length ? items.map(s =>
      '<div class="sch-row"><span class="sch-day">' + esc(s.day) + '</span>'
      + '<span class="sch-time">' + IC.clock + esc(s.time) + '</span>'
      + '<span class="sch-topic">' + esc(s.topic) + '</span>'
      + '<span class="sch-place">' + IC.pin + esc(s.place) + '</span></div>').join('')
      : '<div class="empty-note">لا توجد مواعيد بعد ✦</div>';
  }

  /* ---------- المعرض ---------- */
  function paintGallery() {
    const g = $('#galleryGrid');
    const items = data.photos || [];
    g.innerHTML = items.length ? items.map((p, i) =>
      '<figure data-i="' + i + '"><img loading="lazy" src="' + esc(p.src) + '" alt="' + esc(p.caption || 'صورة') + '"><figcaption>' + esc(p.caption || '') + '</figcaption></figure>').join('')
      : '<div class="empty-note">معرض الصور بانتظار لحظاتك الدعوية — أضِف الصور من لوحة التحكم ✦</div>';
    g.onclick = e => {
      const f = e.target.closest('figure'); if (!f) return;
      const p = items[+f.dataset.i]; if (!p) return;
      $('#lbImg').src = p.src; $('#lbCap').textContent = p.caption || '';
      $('#lightbox').hidden = false;
    };
  }

  /* ---------- التواصل ---------- */
  function paintContact() {
    const s = data.settings;
    const waDigits = String(s.wa || '').replace(/\D/g, '');
    $('#contactCards').innerHTML =
      '<div class="c-item"><span class="c-ic">' + IC.wa + '</span><div><b>واتساب</b><a href="https://wa.me/' + waDigits + '" target="_blank" rel="noopener">' + esc(s.wa || '—') + '</a></div></div>'
      + '<div class="c-item"><span class="c-ic">' + IC.phone + '</span><div><b>الهاتف</b><span>' + esc(s.phone || '—') + '</span></div></div>'
      + '<div class="c-item"><span class="c-ic">' + IC.mail + '</span><div><b>البريد الإلكتروني</b><a href="mailto:' + esc(s.email) + '">' + esc(s.email || '—') + '</a></div></div>'
      + '<div class="c-item"><span class="c-ic">' + IC.loc + '</span><div><b>الموقع</b><span style="direction:rtl">' + esc(s.address || '—') + '</span></div></div>';
    const soc = [
      [s.facebook, IC.fb, 'فيسبوك'], [s.youtube, IC.yt, 'يوتيوب'], [s.telegram, IC.tg, 'تليجرام']
    ].filter(x => x[0]);
    const html = soc.map(x => '<a href="' + esc(x[0]) + '" target="_blank" rel="noopener" aria-label="' + x[2] + '">' + x[1] + '</a>').join('');
    $('#socialRow').innerHTML = html || '<p style="color:var(--muted);font-size:.85rem">أضِف روابط حساباتك من لوحة التحكم ✦</p>';
    $('#footSocial').innerHTML = html;

    const send = () => {
      const name = $('#cName').value.trim(), msg = $('#cMsg').value.trim();
      if (!name || !msg) { toast('اكتب اسمك ورسالتك أولًا', 'err'); return false; }
      return 'السلام عليكم ورحمة الله، معك: ' + name + '\n\n' + msg;
    };
    $('#sendWa').onclick = () => { const t = send(); if (!t) return; window.open('https://wa.me/' + waDigits + '?text=' + encodeURIComponent(t), '_blank'); };
    $('#sendMail').onclick = () => { const t = send(); if (!t) return; location.href = 'mailto:' + s.email + '?subject=' + encodeURIComponent('رسالة من الموقع — ' + name) + '&body=' + encodeURIComponent(t); };
  }

  /* ---------- النوافذ ---------- */
  function openModal(html) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; document.body.classList.add('lock'); }
  function closeModal() { $('#modalBody').innerHTML = ''; $('#modal').hidden = true; if (!$('.admin:not([hidden])')) document.body.classList.remove('lock'); }
  $('#modal').addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  $('#lightbox').addEventListener('click', () => { $('#lightbox').hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); $('#lightbox').hidden = true; } });

  /* ---------- واجهة عامة ---------- */
  $('#navToggle').onclick = () => $('#mainNav').classList.toggle('open');
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => $('#mainNav').classList.remove('open')));

  const header = $('#siteHeader'), prog = $('#progressBar'), toTop = $('#toTop');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', scrollY > 12);
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    toTop.classList.toggle('show', scrollY > 600);
  }, { passive: true });
  toTop.onclick = () => scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });

  function initReveals() {
    const els = $$('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .12 });
    els.forEach(el => io.observe(el));
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting) { animateCounters(); io2.disconnect(); }
      }), { threshold: .3 });
      io2.observe($('.stats'));
    }
  }

  /* ---------- عرض شامل ---------- */
  function renderAll() {
    paintChrome(); paintTicker(); paintStats(); paintAbout();
    paintLessons(); paintVideos(); paintArticles(); paintSchedule();
    paintGallery(); paintContact(); initReveals();
  }

  function save(d) { data = d; try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (e) {} }
  function resetAll() { localStorage.removeItem(LS_KEY); location.reload(); }

  renderAll();
  startRotator();

  window.SiteApp = { get: () => data, save, reset: resetAll, renderAll, toast, LS_KEY };
})();