// app/[lang]/fatwa/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/lib/i18n";
import TopBar from "@/components/TopBar";

// ============================================================
// أنواع البيانات
// ============================================================

type FatwaCategory = {
  id: string;
  ar: string;
  en: string;
  icon: string;
};

type Fatwa = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  tags: string[];
  source?: string;
};

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
};

// ============================================================
// التصنيفات
// ============================================================

const CATEGORIES: FatwaCategory[] = [
  { id: "all", ar: "كل الفتاوى", en: "All Fatwas", icon: "📚" },
  { id: "prayer", ar: "الصلاة", en: "Prayer", icon: "🕌" },
  { id: "fasting", ar: "الصيام", en: "Fasting", icon: "🌙" },
  { id: "zakat", ar: "الزكاة", en: "Zakat", icon: "💰" },
  { id: "hajj", ar: "الحج والعمرة", en: "Hajj & Umrah", icon: "🕋" },
  { id: "family", ar: "الأسرة", en: "Family", icon: "👨‍👩‍👧‍" },
  { id: "transactions", ar: "المعاملات", en: "Transactions", icon: "🤝" },
  { id: "aqeedah", ar: "العقيدة", en: "Aqeedah", icon: "🧠" },
  { id: "ethics", ar: "الأخلاق والآداب", en: "Ethics & Manners", icon: "🌿" },
];

// ============================================================
// نماذج فتاوى — يمكن توسيعها لاحقًا من Supabase أو JSON
// ============================================================

