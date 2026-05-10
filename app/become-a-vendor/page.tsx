import { cookies } from 'next/headers';
import { LangProvider } from '@/lib/i18n';
import VendorPage from '@/components/vendor/VendorPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function BecomeVendorPage() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('layers_lang');
  const lang = langCookie?.value as 'en' | 'zh' || 'zh';

  return (
    <LangProvider lang={lang}>
      <Header />
      <main>
        <VendorPage />
      </main>
      <Footer />
    </LangProvider>
  );
}
