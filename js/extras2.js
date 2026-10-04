/* ================================================================
   حزمة الإضافات — المرحلة الثانية
   مكتبة صوتية • كتب PDF • أسئلة وأجوبة • فعاليات بعدّاد • يوتيوب • Formspree
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const d = app.get();

  /* ---------- بيانات تجريبية تُحقن فقط لو الأقسام فاضية ---------- */
  d.audio = d.audio || [
    { id: 1, title: 'خطبة الجمعة: قيمة الوقت في حياة المسلم', src: '', desc: 'خطبة عن اغتنام الأعمار في طاعة الله.' },
    { id: 2, title: 'درس صوتي: أركان الإيمان الستة', src: '', desc: 'شرح ميسَّر لأركان الإيمان بأدلتها.' }
  ];
  d.books = d.books || [
    { id: 1, title: 'مدخل إلى علم مقارنة الأديان', link: '', desc: 'بحث محرَّر يقرِّر مناهج الدراسة والحوار عند أهل السنة.' },
    { id: 2, title: 'رسالة: كيف أدعو إلى الله؟', link: '', desc: 'خلاصة عملية في فقه الدعوة وأخلاق الداعية.' }
  ];
  d.fatwas = d.fatwas || [
    { id: 1, q: 'كيف أبدأ في حفظ القرآن الكريم؟', a: 'ابدأ بأجزاء قصار مع مصحف واحد ثابت الطبعة، واجعل لك وردًا يوميًّا ولو خمس آيات، وراجع قبل أن تزيد، والأهم: اربط الحفظ بالعمل والفهم، واستعن بصحبة صالحة تعينك. والعلم عند الله.' },
    { id: 2, q: 'ما المنهج الصحيح في الرد على الشبهات؟', a: 'المنهج الصحيح: العلم قبل الرد، فلا يُرد على شبهة إلا بعد تصويرها وفهمها، ثم الرد عليها بالدليل الشرعي والعقل الصريح، بلا تهويل ولا تهوين، مع الرحمة بالسائل وحسن الظن به حتى يتبين خلاف ذلك.' },
    { id: 3, q: 'كيف أثبت على الطاعة بعد المواسم؟', a: 'بالقليل الدائم، فإن أحب الأعمال إلى الله أدومها وإن قل، وبصحبة أهل الإيمان، وبالدعاء: يا مقلب القلوب ثبت قلبي على دينك.' }
  ];
  d.events = d.events || [
    { id: 1, title: 'دورة مكثفة: أساسيات العقيدة الإسلامية', date: '2026-12-20', time: 'بعد صلاة العصر', place: 'مسجد النور', desc: 'دورة مجانية مفتوحة للجميع لمدة ثلاثة أيام.' },
    { id: 2, title: 'محاضرة عامة: الشباب ومواجهة الشبهات', date: '2027-01-15', time: 'بعد صلاة المغرب', place: 'مركز الدعوة الإسلامي', desc: 'محاضرة حوارية مفتوحة للأسئلة.' }
  ];

  const head = (k, t) => '<header class="sec-head"><p class="kicker">' + k + '</p><h2 class="sec-title">' + t + '</h2><div class="orn"><span>✦</span></div></header>';
  const empty = m => '<div class="empty-note">' + m + '</div>';

  /* ---------- 1) الفعاليات ---------- */
  function evHtml() {
    const items = d.events || [];
    return '<section class="section band-white" id="events"><div class="container">' + head('قريبًا', 'الفعاليات والمحاضرات القادمة')
      + (items.length ? '<div class="cards-grid">' + items.map((e, i) => {
        const dt = new Date((e.date || '') + 'T00:00:00');
        const nice = isNaN(dt) ? '' : new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(dt);
        return '<article class="card in-anim" style="animation-delay:' + i * 70 + 'ms"><div class="card-body">'
          + '<div class="ev-top"><span class="ev-date"><b>' + esc(nice ? dt.getDate() : '—') + '</b><span>' + esc(nice ? new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(dt) : '') + '</span></span>'
          + '<span class="cd" data-cd="' + esc(e.date || '') + '"></span></div>'
          + '<h3 class="card-title">' + esc(e.title) + '</h3><p class="card-desc">' + esc(e.desc || '') + '</p>'
          + '<div class="card-foot"><span class="soon">🕐 ' + esc(e.time || '') + ' — 📍 ' + esc(e.place || '') + '</span></div></div></article>';
      }).join('') + '</div>' : empty('لا توجد فعاليات معلنة حاليًا ✦'))
      + '</div></section>';
  }
  function tickCd() {
    document.querySelectorAll('[data-cd]').forEach(el => {
      const t = new Date((el.dataset.cd || '') + 'T00:00:00'); if (isNaN(t)) { el.textContent = ''; return; }
      const days = Math.ceil((t - new Date()) / 86400000);
      el.classList.toggle('done', days < 0);
      el.textContent = days > 0 ? '⏳ باقي ' + days + ' يوم' : days === 0 ? '🔥 اليوم!' : 'انتهت الفعالية';
    });
  }

  /* ---------- 2) المكتبة الصوتية ---------- */
  function audioHtml() {
    const items = d.audio || [];
    return '<section class="section" id="audio"><div class="container">' + head('استمع', 'المكتبة الصوتية')
      + (items.length ? '<div class="audio-list">' + items.map((a, i) =>
        '<div class="audio-row in-anim" style="animation-delay:' + i * 60 + 'ms" data-i="' + i + '"><button class="ap-play" data-i="' + i + '">▶</button><div><b>' + esc(a.title) + '</b><small>' + esc(a.desc || '') + '</small></div></div>').join('') + '</div>'
        : empty('أضف مقاطعك الصوتية من لوحة التحكم ✦'))
      + '</div></section>';
  }
  function initPlayer() {
    document.body.insertAdjacentHTML('beforeend',
      '<div class="aplayer" id="aplayer" hidden><button id="apBtn">▶</button><div class="apInfo"><b id="apTitle"></b><input type="range" id="apSeek" value="0" max="100"></div><span id="apTime">0:00</span><button id="apClose" title="إغلاق">✕</button><audio id="apAudio"></audio></div>');
    const bar = $('#aplayer'), au = $('#apAudio'), btn = $('#apBtn'), seek = $('#apSeek'), tm = $('#apTime');
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    document.addEventListener('click', e => {
      const p = e.target.closest('.ap-play'); if (!p) return;
      const a = (d.audio || [])[+p.dataset.i]; if (!a) return;
      if (!a.src) { app.toast('أضف رابط الصوت (MP3) من لوحة التحكم أولًا', 'err'); return; }
      document.querySelectorAll('.audio-row').forEach(r => r.classList.toggle('playing', r === p.closest('.audio-row')));
      au.src = a.src; $('#apTitle').textContent = a.title; bar.hidden = false; au.play(); btn.textContent = '⏸';
    });
    btn.onclick = () => { au.paused ? (au.play(), btn.textContent = '⏸') : (au.pause(), btn.textContent = '▶'); };
    au.ontimeupdate = () => { if (au.duration) { seek.value = (au.currentTime / au.duration) * 100; tm.textContent = fmt(au.currentTime) + ' / ' + fmt(au.duration); } };
    seek.oninput = () => { if (au.duration) au.currentTime = (seek.value / 100) * au.duration; };
    au.onended = () => { btn.textContent = '▶'; };
    $('#apClose').onclick = () => { au.pause(); bar.hidden = true; document.querySelectorAll('.audio-row').forEach(r => r.classList.remove('playing')); };
  }

  /* ---------- 3) الكتب ---------- */
  function booksHtml() {
    const items = d.books || [];
    return '<section class="section band-white" id="books"><div class="container">' + head('إصدارات', 'الكتب والأبحاث')
      + (items.length ? '<div class="cards-grid">' + items.map((b, i) =>
        '<article class="card in-anim" style="animation-delay:' + i * 70 + 'ms"><div class="card-body"><div class="book-ic">📚</div>'
        + '<h3 class="card-title">' + esc(b.title) + '</h3><p class="card-desc">' + esc(b.desc || '') + '</p>'
        + '<div class="card-foot">' + (b.link ? '<a class="go" href="' + esc(b.link) + '" target="_blank" rel="noopener">⬇️ تحميل PDF</a>' : '<span class="soon">التحميل متاح قريبًا</span>') + '</div></div></article>').join('') + '</div>'
        : empty('أضف كتبك وأبحاثك من لوحة التحكم ✦'))
      + '</div></section>';
  }

  /* ---------- 4) أسئلة وأجوبة ---------- */
  function faqHtml() {
    const items = d.fatwas || [];
    return '<section class="section" id="fatwa"><div class="container">' + head('سألوا الشيخ', 'أسئلة وأجوبة')
      + (items.length ? '<div class="faq-list">' + items.map(f =>
        '<div class="fitem"><button class="fq">س: ' + esc(f.q) + '<span class="farrow">+</span></button><div class="fa"><p>ج: ' + esc(f.a) + '</p></div></div>').join('') + '</div>'
        : empty('أضف الأسئلة والأجوبة من لوحة التحكم ✦'))
      + '</div></section>';
  }
  document.addEventListener('click', e => {
    const q = e.target.closest('.fq'); if (!q) return;
    q.parentElement.classList.toggle('open');
  });

  /* ---------- حقن الأقسام قبل قسم التواصل ---------- */
  const contactSec = $('#contact');
  if (contactSec) contactSec.insertAdjacentHTML('beforebegin', evHtml() + audioHtml() + booksHtml() + faqHtml());
  initPlayer(); tickCd(); setInterval(tickCd, 60000);

  /* ---------- روابط القائمة ---------- */
  const nav = $('#mainNav .nav-cta');
  if (nav) nav.insertAdjacentHTML('beforebegin', '<a href="#events">الفعاليات</a><a href="#audio">الصوتيات</a><a href="#books">الكتب</a><a href="#fatwa">أسئلة</a>');
  const fl = $('.foot-links');
  if (fl) fl.insertAdjacentHTML('beforeend', '<a href="#events">الفعاليات</a><a href="#audio">الصوتيات</a><a href="#books">الكتب</a><a href="#fatwa">أسئلة وأجوبة</a>');

  /* ---------- 5) قناة يوتيوب تلقائيًا ---------- */
  (function () {
    const pl = (d.settings.youtubePlaylist || '').match(/[?&]list=([\w-]+)/);
    const vs = $('#videos .container');
    if (pl && vs) vs.insertAdjacentHTML('beforeend', '<div class="yt-channel"><h3 class="mini-title">📺 قناة الشيخ على يوتيوب</h3><div class="video-wrap"><iframe src="https://www.youtube.com/embed/videoseries?list=' + pl[1] + '" loading="lazy" allowfullscreen></iframe></div></div>');
  })();

  /* ---------- 6) Formspree ---------- */
  (function () {
    const ep = d.settings.formspree; if (!ep) return;
    const row = $('#contactForm .btn-row'); if (!row) return;
    row.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-gold" id="sendFs">📨 إرسال للإيميل</button>');
    $('#sendFs').onclick = async () => {
      const name = $('#cName').value.trim(), msg = $('#cMsg').value.trim();
      if (!name || !msg) { app.toast('اكتب اسمك ورسالتك أولًا', 'err'); return; }
      try {
        const r = await fetch(ep, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ name, message: msg }) });
        r.ok ? (app.toast('وصلت رسالتك للشيخ ✔'), $('#cName').value = '', $('#cMsg').value = '') : app.toast('تعذر الإرسال، جرّب واتساب', 'err');
      } catch (e) { app.toast('تعذر الإرسال، جرّب واتساب', 'err'); }
    };
  })();
})();