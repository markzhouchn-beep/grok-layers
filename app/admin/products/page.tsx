'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';

interface Product {
  id: string;
  title: string;
  titleEn: string;
  price: string;
  currency: string;
  imageUrl: string;
  artistName: string;
  artistId: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  artworkUrl?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  't-shirts': 'T恤', 'hoodies': '卫衣', 'art-prints': '版画', 'phone-cases': '手机壳',
  'mugs': '马克杯', 'tote-bags': '帆布袋', 'stickers': '贴纸', 'blankets': '毯子',
};

const STATUS_LABELS: Record<string, { zh: string; en: string }> = {
  pending: { zh: '待审核', en: 'Pending' },
  approved: { zh: '已通过', en: 'Approved' },
  rejected: { zh: '已拒绝', en: 'Rejected' },
};

export default function AdminProductsPage() {
  const { lang } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/manage/products')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setProducts(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/manage/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      }
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? products : products.filter(p => p.status === filter);
  const countByStatus = (s: string) => products.filter(p => p.status === s).length;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          {lang === 'zh' ? '商品管理' : 'Product Management'}
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
          {lang === 'zh'
            ? `共 ${products.length} 件商品，已通过 ${countByStatus('approved')} 件`
            : `${products.length} products total, ${countByStatus('approved')} approved`}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
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
             f === 'pending' ? (lang === 'zh' ? '待审核' : 'Pending') :
             f === 'approved' ? (lang === 'zh' ? '已通过' : 'Approved') :
             (lang === 'zh' ? '已拒绝' : 'Rejected')}
            {' '}({f === 'all' ? products.length : countByStatus(f)})
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
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>
            {lang === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>
            {filter === 'all'
              ? (lang === 'zh' ? '暂无商品' : 'No products')
              : (lang === 'zh' ? '无匹配商品' : 'No matching products')}
          </div>
        ) : (
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
                        src={p.artworkUrl || p.imageUrl || '/images/mockups/tshirt-1.jpg'}
                        alt={p.title}
                        onError={e => { (e.target as HTMLImageElement).src = '/images/mockups/tshirt-1.jpg'; }}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', background: 'var(--layers-gray-100)' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--layers-text)' }}>
                          {lang === 'zh' ? p.title : (p.titleEn || p.title)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '2px' }}>ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                    {p.creatorName}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)', textTransform: 'capitalize' }}>
                    {CATEGORY_LABELS[p.category] || p.category}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: p.status === 'approved' ? 'rgba(34,197,94,0.1)' :
                                  p.status === 'pending' ? 'rgba(245,158,11,0.1)' :
                                  'rgba(239,68,68,0.1)',
                      color: p.status === 'approved' ? 'var(--layers-success)' :
                             p.status === 'pending' ? '#f59e0b' :
                             '#ef4444',
                    }}>
                      {STATUS_LABELS[p.status]?.[lang === 'zh' ? 'zh' : 'en'] || p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {p.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'approved')}
                          disabled={updating === p.id}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--layers-success)',
                            background: 'transparent',
                            color: 'var(--layers-success)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: updating === p.id ? 'not-allowed' : 'pointer',
                            opacity: updating === p.id ? 0.5 : 1,
                          }}
                        >
                          {lang === 'zh' ? '通过' : 'Approve'}
                        </button>
                      )}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'pending')}
                          disabled={updating === p.id}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--layers-border)',
                            background: 'transparent',
                            color: 'var(--layers-text-muted)',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: updating === p.id ? 'not-allowed' : 'pointer',
                            opacity: updating === p.id ? 0.5 : 1,
                          }}
                        >
                          {lang === 'zh' ? '下架' : 'Unpublish'}
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'rejected')}
                          disabled={updating === p.id}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #ef4444',
                            background: 'transparent',
                            color: '#ef4444',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: updating === p.id ? 'not-allowed' : 'pointer',
                            opacity: updating === p.id ? 0.5 : 1,
                          }}
                        >
                          {lang === 'zh' ? '拒绝' : 'Reject'}
                        </button>
                      )}
                      {p.status === 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'pending')}
                          disabled={updating === p.id}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--layers-border)',
                            background: 'transparent',
                            color: 'var(--layers-text-muted)',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: updating === p.id ? 'not-allowed' : 'pointer',
                            opacity: updating === p.id ? 0.5 : 1,
                          }}
                        >
                          {lang === 'zh' ? '恢复' : 'Restore'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
