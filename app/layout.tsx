import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { LangProvider } from '@/lib/i18n';
import { CreatorAuthProvider } from '@/lib/auth/CreatorAuth';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Layers — 中国艺术家 · 全球版画平台',
    template: '%s | Layers',
  },
  description:
    '让中国独立艺术家的作品通过 Print-on-Demand 销往全球。T 恤、画布、马克杯——欧美本地制造，持续被动收入。',
  icons: {
    icon: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('layers_lang');
  const lang = (langCookie?.value as 'en' | 'zh') || 'zh';

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <body>
        <CreatorAuthProvider>
          <LangProvider lang={lang}>{children}</LangProvider>
        </CreatorAuthProvider>
      </body>
    </html>
  );
}
