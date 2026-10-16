// scripts/diagnose.mjs
// تشخيص شامل: المحتوى + التصنيفات + التغطية. قراءة فقط (لا يكتب شيئًا).
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("❌ متغيرات البيئة ناقصة (NEXT_PUBLIC_SUPABASE_URL / SERVICE ROLE)");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const line = (s = "") => process.stdout.write(s + "\n");

// 1) المحتوى حسب النوع
const { data: content, error: e1 } = await sb.from("content").select("id, content_type, status");
if (e1) { console.error("content:", e1.message); process.exit(1); }
const byType = {};
for (const r of content) {
  byType[r.content_type] ??= { published: 0, draft: 0, other: 0 };
  if (r.status === "published") byType[r.content_type].published++;
  else if (r.status === "draft") byType[r.content_type].draft++;
  else byType[r.content_type].other++;
}
line("=== المحتوى حسب النوع ===");
line(["النوع".padEnd(14), "منشور".padStart(8), "مسودة".padStart(8)].join(" | "));
for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].published - a[1].published)) {
  line([t.padEnd(14), String(v.published).padStart(8), String(v.draft).padStart(8)].join(" | "));
}
line(`إجمالي العناصر: ${content.length} (منشور: ${content.filter((c) => c.status === "published").length})`);

// 2) الترجمات
const { data: trs } = await sb.from("content_translations").select("lang, content_id");
const byLang = {};
for (const t of trs ?? []) byLang[t.lang] = (byLang[t.lang] ?? 0) + 1;
line("");
line("=== الترجمات حسب اللغة ===");
for (const [k, v] of Object.entries(byLang)) line(`  ${k}: ${v}`);

// 3) التصنيفات
const { data: tax, error: e3 } = await sb
  .from("taxonomies")
  .select("*")
  .order("kind", { ascending: true })
  .order("sort_order", { ascending: true });
if (e3) { console.error("taxonomies:", e3.message); process.exit(1); }
line("");
line(`=== التصنيفات (${tax.length} صف) — الأعمدة: ${Object.keys(tax[0] ?? {}).join(", ")} ===`);
const kinds = {};
for (const t of tax) (kinds[t.kind] ??= []).push(t);
for (const [k, rows] of Object.entries(kinds)) {
  line(`  ${k}: ${rows.length}`);
}

// 4) تغطية كل تصنيف (عدد العناصر المرتبطة)
const { data: terms } = await sb.from("content_terms").select("taxonomy_id");
const linkCount = {};
for (const t of terms ?? []) linkCount[t.taxonomy_id] = (linkCount[t.taxonomy_id] ?? 0) + 1;

const empties = { branch: [], field: [], subbranch: [], category: [] };
const thin = { branch: [], field: [], subbranch: [], category: [] };
for (const t of tax) {
  const n = linkCount[t.id] ?? 0;
  const bucket = empties[t.kind] ?? (empties[t.kind] = []);
  const bucket2 = thin[t.kind] ?? (thin[t.kind] = []);
  if (n === 0) bucket.push(`${t.slug} (${t.name})`);
  else if (n < 3) bucket2.push(`${t.slug} (${t.name}) — ${n}`);
}
line("");
line("=== تصنيفات فاضية تمامًا (0 عناصر) ===");
for (const [k, arr] of Object.entries(empties)) line(`  [${k}] ${arr.length}: ${arr.join(" · ") || "—"}`);
line("");
line("=== تصنيفات ضعيفة (< 3 عناصر) ===");
for (const [k, arr] of Object.entries(thin)) line(`  [${k}] ${arr.length}: ${arr.join(" · ") || "—"}`);

// 5) الصفحات (من نظام الملفات)
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "page.tsx") out.push(path.relative(root, p).replace(/\\/g, "/"));
  }
  return out;
}
const pages = walk(path.join(root, "app")).filter((p) => p.includes("app/[lang]/"));
line("");
line(`=== صفحات app/[lang] (${pages.length}) ===`);
line(pages.map((p) => "  " + p).join("\n"));
