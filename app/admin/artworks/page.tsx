'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

interface Artwork {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  category: string;
  createdAt: string;
}

const VARIANT_OPTIONS = [
  { value: 't-shirts',      label: 'T恤 (T-Shirt)',      labelEn: 'T-Shirt' },
  { value: 'hoodies',        label: '卫衣 (Hoodie)',        labelEn: 'Hoodie' },
  { value: 'art-prints',     label: '版画 (Art Print)',      labelEn: 'Art Print' },
  { value: 'phone-cases',    label: '手机壳 (Phone Case)',    labelEn: 'Phone Case' },
  { value: 'mugs',            label: '马克杯 (Mug)',           labelEn: 'Mug' },
  { value: 'tote-bags',       label: '帆布袋 (Tote Bag)',      labelEn: 'Tote Bag' },
  { value: 'stickers',        label: '贴纸 (Sticker)',        labelEn: 'Sticker' },
  { value: 'blankets',        label: '毯子 (Blanket)',        labelEn: 'Blanket' },
];

const CATEGORY_LABELS: Record<string, string> = {
  't-shirts': 'T恤', 'hoodies': '卫衣', 'art-prints': '版画', 'phone-cases': '手机壳',
  'mugs': '马克杯', 'tote-bags': '帆布袋', 'stickers': '贴纸', 'blankets': '毯子',
};

