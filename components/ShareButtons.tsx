"use client";

import { useState, useEffect } from "react";
import { t, type Lang } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function ShareButtons({ title, lang: langProp }: { title: string; lang?: Lang }) {
  const params = useParams();
  const lang = (langProp || params?.lang || "ar") as Lang;
  const tr = t(lang);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const links = [
    { name: "WhatsApp", icon: "💬", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, color: "bg-green-500" },
    { name: "Facebook", icon: "📘", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: "bg-blue-600" },
    { name: "Twitter", icon: "🐦", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, color: "bg-sky-500" },
    { name: "Telegram", icon: "✈️", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, color: "bg-cyan-600" },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{tr.shareNow}:</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          title={l.name}
          className={`w-8 h-8 ${l.color} text-white rounded-full grid place-items-center text-sm hover:opacity-80 transition`}
        >
          {l.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        title={tr.copyLink}
        className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gold px-2"
      >
        {copied ? tr.copied : "🔗 " + tr.copyLink}
      </button>
    </div>
  );
}