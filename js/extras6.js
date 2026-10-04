/* ================================================================
   المرحلة C: أزرار تيليجرام + شارة البث المباشر
   البث: من لوحة التحكم ← الإعدادات ← «رابط البث المباشر»
   (ضيفه من اللصقة الاختيارية تحت) — لما تسيبه فاضي الشارة تختفي
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const d = app.get();
  const ytId = u => { const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|live\/)([\w-]{6,})/); return m ? m[1] : ''; };

  /* ---------- 1) البث المباشر ---------- */
  (function () {
    const url = d.settings.liveUrl; if (!url) return;
    const b = document.createElement('button');
    b.className = 'live-badge'; b.textContent = '🔴 بث مباشر الآن';
    document.body.appendChild(b);
    b.onclick = () => {
      const id = ytId(url);
      $('#modalBody').innerHTML = id
        ? '<h3 class="modal-title">🔴 البث المباشر</h3><div class="video-wrap"><iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>'
        : '<p>رابط البث: <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a></p>';
      $('#modal').hidden = false; document.body.classList.add('lock');
    };
  })();

  /* ---------- 2) تيليجرام ---------- */
  (function () {
    const tg = d.settings.telegram;
    const row = document.createElement('div'); row.className = 'tg-row';
    row.innerHTML = (tg ? '<a class="tg-btn" href="' + tg + '" target="_blank" rel="noopener">📢 قناة الشيخ على تيليجرام</a>' : '')
      + '<a class="tg-btn" style="background:#1e7a58" href="https://t.me/share/url?url=' + encodeURIComponent(location.href.split('#')[0]) + '&text=' + encodeURIComponent(document.title) + '" target="_blank" rel="noopener">📤 مشاركة الموقع على تيليجرام</a>';
    const ci = $('.contact-info'); if (ci) ci.appendChild(row);
  })();
})();