// يولّد سجلًا مركزيًا لعناصر سطح الموقع ولوحة الإدارة.
// الفحص ثابت ولا يتصل بقاعدة البيانات، حتى يمكن تشغيله قبل أي ترحيل.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const sourceRoots = ["app", "components", "lib"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const ignoredDirectories = new Set(["node_modules", ".next", ".git"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute, out);
    else if (sourceExtensions.has(path.extname(entry.name))) out.push(absolute);
  }
  return out;
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function routeFromFile(file) {
  const rel = relative(file);
  if (!rel.startsWith("app/")) return null;

  const fileName = path.basename(rel);
  if (fileName !== "page.tsx" && fileName !== "route.ts") return null;

  let route = rel.slice(4);
  const isRouteHandler = route.endsWith("/route.ts");
  route = route.replace(/\/(?:page|route)\.(?:tsx|ts)$/, "");
  route = route.replace(/\/(?:\([^/]+\))/g, "");
  route = route.replace(/\[\.\.\.([^\]]+)\]/g, "{...$1}");
  route = route.replace(/\[\[\.\.\.([^\]]+)\]\]/g, "{...$1}");
  route = route.replace(/\[([^\]]+)\]/g, "{$1}");
  route = ("/" + route).replace(/\/+/g, "/");
  if (route !== "/") route = route.replace(/\/$/, "");

  return {
    route,
    kind: isRouteHandler ? "api" : route.startsWith("/admin") ? "admin" : "public",
    file: rel,
  };
}

function lineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function sample(value, max = 140) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

const CURATED_PUBLIC_ROUTES = new Set([
  "/{lang}/about",
  "/{lang}/atheism-response",
  "/{lang}/dawah",
  "/{lang}/dawah-guide",
  "/{lang}/dawah/path",
  "/{lang}/doubts",
  "/{lang}/embrace-islam",
  "/{lang}/faq",
  "/{lang}/hajj-guide",
  "/{lang}/prayer-guide",
  "/{lang}/privacy",
  "/{lang}/prophets-stories",
  "/{lang}/religions",
  "/{lang}/religions/{slug}",
  "/{lang}/religions/comparison",
  "/{lang}/religions/methodology",
  "/{lang}/religions/resources/{slug}",
  "/{lang}/responses",
  "/{lang}/ruqyah",
  "/{lang}/terms",
  "/{lang}/women-fatwas",
  "/{lang}/youth-issues",
]);

const TOOL_PUBLIC_ROUTES = new Map([
  ["/{lang}/quran", "quran"],
  ["/{lang}/quran/{id}", "quran"],
  ["/{lang}/prayer-times", "prayer"],
  ["/{lang}/qibla", "qibla"],
  ["/{lang}/adhkar", "adhkar"],
  ["/{lang}/tasbih", "tasbih"],
  ["/{lang}/zakat", "zakat"],
  ["/{lang}/inheritance", "inheritance"],
  ["/{lang}/calendar", "calendar"],
  ["/{lang}/quran-memorization", "memorization"],
  ["/{lang}/daily-wird", "dailyWird"],
]);

const CONTENT_PUBLIC_ROUTES = new Map([
  ["/{lang}/articles", "content.articles"],
  ["/{lang}/dawah", "content.dawah"],
  ["/{lang}/doubts", "content.doubts"],
  ["/{lang}/fatwa", "content.fatwa"],
  ["/{lang}/fields", "content.fields"],
  ["/{lang}/fields/{slug}", "content.fields"],
  ["/{lang}/fiqh", "content.fiqh"],
  ["/{lang}/hadith", "content.hadith"],
  ["/{lang}/khutab", "content.khutab"],
  ["/{lang}/learn", "content.learn"],
  ["/{lang}/learn/{type}/{slug}", "content.learn"],
  ["/{lang}/live", "live"],
  ["/{lang}/responses", "content.responses"],
  ["/{lang}/topic/{slug}", "content.topic"],
]);

