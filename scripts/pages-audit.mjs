// scripts/pages-audit.mjs
// يولّد تقرير جرد لكل صفحات app/[lang] + تغطية التصنيفات، إلى ملف AUDIT.md
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

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "page.tsx") out.push(p);
  }
  return out;
}

const langRoot = path.join(root, "app", "[lang]");
const files = walk(langRoot);

const rows = files.map((f) => {
  const rel = path.relative(root, f).replace(/\\/g, "/");
  const route = "/{lang}" + rel.replace("app/[lang]", "").replace(/\/page\.tsx$/, "").replace(/\[(\w+)\]/g, "{$1}") || "/{lang}";
  const src = fs.readFileSync(f, "utf8");
  const hasMeta = (s) => /export\s+(const\s+metadata\b|(async\s+)?function\s+generateMetadata)/.test(s);
  const layoutFile = path.join(path.dirname(f), "layout.tsx");
  const layoutSrc = fs.existsSync(layoutFile) ? fs.readFileSync(layoutFile, "utf8") : "";
  const lines = src.split(/\r?\n/).length;
  return {
    route: route === "/{lang}" ? "/{lang}" : route,
    lines,
    meta: hasMeta(src) ? "نعم" : hasMeta(layoutSrc) ? "نعم (layout)" : "—",
    topbar: /from\s+["']@\/components\/TopBar["']/.test(src) ? "نعم" : "—",
    hero: /PageHero/.test(src) ? "نعم" : "—",
    dynamic: /export\s+const\s+dynamic/.test(src) ? "نعم" : "ثابت",
  };
});

rows.sort((a, b) => a.route.localeCompare(b.route));

let md = "# جرد صفحات الموقع (توليد آلي)\n\n";
md += `عدد صفحات app/[lang]: **${rows.length}**\n\n`;
md += "| المسار | أسطر | Metadata | TopBar | PageHero | العرض |\n";
md += "|---|---:|---|:--:|:--:|---|\n";
for (const r of rows) {
  md += `| \`${r.route}\` | ${r.lines} | ${r.meta} | ${r.topbar} | ${r.hero} | ${r.dynamic} |\n`;
}

const noMeta = rows.filter((r) => r.meta === "—");
md += `\n## صفحات بلا Metadata (${noMeta.length})\n\n`;
md += noMeta.length ? noMeta.map((r) => `- \`${r.route}\``).join("\n") + "\n" : "لا يوجد.\n";

// تغطية التصنيفات
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (url && key) {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data: tax } = await sb.from("taxonomies").select("*").order("kind").order("sort_order");
  const { data: terms } = await sb.from("content_terms").select("taxonomy_id");
  const links = {};
  for (const t of terms ?? []) links[t.taxonomy_id] = (links[t.taxonomy_id] ?? 0) + 1;

  md += "\n## تغطية المجالات (kind = field, صفوف ar)\n\n";
  md += "| المجال | slug | عدد المواد |\n|---|---|---:|\n";
  const fields = (tax ?? []).filter((t) => t.kind === "field" && t.lang === "ar");
  const sorted = fields
    .map((f) => ({ ...f, n: links[f.id] ?? 0 }))
    .sort((a, b) => b.n - a.n);
  for (const f of sorted) md += `| ${f.name} | \`${f.slug}\` | ${f.n} |\n`;
  const empty = sorted.filter((f) => f.n === 0);
  md += `\n**مجالات بلا محتوى (${empty.length}):** ${empty.map((f) => `\`${f.slug}\``).join(" · ") || "—"}\n`;

  md += "\n## تغطية الفروع والمواضيع (kind = branch/subbranch)\n\n";
  md += "| النوع | الاسم | slug | عدد المواد |\n|---|---|---|---:|\n";
  for (const t of (tax ?? []).filter((x) => (x.kind === "branch" || x.kind === "subbranch") && x.lang === "ar")) {
    md += `| ${t.kind} | ${t.name} | \`${t.slug}\` | ${links[t.id] ?? 0} |\n`;
  }
}

const out = path.join(root, "AUDIT.md");
fs.writeFileSync(out, md, "utf8");
console.log(`✅ كُتب ${out} — ${rows.length} صفحة، ${noMeta.length} بلا metadata`);
