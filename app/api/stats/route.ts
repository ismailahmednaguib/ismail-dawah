import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getContent } from "@/lib/content";

function getAdminFromCookie(cookieHeader: string | null): number | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    const data = JSON.parse(Buffer.from(match[1], "base64").toString());
    if (data.role !== "admin") return null;
    return data.userId;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const adminId = getAdminFromCookie(req.headers.get("cookie"));
  if (!adminId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const c = await getContent();
  
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  let usersCount = 0;
  let questionsCount = 0;
  let pendingQuestions = 0;

  if (url && key) {
    const supabase = createClient(url, key);
    
    const { count: users } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    usersCount = users || 0;

    const { count: questions } = await supabase
      .from("user_questions")
      .select("*", { count: "exact", head: true });
    questionsCount = questions || 0;

    const { count: pending } = await supabase
      .from("user_questions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingQuestions = pending || 0;
  }

  const stats = {
    content: {
      fields: c.fields.length,
      lessons: c.lessons.length,
      videos: c.videos.length,
      articles: c.articles.length,
      books: c.books.length,
      audio: c.audio.length,
      photos: c.photos.length,
      fatwas: c.fatwas.length,
      doubts: c.doubts.length,
      projects: c.projects.length,
      news: c.news.length,
      places: c.places.length,
      adhkar: c.adhkar.length,
    },
    users: {
      total: usersCount,
    },
    questions: {
      total: questionsCount,
      pending: pendingQuestions,
      answered: questionsCount - pendingQuestions,
    },
    languages: 13,
  };

  return NextResponse.json(stats);
}