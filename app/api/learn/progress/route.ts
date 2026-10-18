import { NextResponse } from "next/server";
import { createAdminClient, requireAuthResponse } from "@/lib/auth";
import { isAllowedMutationOrigin } from "@/lib/security/origin";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_POSITION_SECONDS = 7 * 24 * 60 * 60;

type ProgressBody = {
  content_id?: unknown;
  completed?: unknown;
  position_seconds?: unknown;
};

function contentIdFrom(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const contentId = value.trim();
  return UUID_PATTERN.test(contentId) ? contentId : null;
}

function sessionUserId(value: string): string | null {
  const userId = value.trim();
  return userId && userId.length <= 255 ? userId : null;
}

function positionFrom(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const position = Number(value);
  if (!Number.isSafeInteger(position) || position < 0) return null;
  return Math.min(position, MAX_POSITION_SECONDS);
}

function authRedirect(request: Request): string {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
}

export async function GET(request: Request) {
  const auth = await requireAuthResponse(request, authRedirect(request));
  if (!auth.ok) return auth.response;

  const userId = sessionUserId(auth.user.id);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 403 });
  }

  const requestedContentId = new URL(request.url).searchParams.get("content_id");
  const contentId = contentIdFrom(requestedContentId);
  if (requestedContentId !== null && !contentId) {
    return NextResponse.json(
      { ok: false, error: "invalid_content_id" },
      { status: 400 }
    );
  }
  const client = createAdminClient();
  let query = client
    .from("learner_content_progress")
    .select("content_id,last_position_seconds,completed_at,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (contentId) query = query.eq("content_id", contentId);

  const { data, error } = contentId
    ? await query.maybeSingle()
    : await query;

  if (error) {
    console.error("[learn/progress GET]", error);
    return NextResponse.json(
      { ok: false, error: "progress_unavailable" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    progress: contentId ? data ?? null : undefined,
    items: contentId ? undefined : data ?? [],
  });
}

export async function POST(request: Request) {
  if (!isAllowedMutationOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "untrusted_origin" },
      { status: 403 }
    );
  }

  const auth = await requireAuthResponse(request, authRedirect(request));
  if (!auth.ok) return auth.response;

  const userId = sessionUserId(auth.user.id);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 403 });
  }

  let body: ProgressBody;
  try {
    body = (await request.json()) as ProgressBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const contentId = contentIdFrom(body.content_id);
  if (!contentId) {
    return NextResponse.json(
      { ok: false, error: "invalid_content_id" },
      { status: 400 }
    );
  }

  const client = createAdminClient();
  const { data: content, error: contentError } = await client
    .from("content")
    .select("id,status")
    .eq("id", contentId)
    .maybeSingle();

  if (contentError) {
    console.error("[learn/progress content lookup]", contentError);
    return NextResponse.json(
      { ok: false, error: "content_unavailable" },
      { status: 500 }
    );
  }

  if (!content || content.status !== "published") {
    return NextResponse.json(
      { ok: false, error: "content_not_available" },
      { status: 404 }
    );
  }

  const { data: current, error: currentError } = await client
    .from("learner_content_progress")
    .select("last_position_seconds,completed_at")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (currentError) {
    console.error("[learn/progress current lookup]", currentError);
    return NextResponse.json(
      { ok: false, error: "progress_unavailable" },
      { status: 500 }
    );
  }

  const position = positionFrom(body.position_seconds);
  if (body.position_seconds !== undefined && position === null) {
    return NextResponse.json(
      { ok: false, error: "invalid_position" },
      { status: 400 }
    );
  }

  const completed =
    typeof body.completed === "boolean"
      ? body.completed
      : Boolean(current?.completed_at);

  const { data: saved, error: saveError } = await client
    .from("learner_content_progress")
    .upsert(
      {
        user_id: userId,
        content_id: contentId,
        last_position_seconds:
          position ?? current?.last_position_seconds ?? 0,
        completed_at: completed
          ? current?.completed_at ?? new Date().toISOString()
          : null,
      },
      { onConflict: "user_id,content_id" }
    )
    .select("content_id,last_position_seconds,completed_at,created_at,updated_at")
    .single();

  if (saveError) {
    console.error("[learn/progress POST]", saveError);
    return NextResponse.json(
      { ok: false, error: "progress_save_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, progress: saved });
}

export async function DELETE(request: Request) {
  if (!isAllowedMutationOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "untrusted_origin" },
      { status: 403 }
    );
  }

  const auth = await requireAuthResponse(request, authRedirect(request));
  if (!auth.ok) return auth.response;

  const userId = sessionUserId(auth.user.id);
  const contentId = contentIdFrom(
    new URL(request.url).searchParams.get("content_id")
  );
  if (!userId || !contentId) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const { error } = await createAdminClient()
    .from("learner_content_progress")
    .delete()
    .eq("user_id", userId)
    .eq("content_id", contentId);

  if (error) {
    console.error("[learn/progress DELETE]", error);
    return NextResponse.json(
      { ok: false, error: "progress_delete_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
