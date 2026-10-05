import type { Lesson, Video, ScheduleItem } from "@/lib/data";

export function SectionTitle({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="text-center mb-12">
      <h2 className={`font-serif text-4xl ${light ? "text-gold" : "text-primary"}`}>{children}</h2>
      <div className="text-gold text-xl mt-2">✦</div>
    </div>
  );
}

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-md border-t-4 border-gold hover:-translate-y-1 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-3">
        <span className="bg-cream-dark text-primary px-3 py-1 rounded-full text-xs font-bold">
          {lesson.category}
        </span>
        <span className="text-xs text-gray-400">{lesson.date}</span>
      </div>
      <h3 className="font-serif text-xl text-primary mb-3">{lesson.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{lesson.desc}</p>
      {lesson.link ? (
        <a href={lesson.link} target="_blank" rel="noopener" className="text-gold font-bold text-sm hover:underline">
          استمع الآن ←
        </a>
      ) : (
        <span className="text-gray-400 text-sm">🔒 الرابط متاح قريبًا</span>
      )}
    </article>
  );
}

function youtubeId(url: string): string {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : "";
}

export function VideoCard({ video }: { video: Video }) {
  const id = youtubeId(video.url);
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
      <div className="aspect-video bg-primary-light grid place-items-center">
        {id ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title={video.title}
            className="w-full h-full"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <span className="text-5xl">🎬</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg text-primary mb-2">{video.title}</h3>
        <p className="text-gray-600 text-sm">{video.desc}</p>
      </div>
    </article>
  );
}

export function ScheduleRow({ item }: { item: ScheduleItem }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border-r-4 border-gold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="font-black text-primary text-lg min-w-20">{item.day}</div>
      <div className="flex-1">
        <h4 className="font-bold">{item.topic}</h4>
        <p className="text-sm text-gray-500">🕐 {item.time} — 📍 {item.place}</p>
      </div>
    </div>
  );
}