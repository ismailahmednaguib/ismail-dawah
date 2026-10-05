/* ================================================================
   المرحلة 5: مشغل القرآن + الأذكار + حاسبة الزكاة + الأدعية + الوضع البصري
   ================================================================ */
(function () {
  'use strict';
  const app = window.SiteApp; if (!app) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ================= 1) مشغل القرآن ================= */
  function buildQuran() {
    const sec = document.createElement('section');
    sec.className = 'section band-white'; sec.id = 'quran';
    sec.innerHTML = '<div class="container"><header class="sec-head"><p class="kicker">كتاب الله</p><h2 class="sec-title">القرآن الكريم</h2><div class="orn"><span>✦</span></div></header><div class="quran-player" id="quran-player"><div class="quran-controls"><select id="q-surah"></select><select id="q-reciter"><option value="ar.alafasy">مشاري العفاسي</option><option value="ar.abdulbasitmurattal">عبد الباسط عبد الصمد</option><option value="ar.husary">محمود خليل الحصري</option><option value="ar.minshawi">محمد صديق المنشاوي</option><option value="ar.abdullahbasfar">عبدالله بصفر</option></select><button id="q-play">▶ استمع</button></div><div class="quran-text" id="q-text">اختر السورة لبدء القراءة</div><div class="quran-nav"><button id="q-prev">السورة السابقة</button><button id="q-next">السورة التالية</button></div></div></div>';
    const contact = $('#contact'); if (contact) contact.insertAdjacentElement('beforebegin', sec);

    const surahSelect = $('#q-surah');
    const surahs = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
    surahs.forEach((s, i) => { const o = document.createElement('option'); o.value = i + 1; o.textContent = (i + 1) + '. ' + s; surahSelect.appendChild(o); });

    let audio = null;
    $('#q-play').onclick = async () => {
      const surah = surahSelect.value;
      const reciter = $('#q-reciter').value;
      $('#q-text').textContent = 'جاري التحميل...';
      try {
        const r = await fetch('https://api.alquran.cloud/v1/surah/' + surah + '/' + reciter);
        const j = await r.json();
        const ayahs = j.data.ayahs;
        $('#q-text').innerHTML = ayahs.map(a => '<span>' + a.text + ' ﴿' + a.numberInSurah + '﴾ </span>').join(' ');
        if (audio) audio.pause();
        audio = new Audio(ayahs[0].audio);
        audio.play();
        $('#q-play').textContent = '⏸';
        audio.onended = () => $('#q-play').textContent = '▶ استمع';
      } catch (e) { $('#q-text').textContent = 'تعذر التحميل'; }
    };
    $('#q-prev').onclick = () => { if (surahSelect.value > 1) { surahSelect.value = +surahSelect.value - 1; $('#q-play').click(); } };
    $('#q-next').onclick = () => { if (surahSelect.value < 114) { surahSelect.value = +surahSelect.value + 1; $('#q-play').click(); } };
  }

  /* ================= 2) الأذكار ================= */
  function buildAzkar() {
    const AZKAR = {
      morning: [
        { t: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', c: 1 },
        { t: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', c: 1 },
        { t: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', c: 100 },
        { t: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', c: 10 }
      ],
      evening: [
        { t: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', c: 1 },
        { t: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', c: 1 },
        { t: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', c: 3 }
      ],
      sleep: [
        { t: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', c: 1 },
        { t: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', c: 3 }
      ]
    };

    const sec = document.createElement('section');
    sec.className = 'section'; sec.id = 'azkar';
    sec.innerHTML = '<div class="container"><header class="sec-head"><p class="kicker">ذكر الله</p><h2 class="sec-title">الأذكار اليومية</h2><div class="orn"><span>✦</span></div></header><div class="azkar-tabs"><button class="azkar-tab active" data-tab="morning">أذكار الصباح</button><button class="azkar-tab" data-tab="evening">أذكار المساء</button><button class="azkar-tab" data-tab="sleep">أذكار النوم</button></div><div id="azkar-list"></div></div>';
    const contact = $('#contact'); if (contact) contact.insertAdjacentElement('beforebegin', sec);

    const render = tab => {
      const list = $('#azkar-list');
      list.innerHTML = AZKAR[tab].map((z, i) =>
        '<div class="azkar-item" data-i="' + i + '"><div class="azkar-text">' + esc(z.t) + '</div><div class="azkar-count"><button data-i="' + i + '">👆</button><span>العدد: <b class="azkar-c">' + z.c + '</b> / ' + z.c + '</span></div></div>'
      ).join('');
    };
    render('morning');

    document.querySelectorAll('.azkar-tab').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.azkar-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.tab);
      };
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.azkar-count button'); if (!btn) return;
      const i = +btn.dataset.i;
      const item = btn.closest('.azkar-item');
      const b = item.querySelector('.azkar-c');
      let c = +b.textContent;
      if (c > 0) { c--; b.textContent = c; if (c === 0) item.classList.add('azkar-done'); }
    });
  }

  /* ================= 3) حاسبة الزكاة ================= */
  function buildZakat() {
    const sec = document.createElement('section');
    sec.className = 'section band-white'; sec.id = 'zakat';
    sec.innerHTML = '<div class="container"><header class="sec-head"><p class="kicker">أداة عملية</p><h2 class="sec-title">حاسبة الزكاة</h2><div class="orn"><span>✦</span></div></header><div class="zakat-calc"><div class="zakat-field"><label> النقود والذهب والفضة (بالجنيه)</label><input type="number" id="z-money" placeholder="0"></div><div class="zakat-field"><label>📈 أرباح التجارة والاستثمارات</label><input type="number" id="z-trade" placeholder="0"></div><div class="zakat-field"><label>🏠 العقارات المؤجرة (قيمة الإيجار السنوي)</label><input type="number" id="z-rent" placeholder="0"></div><div class="zakat-field"><label>💳 الديون المستحقة عليك</label><input type="number" id="z-debt" placeholder="0"></div><button id="z-calc" style="width:100%;background:var(--gold);color:#241c04;border:0;padding:12px;border-radius:10px;font-weight:900;font-size:1.1rem;cursor:pointer">احسب الزكاة</button><div class="zakat-result" id="z-result" hidden><small>مقدار الزكاة الواجبة (2.5%)</small><b id="z-amount">0</b><small>جنيه مصري</small></div></div></div>';
    const contact = $('#contact'); if (contact) contact.insertAdjacentElement('beforebegin', sec);

    $('#z-calc').onclick = () => {
      const money = +$('#z-money').value || 0;
      const trade = +$('#z-trade').value || 0;
      const rent = +$('#z-rent').value || 0;
      const debt = +$('#z-debt').value || 0;
      const total = money + trade + rent - debt;
      const zakat = total > 0 ? total * 0.025 : 0;
      $('#z-amount').textContent = zakat.toLocaleString('ar-EG', { maximumFractionDigits: 2 });
      $('#z-result').hidden = false;
    };
  }

  /* ================= 4) الأدعية ================= */
  function buildDua() {
    const DUAS = [
      { cat: 'أدعية قرآنية', t: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', s: 'البقرة: 201' },
      { cat: 'أدعية نبوية', t: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ', s: 'رواه البخاري' },
      { cat: 'أدعية قرآنية', t: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', s: 'طه: 25-26' },
      { cat: 'أدعية نبوية', t: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي', s: 'رواه مسلم' },
      { cat: 'أدعية متنوعة', t: 'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَارْزُقْنِي وَعَافِنِي', s: 'دعاء جامع' }
    ];

    const sec = document.createElement('section');
    sec.className = 'section'; sec.id = 'dua';
    sec.innerHTML = '<div class="container"><header class="sec-head"><p class="kicker">مناجاة</p><h2 class="sec-title">مكتبة الأدعية</h2><div class="orn"><span>✦</span></div></header><input type="search" class="dua-search" id="dua-search" placeholder="ابحث في الأدعية..."><div id="dua-list"></div></div>';
    const contact = $('#contact'); if (contact) contact.insertAdjacentElement('beforebegin', sec);

    const render = q => {
      const list = $('#dua-list');
      const filtered = DUAS.filter(d => (d.t + ' ' + d.cat + ' ' + d.s).includes(q));
      list.innerHTML = filtered.length ? filtered.map(d =>
        '<div class="dua-card"><h4>' + esc(d.cat) + '</h4><p>' + esc(d.t) + '</p><span class="dua-cat">' + esc(d.s) + '</span></div>'
      ).join('') : '<p class="empty-note">لا توجد نتائج</p>';
    };
    render('');
    $('#dua-search').oninput = e => render(e.target.value.trim());
  }

  /* ================= 5) الوضع البصري ================= */
  (function () {
    const nav = $('.nav-tools'); if (!nav) return;
    const btn = document.createElement('button');
    btn.title = 'تكبير الخط'; btn.textContent = '️';
    btn.style.cssText = 'width:40px;height:40px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);font-size:1.05rem;cursor:pointer';
    nav.appendChild(btn);
    btn.onclick = () => { document.body.classList.toggle('big-text'); localStorage.setItem('bigText', document.body.classList.contains('big-text') ? '1' : '0'); };
    if (localStorage.getItem('bigText') === '1') document.body.classList.add('big-text');
  })();

  /* ================= 6) تصدير الدرس كصورة ================= */
  (function () {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script);

    document.addEventListener('click', e => {
      const card = e.target.closest('.card'); if (!card) return;
      if (e.target.closest('.export-btn')) {
        const btn = e.target;
        btn.textContent = '⏳';
        html2canvas(card, { backgroundColor: '#0b2e22', scale: 2 }).then(canvas => {
          const link = document.createElement('a');
          link.download = 'درس-' + Date.now() + '.png';
          link.href = canvas.toDataURL();
          link.click();
          btn.textContent = '📥';
          setTimeout(() => btn.textContent = '️', 2000);
        });
      } else {
        const btn = document.createElement('button');
        btn.className = 'export-btn'; btn.textContent = '️';
        card.style.position = 'relative';
        card.appendChild(btn);
      }
    });
  })();

  /* ================= تشغيل ================= */
  buildQuran(); buildAzkar(); buildZakat(); buildDua();

  const nav = $('#mainNav .nav-cta');
  if (nav) nav.insertAdjacentHTML('beforebegin', '<a href="#quran">القرآن</a><a href="#azkar">الأذكار</a><a href="#zakat">الزكاة</a><a href="#dua">الأدعية</a>');
  const fl = $('.foot-links');
  if (fl) fl.insertAdjacentHTML('beforeend', '<a href="#quran">القرآن</a><a href="#azkar">الأذكار</a><a href="#zakat">الزكاة</a><a href="#dua">الأدعية</a>');
})();