export default function AdminArtworksPage() {
  const { lang } = useLang();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingArtwork, setApprovingArtwork] = useState<Artwork | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetch('/api/artworks')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setArtworks(j.data); })
      .finally(() => setLoading(false));
  }, []);

  const openApproveModal = (artwork: Artwork) => {
    setApprovingArtwork(artwork);
    setSelectedVariants(['t-shirts', 'mugs', 'phone-cases']); // defaults
  };

  const toggleVariant = (v: string) => {
    setSelectedVariants(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const handleApprove = async () => {
    if (!approvingArtwork || selectedVariants.length === 0) return;
    setApproving(true);
    try {
      await fetch('/api/artworks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approvingArtwork.id, status: 'approved' }),
      });
      await fetch('/api/admin/manage/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId: approvingArtwork.id, variantTypes: selectedVariants }),
      });
      setArtworks(prev => prev.map(a => a.id === approvingArtwork.id ? { ...a, status: 'approved' } : a));
      setApprovingArtwork(null);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert(lang === 'zh' ? '请输入拒绝原因' : 'Please enter a rejection reason');
      return;
    }
    await fetch('/api/artworks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected', rejectionReason: rejectReason }),
    });
    setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', rejectionReason: rejectReason } : a));
    setRejectingId(null);
    setRejectReason('');
  };

  const handleRestore = async (id: string) => {
    await fetch('/api/artworks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'pending', rejectionReason: '' }),
    });
    setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: 'pending', rejectionReason: undefined } : a));
  };

  const handleRevokeApproval = async (id: string) => {
    if (!confirm(lang === 'zh' ? '确认取消通过？相关周边也将全部下架。' : 'Revoke approval? All related products will also be taken offline.')) return;
    await fetch('/api/artworks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'pending' }),
    });
    setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: 'pending' } : a));
  };

  const filtered = filter === 'all' ? artworks : artworks.filter(a => a.status === filter);
  const pendingCount = artworks.filter(a => a.status === 'pending').length;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          {lang === 'zh' ? '作品审核' : 'Artwork Review'}
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
          {pendingCount > 0
            ? (lang === 'zh' ? `有 ${pendingCount} 个作品待审核` : `${pendingCount} artworks pending review`)
            : (lang === 'zh' ? '暂无待审核作品' : 'No pending artworks')}
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
             f === 'pending' ? (lang === 'zh' ? '待审核' : 'Pending') :
             f === 'approved' ? (lang === 'zh' ? '已通过' : 'Approved') :
             (lang === 'zh' ? '已拒绝' : 'Rejected')} ({f === 'all' ? artworks.length : artworks.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      {/* Artwork rows */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>
            {filter === 'all'
              ? (lang === 'zh' ? '暂无作品' : 'No artworks')
              : (lang === 'zh' ? '无匹配作品' : 'No matching artworks')}
          </div>
        ) : filtered.map(a => (
          <div key={a.id} style={{
            background: 'var(--layers-white)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--layers-border)', padding: '20px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            {/* Thumbnail */}
            <img
              src={a.artworkUrl}
              alt={a.title}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--layers-gray-100)', cursor: 'zoom-in' }}
              onError={e => { (e.target as HTMLImageElement).src = '/images/mockups/tshirt-1.jpg'; }}
              onClick={() => a.artworkUrl && setLightboxImg(a.artworkUrl)}
            />

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600 }}>{a.title || '(无标题)'}</div>
              <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)', marginTop: '4px' }}>
                {a.creatorName} · {CATEGORY_LABELS[a.category] || a.category} · {new Date(a.createdAt).toLocaleDateString('zh-CN')}
              </div>
              {a.rejectionReason && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {lang === 'zh' ? '拒绝原因' : 'Rejection reason'}: {a.rejectionReason}
                </div>
              )}
            </div>

            {/* Action buttons by status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

              {/* PENDING → Approve + Reject */}
              {a.status === 'pending' && (
                <>
                  <button
                    onClick={() => openApproveModal(a)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'var(--layers-success)', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    <CheckCircle size={14} /> {lang === 'zh' ? '通过' : 'Approve'}
                  </button>
                  <button
                    onClick={() => { setRejectingId(a.id); setRejectReason(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1.5px solid var(--layers-border)', background: 'transparent', color: 'var(--layers-text-muted)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                    <XCircle size={14} /> {lang === 'zh' ? '拒绝' : 'Reject'}
                  </button>
                </>
              )}

              {/* APPROVED → green badge + Revoke button */}
              {a.status === 'approved' && (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '9999px', background: 'rgba(34,197,94,0.1)', color: 'var(--layers-success)', fontSize: '12px', fontWeight: 600 }}>
                    <CheckCircle size={13} /> {lang === 'zh' ? '已通过' : 'Approved'}
                  </span>
                  <button
                    onClick={() => handleRevokeApproval(a.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1.5px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#ef4444', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                    <XCircle size={14} /> {lang === 'zh' ? '取消通过' : 'Revoke'}
                  </button>
                </>
              )}

              {/* REJECTED → red badge + Restore button */}
              {a.status === 'rejected' && (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '9999px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                    <XCircle size={13} /> {lang === 'zh' ? '已拒绝' : 'Rejected'}
                  </span>
                  <button
                    onClick={() => handleRestore(a.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1.5px solid var(--layers-border)', background: 'transparent', color: 'var(--layers-text-muted)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                    <CheckCircle size={14} /> {lang === 'zh' ? '恢复审核' : 'Restore'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---- Approve Modal: select variants ---- */}
      {approvingArtwork && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setApprovingArtwork(null)}>
          <div style={{ background: 'var(--layers-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--layers-border)', padding: '32px', width: '100%', maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              {lang === 'zh' ? '选择要生成的周边类型' : 'Select product variants to create'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--layers-text-muted)', marginBottom: '20px' }}>
              {lang === 'zh'
                ? `为「${approvingArtwork.title || '(无标题)'}」选择要做的周边，生成后可到周边管理页上传效果图和购买链接。`
                : `Select which product variants to create for "${approvingArtwork.title || 'Untitled'}". You can then upload mockups and purchase links from the Products page.`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {VARIANT_OPTIONS.map(opt => {
                const checked = selectedVariants.includes(opt.value);
                return (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 12px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: checked ? 'var(--layers-brand)' : 'var(--layers-border)',
                    background: checked ? 'rgba(59,130,246,0.06)' : 'transparent',
                    cursor: 'pointer', fontSize: '13px', fontWeight: checked ? 600 : 400,
                    color: checked ? 'var(--layers-brand)' : 'var(--layers-text)',
                    transition: 'all 0.15s',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleVariant(opt.value)}
                      style={{ accentColor: 'var(--layers-brand)', width: 15, height: 15 }}
                    />
                    {lang === 'zh' ? opt.label : opt.labelEn}
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleApprove}
                disabled={approving || selectedVariants.length === 0}
                style={{
                  flex: 1, padding: '10px', background: (approving || selectedVariants.length === 0) ? 'var(--layers-gray-300)' : 'var(--layers-success)',
                  color: '#fff', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, border: 'none',
                  cursor: (approving || selectedVariants.length === 0) ? 'not-allowed' : 'pointer',
                }}>
                {approving
                  ? (lang === 'zh' ? '处理中...' : 'Processing...')
                  : (lang === 'zh' ? `确认通过 (${selectedVariants.length}个周边)` : `Approve (${selectedVariants.length} variants)`)}
              </button>
              <button
                onClick={() => setApprovingArtwork(null)}
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--layers-border)', background: 'transparent', cursor: 'pointer', fontSize: '14px' }}>
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setRejectingId(null)}>
          <div style={{ background: 'var(--layers-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--layers-border)', padding: '32px', width: '100%', maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{lang === 'zh' ? '拒绝原因' : 'Rejection Reason'}</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder={lang === 'zh' ? '请输入拒绝原因（选填）...' : 'Enter rejection reason (optional)...'}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--layers-border)', fontSize: '14px', resize: 'vertical', marginBottom: '16px', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleReject(rejectingId)} style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {lang === 'zh' ? '确认拒绝' : 'Confirm Reject'}
              </button>
              <button onClick={() => setRejectingId(null)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--layers-border)', background: 'transparent', cursor: 'pointer' }}>
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }} onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="preview" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}
