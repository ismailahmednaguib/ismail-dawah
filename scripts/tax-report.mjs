// scripts/tax-report.mjs
// تقرير التصنيفات: يطبع كل تصنيف + عدد المحتوى المرتبط، ويحدّد غير الموجود
// من بين التصنيفات التي تشير إليها القوائم (lib/navigation.ts). قراءة فقط.
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
const sb = createClient(url, key, { auth: { persistSession: false } });

// التصنيفات المذكورة في هيكل القوائم
const navTax = fs
  .readFileSync(path.join(root, "lib", "navigation.ts"), "utf8")
  .match(/taxonomy:\s*"([^"]+)"/g)
  ?.map((s) => s.replace(/.*"([^"]+)".*/, "$1")) ?? [];
const navSet = [...new Set(navTax)];

const { data: tax } = await sb.from("taxonomies").select("*").order("kind").order("sort_order");
const { data: terms } = await sb.from("content_terms").select("taxonomy_id");
const links = {};
for (const t of terms ?? []) links[t.taxonomy_id] = (links[t.taxonomy_id] ?? 0) + 1;

const kinds = {};
for (const t of tax ?? []) (kinds[t.kind] ??= []).push(t);

for (const [kind, rows] of Object.entries(kinds)) {
  console.log(`\n### ${kind} (${rows.length})`);
  for (const r of rows) {
    const n = links[r.id] ?? 0;
    console.log(`  ${(r.slug || "-").padEnd(22)} ${(r.lang || "-").padEnd(4)} ${String(n).padStart(3)}  ${r.name}${r.icon ? "  " + r.icon : ""}`);
  }
}

const existingSlugs = new Set((tax ?? []).map((t) => t.slug));
const missing = navSet.filter((s) => !existingSlugs.has(s));
console.log(`\n=== تصنيفات تشير إليها القوائم وغير موجودة في القاعدة (${missing.length}) ===`);
console.log("  " + (missing.join(" · ") || "—"));

const unlinked = (tax ?? []).filter((t) => (links[t.id] ?? 0) === 0);
console.log(`\n=== صفوف تصنيف بلا أي محتوى مرتبط (${unlinked.length}) ===`);
console.log("  " + (unlinked.map((t) => `${t.kind}:${t.slug}(${t.lang})`).join(" · ") || "—"));