const FATWAS: Fatwa[] = [
  {
    id: "prayer-congregation",
    categoryId: "prayer",
    question: "ما حكم صلاة الجماعة للرجل؟",
    answer:
      "صلاة الجماعة للرجال سنة مؤكدة عند جمهور العلماء، وذهب بعض أهل العلم إلى وجوبها على القادر الحاضر. والأحوط للمسلم ألا يتركها بلا عذر، لأن فيها تعظيمًا لشعائر الله وحضورًا للقلوب وأجرًا عظيمًا.",
    tags: ["صلاة", "جماعة", "أحكام"],
    source: "مراجع فقهية عامة",
  },
  {
    id: "prayer-missing-ruku",
    categoryId: "prayer",
    question: "من نسي الركوع في الصلاة ماذا يفعل؟",
    answer:
      "إذا تذكر المصلي أنه ترك الركوع قبل أن يسجد، رجع فركع ثم سجد. وإن تذكره بعد أن سجد، فالأحوط أن يعيد الركعة، لأن الركن لا يسقط بالنسيان إلا بجبره بسجود سهو إذا كان تركه سهوًا مع الترتيب الصحيح. ومع الشك الكثير يُرجع إلى أهل العلم.",
    tags: ["صلاة", "ركوع", "نسيان"],
    source: "أصول فقهية",
  },
  {
    id: "fasting-travel",
    categoryId: "fasting",
    question: "هل يجوز الفطر في السفر في رمضان؟",
    answer:
      "نعم، يجوز للمسافر الفطر في رمضان ويقضي عدد الأيام التي أفطرها. والأفضل له أن يصوم إذا قدر ولم يشق عليه، لقوله تعالى: ﴿فَمَن كَانَ مِنكُم مَّرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ﴾.",
    tags: ["صيام", "سفر", "رمضان"],
    source: "القرآن الكريم",
  },
  {
    id: "fasting-eating-forgetfully",
    categoryId: "fasting",
    question: "من أكل أو شرب ناسيًا في نهار رمضان هل أفطر؟",
    answer:
      "لا يفطر، بل يتم صومه، لأن ذلك رزق من الله. وقد قال النبي ﷺ: «من نسي وهو صائم فأكل أو شرب فليتم صومه، فإنما أطعمه الله وسقاه».",
    tags: ["صيام", "نسيان", "رمضان"],
    source: "متفق عليه",
  },
  {
    id: "zakat-cash",
    categoryId: "zakat",
    question: "كيف تزكى الأموال النقدية؟",
    answer:
      "تُزكى النقود إذا بلغ مجموعها النصاب، ومر عليها حول قمري. والنصاب يقدر بقيمة ما يعادل 85 جرامًا من الذهب تقريبًا، وتخرج 2.5% من المجموع. ويُضم إلى النقود ما أعد للتجارة من عروض، بينما لا تُزكى_assets الشخصية التي ليست للتجارة مثل السيارة والسكن.",
    tags: ["زكاة", "مال", "نصاب"],
    source: "أحكام الزكاة",
  },
  {
    id: "hajj-umrah-order",
    categoryId: "hajj",
    question: "هل يجوز أداء العمرة قبل الحج؟",
    answer:
      "نعم، يجوز أداء العمرة قبل الحج، بل هو مشروع في أصناف النسك، خاصة في التمتع حيث يعتمر الحاج ثم يحج. والأمر واسع بحمد الله، والأهم هو التعلم على النسك الصحيح وأداء الأركان والواجبات.",
    tags: ["حج", "عمرة", "نسك"],
    source: "فقه المناسك",
  },
  {
    id: "family-divorce-word",
    categoryId: "family",
    question: "هل يقع الطلاق بالكناية؟",
    answer:
      "الكناية في الطلاق تحتاج إلى نية. فإذا قال الزوج كلامًا محتملًا مثل: «اذهبي» أو «تصرفي»، فلا يقع الطلاق إلا إذا نواه. أما التصريح مثل: «أنت طالق» فيقع به الطلاق في الجملة، مع التفصيل حسب الحالة والشروط. ومسائل الطلاق دقيقة، لذا يُنصح بمراجعة عالم ثقة.",
    tags: ["طلاق", "أسرة", "كناية"],
    source: "فقه الأسرة",
  },
  {
    id: "transactions-interest",
    categoryId: "transactions",
    question: "ما حكم الفائدة البنكية؟",
    answer:
      "الفائدة الربوية حرام، لأنها من أكل أموال الناس بالباطل، وقد جاء الوعيد الشديد في الربا. والبدائل المشروعة كثيرة مثل المرابحة الشرعية والمشاركة والمضاربة، بشرط أن تكون العقود منضبطة وضابطة للغرر والربا.",
    tags: ["ربا", "بنوك", "معاملات"],
    source: "قرآن وسنة",
  },
  {
    id: "aqeedah-tawassul",
    categoryId: "aqeedah",
    question: "ما الفرق بين التوسل المشروع والممنوع؟",
    answer:
      "التوسل المشروع يكون بما شرعه الله، مثل التوسل بأسماء الله وصفاته، وبإيمان العبد وعمله الصالح، وبدعاء الحي الصالح. أما التوسل الممنوع فهو سؤال الأموات أو الغائبين أو الاستغاثة بهم فيما لا يقدر عليه إلا الله، فهذا من باب الشرك أو ذرائعه.",
    tags: ["عقيدة", "توسل", "توحيد"],
    source: "أصول العقيدة",
  },
  {
    id: "ethics-backbiting",
    categoryId: "ethics",
    question: "ما حكم الغيبة والنميمة؟",
    answer:
      "الغيبة حرام، وهي ذكر أخي بما يكره. والنميمة أيضًا حرام، وهي نقل الكلام بين الناس على وجه الإفساد. والتوبة منها تكون بالإقلاع والندم والعزم على عدم العودة، مع رد المظالم أو الاستحلال إذا ترتب ضرر على الشخص.",
    tags: ["أخلاق", "غيبة", "نميمة"],
    source: "القرآن والسنة",
  },
  {
    id: "prayer-wudu-order",
    categoryId: "prayer",
    question: "هل الترتيب في الوضوء واجب؟",
    answer:
      "الترتيب بين أعضاء الوضوء سنة عند جمهور العلماء، وواجب عند بعضهم. والأحوط أن يتوضأ المسلم مرتبًا: غسل الوجه، ثم اليدين إلى المرفقين، ثم مسح الرأس، ثم غسل الرجلين إلى الكعبين، لحديث صفة وضوء النبي ﷺ.",
    tags: ["وضوء", "صلاة", "ترتيب"],
    source: "حديث الوضوء",
  },
  {
    id: "fasting-intention",
    categoryId: "fasting",
    question: "هل يجب تبييت النية في صيام رمضان؟",
    answer:
      "نعم، يجب تبييت النية لصيام الفرض من الليل، لحديث النبي ﷺ: «من لم يبيت الصيام من الليل فلا صيام له». والنية محلها القلب، ولا يشترط التلفظ بها.",
    tags: ["صيام", "نية", "رمضان"],
    source: "سنة نبوية",
  },
];

// ============================================================
// نصوص الواجهة
// ============================================================

const UI: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    home: string;
    description: string;
    searchPlaceholder: string;
    category: string;
    search: string;
    clearFilters: string;
    results: string;
    noResults: string;
    noResultsDesc: string;
    askQuestion: string;
    source: string;
    tags: string;
    answer: string;
    disclaimer: string;
    disclaimerText: string;
    categoriesTitle: string;
    popularTitle: string;
    readAnswer: string;
    of: string;
  }