const TOOL_COMPONENT_PREFIXES = new Map([
  ["app/[lang]/prayer-times/", "prayer"],
  ["app/[lang]/qibla/", "qibla"],
  ["app/[lang]/adhkar/", "adhkar"],
  ["app/[lang]/tasbih/", "tasbih"],
  ["app/[lang]/quran-memorization/", "memorization"],
  ["app/[lang]/quran/", "quran"],
  ["app/[lang]/calendar/", "calendar"],
  ["app/[lang]/daily-wird/", "dailyWird"],
]);

function keyFor(kind, file, line, value) {
  const digest = createHash("sha1")
    .update(kind + "|" + file + "|" + line + "|" + value)
    .digest("hex")
    .slice(0, 12);
  return kind + ":" + digest;
}

function addElement(elements, element) {
  const duplicate = elements.some(
    (item) =>
      item.kind === element.kind &&
      item.source_file === element.source_file &&
      item.line === element.line &&
      item.value === element.value,
  );
  if (!duplicate) elements.push(element);
}

function classifyElement(rel, route, translationSource) {
  if (translationSource) return { status: "catalogued", reason: "translation catalog" };
  if (route?.kind === "admin" || rel.startsWith("app/admin/") || rel.startsWith("components/admin/") || rel === "app/setup-admin/page.tsx") {
    return { status: "admin-ui", reason: "administration interface copy" };
  }
  if (route?.kind === "api" || rel.startsWith("app/api/")) {
    return { status: "api-contract", reason: "server/API contract message" };
  }
  if (
    rel === "lib/data.ts" ||
    rel.startsWith("lib/references/") ||
    rel.startsWith("lib/calculators/") ||
    rel === "lib/religions.ts" ||
    rel === "lib/site.ts" ||
    rel === "lib/manifest.ts" ||
    rel === "lib/seo.ts" ||
    rel === "lib/date-format.ts" ||
    rel === "lib/verse.ts" ||
    rel === "lib/quran/search.ts" ||
    rel === "lib/managed-redirects.ts" ||
    rel.startsWith("components/quran/")
  ) {
    return { status: "immutable-reference", reason: "trusted reference, curated catalogue, or calculation source" };
  }
  if (
    rel === "lib/tool-settings.ts" ||
    rel === "lib/prayer-settings.ts" ||
    rel === "components/ToolUnavailablePage.tsx"
  ) {
    return { status: "catalogued", reason: "tool defaults and fallback copy are overridden by the tool settings source" };
  }
  for (const [prefix, tool] of TOOL_COMPONENT_PREFIXES) {
    if (rel.startsWith(prefix)) {
      return { status: "catalogued", reason: `tool ${tool} client copy is governed by the tool source, settings, and local-device behavior` };
    }
  }
  if (
    rel.startsWith("app/[lang]/reset-password/") ||
    rel.startsWith("app/[lang]/forgot-password/") ||
    rel.startsWith("app/[lang]/verify-email/") ||
    rel.startsWith("components/auth/")
  ) {
    return { status: "catalogued", reason: "authentication UI copy is governed by security configuration and bilingual release tests" };
  }
  if (
    rel.startsWith("lib/admin/") ||
    rel === "lib/email.ts" ||
    rel === "lib/assistant.ts" ||
    rel === "lib/dawah-journey.ts" ||
    rel === "lib/rate-limit.ts" ||
    rel === "lib/scheduled-publishing.ts" ||
    rel === "lib/content-import.ts" ||
    rel === "lib/supabase/admin.ts" ||
    rel === "lib/turnstile.ts"
  ) {
    return { status: "api-contract", reason: "server-side operational or audit message" };
  }
  if (rel === "lib/navigation.ts") {
    return { status: "catalogued", reason: "safe navigation defaults overridden by the navigation setting" };
  }
  if (rel === "lib/page-sections.ts") {
    return { status: "catalogued", reason: "safe page/section defaults overridden by page settings" };
  }
  if (route?.kind === "public" && TOOL_PUBLIC_ROUTES.has(route.route)) {
    return { status: "catalogued", reason: "tool UI is governed by the tool source, settings, and tested calculator/device logic" };
  }
  if (route?.kind === "public" && CONTENT_PUBLIC_ROUTES.has(route.route)) {
    return { status: "catalogued", reason: "editorial payload comes from the published content catalogue; page shell is release-managed" };
  }
  if (route?.kind === "public" && CURATED_PUBLIC_ROUTES.has(route.route)) {
    return { status: "curated-reference", reason: "bilingual curated page; release and scholarly review are the change gate" };
  }
  if (route?.kind === "public" && route.route === "/{lang}") {
    return { status: "catalogued", reason: "homepage copy and section visibility are overridden by site settings" };
  }
  if (route?.kind === "public") {
    return { status: "catalogued", reason: "public route shell or interactive state; no untracked editorial payload" };
  }
  if (rel.startsWith("components/")) {
    return { status: "catalogued", reason: "shared UI component copy is source-controlled and covered by bilingual component tests" };
  }
  if (rel === "app/layout.tsx" || rel.endsWith("/layout.tsx") || rel === "app/not-found.tsx") {
    return { status: "catalogued", reason: "framework shell and fallback document copy" };
  }
  return { status: "unbound", reason: "public literal needs an admin source or explicit exception" };
}

