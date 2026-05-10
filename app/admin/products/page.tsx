'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';

interface Product {
  id: string;
  title: string;
  titleEn: string;
  price: number;
  currency: string;
  imageUrl: string;
  artistName: string;
  artistId: string;
  category: string;
  status: 'publish' | 'draft';
}

const DEMO_PRODUCTS: Product[] = [
  { id: '1', title: '抽象波纹 T 恤', titleEn: 'Abstract Wave Tee', price: 29.99, currency: '$', imageUrl: '/images/mockups/tshirt-1.jpg', artistName: 'Zhao Yi', artistId: 'a1', category: 't-shirts', status: 'publish' },
  { id: '2', title: '极简几何卫衣', titleEn: 'Minimal Geo Hoodie', price: 59.99, currency: '$', imageUrl: '/images/mockups/tshirt-2.jpg', artistName: 'Lin Mei', artistId: 'a2', category: 'hoodies', status: 'draft' },
  { id: '3', title: '艺术版画 30×40', titleEn: 'Art Print 12×16"', price: 39.99, currency: '$', imageUrl: '/images/mockups/canvas-1.jpg', artistName: 'Chen Xiao', artistId: 'a3', category: 'art-prints', status: 'publish' },
  { id: '4', title: '水彩手机壳', titleEn: 'Watercolor Phone Case', price: 19.99, currency: '$', imageUrl: '/images/mockups/phone-1.png', artistName: 'Wang Fang', artistId: 'a4', category: 'phone-cases', status: 'publish' },
  { id: '5', title: '复古海报系列', titleEn: 'Vintage Poster Set', price: 44.99, currency: '$', imageUrl: '/images/mockups/canvas-2.jpg', artistName: 'Liu Yang', artistId: 'a5', category: 'art-prints', status: 'publish' },
  { id: '6', title: '马克杯定制', titleEn: 'Custom Ceramic Mug', price: 16.99, currency: '$', imageUrl: '/images/mockups/mug-1.jpg', artistName: 'Zhang Bei', artistId: 'a6', category: 'mugs', status: 'publish' },
  { id: '7', title: '艺术家帆布袋', titleEn: 'Artist Tote Bag', price: 24.99, currency: '$', imageUrl: '/images/mockups/tote-1.png', artistName: 'Sun Jie', artistId: 'a7', category: 'tote-bags', status: 'draft' },
  { id: '8', title: '创意贴纸包', titleEn: 'Sticker Pack', price: 9.99, currency: '$', imageUrl: '/images/mockups/tote-2.png', artistName: 'Layers Artist', artistId: 'a8', category: 'stickers', status: 'publish' },
  { id: '9', title: '植物标本 T 恤', titleEn: 'Botanical Tee', price: 27.99, currency: '$', imageUrl: '/images/mockups/tshirt-1.jpg', artistName: 'Xu Ling', artistId: 'a9', category: 't-shirts', status: 'draft' },
  { id: '10', title: '星空渐变卫衣', titleEn: 'Galaxy Gradient Hoodie', price: 64.99, currency: '$', imageUrl: '/images/mockups/tshirt-2.jpg', artistName: 'He Yue', artistId: 'a10', category: 'hoodies', status: 'publish' },
  { id: '11', title: '浮世绘版画', titleEn: 'Ukiyo-e Art Print', price: 49.99, currency: '$', imageUrl: '/images/mockups/canvas-3.jpg', artistName: 'Aoi Sakura', artistId: 'a11', category: 'art-prints', status: 'publish' },
  { id: '12', title: '手工陶艺马克杯', titleEn: 'Handmade Ceramic Mug', price: 21.99, currency: '$', imageUrl: '/images/mockups/mug-2.jpg', artistName: 'Ma Li', artistId: 'a12', category: 'mugs', status: 'publish' },
];

export default function AdminProductsPage() {
  const { lang } = useLang();
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [filter, setFilter] = useState<'all' | 'publish' | 'draft'>('all');

  const filtered = filter === 'all' ? products : products.filter((p) => p.status === filter);
  const publishCount = products.filter((p) => p.status === 'publish').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;

  const toggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'publish' ? 'draft' : 'publish' }
          : p
      )
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          {lang === 'zh' ? '商品管理' : 'Product Management'}
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
          {lang === 'zh'
            ? `共 ${products.length} 件商品，已上架 ${publishCount} 件，${draftCount} 件草稿`
            : `${products.length} products total, ${publishCount} published, ${draftCount} drafts`}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'publish', 'draft'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: '1.5px solid',
              borderColor: filter === f ? 'var(--layers-brand)' : 'var(--layers-border)',
              background: filter === f ? 'var(--layers-brand)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--layers-text-muted)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {f === 'all' ? (lang === 'zh' ? '全部' : 'All') :
             f === 'publish' ? (lang === 'zh' ? '已上架' : 'Published') :
             (lang === 'zh' ? '草稿' : 'Drafts')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--layers-white)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--layers-border)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--layers-gray-50)', borderBottom: '1px solid var(--layers-border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                {lang === 'zh' ? '商品' : 'Product'}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                {lang === 'zh' ? '创作者' : 'Artist'}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                {lang === 'zh' ? '类目' : 'Category'}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                {lang === 'zh' ? '价格' : 'Price'}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                {lang === 'zh' ? '状态' : 'Status'}
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                {lang === 'zh' ? '操作' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--layers-border)' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', background: 'var(--layers-gray-100)' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--layers-text)' }}>
                        {lang === 'zh' ? p.title : p.titleEn}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '2px' }}>ID: {p.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                  {p.artistName}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)', textTransform: 'capitalize' }}>
                  {p.category}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text)', textAlign: 'right', fontWeight: 500 }}>
                  {p.currency}{p.price.toFixed(2)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: p.status === 'publish' ? 'rgba(34,197,94,0.1)' : 'rgba(255,107,107,0.1)',
                    color: p.status === 'publish' ? 'var(--layers-success)' : 'var(--layers-brand)',
                  }}>
                    {p.status === 'publish' ? (lang === 'zh' ? '已上架' : 'Published') : (lang === 'zh' ? '草稿' : 'Draft')}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => toggleStatus(p.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--layers-border)',
                      background: 'transparent',
                      color: 'var(--layers-text)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {p.status === 'publish'
                      ? (lang === 'zh' ? '下架' : 'Unpublish')
                      : (lang === 'zh' ? '上架' : 'Publish')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
