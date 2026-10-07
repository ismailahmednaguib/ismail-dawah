import React from "react";

type IconProps = {
  className?: string;
  size?: number;
};

// أيقونات SVG مخصصة بأسلوب إسلامي
export const Icons = {
  Mosque: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L8 6v2H4v12h16V8h-4V6l-4-4zm0 2.828L14 7v1h-4V7l2-2.172zM6 10h12v8H6v-8z"/>
    </svg>
  ),
  
  Quran: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
    </svg>
  ),
  
  Prayer: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v5h6v-5c2-1 4-3 4-6 0-4-3-7-7-7z"/>
    </svg>
  ),
  
  Knowledge: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
    </svg>
  ),
  
  Fatwa: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  ),
  
  Heart: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  
  Star: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  
  Crescent: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"/>
      <path d="M12 6a6 6 0 100 12 6 6 0 000-12z"/>
    </svg>
  ),
  
  Kaaba: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 21h18v-2H3v2zM5 13h2v6H5v-6zm4-4h2v10H9V9zm4 2h2v8h-2v-8zm4-6h2v14h-2V5z"/>
    </svg>
  ),
  
  Light: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
    </svg>
  ),
};

// مكون أيقونة موحد
export function IslamicIcon({ name, className = "", size = 24 }: { name: string; className?: string; size?: number }) {
  const icons: Record<string, React.FC<IconProps>> = {
    mosque: Icons.Mosque,
    quran: Icons.Quran,
    prayer: Icons.Prayer,
    knowledge: Icons.Knowledge,
    fatwa: Icons.Fatwa,
    heart: Icons.Heart,
    star: Icons.Star,
    crescent: Icons.Crescent,
    kaaba: Icons.Kaaba,
    light: Icons.Light,
  };

  const IconComponent = icons[name] || Icons.Star;
  return <IconComponent className={className} size={size} />;
}