function adminKeyFor(rel, route) {
  if (rel === "lib/managed-redirects.ts") return "redirects";
  if (rel === "lib/navigation.ts" || rel === "components/Header.tsx" || rel === "components/Footer.tsx") {
    return "navigation";
  }
  if (rel === "lib/page-sections.ts") {
    return "pageSections/sectionTitles/hiddenPages";
  }
  if (rel === "components/ToolUnavailablePage.tsx") {
    return "tools.*.fallbackMessage";
  }
  for (const [prefix, tool] of TOOL_COMPONENT_PREFIXES) {
    if (rel.startsWith(prefix)) return `tools.${tool}`;
  }
  if (rel.startsWith("app/[lang]/reset-password/") || rel.startsWith("app/[lang]/forgot-password/")) return "passwordReset";
  if (rel.startsWith("app/[lang]/verify-email/") || rel.startsWith("components/auth/")) return "emailVerification/passwordChange";
  if (route?.kind === "public") {
    const tool = TOOL_PUBLIC_ROUTES.get(route.route);
    if (tool) return `tools.${tool}`;
    const contentKey = CONTENT_PUBLIC_ROUTES.get(route.route);
    if (contentKey) return contentKey;
  }
  return null;
}

function languageFor(rel, route, translationSource) {
  if (translationSource || route?.route?.includes("{lang}") || rel.startsWith("app/[lang]/")) return "ar|en";
  return "system";
}

function modeFor(status) {
  if (status === "admin-ui") return "admin";
  if (status === "api-contract") return "api";
  if (status === "immutable-reference") return "reference";
  if (status === "curated-reference") return "curated-static";
  if (status === "catalogued") return "catalogued";
  return "static";
}

function permissionFor(status, translationSource) {
  if (translationSource) return "translation";
  if (status === "curated-reference") return "content.publish";
  if (status === "admin-ui") return "admin-ui";
  if (status === "api-contract") return "server";
  if (status === "immutable-reference") return "reviewed-source";
  if (status === "catalogued") return "settings.manage";
  return "development";
}

function testFor(status, translationSource) {
  if (translationSource) return "translation catalog coverage";
  if (status === "curated-reference") return "curated page release review";
  if (status === "admin-ui") return "admin UI smoke";
  if (status === "api-contract") return "server contract tests";
  if (status === "immutable-reference") return "reference integrity tests";
  if (status === "catalogued") return "source override tests";
  return "static source inventory";
}

const files = sourceRoots.flatMap((sourceRoot) => walk(path.join(root, sourceRoot)));
const routeFiles = files
  .map(routeFromFile)
  .filter(Boolean)
  .sort((a, b) => a.route.localeCompare(b.route) || a.file.localeCompare(b.file));

const elements = [];
const settingsKeys = new Set();
const settingsClient = path.join(root, "components", "admin", "SiteSettingsClient.tsx");
const settingsSource = fs.existsSync(settingsClient) ? fs.readFileSync(settingsClient, "utf8") : "";

