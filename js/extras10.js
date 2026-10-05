/* ================================================================
   المرحلة 7: ترجمة + مسابقات + إشعارات + تفسير + متتبع الحفظ
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const d = app.get();

  /* ================= 1) الترجمة التلقائية ================= */
  function buildTranslate() {
    const wrap = document.createElement('div');
    wrap.className = 'translate-wrap';
    wrap.innerHTML = '<button class="translate-btn" id="tr-btn" title="ترجمة الموقع">🌐</button>'
      + '<div class="translate-panel" id="tr-panel">'
      + '<h4 style="color:var(--gold);margin-bottom:10px;font-family:var(--f-disp)">ترجمة الموقع</h4>'
      + '<div class="google-translate" id="gtranslate"></div>'
      + '<p style="font-size:.75rem;color:var(--muted);margin-top:8px">يعمل عبر Google Translate — مجاني تماماً</p>'
      + '</div>';
    document.body.appendChild(wrap);

    $('#tr-btn').onclick = () => $('#tr-panel').classList.toggle('open');

    // تحميل Google Translate
    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);

    window.googleTranslateElementInit = () => {
      try {
        new google.translate.TranslateElement({
          pageLanguage: 'ar',
          includedLanguages: 'en,fr,es,ur,id,tr,de,it,ru,zh-CN,ja,ko,hi,sw,so,fa',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'gtranslate');
      } catch (e) {
        $('#gtranslate').innerHTML = '<p style="color:var(--muted);font-size:.85rem">تعذر تحميل الترجمة — تحقق من الاتصال</p>';
      }
    };

    document.addEventListener('click', e => {
      if (!e.target.closest('.translate-wrap')) $('#tr-panel').classList.remove('open');
    });
  }

  /* ================= 2) المسابقات الثقافية ================= */
  const QUIZ_BANK = [
    { q: 'من هو أول من آمن من النساء؟', opts: ['خديجة بنت خويلد', 'عائشة بنت أبي بكر', 'فاطمة الزهراء', 'آمنة بنت وهب'], ans: 0 },
    { q: 'كم عدد سور القرآن الكريم؟', opts: ['110', '114', '120', '116'], ans: 1 },
    { q: 'ما هي أطول سورة في القرآن؟', opts: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], ans: 2 },
    { q: 'من هو صاحب لقب "ذو النورين"؟', opts: ['أبو بكر الصديق', 'عثمان بن عفان', 'علي بن أبي طالب', 'عمر بن الخطاب'], ans: 1 },
    { q: 'في أي غزوة نزلت آية: ﴿إِنَّا فَتَحْنَا لَكَ فَتْحًا مُبِينًا﴾؟', opts: ['بدر', 'أحد', 'الحديبية', 'خيبر'], ans: 2 },
    { q: 'ما هو أطول آية في القرآن؟', opts: ['آية الكرسي', 'آية الدين', 'آية الربا', 'آية السيف'], ans: 1 },
    { q: 'من هو أول مؤذن في الإسلام؟', opts: ['بلال بن رباح', 'عبد الله بن أم مكتوم', 'أسامة بن زيد', 'سعد بن أبي وقاص'], ans: 0 },
    { q: 'كم سنة استمرت دعوة النبي ﷺ في مكة؟', opts: ['10 سنوات', '13 سنة', '15 سنة', '20 سنة'], ans: 1 },
    { q: 'ما هي السورة التي تُسمى "قلب القرآن"؟', opts: ['يس', 'الرحمن', 'الواقعة', 'الملك'], ans: 0 },
    { q: 'من هو الصحابي الذي لُقّب بـ "سيوف الله المسلول"؟', opts: ['خالد بن الوليد', 'سعد بن أبي وقاص', 'المثنى بن حارثة', 'عمرو بن العاص'], ans: 0 },
    { q: 'في أي سنة كانت الهجرة النبوية؟', opts: ['610م', '622م', '632م', '615م'], ans: 1 },
    { q: 'ما هي أول سورة نزلت كاملة؟', opts: ['الفاتحة', 'العلق', 'المدثر', 'المسد'], ans: 0 },
    { q: 'من هو الخليفة الراشد الرابع؟', opts: ['أبو بكر', 'عمر', 'عثمان', 'علي'], ans: 3 },
    { q: 'كم عدد أركان الإسلام؟', opts: ['4', '5', '6', '7'], ans: 1 },
    { q: 'ما هي الصلاة التي لا ركوع فيها ولا سجود؟', opts: ['صلاة الجنازة', 'صلاة العيد', 'صلاة الاستسقاء', 'صلاة الكسوف'], ans: 0 }
  ];

  function buildQuiz() {
    const sec = document.createElement('section');
    sec.className = 'section band-white'; sec.id = 'quiz';
    sec.innerHTML = '<div class="container quiz-wrap"><header class="sec-head"><p class="kicker">اختبر معلوماتك</p><h2 class="sec-title">المسابقة الثقافية</h2><div class="orn"><span>✦</span></div></header>'
      + '<div id="quiz-area"></div></div>';
    const azkar = $('#azkar');
    if (azkar) azkar.insertAdjacentElement('afterend', sec);
    else { const c = $('#contact'); if (c) c.insertAdjacentElement('beforebegin', sec); }

    let questions = [], current = 0, score = 0;

    function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

    function start() {
      questions = shuffle([...QUIZ_BANK]).slice(0, 10);
      current = 0; score = 0;
      renderQ();
    }

    function renderQ() {
      if (current >= questions.length) return renderResult();
      const q = questions[current];
      const pct = ((current) / questions.length * 100).toFixed(0);
      $('#quiz-area').innerHTML =
        '<div class="quiz-progress"><span class="quiz-score">النقاط: ' + score + '</span><div class="quiz-bar"><div class="quiz-bar-fill" style="width:' + pct + '%"></div></div><span>' + (current + 1) + '/' + questions.length + '</span></div>'
        + '<div class="quiz-card"><p class="quiz-q">' + esc(q.q) + '</p>'
        + '<div class="quiz-options">' + q.opts.map((o, i) => '<button class="quiz-opt" data-i="' + i + '">' + esc(o) + '</button>').join('') + '</div></div>';

      $$('.quiz-opt').forEach(btn => {
        btn.onclick = () => {
          const i = +btn.dataset.i;
          $$('.quiz-opt').forEach(b => b.classList.add('disabled'));
          if (i === q.ans) {
            btn.classList.add('correct');
            score += 10;
            app.toast('إجابة صحيحة! +10 نقاط ✔');
          } else {
            btn.classList.add('wrong');
            $$('.quiz-opt')[q.ans].classList.add('correct');
            app.toast('إجابة خاطئة — الصحيح: ' + q.opts[q.ans], 'err');
          }
          setTimeout(() => { current++; renderQ(); }, 1800);
        };
      });
    }

    function renderResult() {
      const total = questions.length * 10;
      const pct = Math.round(score / total * 100);
      const grade = pct >= 90 ? '🏆 ممتاز!' : pct >= 70 ? '🥈 جيد جداً' : pct >= 50 ? '🥉 جيد' : '📚 راجع وحاول تاني';
      $('#quiz-area').innerHTML =
        '<div class="quiz-card quiz-result"><h3>' + grade + '</h3>'
        + '<div class="grade">' + (pct >= 90 ? '🏆' : pct >= 70 ? '🥈' : pct >= 50 ? '🥉' : '📚') + '</div>'
        + '<p style="font-size:1.3rem;font-weight:900;color:var(--gold)">' + score + ' / ' + total + ' نقطة</p>'
        + '<p style="color:var(--muted);margin:10px 0">أجبت صح على ' + (score / 10) + ' من ' + questions.length + ' أسئلة</p>'
        + '<button class="quiz-btn" id="quiz-restart">🔄 حاول تاني</button></div>';
      $('#quiz-restart').onclick = start;
    }

    start();
  }

  /* ================= 3) إشعارات الدروس ================= */
  function buildNotif() {
    if (!('Notification' in window)) return;
    const schedule = d.schedule || [];
    if (!schedule.length) return;

    const box = document.createElement('div');
    box.className = 'notif-box';
    box.innerHTML = '<h4>🔔 إشعارات مواعيد الدروس</h4>'
      + '<p>فعّل الإشعارات عشان يوصلك تنبيه قبل كل درس بـ 15 دقيقة</p>'
      + '<button class="notif-btn" id="notif-enable">تفعيل الإشعارات</button>'
      + '<div class="notif-schedule">' + schedule.map((s, i) =>
        '<label class="notif-item"><input type="checkbox" data-i="' + i + '"> ' + esc(s.day || '') + ' — ' + esc(s.topic || '') + '</label>'
      ).join('') + '</div>';

    const hijri = $('#hijri');
    if (hijri) hijri.insertAdjacentElement('afterend', box);
    else { const c = $('#contact'); if (c) c.insertAdjacentElement('beforebegin', box); }

    $('#notif-enable').onclick = async () => {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        localStorage.setItem('notifEnabled', '1');
        app.toast('تم تفعيل الإشعارات ✔');
        $('#notif-enable').textContent = '✓ مفعّل';
        $('#notif-enable').disabled = true;
        // إشعار ترحيبي
        new Notification('🕌 موقع الشيخ إسماعيل أحمد نجيب', {
          body: 'تم تفعيل إشعارات المواعيد بنجاح. بارك الله فيك!',
          icon: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b2e22"/><text x="32" y="46" text-anchor="middle" font-size="40" fill="#c9a227">إ</text></svg>')
        });
      } else {
        app.toast('تم رفض الإذن — تقدر تفعّله من إعدادات المتصفح', 'err');
      }
    };

    if (localStorage.getItem('notifEnabled') === '1') {
      $('#notif-enable').textContent = '✓ مفعّل';
      $('#notif-enable').disabled = true;
    }

    // فحص المواعيد كل دقيقة
    setInterval(() => {
      if (localStorage.getItem('notifEnabled') !== '1') return;
      const now = new Date();
      const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
      const todayName = dayNames[now.getDay()];
      schedule.forEach((s, i) => {
        const cb = document.querySelector('.notif-item input[data-i="' + i + '"]');
        if (!cb || !cb.checked) return;
        if (s.day !== todayName) return;
        // استخراج الوقت من النص (تقريبي)
        const timeMatch = String(s.time || '').match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return;
        const h = +timeMatch[1], m = +timeMatch[2];
        const diff = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
        if (diff > 0 && diff <= 15) {
          const key = 'notif_' + todayName + '_' + i + '_' + now.toDateString();
          if (localStorage.getItem(key)) return;
          localStorage.setItem(key, '1');
          new Notification('⏰ درس بعد شوي!', {
            body: s.topic + ' — ' + s.time + ' — ' + s.place,
            icon: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b2e22"/><text x="32" y="46" text-anchor="middle" font-size="40" fill="#c9a227">إ</text></svg>')
          });
        }
      });
    }, 60000);
  }

  /* ================= 4) تفسير الآيات ================= */
  function buildTafsir() {
    const overlay = document.createElement('div');
    overlay.className = 'tafsir-overlay'; overlay.id = 'tafsir-overlay'; overlay.hidden = true;
    overlay.innerHTML = '<div class="tafsir-box" style="position:relative"><button class="tafsir-close" id="tafsir-close">✕</button><h3>📖 تفسير الآية</h3><div class="ayah-text" id="tf-ayah"></div><div class="tafsir-text" id="tf-text"></div></div>';
    document.body.appendChild(overlay);

    $('#tafsir-close').onclick = () => { overlay.hidden = true; document.body.classList.remove('lock'); };
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.hidden = true; document.body.classList.remove('lock'); } });

    // جعل كل الآيات قابلة للضغط
    document.addEventListener('click', async e => {
      const ayah = e.target.closest('.quran-text span, .ticker-item, .quote-text');
      if (!ayah) return;
      const text = ayah.textContent.trim();
      if (!text.includes('﴿') && !text.includes('﴾')) return;

      $('#tf-ayah').textContent = text;
      $('#tf-text').textContent = 'جاري تحميل التفسير…';
      overlay.hidden = false; document.body.classList.add('lock');

      try {
        // استخراج اسم السورة من النص أو البحث
        const clean = text.replace(/[﴿﴾\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\s]/g, '').trim();
        const r = await fetch('https://api.alquran.cloud/v1/ayah/' + encodeURIComponent(clean) + '/editions/quran-uthmani,ar.muyassar');
        const j = await r.json();
        if (j.code === 200 && j.data) {
          const ayahData = Array.isArray(j.data) ? j.data[0] : j.data;
          const tafsirData = Array.isArray(j.data) ? j.data[1] : null;
          $('#tf-ayah').textContent = ayahData.text || text;
          $('#tf-text').textContent = tafsirData ? tafsirData.text : 'التفسير متاح قريباً — راجع تفسير ابن كثير أو السعدي.';
        } else {
          $('#tf-text').textContent = 'تعذر إيجاد التفسير لهذه الآية — جريب البحث في تفسير السعدي أو ابن كثير.';
        }
      } catch (err) {
        $('#tf-text').textContent = 'تعذر تحميل التفسير — تحقق من الاتصال.';
      }
    });
  }

  /* ================= 5) متتبع الحفظ ================= */
  function buildMemTrack() {
    const SURAH_LIST = [
      { n: 1, name: 'الفاتحة', ayat: 7 }, { n: 2, name: 'البقرة', ayat: 286 }, { n: 3, name: 'آل عمران', ayat: 200 },
      { n: 4, name: 'النساء', ayat: 176 }, { n: 5, name: 'المائدة', ayat: 120 }, { n: 6, name: 'الأنعام', ayat: 165 },
      { n: 7, name: 'الأعراف', ayat: 206 }, { n: 8, name: 'الأنفال', ayat: 75 }, { n: 9, name: 'التوبة', ayat: 129 },
      { n: 10, name: 'يونس', ayat: 109 }, { n: 11, name: 'هود', ayat: 123 }, { n: 12, name: 'يوسف', ayat: 111 },
      { n: 13, name: 'الرعد', ayat: 43 }, { n: 14, name: 'إبراهيم', ayat: 52 }, { n: 15, name: 'الحجر', ayat: 99 },
      { n: 16, name: 'النحل', ayat: 128 }, { n: 17, name: 'الإسراء', ayat: 111 }, { n: 18, name: 'الكهف', ayat: 110 },
      { n: 19, name: 'مريم', ayat: 98 }, { n: 20, name: 'طه', ayat: 135 }, { n: 21, name: 'الأنبياء', ayat: 112 },
      { n: 22, name: 'الحج', ayat: 78 }, { n: 23, name: 'المؤمنون', ayat: 118 }, { n: 24, name: 'النور', ayat: 64 },
      { n: 25, name: 'الفرقان', ayat: 77 }, { n: 26, name: 'الشعراء', ayat: 227 }, { n: 27, name: 'النمل', ayat: 93 },
      { n: 28, name: 'القصص', ayat: 88 }, { n: 29, name: 'العنكبوت', ayat: 69 }, { n: 30, name: 'الروم', ayat: 60 },
      { n: 31, name: 'لقمان', ayat: 34 }, { n: 32, name: 'السجدة', ayat: 30 }, { n: 33, name: 'الأحزاب', ayat: 73 },
      { n: 34, name: 'سبأ', ayat: 54 }, { n: 35, name: 'فاطر', ayat: 45 }, { n: 36, name: 'يس', ayat: 83 },
      { n: 37, name: 'الصافات', ayat: 182 }, { n: 38, name: 'ص', ayat: 88 }, { n: 39, name: 'الزمر', ayat: 75 },
      { n: 40, name: 'غافر', ayat: 85 }, { n: 41, name: 'فصلت', ayat: 54 }, { n: 42, name: 'الشورى', ayat: 53 },
      { n: 43, name: 'الزخرف', ayat: 89 }, { n: 44, name: 'الدخان', ayat: 59 }, { n: 45, name: 'الجاثية', ayat: 37 },
      { n: 46, name: 'الأحقاف', ayat: 35 }, { n: 47, name: 'محمد', ayat: 38 }, { n: 48, name: 'الفتح', ayat: 29 },
      { n: 49, name: 'الحجرات', ayat: 18 }, { n: 50, name: 'ق', ayat: 45 }, { n: 51, name: 'الذاريات', ayat: 60 },
      { n: 52, name: 'الطور', ayat: 49 }, { n: 53, name: 'النجم', ayat: 62 }, { n: 54, name: 'القمر', ayat: 55 },
      { n: 55, name: 'الرحمن', ayat: 78 }, { n: 56, name: 'الواقعة', ayat: 96 }, { n: 57, name: 'الحديد', ayat: 29 },
      { n: 58, name: 'المجادلة', ayat: 22 }, { n: 59, name: 'الحشر', ayat: 24 }, { n: 60, name: 'الممتحنة', ayat: 13 },
      { n: 61, name: 'الصف', ayat: 14 }, { n: 62, name: 'الجمعة', ayat: 11 }, { n: 63, name: 'المنافقون', ayat: 11 },
      { n: 64, name: 'التغابن', ayat: 18 }, { n: 65, name: 'الطلاق', ayat: 12 }, { n: 66, name: 'التحريم', ayat: 12 },
      { n: 67, name: 'الملك', ayat: 30 }, { n: 68, name: 'القلم', ayat: 52 }, { n: 69, name: 'الحاقة', ayat: 52 },
      { n: 70, name: 'المعارج', ayat: 44 }, { n: 71, name: 'نوح', ayat: 28 }, { n: 72, name: 'الجن', ayat: 28 },
      { n: 73, name: 'المزمل', ayat: 20 }, { n: 74, name: 'المدثر', ayat: 56 }, { n: 75, name: 'القيامة', ayat: 40 },
      { n: 76, name: 'الإنسان', ayat: 31 }, { n: 77, name: 'المرسلات', ayat: 50 }, { n: 78, name: 'النبأ', ayat: 40 },
      { n: 79, name: 'النازعات', ayat: 46 }, { n: 80, name: 'عبس', ayat: 42 }, { n: 81, name: 'التكوير', ayat: 29 },
      { n: 82, name: 'الانفطار', ayat: 19 }, { n: 83, name: 'المطففين', ayat: 36 }, { n: 84, name: 'الانشقاق', ayat: 25 },
      { n: 85, name: 'البروج', ayat: 22 }, { n: 86, name: 'الطارق', ayat: 17 }, { n: 87, name: 'الأعلى', ayat: 19 },
      { n: 88, name: 'الغاشية', ayat: 26 }, { n: 89, name: 'الفجر', ayat: 30 }, { n: 90, name: 'البلد', ayat: 20 },
      { n: 91, name: 'الشمس', ayat: 15 }, { n: 92, name: 'الليل', ayat: 21 }, { n: 93, name: 'الضحى', ayat: 11 },
      { n: 94, name: 'الشرح', ayat: 8 }, { n: 95, name: 'التين', ayat: 8 }, { n: 96, name: 'العلق', ayat: 19 },
      { n: 97, name: 'القدر', ayat: 5 }, { n: 98, name: 'البينة', ayat: 8 }, { n: 99, name: 'الزلزلة', ayat: 8 },
      { n: 100, name: 'العاديات', ayat: 11 }, { n: 101, name: 'القارعة', ayat: 11 }, { n: 102, name: 'التكاثر', ayat: 8 },
      { n: 103, name: 'العصر', ayat: 3 }, { n: 104, name: 'الهمزة', ayat: 9 }, { n: 105, name: 'الفيل', ayat: 5 },
      { n: 106, name: 'قريش', ayat: 4 }, { n: 107, name: 'الماعون', ayat: 7 }, { n: 108, name: 'الكوثر', ayat: 3 },
      { n: 109, name: 'الكافرون', ayat: 6 }, { n: 110, name: 'النصر', ayat: 3 }, { n: 111, name: 'المسد', ayat: 5 },
      { n: 112, name: 'الإخلاص', ayat: 4 }, { n: 113, name: 'الفلق', ayat: 5 }, { n: 114, name: 'الناس', ayat: 6 }
    ];

    const KEY = 'siteMemorization_v1';
    let mem; try { mem = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { mem = {}; }
    const save = () => localStorage.setItem(KEY, JSON.stringify(mem));

    const sec = document.createElement('section');
    sec.className = 'section'; sec.id = 'memorize';
    sec.innerHTML = '<div class="container mem-track"><header class="sec-head"><p class="kicker">رحلتك مع القرآن</p><h2 class="sec-title">متتبع الحفظ</h2><div class="orn"><span>✦</span></div></header>'
      + '<div class="mem-summary" id="mem-summary"></div>'
      + '<div class="mem-grid" id="mem-grid"></div></div>';

    const quiz = $('#quiz');
    if (quiz) quiz.insertAdjacentElement('afterend', sec);
    else { const c = $('#contact'); if (c) c.insertAdjacentElement('beforebegin', sec); }

    function renderSummary() {
      const done = Object.values(mem).filter(v => v).length;
      const totalAyat = SURAH_LIST.filter(s => mem[s.n]).reduce((sum, s) => sum + s.ayat, 0);
      $('#mem-summary').innerHTML =
        '<div class="mem-stat"><b>' + done + '</b><small>سور محفوظة</small></div>'
        + '<div class="mem-stat"><b>' + totalAyat + '</b><small>آيات محفوظة</small></div>'
        + '<div class="mem-stat"><b>' + (done / 114 * 100).toFixed(1) + '%</b><small>نسبة الحفظ</small></div>';
    }

    function renderGrid() {
      const grid = $('#mem-grid');
      grid.innerHTML = SURAH_LIST.map(s =>
        '<div class="mem-surah' + (mem[s.n] ? ' memorized' : '') + '" data-n="' + s.n + '"><b>' + s.name + '</b><small>' + s.ayat + ' آية</small></div>'
      ).join('');
    }

    renderSummary(); renderGrid();

    $('#mem-grid').addEventListener('click', e => {
      const card = e.target.closest('.mem-surah'); if (!card) return;
      const n = +card.dataset.n;
      mem[n] = !mem[n];
      save();
      card.classList.toggle('memorized', mem[n]);
      renderSummary();
      app.toast(mem[n] ? 'ما شاء الله! ✓ ' + SURAH_LIST.find(s => s.n === n).name : 'تم إلغاء التحديد');
    });
  }

  /* ================= تشغيل ================= */
  buildTranslate(); buildQuiz(); buildNotif(); buildTafsir(); buildMemTrack();

  const nav = $('#mainNav .nav-cta');
  if (nav) nav.insertAdjacentHTML('beforebegin', '<a href="#quiz">المسابقات</a><a href="#memorize">متتبع الحفظ</a>');
  const fl = $('.foot-links');
  if (fl) fl.insertAdjacentHTML('beforeend', '<a href="#quiz">المسابقات</a><a href="#memorize">متتبع الحفظ</a>');
})();