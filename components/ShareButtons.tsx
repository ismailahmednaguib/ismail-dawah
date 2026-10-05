"use client";

export default function ShareButtons({ title }: { title: string }) {
  const share = (net: string) => {
    const u = encodeURIComponent(window.location.href);
    const t = encodeURIComponent(title);
    if (net === "copy") { navigator.clipboard.writeText(window.location.href); alert("تم نسخ الرابط ✅"); return; }
    const links: Record<string, string> = {
      wa: `https://wa.me/?text=${t}%20${u}`,
      fb: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    };
    window.open(links[net], "_blank");
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      <button onClick={() => share("wa")} className="px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-bold">واتساب</button>
      <button onClick={() => share("fb")} className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-sm font-bold">فيسبوك</button>
      <button onClick={() => share("x")} className="px-4 py-2 rounded-lg bg-black text-white text-sm font-bold">إكس</button>
      <button onClick={() => share("copy")} className="px-4 py-2 rounded-lg border-2 border-gold text-gold text-sm font-bold">نسخ الرابط</button>
    </div>
  );
}