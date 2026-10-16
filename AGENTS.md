<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## قواعد هذا المستودع

- **بارامترات المسار الديناميكية لا تُفكّ ترميزها تلقائيًا.** في هذا الإصدار من Next.js يصل مقطع المسار كما هو في الرابط (`lesson-quran-%D8%AA%D9%81...`)، بينما `searchParams` تُفكّ ترميزها فعلًا. لذلك أي معرّف عربي مخزّن في قاعدة البيانات لن يُوجَد دون فكّ ترميز.
  - استخدم `decodeParam` / `decodeParams` من `lib/params.ts` في كل صفحة ديناميكية (`[slug]`, `[id]`, `[type]`).
  - اختبار الانحدار: `node scripts/smoke-content.mjs` بعد `npm run build && npm start` — يفحص كل مادة منشورة باللغتين (٣٦٢ رابطًا).
- الترجمة ↔ التعرّف: معرّف (slug) المحتوى **متطابق في اللغتين**، لأن مبدّل اللغة يبدّل مقطع اللغة فقط. لا تُنشئ لاحقة `-en`.
- الترجمة الإنجليزية آلية بمساعدة الذكاء الاصطناعي: تُوسم `is_machine_translated = true` و `is_reviewed = false`.

