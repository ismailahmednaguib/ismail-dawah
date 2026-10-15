// lib/i18n/dictionaries.ts

export interface Dictionary {
  nav: {
    home: string;
    learn: string;
    quran: string;
    fatwa: string;
    about: string;
    search: string;
    admin: string;
    login: string;
    register: string;
  };
  common: {
    readMore: string;
    loading: string;
    noResults: string;
    searchPlaceholder: string;
    publishedAt: string;
    views: string;
    share: string;
    bookmark: string;
    backToList: string;
    languageNotice: string;
  };
  content: {
    article: string;
    lesson: string;
    course: string;
    book: string;
    fatwa: string;
    khutbah: string;
    audio: string;
    video: string;
    hadith: string;
    duaa: string;
    story: string;
    research: string;
  };
  filters: {
    all: string;
    type: string;
    audience: string;
    ageGroup: string;
    level: string;
    clearFilters: string;
    results: string;
  };
  footer: {
    rights: string;
    aboutUs: string;
    contactUs: string;
    privacy: string;
    terms: string;
  };
}

const ar: Dictionary = {
  nav: {
    home: 'الرئيسية',
    learn: 'المكتبة',
    quran: 'القرآن الكريم',
    fatwa: 'الفتاوى',
    about: 'عن الأكاديمية',
    search: 'البحث',
    admin: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
  },
  common: {
    readMore: 'اقرأ المزيد',
    loading: 'جارٍ التحميل...',
    noResults: 'لا توجد نتائج',
    searchPlaceholder: '🔍 ابحث في المكتبة الإسلامية...',
    publishedAt: 'نُشر في',
    views: 'مشاهدة',
    share: 'مشاركة',
    bookmark: 'حفظ',
    backToList: 'العودة إلى القائمة',
    languageNotice: 'هذا المحتوى غير متوفر بعد باللغة المطلوبة. يتم عرضه باللغة',
  },
  content: {
    article: 'مقال',
    lesson: 'درس',
    course: 'دورة',
    book: 'كتاب',
    fatwa: 'فتوى',
    khutbah: 'خطبة',
    audio: 'صوت',
    video: 'فيديو',
    hadith: 'حديث',
    duaa: 'دعاء',
    story: 'قصة',
    research: 'بحث',
  },
  filters: {
    all: 'الكل',
    type: 'النوع',
    audience: 'الجمهور',
    ageGroup: 'الفئة العمرية',
    level: 'المستوى',
    clearFilters: 'مسح الفلاتر',
    results: 'نتيجة',
  },
  footer: {
    rights: 'جميع الحقوق محفوظة © منصة إسماعيل أحمد نجيب',
    aboutUs: 'من نحن',
    contactUs: 'اتصل بنا',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الاستخدام',
  },
};

const en: Dictionary = {
  nav: {
    home: 'Home',
    learn: 'Library',
    quran: 'Holy Quran',
    fatwa: 'Fatwas',
    about: 'About',
    search: 'Search',
    admin: 'Admin Panel',
    login: 'Login',
    register: 'Register',
  },
  common: {
    readMore: 'Read More',
    loading: 'Loading...',
    noResults: 'No results found',
    searchPlaceholder: '🔍 Search the Islamic library...',
    publishedAt: 'Published on',
    views: 'views',
    share: 'Share',
    bookmark: 'Bookmark',
    backToList: 'Back to list',
    languageNotice: 'This content is not yet available in the requested language. Showing in',
  },
  content: {
    article: 'Article',
    lesson: 'Lesson',
    course: 'Course',
    book: 'Book',
    fatwa: 'Fatwa',
    khutbah: 'Sermon',
    audio: 'Audio',
    video: 'Video',
    hadith: 'Hadith',
    duaa: 'Dua',
    story: 'Story',
    research: 'Research',
  },
  filters: {
    all: 'All',
    type: 'Type',
    audience: 'Audience',
    ageGroup: 'Age Group',
    level: 'Level',
    clearFilters: 'Clear Filters',
    results: 'results',
  },
  footer: {
    rights: 'All rights reserved © Ismail Ahmed Naguib Academy',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  },
};

const fr: Dictionary = {
  nav: {
    home: 'Accueil',
    learn: 'Bibliothèque',
    quran: 'Saint Coran',
    fatwa: 'Fatwas',
    about: 'À propos',
    search: 'Recherche',
    admin: 'Panneau d\'administration',
    login: 'Connexion',
    register: 'Créer un compte',
  },
  common: {
    readMore: 'Lire la suite',
    loading: 'Chargement...',
    noResults: 'Aucun résultat',
    searchPlaceholder: '🔍 Rechercher dans la bibliothèque islamique...',
    publishedAt: 'Publié le',
    views: 'vues',
    share: 'Partager',
    bookmark: 'Marque-page',
    backToList: 'Retour à la liste',
    languageNotice: 'Ce contenu n\'est pas encore disponible dans la langue demandée. Affichage en',
  },
  content: {
    article: 'Article',
    lesson: 'Leçon',
    course: 'Cours',
    book: 'Livre',
    fatwa: 'Fatwa',
    khutbah: 'Sermon',
    audio: 'Audio',
    video: 'Vidéo',
    hadith: 'Hadith',
    duaa: 'Invocation',
    story: 'Histoire',
    research: 'Recherche',
  },
  filters: {
    all: 'Tout',
    type: 'Type',
    audience: 'Public',
    ageGroup: 'Groupe d\'âge',
    level: 'Niveau',
    clearFilters: 'Effacer les filtres',
    results: 'résultats',
  },
  footer: {
    rights: 'Tous droits réservés © Plateforme Ismail Ahmed Naguib',
    aboutUs: 'À propos',
    contactUs: 'Nous contacter',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d\'utilisation',
  },
};

