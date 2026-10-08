// lib/translations.ts
// قاموس الترجمات الكامل للمنصة

export type TranslationDict = Record<string, string>;

export const translations: Record<'ar' | 'en', TranslationDict> = {
  ar: {
    // ===== عام =====
    "site.name": "إسماعيل أحمد نجيب",
    "site.tagline": "منصة دعوية شاملة",
    "site.description": "منصة إسلامية شاملة تجمع القرآن والسنة والعلوم الشرعية وأدوات الدعوة في مكان واحد",

    // ===== التنقل =====
    "nav.home": "الرئيسية",
    "nav.quran": "القرآن الكريم",
    "nav.adhkar": "الأذكار",
    "nav.prayer": "مواقيت الصلاة",
    "nav.fatwa": "الفتاوى",
    "nav.live": "البث المباشر",
    "nav.more": "المزيد",
    "nav.search": "البحث",
    "nav.account": "حسابي",
    "nav.login": "تسجيل الدخول",
    "nav.register": "إنشاء حساب",
    "nav.logout": "تسجيل الخروج",
    "nav.bookmarks": "المحفوظات",

    // ===== الفوتر =====
    "footer.worship": "العبادات",
    "footer.knowledge": "العلوم",
    "footer.dawah": "الدعوة",
    "footer.about": "من نحن",
    "footer.contact": "تواصل معنا",
    "footer.privacy": "الخصوصية",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.newsletter.title": "اشترك في النشرة البريدية",
    "footer.newsletter.desc": "صلك جديد المحتوى الدعوي والدروس والفتاوى أولاً بأول",
    "footer.newsletter.placeholder": "بريدك الإلكتروني",
    "footer.newsletter.subscribe": "اشترك",
    "footer.newsletter.success": "تم الاشتراك بنجاح",
    "footer.newsletter.error": "حدث خطأ، حاول مرة أخرى",

    // ===== الصفحة الرئيسية =====
    "home.hero.badge": "✨ منصة دعوية شاملة",
    "home.hero.title": "نورُ العلم.. بين يديك",
    "home.hero.subtitle": "القرآن الكريم، السنة النبوية، الفتاوى، وأدوات الدعوة — كل ما يحتاجه المسلم في مكان واحد",
    "home.hero.cta1": "ابدأ الآن",
    "home.hero.cta2": "البث المباشر",
    "home.stats.sections": "قسم ومحتوى",
    "home.stats.languages": "لغتان",
    "home.stats.free": "مجاني 100%",
    "home.tools.title": "أدواتك اليومية",
    "home.tools.subtitle": "كل ما تحتاجه في يومك",
    "home.learn.title": "تعلّم ودلائل",
    "home.learn.subtitle": "خطوة بخطوة نحو الفهم الصحيح",
    "home.responses.title": "العلوم والردود",
    "home.responses.subtitle": "دافع عن عقيدتك بالعلم والحجة",
    "home.dawah.title": "الدعوة والمجتمع",
    "home.dawah.subtitle": "كن داعيةً مؤثراً",
    "home.verse.text": "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾",
    "home.verse.ref": "سورة طه — الآية 114",

    // ===== القرآن =====
    "quran.title": "القرآن الكريم",
    "quran.subtitle": "اقرأ واستمع إلى كتاب الله",
    "quran.search.placeholder": "ابحث عن سورة...",
    "quran.surah": "سورة",
    "quran.ayah": "آية",
    "quran.juz": "جزء",
    "quran.hizb": "حزب",
    "quran.page": "صفحة",
    "quran.makki": "مكية",
    "quran.madani": "مدنية",
    "quran.listen": "استمع",
    "quran.read": "اقرأ",
    "quran.bookmark": "حفظ",
    "quran.share": "مشاركة",
    "quran.totalSurahs": "سورة",

    // ===== الأذكار =====
    "adhkar.title": "الأذكار",
    "adhkar.subtitle": "أذكار الصباح والمساء والنوم",
    "adhkar.morning": "أذكار الصباح",
    "adhkar.evening": "أذكار المساء",
    "adhkar.sleep": "أذكار النوم",
    "adhkar.wake": "أذكار الاستيقاظ",
    "adhkar.afterPrayer": "أذكار بعد الصلاة",
    "adhkar.counter": "العداد",
    "adhkar.repeat": "التكرار",
    "adhkar.done": "تم",

    // ===== المسبحة =====
    "tasbih.title": "المسبحة الإلكترونية",
    "tasbih.subtitle": "سبّح واستغفر وصلِّ على النبي ﷺ",
    "tasbih.subhanAllah": "سبحان الله",
    "tasbih.alhamdulillah": "الحمد لله",
    "tasbih.allahuAkbar": "الله أكبر",
    "tasbih.astaghfirullah": "أستغفر الله",
    "tasbih.laIlahaIllaAllah": "لا إله إلا الله",
    "tasbih.salawat": "اللهم صلِّ وسلم على نبينا محمد",
    "tasbih.count": "العدد",
    "tasbih.target": "الهدف",
    "tasbih.reset": "إعادة تعيين",
    "tasbih.vibrate": "اهتزاز",

    // ===== مواقيت الصلاة =====
    "prayer.title": "مواقيت الصلاة",
    "prayer.subtitle": "مواعيد الصلاة حسب موقعك",
    "prayer.fajr": "الفجر",
    "prayer.sunrise": "الشروق",
    "prayer.dhuhr": "الظهر",
    "prayer.asr": "العصر",
    "prayer.maghrib": "المغرب",
    "prayer.isha": "العشاء",
    "prayer.next": "الصلاة القادمة",
    "prayer.remaining": "الوقت المتبقي",
    "prayer.location": "تحديد الموقع",
    "prayer.detecting": "جارٍ تحديد موقعك...",
    "prayer.error": "تعذر تحديد الموقع",

    // ===== القبلة =====
    "qibla.title": "اتجاه القبلة",
    "qibla.subtitle": "حدد اتجاه الكعبة المشرفة",
    "qibla.direction": "الاتجاه",
    "qibla.degrees": "درجة",
    "qibla.north": "الشمال",

    // ===== التقويم =====
    "calendar.title": "التقويم الهجري",
    "calendar.subtitle": "التقويم الهجري والميلادي",
    "calendar.hijri": "هجري",
    "calendar.gregorian": "ميلادي",
    "calendar.today": "اليوم",

    // ===== الفتاوى =====
    "fatwa.title": "الفتاوى",
    "fatwa.subtitle": "أسئلة وأجوبة شرعية",
    "fatwa.ask": "اطرح سؤالك",
    "fatwa.search.placeholder": "ابحث في الفتاوى...",
    "fatwa.categories": "التصنيفات",
    "fatwa.recent": "أحدث الفتاوى",
    "fatwa.popular": "الأكثر قراءة",

    // ===== الرد على الإلحاد =====
    "atheism.title": "الرد على الإلحاد",
    "atheism.subtitle": "حجج عقلية ونقلية على وجود الله",

    // ===== الشبهات =====
    "doubts.title": "الشبهات والردود",
    "doubts.subtitle": "شبهات معاصرة بأجوبة علمية",

    // ===== قضايا الشباب =====
    "youth.title": "قضايا الشباب",
    "youth.subtitle": "مشاكل وحلول جيلنا",

    // ===== فتاوى المرأة =====
    "womenFatwas.title": "فتاوى المرأة",
    "womenFatwas.subtitle": "أحكام تخص المرأة المسلمة",

    // ===== ادخل الإسلام =====
    "embraceIslam.title": "ادخل الإسلام",
    "embraceIslam.subtitle": "لغير المسلمين والمهتمين",
    "embraceIslam.shahada": "الشهادتان",
    "embraceIslam.steps": "خطوات الدخول في الإسلام",

    // ===== دليل الصلاة =====
    "prayerGuide.title": "دليل الصلاة",
    "prayerGuide.subtitle": "تعلّم الصلاة الصحيحة خطوة بخطوة",

    // ===== دليل الحج =====
    "hajjGuide.title": "دليل الحج والعمرة",
    "hajjGuide.subtitle": "من الإحرام حتى التحلل",

    // ===== الزكاة =====
    "zakat.title": "حاسبة الزكاة",
    "zakat.subtitle": "زكاة المال والذهب والعروض",
    "zakat.calculator": "الحاسبة",
    "zakat.amount": "المبلغ",
    "zakat.nisab": "النصاب",
    "zakat.result": "الزكاة المستحقة",

    // ===== المواريث =====
    "inheritance.title": "علم المواريث",
    "inheritance.subtitle": "تقسيم التركات شرعاً",

    // ===== قصص الأنبياء =====
    "prophets.title": "قصص الأنبياء",
    "prophets.subtitle": "العبر والدروس من حياة الأنبياء",

    // ===== حفظ القرآن =====
    "memorization.title": "حفظ القرآن",
    "memorization.subtitle": "خطة عملية للحفظ والمراجعة",

    // ===== الرقية الشرعية =====
    "ruqyah.title": "الرقية الشرعية",
    "ruqyah.subtitle": "آيات وأدعية الرقية",

    // ===== الورد اليومي =====
    "dailyWird.title": "الورد اليومي",
    "dailyWird.subtitle": "برنامجك اليومي من القرآن والذكر",

    // ===== دليل الدعوة =====
    "dawahGuide.title": "دليل الدعوة",
    "dawahGuide.subtitle": "كيف تكون داعية ناجحاً",

    // ===== المجالات =====
    "fields.title": "المجالات الدعوية",
    "fields.subtitle": "ساحات الدعوة المعاصرة",

    // ===== المشاريع =====
    "projects.title": "المشاريع",
    "projects.subtitle": "مبادرات دعوية قائمة",

    // ===== الخطب =====
    "khutab.title": "الخطب",
    "khutab.subtitle": "خطب جمعة مكتوبة",

    // ===== ختمة الدعاء =====
    "khatmDua.title": "ختمة الدعاء",
    "khatmDua.subtitle": "شارك في ختمة دعاء جماعية",

    // ===== البث المباشر =====
    "live.title": "البث المباشر",
    "live.subtitle": "دروس ومحاضرات حية",
    "live.now": "مباشر الآن",
    "live.upcoming": "قادم",
    "live.ended": "انتهى",

    // ===== الأخبار =====
    "news.title": "الأخبار",
    "news.subtitle": "آخر الأخبار والمقالات",

    // ===== البحث =====
    "search.title": "البحث",
    "search.placeholder": "ابحث في المنصة...",
    "search.noResults": "لا توجد نتائج",
    "search.results": "نتيجة",

    // ===== من نحن =====
    "about.title": "من نحن",
    "about.subtitle": "تعرف على المنصة وصاحبها",

    // ===== تواصل معنا =====
    "contact.title": "تواصل معنا",
    "contact.subtitle": "نسعد بتواصلك",
    "contact.name": "الاسم",
    "contact.email": "البريد الإلكتروني",
    "contact.message": "الرسالة",
    "contact.send": "إرسال",
    "contact.success": "تم إرسال رسالتك بنجاح",

    // ===== تسجيل الدخول =====
    "login.title": "تسجيل الدخول",
    "login.email": "البريد الإلكتروني",
    "login.password": "كلمة المرور",
    "login.submit": "دخول",
    "login.forgot": "نسيت كلمة المرور؟",
    "login.noAccount": "ليس لديك حساب؟",

    // ===== إنشاء حساب =====
    "register.title": "إنشاء حساب",
    "register.name": "الاسم الكامل",
    "register.email": "البريد الإلكتروني",
    "register.password": "كلمة المرور",
    "register.confirmPassword": "تأكيد كلمة المرور",
    "register.submit": "إنشاء الحساب",
    "register.haveAccount": "لديك حساب بالفعل؟",

    // ===== المحفوظات =====
    "bookmarks.title": "المحفوظات",
    "bookmarks.empty": "لا توجد محفوظات بعد",

    // ===== التعلم =====
    "learn.title": "تعلّم",
    "learn.subtitle": "محتوى تعليمي شامل",

    // ===== الخريطة =====
    "map.title": "خريطة المنصة",
    "map.subtitle": "جميع الأقسام في مكان واحد",

    // ===== رسائل عامة =====
    "common.loading": "جارٍ التحميل...",
    "common.error": "حدث خطأ",
    "common.retry": "إعادة المحاولة",
    "common.back": "رجوع",
    "common.readMore": "اقرأ المزيد",
    "common.viewAll": "عرض الكل",
    "common.share": "مشاركة",
    "common.copy": "نسخ",
    "common.copied": "تم النسخ",
    "common.language": "اللغة",
    "common.darkMode": "الوضع الليلي",
    "common.lightMode": "الوضع النهاري",
  },

  en: {
    // ===== General =====
    "site.name": "Ismail Ahmed Naguib",
    "site.tagline": "Complete Dawah Platform",
    "site.description": "A comprehensive Islamic platform combining Quran, Sunnah, Islamic sciences and Dawah tools in one place",

    // ===== Navigation =====
    "nav.home": "Home",
    "nav.quran": "Quran",
    "nav.adhkar": "Adhkar",
    "nav.prayer": "Prayer Times",
    "nav.fatwa": "Fatwa",
    "nav.live": "Live Stream",
    "nav.more": "More",
    "nav.search": "Search",
    "nav.account": "My Account",
    "nav.login": "Login",
    "nav.register": "Sign Up",
    "nav.logout": "Logout",
    "nav.bookmarks": "Bookmarks",

    // ===== Footer =====
    "footer.worship": "Worship",
    "footer.knowledge": "Knowledge",
    "footer.dawah": "Dawah",
    "footer.about": "About Us",
    "footer.contact": "Contact Us",
    "footer.privacy": "Privacy",
    "footer.rights": "All rights reserved",
    "footer.newsletter.title": "Subscribe to Newsletter",
    "footer.newsletter.desc": "Get the latest Dawah content, lessons and Fatwas",
    "footer.newsletter.placeholder": "Your email",
    "footer.newsletter.subscribe": "Subscribe",
    "footer.newsletter.success": "Subscribed successfully",
    "footer.newsletter.error": "An error occurred, please try again",

    // ===== Home Page =====
    "home.hero.badge": "✨ Complete Dawah Platform",
    "home.hero.title": "The Light of Knowledge.. In Your Hands",
    "home.hero.subtitle": "Quran, Sunnah, Fatwas and Dawah tools — everything a Muslim needs in one place",
    "home.hero.cta1": "Get Started",
    "home.hero.cta2": "Live Stream",
    "home.stats.sections": "Sections",
    "home.stats.languages": "Languages",
    "home.stats.free": "100% Free",
    "home.tools.title": "Your Daily Tools",
    "home.tools.subtitle": "Everything you need every day",
    "home.learn.title": "Learn & Guides",
    "home.learn.subtitle": "Step by step to correct understanding",
    "home.responses.title": "Knowledge & Responses",
    "home.responses.subtitle": "Defend your faith with knowledge",
    "home.dawah.title": "Dawah & Community",
    "home.dawah.subtitle": "Be an impactful Da'ee",
    "home.verse.text": "My Lord, increase me in knowledge",
    "home.verse.ref": "Surah Taha — Verse 114",

    // ===== Quran =====
    "quran.title": "The Holy Quran",
    "quran.subtitle": "Read and listen to the Book of Allah",
    "quran.search.placeholder": "Search for a Surah...",
    "quran.surah": "Surah",
    "quran.ayah": "Ayah",
    "quran.juz": "Juz",
    "quran.hizb": "Hizb",
    "quran.page": "Page",
    "quran.makki": "Meccan",
    "quran.madani": "Medinan",
    "quran.listen": "Listen",
    "quran.read": "Read",
    "quran.bookmark": "Bookmark",
    "quran.share": "Share",
    "quran.totalSurahs": "Surahs",

    // ===== Adhkar =====
    "adhkar.title": "Adhkar",
    "adhkar.subtitle": "Morning, evening and sleep supplications",
    "adhkar.morning": "Morning Adhkar",
    "adhkar.evening": "Evening Adhkar",
    "adhkar.sleep": "Sleep Adhkar",
    "adhkar.wake": "Waking Up Adhkar",
    "adhkar.afterPrayer": "After Prayer Adhkar",
    "adhkar.counter": "Counter",
    "adhkar.repeat": "Repeat",
    "adhkar.done": "Done",

    // ===== Tasbih =====
    "tasbih.title": "Digital Tasbih",
    "tasbih.subtitle": "Glorify, seek forgiveness and send blessings upon the Prophet ﷺ",
    "tasbih.subhanAllah": "Subhan Allah",
    "tasbih.alhamdulillah": "Alhamdulillah",
    "tasbih.allahuAkbar": "Allahu Akbar",
    "tasbih.astaghfirullah": "Astaghfirullah",
    "tasbih.laIlahaIllaAllah": "La ilaha illa Allah",
    "tasbih.salawat": "O Allah, send blessings upon our Prophet Muhammad",
    "tasbih.count": "Count",
    "tasbih.target": "Target",
    "tasbih.reset": "Reset",
    "tasbih.vibrate": "Vibrate",

    // ===== Prayer Times =====
    "prayer.title": "Prayer Times",
    "prayer.subtitle": "Prayer times based on your location",
    "prayer.fajr": "Fajr",
    "prayer.sunrise": "Sunrise",
    "prayer.dhuhr": "Dhuhr",
    "prayer.asr": "Asr",
    "prayer.maghrib": "Maghrib",
    "prayer.isha": "Isha",
    "prayer.next": "Next Prayer",
    "prayer.remaining": "Time Remaining",
    "prayer.location": "Detect Location",
    "prayer.detecting": "Detecting your location...",
    "prayer.error": "Unable to detect location",

    // ===== Qibla =====
    "qibla.title": "Qibla Direction",
    "qibla.subtitle": "Find the direction of the Holy Kaaba",
    "qibla.direction": "Direction",
    "qibla.degrees": "Degrees",
    "qibla.north": "North",

    // ===== Calendar =====
    "calendar.title": "Hijri Calendar",
    "calendar.subtitle": "Hijri and Gregorian calendar",
    "calendar.hijri": "Hijri",
    "calendar.gregorian": "Gregorian",
    "calendar.today": "Today",

    // ===== Fatwa =====
    "fatwa.title": "Fatwas",
    "fatwa.subtitle": "Islamic questions and answers",
    "fatwa.ask": "Ask your question",
    "fatwa.search.placeholder": "Search Fatwas...",
    "fatwa.categories": "Categories",
    "fatwa.recent": "Recent Fatwas",
    "fatwa.popular": "Most Read",

    // ===== Atheism Response =====
    "atheism.title": "Atheism Response",
    "atheism.subtitle": "Rational and textual proofs for the existence of God",

    // ===== Doubts =====
    "doubts.title": "Doubts & Answers",
    "doubts.subtitle": "Modern doubts with scholarly answers",

    // ===== Youth Issues =====
    "youth.title": "Youth Issues",
    "youth.subtitle": "Problems and solutions for our generation",

    // ===== Women Fatwas =====
    "womenFatwas.title": "Women's Fatwas",
    "womenFatwas.subtitle": "Rulings specific to Muslim women",

    // ===== Embrace Islam =====
    "embraceIslam.title": "Embrace Islam",
    "embraceIslam.subtitle": "For non-Muslims and seekers",
    "embraceIslam.shahada": "The Shahada",
    "embraceIslam.steps": "Steps to embrace Islam",

    // ===== Prayer Guide =====
    "prayerGuide.title": "Prayer Guide",
    "prayerGuide.subtitle": "Learn correct prayer step by step",

    // ===== Hajj Guide =====
    "hajjGuide.title": "Hajj & Umrah Guide",
    "hajjGuide.subtitle": "From Ihram to completion",

    // ===== Zakat =====
    "zakat.title": "Zakat Calculator",
    "zakat.subtitle": "Zakat on money, gold and trade",
    "zakat.calculator": "Calculator",
    "zakat.amount": "Amount",
    "zakat.nisab": "Nisab",
    "zakat.result": "Zakat Due",

    // ===== Inheritance =====
    "inheritance.title": "Islamic Inheritance",
    "inheritance.subtitle": "Islamic estate division",

    // ===== Prophets Stories =====
    "prophets.title": "Prophets Stories",
    "prophets.subtitle": "Lessons from the lives of Prophets",

    // ===== Quran Memorization =====
    "memorization.title": "Quran Memorization",
    "memorization.subtitle": "Practical memorization plan",

    // ===== Ruqyah =====
    "ruqyah.title": "Ruqyah",
    "ruqyah.subtitle": "Verses and supplications for Ruqyah",

    // ===== Daily Wird =====
    "dailyWird.title": "Daily Wird",
    "dailyWird.subtitle": "Your daily Quran and Dhikr program",

    // ===== Dawah Guide =====
    "dawahGuide.title": "Dawah Guide",
    "dawahGuide.subtitle": "How to be a successful Da'ee",

    // ===== Fields =====
    "fields.title": "Dawah Fields",
    "fields.subtitle": "Modern Dawah arenas",

    // ===== Projects =====
    "projects.title": "Projects",
    "projects.subtitle": "Active Dawah initiatives",

    // ===== Khutab =====
    "khutab.title": "Khutbahs",
    "khutab.subtitle": "Written Friday sermons",

    // ===== Khatm Dua =====
    "khatmDua.title": "Dua Khatm",
    "khatmDua.subtitle": "Join a collective Dua completion",

    // ===== Live =====
    "live.title": "Live Stream",
    "live.subtitle": "Live lessons and lectures",
    "live.now": "Live Now",
    "live.upcoming": "Upcoming",
    "live.ended": "Ended",

    // ===== News =====
    "news.title": "News",
    "news.subtitle": "Latest news and articles",

    // ===== Search =====
    "search.title": "Search",
    "search.placeholder": "Search the platform...",
    "search.noResults": "No results found",
    "search.results": "Results",

    // ===== About =====
    "about.title": "About Us",
    "about.subtitle": "Learn about the platform and its creator",

    // ===== Contact =====
    "contact.title": "Contact Us",
    "contact.subtitle": "We'd love to hear from you",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send",
    "contact.success": "Your message has been sent successfully",

    // ===== Login =====
    "login.title": "Login",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Login",
    "login.forgot": "Forgot password?",
    "login.noAccount": "Don't have an account?",

    // ===== Register =====
    "register.title": "Sign Up",
    "register.name": "Full Name",
    "register.email": "Email",
    "register.password": "Password",
    "register.confirmPassword": "Confirm Password",
    "register.submit": "Create Account",
    "register.haveAccount": "Already have an account?",

    // ===== Bookmarks =====
    "bookmarks.title": "Bookmarks",
    "bookmarks.empty": "No bookmarks yet",

    // ===== Learn =====
    "learn.title": "Learn",
    "learn.subtitle": "Comprehensive educational content",

    // ===== Map =====
    "map.title": "Platform Map",
    "map.subtitle": "All sections in one place",

    // ===== Common =====
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.retry": "Retry",
    "common.back": "Back",
    "common.readMore": "Read More",
    "common.viewAll": "View All",
    "common.share": "Share",
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.language": "Language",
    "common.darkMode": "Dark Mode",
    "common.lightMode": "Light Mode",
  },
};
// ===== Stubs مؤقتة =====

export const defaultFieldTranslations: Record<string, Record<string, string>> = {};

export function getFieldTranslation(
  fieldId: string,
  lang: string,
  key: string
): string {
  return defaultFieldTranslations[fieldId]?.[`${lang}_${key}`] || key;
}