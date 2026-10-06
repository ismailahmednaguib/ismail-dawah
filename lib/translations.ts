import type { Lang } from "./i18n";

export const defaultFieldTranslations: Record<string, Record<Lang, { name: string; desc: string }>> = {
  aqeedah: {
    ar: { name: "العقيدة", desc: "التوحيد وأركان الإيمان والرد على الشبهات العقدية" },
    en: { name: "Aqeedah", desc: "Monotheism, pillars of faith, and responding to doctrinal doubts" },
    fr: { name: "Aqida", desc: "Monothéisme, piliers de la foi et réponse aux doutes doctrinaux" },
    ur: { name: "عقیدہ", desc: "توحید، ایمان کے ارکان اور عقیدتی شبہات کا جواب" },
    tr: { name: "Akaid", desc: "Tevhid, imanın şartları ve akaid şüphelerine cevaplar" },
    id: { name: "Akidah", desc: "Tauhid, rukun iman, dan menjawab keraguan akidah" },
  },
  fiqh: {
    ar: { name: "الفقه", desc: "العبادات والمعاملات والأحوال الشخصية" },
    en: { name: "Fiqh", desc: "Worship, transactions, and personal status" },
    fr: { name: "Fiqh", desc: "Adorations, transactions et statut personnel" },
    ur: { name: "فقہ", desc: "عبادات، معاملات اور ذاتی حیثیت" },
    tr: { name: "Fıkıh", desc: "İbadetler, muameleler ve şahsi hal" },
    id: { name: "Fiqih", desc: "Ibadah, muamalah, dan hukum keluarga" },
  },
  usul: {
    ar: { name: "أصول الفقه", desc: "القواعد التي يُبنى عليها الاستنباط" },
    en: { name: "Usul al-Fiqh", desc: "Principles upon which legal deduction is built" },
    fr: { name: "Usul al-Fiqh", desc: "Principes sur lesquels repose la déduction juridique" },
    ur: { name: "اصول الفقہ", desc: "وہ قواعد جن پر استنباط کی بنیاد رکھی جاتی ہے" },
    tr: { name: "Fıkıh Usulü", desc: "Hüküm çıkarımının üzerine kurulduğu kurallar" },
    id: { name: "Ushul Fiqih", desc: "Kaidah-kaidah yang menjadi dasar istinbath" },
  },
  hadith: {
    ar: { name: "الحديث وعلومه", desc: "المتن والسند ومصطلح الحديث" },
    en: { name: "Hadith Sciences", desc: "Matn, isnad, and hadith terminology" },
    fr: { name: "Sciences du hadith", desc: "Texte, chaîne et terminologie du hadith" },
    ur: { name: "حدیث اور اس کے علوم", desc: "متن، سند اور حدیث کی اصطلاحات" },
    tr: { name: "Hadis ve İlimleri", desc: "Metin, senet ve hadis ıstılahları" },
    id: { name: "Hadis dan Ilmu-ilmunya", desc: "Matan, sanad, dan istilah hadis" },
  },
  tafsir: {
    ar: { name: "التفسير", desc: "تدبُّر القرآن وبيان معانيه" },
    en: { name: "Tafsir", desc: "Reflection on the Quran and explaining its meanings" },
    fr: { name: "Tafsir", desc: "Méditation du Coran et explication de ses sens" },
    ur: { name: "تفسیر", desc: "قرآن پر تدبر اور اس کے معانی کا بیان" },
    tr: { name: "Tefsir", desc: "Kur'an'ı tefekkür ve anlamlarının açıklanması" },
    id: { name: "Tafsir", desc: "Merenungi Al-Qur'an dan menjelaskan maknanya" },
  },
  "quran-sciences": {
    ar: { name: "علوم القرآن", desc: "أسباب النزول والناسخ والمنسوخ" },
    en: { name: "Quranic Sciences", desc: "Reasons for revelation, abrogating and abrogated" },
    fr: { name: "Sciences coraniques", desc: "Causes de la révélation, abrogeant et abrogé" },
    ur: { name: "علوم القرآن", desc: "اسباب نزول، ناسخ اور منسوخ" },
    tr: { name: "Kur'an İlimleri", desc: "Nüzul sebepleri, nâsih ve mensûh" },
    id: { name: "Ulumul Qur'an", desc: "Asbabun nuzul, nasikh dan mansukh" },
  },
  seerah: {
    ar: { name: "السيرة النبوية", desc: "حياة النبي ﷺ ودروسها العملية" },
    en: { name: "Prophetic Biography", desc: "The life of the Prophet ﷺ and its practical lessons" },
    fr: { name: "Biographie prophétique", desc: "La vie du Prophète ﷺ et ses leçons pratiques" },
    ur: { name: "سیرت النبی ﷺ", desc: "نبی ﷺ کی حیات اور اس کے عملی اسباق" },
    tr: { name: "Siyer", desc: "Peygamber ﷺ'in hayatı ve pratik dersleri" },
    id: { name: "Sirah Nabawiyah", desc: "Kehidupan Nabi ﷺ dan pelajaran praktisnya" },
  },
  history: {
    ar: { name: "التاريخ الإسلامي", desc: "من الخلفاء الراشدين إلى العصر الحديث" },
    en: { name: "Islamic History", desc: "From the Rightly Guided Caliphs to the modern era" },
    fr: { name: "Histoire islamique", desc: "Des califes bien guidés à l'ère moderne" },
    ur: { name: "اسلامی تاریخ", desc: "خلفائے راشدین سے جدید دور تک" },
    tr: { name: "İslam Tarihi", desc: "Hulefa-i Raşidin'den modern çağa kadar" },
    id: { name: "Sejarah Islam", desc: "Dari Khulafaur Rasyidin hingga era modern" },
  },
  comparative: {
    ar: { name: "مقارنة الأديان", desc: "دراسة الأديان والحوار والرد على الشبهات" },
    en: { name: "Comparative Religion", desc: "Study of religions, dialogue, and responding to doubts" },
    fr: { name: "Religion comparée", desc: "Étude des religions, dialogue et réponse aux doutes" },
    ur: { name: "مقابلہ ادیان", desc: "ادیان کا مطالعہ، مکالمہ اور شبہات کا جواب" },
    tr: { name: "Dinler Arası Karşılaştırma", desc: "Dinlerin incelenmesi, diyalog ve şüphelere cevap" },
    id: { name: "Perbandingan Agama", desc: "Studi agama, dialog, dan menjawab keraguan" },
  },
  akhlaq: {
    ar: { name: "الأخلاق والرقائق", desc: "تزكية النفس ورقائق القلوب" },
    en: { name: "Ethics & Spirituality", desc: "Purification of the soul and heart softeners" },
    fr: { name: "Éthique et spiritualité", desc: "Purification de l'âme et adoucissants des cœurs" },
    ur: { name: "اخلاق اور رقائق", desc: "نفس کی تزکیہ اور دلوں کے رقائق" },
    tr: { name: "Ahlak ve Kalp Yumuşatıcılar", desc: "Nefis tezkiyesi ve kalp yumuşatıcı sözler" },
    id: { name: "Akhlak dan Raqa'iq", desc: "Tazkiyatun nafs dan pelembut hati" },
  },
  dawah: {
    ar: { name: "الدعوة وأصولها", desc: "فقه الدعوة ووسائلها المعاصرة" },
    en: { name: "Da'wah & Principles", desc: "Fiqh of da'wah and its contemporary means" },
    fr: { name: "Da'wa et principes", desc: "Fiqh de la da'wa et ses moyens contemporains" },
    ur: { name: "دعوت اور اس کے اصول", desc: "دعوت کا فقہ اور اس کے جدید ذرائع" },
    tr: { name: "Davet ve Esasları", desc: "Davet fıkhı ve çağdaş vasıtaları" },
    id: { name: "Dakwah dan Prinsip-prinsipnya", desc: "Fiqih dakwah dan sarana kontemporer" },
  },
  arabic: {
    ar: { name: "اللغة العربية", desc: "النحو والصرف والبلاغة لخدمة النصوص" },
    en: { name: "Arabic Language", desc: "Grammar, morphology, and rhetoric to serve texts" },
    fr: { name: "Langue arabe", desc: "Grammaire, morphologie et rhétorique au service des textes" },
    ur: { name: "عربی زبان", desc: "نحو، صرف اور بلاغت نصوص کی خدمت کے لیے" },
    tr: { name: "Arap Dili", desc: "Nahiv, sarf ve belagat - metinlere hizmet için" },
    id: { name: "Bahasa Arab", desc: "Nahwu, sharaf, dan balaghah untuk melayani teks" },
  },
  tajweed: {
    ar: { name: "التجويد والقراءات", desc: "حُسن تلاوة كتاب الله" },
    en: { name: "Tajweed & Readings", desc: "Beautiful recitation of the Book of Allah" },
    fr: { name: "Tajwid et lectures", desc: "Belle récitation du Livre d'Allah" },
    ur: { name: "تجوید اور قراءات", desc: "اللہ کی کتاب کی اچھی تلاوت" },
    tr: { name: "Tecvid ve Kıraatler", desc: "Allah'ın kitabının güzel tilaveti" },
    id: { name: "Tajwid dan Qira'at", desc: "Tilawah yang baik terhadap Kitabullah" },
  },
  economics: {
    ar: { name: "الاقتصاد الإسلامي", desc: "المعاملات المالية المعاصرة" },
    en: { name: "Islamic Economics", desc: "Contemporary financial transactions" },
    fr: { name: "Économie islamique", desc: "Transactions financières contemporaines" },
    ur: { name: "اسلامی معاشیات", desc: "جدید مالی معاملات" },
    tr: { name: "İslam Ekonomisi", desc: "Çağdaş mali muameleler" },
    id: { name: "Ekonomi Islam", desc: "Transaksi keuangan kontemporer" },
  },
  faraaid: {
    ar: { name: "الفرائض والمواريث", desc: "قسمة التركات وفق الكتاب والسنة" },
    en: { name: "Inheritance (Fara'id)", desc: "Division of estates according to the Quran and Sunnah" },
    fr: { name: "Successions (Fara'id)", desc: "Répartition des héritages selon le Coran et la Sunna" },
    ur: { name: "فرائض اور میراث", desc: "قرآن و سنت کے مطابق ترکات کی تقسیم" },
    tr: { name: "Ferâiz", desc: "Kur'an ve Sünnet'e göre miras taksimi" },
    id: { name: "Faraidh dan Waris", desc: "Pembagian harta waris menurut Al-Qur'an dan Sunnah" },
  },
  family: {
    ar: { name: "ركن الأسرة", desc: "تربية وأزواج وبيوت مسلمة" },
    en: { name: "Family Corner", desc: "Upbringing, spouses, and Muslim homes" },
    fr: { name: "Espace famille", desc: "Éducation, époux et foyers musulmans" },
    ur: { name: "خاندان کا رکن", desc: "تربیت، میاں بیوی اور مسلم گھر" },
    tr: { name: "Aile Köşesi", desc: "Terbiye, eşler ve Müslüman evler" },
    id: { name: "Ruang Keluarga", desc: "Tarbiyah, pasangan, dan rumah tangga muslim" },
  },
  youth: {
    ar: { name: "ركن الشباب", desc: "قضايا معاصرة بلسان شاب" },
    en: { name: "Youth Corner", desc: "Contemporary issues with a young voice" },
    fr: { name: "Espace jeunesse", desc: "Questions contemporaines avec une voix jeune" },
    ur: { name: "نوجوانوں کا رکن", desc: "جدید مسائل نوجوانوں کی زبان میں" },
    tr: { name: "Gençlik Köşesi", desc: "Gençlerin diliyle güncel meseleler" },
    id: { name: "Ruang Pemuda", desc: "Isu-isu kontemporer dengan suara pemuda" },
  },
};

export function getFieldTranslation(
  slug: string,
  lang: Lang,
  fallback: { name: string; desc: string },
  overrides?: Record<string, Record<string, { name: string; desc: string }>>
) {
  if (overrides?.[slug]?.[lang]) {
    return overrides[slug][lang];
  }
  const all = defaultFieldTranslations[slug];
  if (!all) return fallback;
  return all[lang] || fallback;
}