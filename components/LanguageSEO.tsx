// components/LanguageSEO.tsx
import { getAlternateLanguages } from '@/lib/i18n/helpers';

interface LanguageSEOProps {
  path: string;
  lang: string;
  title?: string;
  description?: string;
  ogImage?: string;
}

export default function LanguageSEO({
  path,
  lang,
  title,
  description,
  ogImage,
}: LanguageSEOProps) {
  const alternates = getAlternateLanguages(path);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ismailahmednaguib.vercel.app';
  const canonicalUrl = `${baseUrl}/${lang}${path}`;

  return (
    <>
      {/* hreflang tags */}
      {alternates.map(({ lang: altLang, href }) => (
        <link key={altLang} rel="alternate" hrefLang={altLang} href={href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/ar${path}`} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="أكاديمية إسماعيل أحمد نجيب" />
      <meta property="og:locale" content={lang === 'ar' ? 'ar_EG' : `${lang}_${lang.toUpperCase()}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </>
  );
}