const ur: Dictionary = {
  nav: {
    home: 'صفحہ ראשی',
    learn: 'لائبریری',
    quran: 'قران مجید',
    fatwa: 'فتاویٰ',
    about: 'ہمارے بارے میں',
    search: 'تلاش',
    admin: 'ایڈمین پینل',
    login: 'لاگ ان',
    register: 'رجسٹر کریں',
  },
  common: {
    readMore: 'مزید پڑھیں',
    loading: 'لوڈ ہو رہا ہے...',
    noResults: 'کoi نتیجہ نہیں ملا',
    searchPlaceholder: '🔍 اسلامی لائبریری میں تلاش کریں...',
    publishedAt: 'شائع ہوا',
    views: 'منظر',
    share: 'شیئر کریں',
    bookmark: 'بک مارک',
    backToList: 'فہرست پر واپس جائیں',
    languageNotice: 'یہ مواد مطلوبہ زبان میں ابھی دستیاب نہیں ہے۔ یہ زبان میں دکھایا جا رہا ہے',
  },
  content: {
    article: 'مضمون',
    lesson: 'سبق',
    course: 'کورس',
    book: 'کتاب',
    fatwa: 'فتویٰ',
    khutbah: 'خطبہ',
    audio: 'آڈیو',
    video: 'ویڈیو',
    hadith: 'حدیث',
    duaa: 'دعاء',
    story: 'کہانی',
    research: 'تحقیق',
  },
  filters: {
    all: 'سب',
    type: 'قسم',
    audience: 'سامعین',
    ageGroup: 'عمر کی группа',
    level: 'لیول',
    clearFilters: 'فلٹر صاف کریں',
    results: 'نتائج',
  },
  footer: {
    rights: 'جملہ حقوق محفوظ © إسماعيل أحمد نجیب پلیٹ فارم',
    aboutUs: 'ہمارے بارے میں',
    contactUs: 'ہم سے رابطہ کریں',
    privacy: 'व्यवसाय/خصوصیता پالیسی',
    terms: 'خدمات کی شرائط',
  },
};

const id: Dictionary = {
  nav: {
    home: 'Beranda',
    learn: 'Perpustakaan',
    quran: 'Al-Qur\'an',
    fatwa: 'Fatwa',
    about: 'Tentang',
    search: 'Pencarian',
    admin: 'Panel Admin',
    login: 'Masuk',
    register: 'Daftar',
  },
  common: {
    readMore: 'Baca selengkapnya',
    loading: 'Memuat...',
    noResults: 'Tidak ada hasil',
    searchPlaceholder: '🔍 Cari di perpustakaan Islam...',
    publishedAt: 'Dipublish pada',
    views: 'tayangan',
    share: 'Bagikan',
    bookmark: 'Tandai',
    backToList: 'Kembali ke daftar',
    languageNotice: 'Konten ini belum tersedia dalam bahasa yang diminta. Ditampilkan dalam',
  },
  content: {
    article: 'Artikel',
    lesson: 'Pelajaran',
    course: 'Kursus',
    book: 'Buku',
    fatwa: 'Fatwa',
    khutbah: 'Khotbah',
    audio: 'Audio',
    video: 'Video',
    hadith: 'Hadits',
    duaa: 'Doa',
    story: 'Cerita',
    research: 'Riset',
  },
  filters: {
    all: 'Semua',
    type: 'Tipe',
    audience: 'Audiens',
    ageGroup: 'Kelompok usia',
    level: 'Tingkat',
    clearFilters: 'Hapus filter',
    results: 'hasil',
  },
  footer: {
    rights: 'Hak cipta dilindungi undang-undang © Platform Ismail Ahmed Naguib',
    aboutUs: 'Tentang Kami',
    contactUs: 'Hubungi Kami',
    privacy: 'Kebijakan Privasi',
    terms: 'Syarat Ketentuan',
  },
};

