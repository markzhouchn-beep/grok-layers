'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { CheckCircle, Clock, XCircle, Upload, Image as ImageIcon, ChevronDown, ChevronRight, ExternalLink, Plus } from 'lucide-react';

interface Product {
  id: string;
  artworkId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  mockups: string[];
  purchaseUrl?: string;
  price?: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  createdAt: string;
}

const VARIANT_LABELS: Record<string, string> = {
  't-shirts': 'T恤 (T-Shirt)',
  'hoodies': '卫衣 (Hoodie)',
  'art-prints': '版画 (Art Print)',
  'phone-cases': '手机壳 (Phone Case)',
  'mugs': '马克杯 (Mug)',
  'tote-bags': '帆布袋 (Tote Bag)',
  'stickers': '贴纸 (Sticker)',
  'blankets': '毯子 (Blanket)',
};

const STATUS_STYLE = {
  pending:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: '待完善' },
  approved: { bg: 'rgba(34,197,94,0.12)',  color: 'var(--layers-success)', label: '已上线' },
  rejected: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', label: '已拒绝' },
};

export default function AdminProductsPage() {
  const { lang } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [addingVariantsTo, setAddingVariantsTo] = useState<string | null>(null); // artworkId
  const [selectedNewTypes, setSelectedNewTypes] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const load = () => {
    fetch('/api/admin/manage/products')
      .then(r => r.ok ? r.json().then(j => setProducts(j.data || [])) : null)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Group by artworkId
  type Group = { artworkId: string; artworkUrl: string; title: string; creatorName: string; products: Product[] };
  const grouped: Group[] = [];
  const map = new Map<string, Group>();
  const filtered = filter === 'all' ? products : products.filter(p => p.status === filter);
  for (const p of filtered) {
    if (!map.has(p.artworkId)) {
      const g: Group = { artworkId: p.artworkId, artworkUrl: p.artworkUrl, title: p.title, creatorName: p.creatorName, products: [] };
      map.set(p.artworkId, g);
      grouped.push(g);
    }
    map.get(p.artworkId)!.products.push(p);
  }

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ---- Actions ----

  const handleApprove = async (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    if ((p.mockups || []).length === 0) {
      alert(lang === 'zh' ? '请先上传至少一张 Mockup 图片' : 'Please upload at least one mockup image first');
      return;
    }
    if (!p.purchaseUrl || !p.purchaseUrl.trim()) {
      alert(lang === 'zh' ? '请先填写购买链接' : 'Please fill in the purchase URL first');
      return;
    }
    await fetch('/api/admin/manage/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'approved' }),
    });
    setProducts(prev => prev.map(x => x.id === id ? { ...x, status: 'approved' } : x));
    if (selectedProduct?.id === id) setSelectedProduct(prev => prev ? { ...prev, status: 'approved' } : null);
  };

  const handleReject = async (id: string) => {
    await fetch('/api/admin/manage/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' }),
    });
    setProducts(prev => prev.map(x => x.id === id ? { ...x, status: 'rejected' } : x));
    if (selectedProduct?.id === id) setSelectedProduct(prev => prev ? { ...prev, status: 'rejected' } : null);
  };

  const handleRevert = async (id: string) => {
    await fetch('/api/admin/manage/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'pending' }),
    });
    setProducts(prev => prev.map(x => x.id === id ? { ...x, status: 'pending' } : x));
    if (selectedProduct?.id === id) setSelectedProduct(prev => prev ? { ...prev, status: 'pending' } : null);
  };

  const handleMockupUpload = async (productId: string, base64: string) => {
    const res = await fetch('/api/admin/manage/products/mockup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, type: 'default', base64 }),
    });
    if (res.ok) {
      const json = await res.json();
      const newUrl = json.data.url;
      setProducts(prev => prev.map(x =>
        x.id === productId ? { ...x, mockups: [...(x.mockups || []), newUrl] } : x
      ));
      if (selectedProduct?.id === productId) {
        setSelectedProduct(prev => prev ? { ...prev, mockups: [...(prev.mockups || []), newUrl] } : null);
      }
    }
  };

  const handleSaveUrl = async (productId: string, url: string) => {
    setSaving(true);
    await fetch('/api/admin/manage/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId, purchaseUrl: url }),
    });
    setProducts(prev => prev.map(x => x.id === productId ? { ...x, purchaseUrl: url } : x));
    if (selectedProduct?.id === productId) setSelectedProduct(prev => prev ? { ...prev, purchaseUrl: url } : null);
    setSaving(false);
  };

  const handleSavePrice = async (productId: string, price: string) => {
    setSaving(true);
    await fetch('/api/admin/manage/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId, price }),
    });
    setProducts(prev => prev.map(x => x.id === productId ? { ...x, price } : x));
    if (selectedProduct?.id === productId) setSelectedProduct(prev => prev ? { ...prev, price } : null);
    setSaving(false);
  };

  const handleAddVariants = async (artworkId: string) => {
    if (selectedNewTypes.length === 0) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/manage/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, variantTypes: selectedNewTypes }),
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(prev => [...prev, ...json.data]);
        setAddingVariantsTo(null);
        setSelectedNewTypes([]);
      }
    } finally {
      setAdding(false);
    }
  };

  // Available variant types not yet created for a given artwork
  const getMissingTypes = (artworkId: string): string[] => {
    const existing = products.filter(p => p.artworkId === artworkId).map(p => p.category);
    return Object.keys(VARIANT_LABELS).filter(t => !existing.includes(t));
  };

  // ---- Render helpers ----

  const pendingCount = products.filter(p => p.status === 'pending').length;
  const approvedCount = products.filter(p => p.status === 'approved').length;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          {lang === 'zh' ? '周边管理' : 'Product Variants'}
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
          {lang === 'zh'
            ? '完善每个周边的 Mockup 图片和购买链接，然后审批上线。'
            : 'Complete each variant with mockup images and purchase links, then approve to go live.'}
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: '9999px', border: '1.5px solid',
            borderColor: filter === f ? 'var(--layers-brand)' : 'var(--layers-border)',
            background: filter === f ? 'var(--layers-brand)' : 'transparent',
            color: filter === f ? '#fff' : 'var(--layers-text-muted)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>
            {f === 'all' ? (lang === 'zh' ? '全部' : 'All') :
             f === 'pending' ? (lang === 'zh' ? `待完善 (${pendingCount})` : `Pending (${pendingCount})`) :
             f === 'approved' ? (lang === 'zh' ? `已上线 (${approvedCount})` : `Live (${approvedCount})`) :
             (lang === 'zh' ? '已拒绝' : 'Rejected')} ({f === 'all' ? products.length : products.filter(p => p.status === f).length})
          </button>
        ))}
      </div>

      {/* Groups */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
      ) : grouped.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>
          {filter === 'all'
            ? (lang === 'zh' ? '暂无周边产品' : 'No product variants yet')
            : (lang === 'zh' ? '无匹配产品' : 'No matching products')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {grouped.map(group => {
            const expanded = expandedGroups.has(group.artworkId);
            const pCount = group.products.length;
            const aCount = group.products.filter(p => p.status === 'approved').length;
            const penCount = group.products.filter(p => p.status === 'pending').length;

            return (
              <div key={group.artworkId} style={{
                background: 'var(--layers-white)',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
              }}>
                {/* Group header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggleGroup(group.artworkId)}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--layers-text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <img
                    src={group.artworkUrl}
                    alt={group.title}
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--layers-gray-100)' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/images/mockups/tshirt-1.jpg'; }}
                    onClick={e => { e.stopPropagation(); setLightboxImg(group.artworkUrl); }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600 }}>{group.title || '(无标题)'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '2px' }}>
                      {group.creatorName} · {pCount} {lang === 'zh' ? '个周边' : 'variants'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {penCount > 0 && (
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                        {penCount} {lang === 'zh' ? '待完善' : 'pending'}
                      </span>
                    )}
                    {aCount > 0 && (
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(34,197,94,0.12)', color: 'var(--layers-success)' }}>
                        {aCount} {lang === 'zh' ? '已上线' : 'live'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded rows */}
                {expanded && (
                  <div style={{ borderTop: '1px solid var(--layers-border)' }}>
                    {group.products.map(p => {
                      const s = STATUS_STYLE[p.status];
                      const hasMockup = (p.mockups || []).length > 0;
                      const hasUrl = !!(p.purchaseUrl && p.purchaseUrl.trim());
                      const canApprove = hasMockup && hasUrl && p.status === 'pending';

                      return (
                        <div key={p.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 20px',
                          borderBottom: '1px solid var(--layers-border)',
                        }}>
                          {/* Variant info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{VARIANT_LABELS[p.category] || p.category}</div>
                            <div style={{ fontSize: '11px', color: 'var(--layers-text-muted)', marginTop: '2px' }}>
                              {hasMockup
                                ? `${(p.mockups || []).length} ${lang === 'zh' ? '张Mockup' : 'mockups'}`
                                : (lang === 'zh' ? '未上传Mockup' : 'No mockup')}
                              {hasUrl
                                ? ` · ${lang === 'zh' ? '有链接' : 'has URL'}`
                                : ` · ${lang === 'zh' ? '无链接' : 'no URL'}`}
                              {p.price ? ` · $${p.price}` : ''}
                            </div>
                          </div>

                          {/* Status badge */}
                          <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>
                            {s.label}
                          </span>

                          {/* Edit button (always visible) */}
                          <button
                            onClick={() => setSelectedProduct(p)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid var(--layers-border)', background: 'transparent', fontSize: '12px', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                            <ImageIcon size={12} /> {lang === 'zh' ? '编辑' : 'Edit'}
                          </button>

                          {/* Pending → Approve (only when ready) */}
                          {canApprove && (
                            <button onClick={() => handleApprove(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', background: 'var(--layers-success)', color: '#fff', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                              <CheckCircle size={12} /> {lang === 'zh' ? '通过' : 'Approve'}
                            </button>
                          )}

                          {/* Pending → Reject */}
                          {p.status === 'pending' && (
                            <button onClick={() => handleReject(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid var(--layers-border)', background: 'transparent', color: 'var(--layers-text-muted)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                              <XCircle size={12} />
                            </button>
                          )}

                          {/* Approved → Revoke */}
                          {p.status === 'approved' && (
                            <button onClick={() => handleRevert(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                              <XCircle size={12} /> {lang === 'zh' ? '取消' : 'Revoke'}
                            </button>
                          )}

                          {/* Rejected → Restore */}
                          {p.status === 'rejected' && (
                            <button onClick={() => handleRevert(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid var(--layers-border)', background: 'transparent', color: 'var(--layers-text-muted)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                              <Clock size={12} /> {lang === 'zh' ? '恢复' : 'Restore'}
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Add new variant types — shown for approved artworks with at least one approved variant */}
                    {(() => {
                      const missing = getMissingTypes(group.artworkId);
                      const hasApproved = group.products.some(p => p.status === 'approved');
                      if (!hasApproved || missing.length === 0) return null;
                      return (
                        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--layers-border)' }}>
                          {addingVariantsTo === group.artworkId ? (
                            <div>
                              <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                                {lang === 'zh' ? '选择要新增的产品类型：' : 'Select variant types to add:'}
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                {missing.map(t => (
                                  <button
                                    key={t}
                                    onClick={() => setSelectedNewTypes(prev =>
                                      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                                    )}
                                    style={{
                                      padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
                                      border: '1.5px solid', cursor: 'pointer',
                                      borderColor: selectedNewTypes.includes(t) ? 'var(--layers-brand)' : 'var(--layers-border)',
                                      background: selectedNewTypes.includes(t) ? 'var(--layers-brand)' : 'transparent',
                                      color: selectedNewTypes.includes(t) ? '#fff' : 'var(--layers-text)',
                                    }}
                                  >
                                    {VARIANT_LABELS[t] || t}
                                  </button>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleAddVariants(group.artworkId)}
                                  disabled={adding || selectedNewTypes.length === 0}
                                  style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--layers-brand)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: adding || selectedNewTypes.length === 0 ? 'not-allowed' : 'pointer', opacity: adding || selectedNewTypes.length === 0 ? 0.5 : 1 }}
                                >
                                  {adding ? '...' : (lang === 'zh' ? `添加 ${selectedNewTypes.length} 个` : `Add ${selectedNewTypes.length}`)}
                                </button>
                                <button
                                  onClick={() => { setAddingVariantsTo(null); setSelectedNewTypes([]); }}
                                  style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--layers-gray-100)', color: 'var(--layers-text)', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                                >
                                  {lang === 'zh' ? '取消' : 'Cancel'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingVariantsTo(group.artworkId)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid var(--layers-brand)', background: 'rgba(212,98,58,0.08)', color: 'var(--layers-brand)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <Plus size={13} /> {lang === 'zh' ? '增加产品类型' : 'Add Variant Types'}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Edit Modal ---- */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          lang={lang}
          saving={saving}
          onClose={() => setSelectedProduct(null)}
          onUpload={handleMockupUpload}
          onSaveUrl={handleSaveUrl}
          onSavePrice={handleSavePrice}
          onApprove={handleApprove}
          onReject={handleReject}
          onRevert={handleRevert}
          onLightbox={setLightboxImg}
        />
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }} onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="preview" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <button onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      )}
    </div>
  );
}

// ---- Product Modal (separate component to keep code clean) ----
function ProductModal({ product, lang, saving, onClose, onUpload, onSaveUrl, onSavePrice, onApprove, onReject, onRevert, onLightbox }: {
  product: Product;
  lang: string;
  saving: boolean;
  onClose: () => void;
  onUpload: (id: string, base64: string) => void;
  onSaveUrl: (id: string, url: string) => void;
  onSavePrice: (id: string, price: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRevert: (id: string) => void;
  onLightbox: (url: string) => void;
}) {
  const hasMockup = (product.mockups || []).length > 0;
  const hasUrl = !!(product.purchaseUrl && product.purchaseUrl.trim());
  const canApprove = hasMockup && hasUrl;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={onClose}>
      <div style={{ background: 'var(--layers-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--layers-border)', padding: '32px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>{product.title || '(无标题)'}</h2>
            <p style={{ fontSize: '13px', color: 'var(--layers-text-muted)', marginTop: '4px' }}>
              {product.creatorName} · {VARIANT_LABELS[product.category] || product.category}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '28px', cursor: 'pointer', color: 'var(--layers-text-muted)', lineHeight: 1 }}>×</button>
        </div>

        {/* Artwork preview */}
        <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--layers-bg)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img
            src={product.artworkUrl}
            alt="artwork"
            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
            onError={e => { (e.target as HTMLImageElement).src = '/images/mockups/tshirt-1.jpg'; }}
          />
          <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)' }}>
            {lang === 'zh' ? '原始作品图' : 'Original artwork'}
            <button onClick={() => onLightbox(product.artworkUrl)} style={{ marginLeft: '8px', background: 'transparent', border: 'none', color: 'var(--layers-brand)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
              {lang === 'zh' ? '放大预览' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Purchase URL */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--layers-text-muted)' }}>
            {lang === 'zh' ? '购买链接' : 'Purchase URL'}
            {hasUrl && <span style={{ marginLeft: '8px', color: 'var(--layers-success)', fontWeight: 400 }}>✓</span>}
            {!hasUrl && <span style={{ marginLeft: '8px', color: '#f59e0b', fontWeight: 400 }}>★ {lang === 'zh' ? '必填' : 'required'}</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="url"
              className="form-input"
              id="pm-url"
              defaultValue={product.purchaseUrl || ''}
              placeholder="https://www.redbubble.com/i/..."
              style={{ flex: 1 }}
            />
            <button
              onClick={() => onSaveUrl(product.id, (document.getElementById('pm-url') as HTMLInputElement).value)}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? '...' : (lang === 'zh' ? '保存' : 'Save')}
            </button>
          </div>
          {product.purchaseUrl && (
            <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', color: 'var(--layers-brand)', textDecoration: 'underline' }}>
              <ExternalLink size={11} /> {lang === 'zh' ? '查看链接' : 'View link'}
            </a>
          )}
        </div>

        {/* Price */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--layers-text-muted)' }}>
            {lang === 'zh' ? '价格 (USD)' : 'Price (USD)'}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--layers-text-muted)' }}>$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              id="pm-price"
              defaultValue={product.price || ''}
              placeholder="29.99"
              style={{ width: '100px' }}
            />
            <button
              onClick={() => onSavePrice(product.id, (document.getElementById('pm-price') as HTMLInputElement).value)}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? '...' : (lang === 'zh' ? '保存' : 'Save')}
            </button>
          </div>
        </div>

        {/* Mockup images */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: 'var(--layers-text-muted)' }}>
            {lang === 'zh' ? 'Mockup 效果图' : 'Mockup Images'}
            {hasMockup && <span style={{ marginLeft: '8px', color: 'var(--layers-success)', fontWeight: 400 }}>✓ {(product.mockups || []).length}</span>}
            {!hasMockup && <span style={{ marginLeft: '8px', color: '#f59e0b', fontWeight: 400 }}>★ {lang === 'zh' ? '必填' : 'required'}</span>}
          </div>

          {/* Existing mockups */}
          {(product.mockups || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {product.mockups.map((url, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img
                    src={url}
                    alt={`mockup ${idx + 1}`}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--layers-border)', cursor: 'zoom-in' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/images/mockups/tshirt-1.jpg'; }}
                    onClick={() => onLightbox(url)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Upload */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid var(--layers-border)', background: 'var(--layers-surface)', color: 'var(--layers-text)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            <Upload size={14} /> {lang === 'zh' ? '上传 Mockup' : 'Upload Mockup'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => onUpload(product.id, ev.target?.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        {/* Status indicator */}
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--layers-bg)', border: '1px solid var(--layers-border)', display: 'flex', gap: '12px', fontSize: '12px' }}>
          <span style={{ color: hasMockup ? 'var(--layers-success)' : '#f59e0b)' }}>
            {hasMockup ? '✓' : '○'} Mockup
          </span>
          <span style={{ color: hasUrl ? 'var(--layers-success)' : '#f59e0b' }}>
            {hasUrl ? '✓' : '○'} {lang === 'zh' ? '购买链接' : 'URL'}
          </span>
          <span style={{ color: product.price ? 'var(--layers-success)' : 'var(--layers-text-muted)' }}>
            {product.price ? `✓ $${product.price}` : `○ ${lang === 'zh' ? '价格' : 'Price'}`}
          </span>
        </div>

        {/* Action buttons by status */}
        {product.status === 'pending' && (
          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--layers-border)' }}>
            {canApprove ? (
              <button
                onClick={() => { onApprove(product.id); onClose(); }}
                style={{ flex: 1, padding: '10px', background: 'var(--layers-success)', color: '#fff', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {lang === 'zh' ? '通过审核，上线销售' : 'Approve & Go Live'}
              </button>
            ) : (
              <div style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: 'var(--radius-lg)', fontSize: '13px' }}>
                {lang === 'zh' ? '请完善上方信息后再审批上线' : 'Complete the fields above before approving'}
              </div>
            )}
            <button
              onClick={() => { onReject(product.id); onClose(); }}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--layers-border)', background: 'transparent', color: 'var(--layers-text-muted)', fontSize: '14px', cursor: 'pointer' }}>
              {lang === 'zh' ? '拒绝' : 'Reject'}
            </button>
          </div>
        )}

        {product.status === 'approved' && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--layers-border)' }}>
            <button
              onClick={() => { onRevert(product.id); onClose(); }}
              style={{ width: '100%', padding: '10px', background: 'transparent', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              {lang === 'zh' ? '取消通过，下架销售' : 'Revoke Approval & Take Offline'}
            </button>
          </div>
        )}

        {product.status === 'rejected' && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--layers-border)' }}>
            <button
              onClick={() => { onRevert(product.id); onClose(); }}
              style={{ width: '100%', padding: '10px', background: 'var(--layers-navy)', color: '#fff', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              {lang === 'zh' ? '恢复为待完善' : 'Restore to Pending'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
