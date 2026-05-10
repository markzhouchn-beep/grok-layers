import { cookies } from 'next/headers';
import { LangProvider } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CreatorProfile from '@/components/creator/CreatorProfile';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatorPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('layers_lang');
  const lang = langCookie?.value as 'en' | 'zh' || 'zh';

  // Fetch creator data
  let creator = null;
  let products: any[] = [];
  let artworks: any[] = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const [creatorsRes, productsRes, artworksRes] = await Promise.all([
      fetch(`${baseUrl}/api/creators?id=${id}`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/admin/manage/products`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/artworks?creatorId=${id}`, { cache: 'no-store' }),
    ]);

    if (creatorsRes.ok) {
      const json = await creatorsRes.json();
      creator = json.data?.creator;
    }
    if (productsRes.ok) {
      const json = await productsRes.json();
      // Show only approved products for this creator
      products = (json.data || []).filter((p: any) => p.creatorId === id && p.status === 'approved');
    }
    if (artworksRes.ok) {
      const json = await artworksRes.json();
      // Show only approved artworks for this creator
      artworks = (json.data || []).filter((aw: any) => aw.status === 'approved');
    }
  } catch {}

  if (!creator) {
    return (
      <LangProvider lang={lang}>
        <Header />
        <main style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '16px' }}>
            {lang === 'zh' ? '创作者未找到' : 'Creator Not Found'}
          </h1>
          <p style={{ color: 'var(--layers-text-muted)' }}>
            {lang === 'zh' ? '该创作者页面不存在' : 'This creator page does not exist'}
          </p>
        </main>
        <Footer />
      </LangProvider>
    );
  }

  return (
    <LangProvider lang={lang}>
      <Header />
      <main>
        <CreatorProfile creator={creator} products={products} artworks={artworks} />
      </main>
      <Footer />
    </LangProvider>
  );
}
