import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/admin/session';
import { can } from '@/lib/admin/permissions';
import type { ContentType } from '@/lib/types/content';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ContentListClient from '@/components/admin/ContentListClient';

type PageProps = {
  params: Promise<{ type: string }>;
};

type ContentSection = {
  type: ContentType;
  title: string;
  description: string;
};

const CONTENT_SECTIONS: Record<string, ContentSection> = {
  articles: { type: 'article', title: 'المقالات', description: 'إدارة المقالات المنشورة ومسوداتها وترجماتها.' },
  lessons: { type: 'lesson', title: 'الدروس', description: 'إدارة الدروس التعليمية ومراحل نشرها.' },
  courses: { type: 'course', title: 'الدورات', description: 'إدارة الدورات ومحتواها التعليمي.' },
  books: { type: 'book', title: 'الكتب', description: 'إدارة الكتب والمواد المطولة.' },
  research: { type: 'research', title: 'الأبحاث والعلوم', description: 'إدارة الأبحاث والمواد العلمية المتخصصة.' },
  fatwas: { type: 'fatwa', title: 'الفتاوى', description: 'إدارة الفتاوى ومراجعها وحالة مراجعتها العلمية.' },
  khutbahs: { type: 'khutbah', title: 'الخطب', description: 'إدارة الخطب وتجهيزها للنشر والمشاركة.' },
  hadith: { type: 'hadith', title: 'الأحاديث', description: 'إدارة الأحاديث وتوثيق مصادرها ودرجاتها.' },
  duas: { type: 'duaa', title: 'الأدعية والأذكار', description: 'إدارة الأدعية والأذكار ومحتواها المترجم.' },
  stories: { type: 'story', title: 'القصص والسيرة', description: 'إدارة قصص الأنبياء والسيرة والمواد المرتبطة بها.' },
  faq: { type: 'faq', title: 'الأسئلة الشائعة والشبهات', description: 'إدارة الأسئلة والإجابات والمواد التوضيحية.' },
  events: { type: 'event', title: 'الفعاليات', description: 'إدارة الفعاليات والمواعيد والمواد المصاحبة.' },
  audio: { type: 'audio', title: 'الصوتيات', description: 'إدارة الدروس والمحاضرات والمواد الصوتية.' },
  videos: { type: 'video', title: 'الفيديوهات', description: 'إدارة الفيديوهات والمواد المرئية.' },
  pages: { type: 'page', title: 'الصفحات الثابتة', description: 'إدارة الصفحات التعريفية والثابتة في الموقع.' },
  profiles: { type: 'profile', title: 'تراجم العلماء', description: 'إدارة تراجم العلماء والملفات التعريفية.' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const section = CONTENT_SECTIONS[type];
  return { title: section ? `${section.title} | لوحة التحكم` : 'المحتوى | لوحة التحكم' };
}

export default async function ContentTypePage({ params }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect('/ar/login');
  if (!can(session.roles, 'content.read')) redirect('/admin');

  const { type } = await params;
  const section = CONTENT_SECTIONS[type];
  if (!section) notFound();

  return (
    <div>
      <AdminPageHeader title={section.title} description={section.description} eyebrow="المحتوى">
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/content" className="btn-outline">
            كل المحتوى
          </Link>
          <Link href={`/admin/content/new?type=${section.type}`} className="btn-primary">
            إضافة {section.title}
          </Link>
        </div>
      </AdminPageHeader>
      <ContentListClient initialType={section.type} />
    </div>
  );
}
