/* ================================================================
   المرحلة B: تعليقات الزوار (Giscus مجاني) + النشرة البريدية
   ----------------------------------------------------------------
   تفعيل التعليقات (5 دقايق، مرة واحدة):
   1) افتح مستودعك على GitHub ← Settings ← Features ← علّم Discussions ✅
   2) افتح https://giscus.app/ar
   3) اكتب اسم مستودعك: ismailahmednaguib/ismail-dawah
   4) اختار Category اسمها Comments (أو أنشئها من تبويب Discussions في المستودع)
   5) انسخ قيمتَي repoId و categoryId والصقهم تحت في GISCUS
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const d = app.get();
  const GISCUS = { repo: 'ismailahmednaguib/ismail-dawah', repoId: '', category: 'Comments', categoryId: '' };

  /* ---------- 1) التعليقات ---------- */
  function buildComments() {
    const sec = document.createElement('section');
    sec.className = 'section'; sec.id = 'comments';
    sec.innerHTML = '<div class="container comments-sec"><header class="sec-head"><p class="kicker">آراءكم تشرّفنا</p><h2 class="sec-title">تعليقات الزوار</h2><div class="orn"><span>✦</span></div></header><div id="giscus-box"></div></div>';
    const contact = $('#contact'); if (contact) contact.insertAdjacentElement('beforebegin', sec);
    const box = $('#giscus-box');
    if (!GISCUS.repoId || !GISCUS.categoryId) {
      box.innerHTML = '<div class="empty-note">💬 نظام التعليقات جاهز — فعّله بخطوات Giscus المكتوبة أعلى ملف extras5.js</div>';
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.setAttribute('data-repo', GISCUS.repo);
    s.setAttribute('data-repo-id', GISCUS.repoId);
    s.setAttribute('data-category', GISCUS.category);
    s.setAttribute('data-category-id', GISCUS.categoryId);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', document.body.classList.contains('night') ? 'dark' : 'light');
    s.setAttribute('data-lang', 'ar');
    s.async = true;
    box.appendChild(s);
  }

  /* ---------- 2) النشرة البريدية ---------- */
  function buildNews() {
    const sec = document.createElement('section');
    sec.className = 'section band-white'; sec.id = 'newsletter';
    sec.innerHTML = '<div class="container"><div class="news-box"><h3 style="font-family:var(--f-disp);font-size:1.6rem">📬 النشرة البريدية</h3><p style="color:#cfe0d4">اشترك ليصلك كل جديد من الدروس والمقالات</p><form class="news-form" id="newsForm"><input type="email" id="newsEmail" placeholder="بريدك الإلكتروني" required><button type="submit">اشترك</button></form></div></div>';
    const contact = $('#contact'); if (contact) contact.insertAdjacentElement('beforebegin', sec);
    $('#newsForm').addEventListener('submit', e => {
      e.preventDefault();
      const em = $('#newsEmail').value.trim(); if (!em) return;
      const ep = d.settings.formspree;
      if (ep) {
        fetch(ep, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, subject: 'اشتراك في النشرة البريدية' }) })
          .then(r => { r.ok ? (app.toast('تم اشتراكك بنجاح ✔'), $('#newsEmail').value = '') : app.toast('تعذر الاشتراك', 'err'); })
          .catch(() => app.toast('تعذر الاشتراك', 'err'));
      } else {
        location.href = 'mailto:' + d.settings.email + '?subject=' + encodeURIComponent('اشتراك في النشرة البريدية') + '&body=' + encodeURIComponent(em);
        app.toast('سينفتح بريدك لتأكيد الاشتراك');
      }
    });
  }

  buildComments(); buildNews();
  const nav = $('#mainNav .nav-cta');
  if (nav) nav.insertAdjacentHTML('beforebegin', '<a href="#comments">التعليقات</a><a href="#newsletter">النشرة</a>');
})();