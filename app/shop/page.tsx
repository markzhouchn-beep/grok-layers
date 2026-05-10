import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/home/ProductCard';
import { Search } from 'lucide-react';
import { cookies } from 'next/headers';
import { LangProvider } from '@/lib/i18n';
import { en } from '@/messages/en';
import { zh as zhMessages } from '@/messages/zh';

const CATEGORIES_ZH = ['全部', 'T恤', '卫衣', '版画', '手机壳', '马克杯', '帆布袋', '贴纸'];
const CATEGORIES_EN = ['All', 'T-Shirts', 'Hoodies', 'Art Prints', 'Phone Cases', 'Mugs', 'Tote Bags', 'Stickers'];
const CATEGORY_KEYS = ['all', 't-shirts', 'hoodies', 'art-prints', 'phone-cases', 'mugs', 'tote-bags', 'stickers'];


const VARIANT_BASE_PRICES: Record<string, number> = {
  't-shirts': 29.99, 'hoodies': 49.99, 'art-prints': 39.99,
  'phone-cases': 19.99, 'mugs': 16.99, 'tote-bags': 24.99,
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; artwork?: string; creator?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('layers_lang');
  const lang = langCookie?.value as 'en' | 'zh' || 'zh';
  const t = lang === 'zh' ? zhMessages.shop : en.shop;
  const categories = lang === 'zh' ? CATEGORIES_ZH : CATEGORIES_EN;

  // Fetch real approved products
  let realProducts: any[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let url = `${baseUrl}/api/admin/manage/products?status=approved`;
    if (params.category && params.category !== 'all') url += `&category=${params.category}`;
    if (params.artwork) url += `&artworkId=${params.artwork}`;
    if (params.creator) url += `&creatorId=${params.creator}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      realProducts = (json.data || []).map((p: any) => {
        const mockupUrl = (p.mockups || [])[0] || '';
        const basePrice = VARIANT_BASE_PRICES[p.category] || 29.99;
        return {
          id: p.id,
          title: p.title || 'Untitled',
          titleEn: p.titleEn || '',
          price: p.price ? String(p.price) : String(basePrice),
          currency: '$',
          imageUrl: mockupUrl,
          artistName: p.creatorName,
          artistId: p.creatorId,
          category: p.category,
          purchaseUrl: p.purchaseUrl || '',
          artworkId: p.artworkId,
        };
      });
    }
  } catch {}

  // Show only real approved products
  const filteredProducts = params.category && params.category !== 'all'
    ? realProducts.filter((p: any) => p.category === params.category)
    : realProducts;

  return (
    <LangProvider lang={lang}>
      <Header />
      <main>
        <div style={{ borderBottom: '1px solid var(--layers-border)', padding: '48px 0 32px' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '24px' }}>
              {t.title}
            </h1>
            <div className="search-bar" style={{ maxWidth: '480px' }}>
              <input type="search" placeholder={t.searchPlaceholder} aria-label="搜索" />
              <button className="search-btn" aria-label="搜索">
                <Search size={18} color="#fff" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '32px 24px' }}>
          <div className="category-pills" style={{ marginBottom: '40px' }}>
            {CATEGORY_KEYS.map((key, i) => (
              <a key={key} href={key === 'all' ? '/shop' : `/shop?category=${key}`} className="category-pill">
                {categories[i]}
              </a>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  title: lang === 'zh' ? p.title : (p.titleEn || p.title),
                  price: p.price,
                  currency: p.currency,
                  imageUrl: p.imageUrl,
                  artistName: p.artistName,
                  artistId: p.artistId,
                  category: p.category,
                  purchaseUrl: p.purchaseUrl,
                }}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button className="btn btn-secondary btn-lg">
              {t.loadMore}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </LangProvider>
  );
}
