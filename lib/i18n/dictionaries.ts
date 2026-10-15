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

const dictionaries: Record<string, Dictionary> = { ar, en };

export function getDictionary(lang: string): Dictionary {
  return dictionaries[lang] ?? dictionaries[DEFAULT_LANGUAGE] ?? ar;
}

import { DEFAULT_LANGUAGE } from './config';