> = {
  ar: {
    title: "الفتاوى",
    subtitle: "أسئلة فقهية وإجاباتها المختصرة",
    home: "الرئيسية",
    description:
      "قسم الفتاوى يحتوي على أسئلة فقهية شائعة في العبادات والمعاملات والأسرة والعقيدة والأخلاق، مع إجابات مختصرة ومحكمة.",
    searchPlaceholder: "ابحث في الفتاوى...",
    category: "التصنيف",
    search: "بحث",
    clearFilters: "مسح الفلاتر",
    results: "عدد النتائج",
    noResults: "لا توجد نتائج",
    noResultsDesc: "جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا.",
    askQuestion: "أرسل سؤالك",
    source: "المصدر",
    tags: "الوسوم",
    answer: "الإجابة",
    disclaimer: "تنبيه",
    disclaimerText:
      "هذه الفتاوى مختصرة للتوعية العامة، ولا تغني عن مراجعة أهل العلم المختصين في النوازل والمسائل الدقيقة.",
    categoriesTitle: "تصنيفات الفتاوى",
    popularTitle: "فتاوى مختارة",
    readAnswer: "عرض الإجابة",
    of: "من",
  },
  en: {
    title: "Fatwas",
    subtitle: "Common Islamic questions and concise answers",
    home: "Home",
    description:
      "The fatwa section contains common Islamic questions about worship, transactions, family life, creed, and ethics, with concise and careful answers.",
    searchPlaceholder: "Search fatwas...",
    category: "Category",
    search: "Search",
    clearFilters: "Clear filters",
    results: "Results",
    noResults: "No results found",
    noResultsDesc: "Try another keyword or choose a different category.",
    askQuestion: "Send your question",
    source: "Source",
    tags: "Tags",
    answer: "Answer",
    disclaimer: "Notice",
    disclaimerText:
      "These fatwas are brief for general awareness and do not replace consulting qualified scholars in detailed or unusual cases.",
    categoriesTitle: "Fatwa Categories",
    popularTitle: "Selected Fatwas",
    readAnswer: "Show answer",
    of: "of",
  },
};

// ============================================================
// دوال مساعدة
// ============================================================

function getFirstValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatNumber(value: number, lang: Lang): string {
  if (lang === "ar") {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    return String(value)
      .split("")
      .map((digit) => {
        const number = Number(digit);
        return Number.isFinite(number) ? arabicNumerals[number] : digit;
      })
      .join("");
  }

  return String(value);
}

function categoryLabel(categoryId: string, lang: Lang): string {
  const category = CATEGORIES.find((item) => item.id === categoryId);

  if (!category) {
    return categoryId;
  }

  return lang === "ar" ? category.ar : category.en;
}

function categoryIcon(categoryId: string): string {
  return CATEGORIES.find((item) => item.id === categoryId)?.icon ?? "📖";
}

function matchesQuery(fatwa: Fatwa, query: string): boolean {
  if (!query) {
    return true;
  }

  const q = query.trim().toLowerCase();

  return (
    fatwa.question.toLowerCase().includes(q) ||
    fatwa.answer.toLowerCase().includes(q) ||
    fatwa.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    categoryLabel(fatwa.categoryId, "ar").includes(query.trim()) ||
    categoryLabel(fatwa.categoryId, "en").toLowerCase().includes(q)
  );
}

function buildFatwaQuery(options: {
  q?: string;
  category?: string;
}): string {
  const search = new URLSearchParams();

  if (options.q?.trim()) {
    search.set("q", options.q.trim());
  }

  if (options.category && options.category !== "all") {
    search.set("category", options.category);
  }

  const queryString = search.toString();

  return queryString ? `?${queryString}` : "";
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    return {};
  }

  const l = lang as Lang;
  const ui = UI[l];

  return {
    title: ui.title,
    description: ui.description,
    alternates: {
      canonical: `/${l}/fatwa`,
      languages: {
        ar: "/ar/fatwa",
        en: "/en/fatwa",
      },
    },
    openGraph: {
      title: ui.title,
      description: ui.description,
      url: `/${l}/fatwa`,
      locale: l === "ar" ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ui.title,
      description: ui.description,
    },
  };
}

// ============================================================
// الصفحة
// ============================================================

