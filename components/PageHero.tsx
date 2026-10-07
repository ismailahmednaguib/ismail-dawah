type PageHeroProps = {
  icon: string;
  title: string;
  subtitle?: string;
  verse?: string;
  verseSource?: string;
  hadith?: string;
  gradient?: string;
};

export default function PageHero({
  icon,
  title,
  subtitle,
  verse,
  verseSource,
  hadith,
  gradient = "from-primary via-primary to-primary/90",
}: PageHeroProps) {
  return (
    <section className={`relative bg-gradient-to-br ${gradient} text-white py-16 md:py-20 text-center overflow-hidden`}>
      {/* زخارف خلفية */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 pattern-light opacity-5"></div>

      <div className="relative max-w-4xl mx-auto px-4">
        {/* أيقونة */}
        <div className="inline-block bg-gold/20 backdrop-blur rounded-full p-5 mb-6">
          <span className="text-6xl">{icon}</span>
        </div>

        {/* العنوان */}
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4 leading-tight">
          {title}
        </h1>

        {/* العنوان الفرعي */}
        {subtitle && (
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            {subtitle}
          </p>
        )}

        {/* آية */}
        {verse && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto mb-4 border border-white/20">
            <p className="font-serif text-xl md:text-2xl text-gold leading-relaxed mb-2">
              ﴿{verse}﴾
            </p>
            {verseSource && (
              <p className="text-white/70 text-sm">{verseSource}</p>
            )}
          </div>
        )}

        {/* حديث */}
        {hadith && !verse && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
            <p className="text-lg md:text-xl leading-relaxed mb-2">
              «{hadith}»
            </p>
          </div>
        )}
      </div>
    </section>
  );
}