const tr: Dictionary = {
  nav: {
    home: 'Ana Sayfa',
    learn: 'Kütüphane',
    quran: 'Kur\'an-ı Kerim',
    fatwa: 'fetva',
    about: 'Hakkında',
    search: 'Arama',
    admin: 'Yönetim Paneli',
    login: 'Giriş',
    register: 'Kayıt Ol',
  },
  common: {
    readMore: 'Devamını oku',
    loading: 'Yükleniyor...',
    noResults: 'Sonuç bulunamadı',
    searchPlaceholder: '🔍 İslam kütüphanesinde ara...',
    publishedAt: 'Yayın tarihi',
    views: 'görüntüleme',
    share: 'Paylaş',
    bookmark: 'Yer işareti',
    backToList: 'Listeye dön',
    languageNotice: 'Bu içerik istenen dilde henüz mevcut değil. Bu dilde gösteriliyor',
  },
  content: {
    article: 'Makale',
    lesson: 'Ders',
    course: 'Ders',
    book: 'Kitap',
    fatwa: 'Fetva',
    khutbah: 'Hutbe',
    audio: 'Ses',
    video: 'Video',
    hadith: 'Hadis',
    duaa: 'Dua',
    story: 'Hikaye',
    research: 'Araştırma',
  },
  filters: {
    all: 'Hepsi',
    type: 'Tür',
    audience: 'Kitle',
    ageGroup: 'Yaş grubu',
    level: 'Seviye',
    clearFilters: 'Filtreleri temizle',
    results: 'sonuç',
  },
  footer: {
    rights: 'Tüm hakları saklı © Ismail Ahmed Naguib Platformu',
    aboutUs: 'Hakkımızda',
    contactUs: 'Bizimle İletişime Geçin',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Şartları',
  },
};

const es: Dictionary = {
  nav: {
    home: 'Inicio',
    learn: 'Biblioteca',
    quran: 'Sagrado Corán',
    fatwa: 'Fatwas',
    about: 'Acerca de',
    search: 'Buscar',
    admin: 'Panel de administración',
    login: 'Iniciar sesión',
    register: 'Regístrate',
  },
  common: {
    readMore: 'Leer más',
    loading: 'Cargando...',
    noResults: 'No se encontraron resultados',
    searchPlaceholder: '🔍 Buscar en la biblioteca islámica...',
    publishedAt: 'Publicado el',
    views: 'vistas',
    share: 'Compartir',
    bookmark: 'Marcar',
    backToList: 'Volver a la lista',
    languageNotice: 'Este contenido aún no está disponible en el idioma solicitado. Mostrando en',
  },
  content: {
    article: 'Artículo',
    lesson: 'Lección',
    course: 'Curso',
    book: 'Libro',
    fatwa: 'Fatwa',
    khutbah: 'Sermón',
    audio: 'Audio',
    video: 'Video',
    hadith: 'Hadiz',
    duaa: 'Dua',
    story: 'Historia',
    research: 'Investigación',
  },
  filters: {
    all: 'Todo',
    type: 'Tipo',
    audience: 'Público',
    ageGroup: 'Grupo de edad',
    level: 'Nivel',
    clearFilters: 'Limpiar filtros',
    results: 'resultados',
  },
  footer: {
    rights: 'Todos los derechos reservados © Plataforma Ismail Ahmed Naguib',
    aboutUs: 'Acerca de',
    contactUs: 'Contáctenos',
    privacy: 'Política de privacidad',
    terms: 'Términos de servicio',
  },
};

const de: Dictionary = {
  nav: {
    home: 'Startseite',
    learn: 'Bibliothek',
    quran: 'Heiliger Quran',
    fatwa: 'Fatwas',
    about: 'Über uns',
    search: 'Suche',
    admin: 'Admin-Panel',
    login: 'Anmelden',
    register: 'Registrieren',
  },
  common: {
    readMore: 'Weiterlesen',
    loading: 'Wird geladen...',
    noResults: 'Keine Ergebnisse',
    searchPlaceholder: '🔍 In der islamischen Bibliothek suchen...',
    publishedAt: 'Veröffentlicht am',
    views: 'Aufrufe',
    share: 'Teilen',
    bookmark: 'Lesezeichen',
    backToList: 'Zurück zur Liste',
    languageNotice: 'Dieser Inhalt ist noch nicht in der gewünschten Sprache verfügbar. Wird angezeigt in',
  },
  content: {
    article: 'Artikel',
    lesson: 'Lektion',
    course: 'Kurs',
    book: 'Buch',
    fatwa: 'Fatwa',
    khutbah: 'Predigt',
    audio: 'Audio',
    video: 'Video',
    hadith: 'Hadith',
    duaa: 'Dua',
    story: 'Geschichte',
    research: 'Forschung',
  },
  filters: {
    all: 'Alle',
    type: 'Typ',
    audience: 'Zielgruppe',
    ageGroup: 'Altersgruppe',
    level: 'Level',
    clearFilters: 'Filter löschen',
    results: 'Ergebnisse',
  },
  footer: {
    rights: 'Alle Rechte vorbehalten © Plattform Ismail Ahmed Naguib',
    aboutUs: 'Über uns',
    contactUs: 'Kontakt',
    privacy: 'Datenschutzrichtlinie',
    terms: 'Nutzungsbedingungen',
  },
};

const dictionaries: Record<string, Dictionary> = { ar, en, fr, ur, id, tr, es, de };

export function getDictionary(lang: string): Dictionary {
  return dictionaries[lang] ?? dictionaries[DEFAULT_LANGUAGE] ?? ar;
}

import { DEFAULT_LANGUAGE } from './config';