export default async function FatwaPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  if (!isValidLang(lang)) {
    notFound();
  }

  const l = lang as Lang;
  const ui = UI[l];
  const isRTL = l === "ar";

  const sp = await searchParams;

  const q = getFirstValue(sp.q).trim();
  const rawCategory = getFirstValue(sp.category);
  const category =
    rawCategory && CATEGORIES.some((item) => item.id === rawCategory)
      ? rawCategory
      : "all";

  const filteredFatwas = FATWAS.filter((fatwa) => {
    if (category !== "all" && fatwa.categoryId !== category) {
      return false;
    }

    return matchesQuery(fatwa, q);
  });

  const activeCategory = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];

  return (
    <main>
      <TopBar
        title={ui.title}
        subtitle={ui.subtitle}
        backHref={`/${l}`}
        showBookmark={false}
        breadcrumb={[
          {
            label: ui.home,
            href: `/${l}`,
          },
          {
            label: ui.title,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {/* ===== بطاقة البحث والفلترة ===== */}
        <div className="card mb-8 p-6 md:p-7">
          <form
            method="get"
            action={`/${l}/fatwa`}
            className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
          >
            <div className="relative">
              <svg
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>

              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={ui.searchPlaceholder}
                className="input-islamic !ps-12"
                aria-label={ui.searchPlaceholder}
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="fatwa-category">
                {ui.category}
              </label>

              <select
                id="fatwa-category"
                name="category"
                defaultValue={category}
                className="input-islamic"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.icon} {l === "ar" ? item.ar : item.en}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary whitespace-nowrap">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              {ui.search}
            </button>
          </form>

          {(q || category !== "all") && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="badge-primary">
                {ui.category}: {activeCategory.icon}{" "}
                {l === "ar" ? activeCategory.ar : activeCategory.en}
              </span>

              {q && (
                <span className="badge-gold">
                  “{q}”
                </span>
              )}

              <Link
                href={`/${l}/fatwa`}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
                {ui.clearFilters}
              </Link>
            </div>
          )}
        </div>

        {/* ===== التصنيفات السريعة ===== */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
            {ui.categoriesTitle}
          </h2>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const isActive = item.id === category;
              const href = `/${l}/fatwa${buildFatwaQuery({
                q,
                category: item.id,
              })}`;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-night-700 dark:bg-night-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:bg-night-700 dark:hover:text-primary-300"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{l === "ar" ? item.ar : item.en}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== عدد النتائج ===== */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {ui.results}:{" "}
            <span className="text-primary-600 dark:text-primary-400">
              {formatNumber(filteredFatwas.length, l)}
            </span>{" "}
            {ui.of}{" "}
            <span className="text-slate-700 dark:text-slate-200">
              {formatNumber(FATWAS.length, l)}
            </span>
          </p>

          <Link
            href={`/${l}/contact`}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition-colors hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRTL ? "rotate-180" : ""}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {ui.askQuestion}
          </Link>
        </div>

        {/* ===== لا توجد نتائج ===== */}
        {filteredFatwas.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mb-4 text-5xl">🔎</div>

            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
              {ui.noResults}
            </h3>

            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {ui.noResultsDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${l}/fatwa`} className="btn-primary">
                {ui.clearFilters}
              </Link>

              <Link href={`/${l}/contact`} className="btn-outline">
                {ui.askQuestion}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredFatwas.map((fatwa) => {
              const cat = categoryLabel(fatwa.categoryId, l);
              const icon = categoryIcon(fatwa.categoryId);

              return (
                <details key={fatwa.id} className="card group p-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="badge-primary">
                          {icon} {cat}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
                        {fatwa.question}
                      </h3>
                    </div>

                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-transform duration-300 group-open:rotate-45 dark:bg-primary-900/40 dark:text-primary-300">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-night-700">
                    <p className="mb-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                      {ui.answer}
                    </p>

                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                      {fatwa.answer}
                    </p>

                    {fatwa.source && (
                      <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {ui.source}: {fatwa.source}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      {fatwa.tags.map((tag) => (
                        <span
                          key={tag}
                          className="badge-gold text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {/* ===== تنبيه ===== */}
        <div className="card mt-10 border-gold-200 bg-gold-50/60 p-6 dark:border-gold-800/40 dark:bg-gold-950/20">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-2xl dark:bg-gold-900/40">
              ⚠️
            </span>

            <div>
              <h3 className="mb-2 text-lg font-black text-slate-900 dark:text-white">
                {ui.disclaimer}
              </h3>

              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {ui.disclaimerText}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}