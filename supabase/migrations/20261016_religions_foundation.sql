-- قسم الأديان والفكر: فهارس التصنيف فقط.
-- لا نضيف نصوصًا عقدية أو مقارنات جاهزة هنا؛ المواد العلمية تُنشأ من لوحة التحكم
-- وتُربط بهذه التصنيفات ثم تمر بالمراجعة قبل النشر.

insert into taxonomies (kind, lang, name, slug, icon, color, sort_order) values
  ('religion', 'ar', 'النصرانية', 'christianity', '✝️', 'primary', 10),
  ('religion', 'ar', 'اليهودية', 'judaism', '✡️', 'primary', 20),
  ('religion', 'ar', 'الهندوسية', 'hinduism', '🕉️', 'primary', 30),
  ('religion', 'ar', 'البوذية', 'buddhism', '☸️', 'primary', 40),
  ('religion', 'ar', 'الإلحاد واللاأدرية', 'atheism', '💡', 'primary', 50),
  ('religion', 'en', 'Christianity', 'christianity', '✝️', 'primary', 10),
  ('religion', 'en', 'Judaism', 'judaism', '✡️', 'primary', 20),
  ('religion', 'en', 'Hinduism', 'hinduism', '🕉️', 'primary', 30),
  ('religion', 'en', 'Buddhism', 'buddhism', '☸️', 'primary', 40),
  ('religion', 'en', 'Atheism & Agnosticism', 'atheism', '💡', 'primary', 50),
  ('religion_resource', 'ar', 'الإسلام في الكتب السابقة', 'previous-books', '📚', 'gold', 10),
  ('religion_resource', 'ar', 'أسئلة غير المسلمين', 'questions', '❓', 'gold', 20),
  ('religion_resource', 'ar', 'قصص المهتدين', 'stories', '🤝', 'gold', 30),
  ('religion_resource', 'en', 'Islam in Earlier Scriptures', 'previous-books', '📚', 'gold', 10),
  ('religion_resource', 'en', 'Questions from Non-Muslims', 'questions', '❓', 'gold', 20),
  ('religion_resource', 'en', 'Stories of Converts', 'stories', '🤝', 'gold', 30)
on conflict (kind, lang, slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  color = excluded.color,
  sort_order = excluded.sort_order;
