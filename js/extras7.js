/* ================================================================
   المرحلة D: عدّاد زيارات محلي + لوحة إحصائيات للمالك
   (إحصائيات كل الزوار حول العالم: لوحة Cloudflare ← Analytics)
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const KEY = 'siteStats_v1';
  let st; try { st = JSON.parse(localStorage.getItem(KEY)) || { views: 0, days: {}, sections: {} }; } catch (e) { st = { views: 0, days: {}, sections: {} }; }
  const today = new Date().toISOString().slice(0, 10);
  st.views = (st.views || 0) + 1;
  st.days[today] = (st.days[today] || 0) + 1;
  const ks = Object.keys(st.days).sort();
  if (ks.length > 30) ks.slice(0, ks.length - 30).forEach(k => delete st.days[k]);
  localStorage.setItem(KEY, JSON.stringify(st));

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1);
    st.sections[id] = (st.sections[id] || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(st));
  });

  /* لوحة المالك (تظهر فقط بعد دخول لوحة التحكم) */
  if (sessionStorage.getItem('siteAdminAuth_v1') === '1') {
    const b = document.createElement('button');
    b.textContent = '📊'; b.title = 'إحصائيات الزيارات (هذا الجهاز)';
    b.style.cssText = 'position:fixed;bottom:84px;left:24px;width:48px;height:48px;border-radius:50%;border:0;background:var(--gold);color:#241c04;font-size:1.2rem;z-index:150;box-shadow:0 10px 24px rgba(201,162,39,.4);cursor:pointer';
    document.body.appendChild(b);
    b.onclick = () => {
      const top = Object.entries(st.sections || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
      const last7 = Object.keys(st.days).sort().slice(-7);
      $('#modalBody').innerHTML = '<h3 class="modal-title">📊 إحصائيات الزيارات</h3>'
        + '<div class="stats-grid"><div class="stat-card"><b>' + st.views + '</b>إجمالي الزيارات</div><div class="stat-card"><b>' + (st.days[today] || 0) + '</b>اليوم</div><div class="stat-card"><b>' + last7.reduce((s, k) => s + st.days[k], 0) + '</b>آخر 7 أيام</div></div>'
        + '<h4 style="margin:16px 0 8px">الأقسام الأكثر زيارة:</h4>'
        + (top.length ? top.map(t => '<p>• ' + t[0] + ' — ' + t[1] + ' مرة</p>').join('') : '<p>لا بيانات بعد</p>')
        + '<p style="margin-top:14px;color:var(--muted);font-size:.85rem">🌍 إحصائيات كل الزوار حول العالم: لوحة Cloudflare ← Analytics</p>';
      $('#modal').hidden = false; document.body.classList.add('lock');
    };
  }
})();