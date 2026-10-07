import Link from "next/link";
import { IslamicIcon } from "@/lib/icons";

type IslamicCardProps = {
  href: string;
  icon: string;
  title: string;
  description: string;
  verse?: string;
  hadith?: string;
  badge?: string;
  gradient?: string;
};

export default function IslamicCard({
  href,
  icon,
  title,
  description,
  verse,
  hadith,
  badge,
  gradient = "from-primary to-primary/80",
}: IslamicCardProps) {
  return (
    <Link
      href={href}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md overflow-hidden border border-black/5 dark:border-white/10 hover:border-gold/60 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 block"
    >
      {/* زخرفة خلفية */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all"></div>
      
      {/* الأيقونة */}
      <div className="relative mb-4">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
          <IslamicIcon name={icon} size={28} />
        </div>
      </div>

      {/* العنوان */}
      <h3 className="relative font-serif text-xl text-primary dark:text-gold font-bold mb-2 group-hover:text-gold transition-colors">
        {title}
      </h3>

      {/* الوصف */}
      <p className="relative text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
        {description}
      </p>

      {/* آية أو حديث */}
      {verse && (
        <div className="relative bg-cream-dark dark:bg-gray-700 rounded-lg p-3 mb-3 border-r-4 border-gold">
          <p className="font-serif text-xs text-primary dark:text-gold leading-relaxed">
            ﴿{verse}﴾
          </p>
        </div>
      )}

      {hadith && (
        <div className="relative bg-cream-dark dark:bg-gray-700 rounded-lg p-3 mb-3 border-r-4 border-primary">
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            «{hadith}»
          </p>
        </div>
      )}

      {/* Badge */}
      {badge && (
        <span className="relative inline-block bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </span>
      )}

      {/* سهم */}
      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-gold text-2xl">←</span>
      </div>
    </Link>
  );
}