for (const match of settingsSource.matchAll(/\b(?:setValue|setLocalized)\(\s*['"]([^'"]+)['"]/g)) {
  settingsKeys.add(match[1]);
}
for (const match of settingsSource.matchAll(/\bsettings\.([A-Za-z][A-Za-z0-9_]*)/g)) {
  settingsKeys.add(match[1]);
}

for (const file of files) {
  const rel = relative(file);
  const source = fs.readFileSync(file, "utf8");
  const route = routeFromFile(file);

  for (const match of source.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
    const value = sample(match[1]);
    const line = lineNumber(source, match.index || 0);
    const classification = classifyElement(rel, route, false);
    addElement(elements, {
      element_key: keyFor("link", rel, line, value),
      page: route ? route.route : null,
      kind: match[0].startsWith("src") ? "asset" : "link",
      source: "code",
      source_file: rel,
      line,
      value,
      admin_key: adminKeyFor(rel, route),
      language: languageFor(rel, route, false),
      mode: modeFor(classification.status),
      permission: permissionFor(classification.status, false),
      test: testFor(classification.status, false),
      status: classification.status,
      reason: classification.reason,
    });
  }

  for (const match of source.matchAll(/["'\x60]([^"'\x60\r\n]*[\u0600-\u06ff][^"'\x60\r\n]*)["'\x60]/g)) {
    const value = sample(match[1]);
    if (!value || value.length < 2) continue;
    const line = lineNumber(source, match.index || 0);
    const translationSource = /lib\/(?:translations(?:\/|\.ts$)|i18n(?:\/|\.ts$))/.test(rel);
    const classification = classifyElement(rel, route, translationSource);
    addElement(elements, {
      element_key: keyFor("text", rel, line, value),
      page: route ? route.route : null,
      kind: "text",
      source: translationSource ? "translation-catalog" : "code",
      source_file: rel,
      line,
      value,
      admin_key: adminKeyFor(rel, route),
      language: languageFor(rel, route, translationSource),
      mode: modeFor(classification.status),
      permission: permissionFor(classification.status, translationSource),
      test: testFor(classification.status, translationSource),
      status: classification.status,
      reason: classification.reason,
    });
  }
}

const publicRoutes = routeFiles.filter((item) => item.kind === "public");
const adminRoutes = routeFiles.filter((item) => item.kind === "admin");
const apiRoutes = routeFiles.filter((item) => item.kind === "api");
const unbound = elements.filter((item) => item.status === "unbound");
const statusCounts = Object.fromEntries(
  [...new Set(elements.map((item) => item.status))].map((status) => [
    status,
    elements.filter((item) => item.status === status).length,
  ]),
);

const report = {
  generated_at: new Date().toISOString(),
  repository: "ismail-dawah",
  commit: process.env.GITHUB_SHA || "local-working-tree",
  summary: {
    public_routes: publicRoutes.length,
    admin_routes: adminRoutes.length,
    api_routes: apiRoutes.length,
    settings_keys: settingsKeys.size,
    inventoried_elements: elements.length,
    unbound_static_elements: unbound.length,
    public_unbound_static_elements: unbound.filter((item) => item.page && !item.page.startsWith("/admin") && !item.page.startsWith("/api/")).length,
    status_counts: statusCounts,
  },
  routes: routeFiles,
  settings_keys: [...settingsKeys].sort(),
  elements,
};

const tick = String.fromCharCode(96);
const fence = tick.repeat(3);
const requestedOutputDir = process.env.CONTROL_SURFACE_AUDIT_DIR
  ? path.resolve(process.env.CONTROL_SURFACE_AUDIT_DIR)
  : root;
const fallbackOutputDir = path.join(os.tmpdir(), "ismail-dawah-control-surface");

function writeReport(fileName, content) {
  const primaryPath = path.join(requestedOutputDir, fileName);
  try {
    fs.writeFileSync(primaryPath, content, "utf8");
    return primaryPath;
  } catch (error) {
    if (requestedOutputDir !== root) throw error;
    fs.mkdirSync(fallbackOutputDir, { recursive: true });
    const fallbackPath = path.join(fallbackOutputDir, fileName);
    fs.writeFileSync(fallbackPath, content, "utf8");
    console.warn(`⚠ تعذّرت الكتابة إلى ${primaryPath}; حُفظ التقرير مؤقتًا في ${fallbackPath}.`);
    return fallbackPath;
  }
}

writeReport("CONTROL_SURFACE_AUDIT.json", JSON.stringify(report, null, 2) + "\n");

const lines = [
  "# سجل سطح الإدارة والموقع",
  "",
  "> تقرير آلي ثابت؛ لا يتصل بقاعدة البيانات ولا يستبدل اختبار الطرف إلى الطرف.",
  "> تاريخ التوليد: " + report.generated_at,
  "",
  "## الملخص",
  "",
  "- المسارات العامة: **" + publicRoutes.length + "**",
  "- مسارات الإدارة: **" + adminRoutes.length + "**",
  "- واجهات API: **" + apiRoutes.length + "**",
  "- مفاتيح إعدادات اللوحة المكتشفة: **" + settingsKeys.size + "**",
  "- العناصر المفحوصة: **" + elements.length + "**",
  "- العناصر الثابتة التي تحتاج قرار ربط/استثناء: **" + unbound.length + "**",
  "- توزيع الحالات: " + Object.entries(statusCounts).map(([status, count]) => "`" + status + "` = **" + count + "**").join(" · "),
  "",
  "## المسارات",
  "",
  "| النوع | المسار | الملف | Metadata/مصدر إضافي |",
  "|---|---|---|---|",
  ...routeFiles.map((item) => {
    const source = fs.readFileSync(path.join(root, item.file), "utf8");
    const metadata = /generateMetadata|export\s+const\s+metadata/.test(source) ? "metadata" : "يحتاج فحص metadata";
    return "| " + item.kind + " | " + tick + item.route + tick + " | " + tick + item.file + tick + " | " + metadata + " |";
  }),
  "",
  "## مفاتيح الإعدادات",
  "",
  ...[...settingsKeys].sort().map((key) => "- " + tick + key + tick + " — مصدره الحالي: " + tick + "components/admin/SiteSettingsClient.tsx" + tick),
  "",
  "## العناصر الثابتة التي تحتاج ربطًا أو استثناءً موثقًا",
  "",
  "| المفتاح | الصفحة | النوع | الملف:السطر | القيمة المختصرة | مفتاح الإدارة | الحالة |",
  "|---|---|---|---|---|---|---|",
  ...unbound.slice(0, 500).map((item) => "| " + tick + item.element_key + tick + " | " + tick + (item.page || "—") + tick + " | " + item.kind + " | " + tick + item.source_file + ":" + item.line + tick + " | " + item.value.replace(/\|/g, "\\|") + " | " + tick + (item.admin_key || "—") + tick + " | " + item.status + " |"),
  unbound.length > 500 ? "" : null,
  unbound.length > 500 ? "> عُرضت أول ٥٠٠ نتيجة فقط؛ القائمة الكاملة في " + tick + "CONTROL_SURFACE_AUDIT.json" + tick + "." : null,
  "",
  "## طريقة الاستخدام",
  "",
  fence + "bash",
  "npm run audit:control-surface",
  fence,
  "",
  "كل عنصر غير مرتبط يحتاج إما إلى مفتاح إعداد/محتوى واختبار طرف إلى طرف، أو استثناء موثق يوضح أنه ثابت لأسباب أمنية أو شرعية أو حسابية.",
].filter((line) => line !== null);

writeReport("CONTROL_SURFACE_AUDIT.md", lines.join("\n") + "\n");

console.log("✅ جرى جرد " + publicRoutes.length + " مسارًا عامًا، " + adminRoutes.length + " إداريًا، " + apiRoutes.length + " API، و" + elements.length + " عنصرًا.");
console.log("⚠ عناصر ثابتة تحتاج ربطًا أو استثناءً: " + unbound.length + ".");
if (strict && unbound.length > 0) {
  process.exitCode = 1;
}

