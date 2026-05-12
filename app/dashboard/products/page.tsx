'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { useCreatorAuth } from '@/lib/auth/CreatorAuth';
import { CheckCircle, Clock, XCircle, Plus, Image as ImageIcon, ChevronDown, ExternalLink, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  't-shirts': 'T恤', 'hoodies': '卫衣', 'art-prints': '版画',
  'phone-cases': '手机壳', 'mugs': '马克杯', 'tote-bags': '帆布袋',
  'stickers': '贴纸', 'blankets': '毯子',
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: '待完善' },
  approved: { bg: 'rgba(34,197,94,0.1)', color: 'var(--layers-success)', label: '已上线' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: '已拒绝' },
};

export default function CreatorProductsPage() {
  const { lang } = useLang();
  const { creator } = useCreatorAuth();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!creator?.id) return;

    fetch(`/api/artworks?creatorId=${creator.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setArtworks(j.data); })
      .catch(() => {});

    fetch('/api/admin/manage/products')
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.data) setProducts(j.data.filter((p: any) => p.creatorId === creator?.id));
      })
      .finally(() => setLoading(false));
  }, [creator?.id]);

  const handleUpload = async (file: File, title: string, category: string) => {
    if (!creator?.id) return;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setUploadError(lang === 'zh' ? `图片不能超过 10MB，当前 ${(file.size / 1024 / 1024).toFixed(1)}MB` : `Image must be under 10MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
    setUploadError(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: creator.id, title, category, artworkBase64: base64 }),
      });
      if (res.ok) {
        const json = await res.json();
        setArtworks(prev => [json.data, ...prev]);
      } else {
        const json = await res.json().catch(() => ({}));
        setUploadError(json.message || (lang === 'zh' ? '上传失败，请重试' : 'Upload failed, please retry'));
      }
      setUploading(false);
    };
    reader.onerror = () => {
      setUploadError(lang === 'zh' ? '文件读取失败' : 'File read error');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleShelf = async (productId: string) => {
    setToggling(productId);
    try {
      const res = await fetch('/api/dashboard/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'toggle_shelf' }),
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(prev => prev.map(p => p.id === productId ? json.data : p));
      }
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !creator?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/artworks?id=${deleteTarget.id}&creatorId=${creator.id}`, { method: 'DELETE' });
      if (res.ok) {
        setArtworks(prev => prev.filter(a => a.id !== deleteTarget.id));
        setProducts(prev => prev.filter(p => p.artworkId !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const getVariants = (artworkId: string) => products.filter(p => p.artworkId === artworkId);

  if (!creator) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>
        {loading ? (lang === 'zh' ? '加载中...' : 'Loading...') : (lang === 'zh' ? '请先登录' : 'Please login first')}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          {lang === 'zh' ? '我的作品' : 'My Artworks'}
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
          {lang === 'zh' ? '上传你的设计作品，管理员会为你生成周边商品。' : 'Upload your designs. We\'ll create product variants for you.'}
        </p>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '13px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>⏱</span>
          {lang === 'zh'
            ? '审核时长：3-5 个工作日，请耐心等待'
            : 'Review takes 3-5 business days. Thank you for your patience.'}
        </p>
      </div>

      {/* Upload area */}
      <div style={{
        border: '2px dashed var(--layers-border)', borderRadius: 'var(--radius-xl)',
        padding: '40px', textAlign: 'center', marginBottom: '32px',
        background: 'var(--layers-surface)',
      }}>
        <input type="file" id="artwork-upload" accept="image/*" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const title = prompt(lang === 'zh' ? '作品名称（可选）' : 'Artwork title (optional)', '') || '';
            handleUpload(file, title, 't-shirts');
            e.target.value = '';
          }}
        />
        <label htmlFor="artwork-upload" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(212,98,58,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={24} color="var(--layers-brand)" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                {uploading ? (lang === 'zh' ? '上传中...' : 'Uploading...') : (lang === 'zh' ? '上传作品图片' : 'Upload Artwork')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                {lang === 'zh' ? '点击选择图片文件，建议 PNG 或 JPG' : 'Click to select image file, PNG or JPG recommended'}
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px',
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 'var(--radius-lg)', color: '#dc2626', fontSize: '14px',
        }}>
          {uploadError}
        </div>
      )}

      {/* Artwork list */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
      ) : artworks.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>
          {lang === 'zh' ? '还没有上传任何作品' : 'No artworks uploaded yet'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {artworks.map(aw => {
            const variants = getVariants(aw.id);
            const isExpanded = expandedId === aw.id;
            const s = STATUS_STYLE[aw.status] || STATUS_STYLE.pending;
            const approvedVariants = variants.filter(v => v.status === 'approved');

            return (
              <div key={aw.id} style={{
                background: 'var(--layers-white)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--layers-border)', overflow: 'hidden',
              }}>
                {/* Artwork row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px', cursor: 'pointer',
                }} onClick={() => setExpandedId(isExpanded ? null : aw.id)}>
                  <img
                    src={aw.artworkUrl}
                    alt={aw.title}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--layers-gray-100)', cursor: 'zoom-in' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/images/mockups/tshirt-1.jpg'; }}
                    onClick={e => { e.stopPropagation(); setLightboxImg(aw.artworkUrl); }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600 }}>
                      {aw.title || '(无标题)'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '3px' }}>
                      {CATEGORY_LABELS[aw.category] || aw.category} · {new Date(aw.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {aw.status === 'approved' && approvedVariants.length > 0 && (
                      <a
                        href={`/shop?creator=${aw.creatorId}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(212,98,58,0.1)', color: 'var(--layers-brand)', textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={11} />
                        {lang === 'zh' ? '在店铺查看' : 'View in Shop'}
                      </a>
                    )}
                    <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--layers-text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} />}
                    </button>
                  </div>
                </div>

                {/* Expanded: variants */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--layers-border)', padding: '16px 20px', background: 'var(--layers-bg)' }}>
                    {variants.length === 0 ? (
                      <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)', textAlign: 'center', padding: '20px' }}>
                        {lang === 'zh' ? '管理员正在为这个作品创建周边商品...' : 'Admin is creating product variants for this artwork...'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', marginBottom: '4px' }}>
                          {lang === 'zh' ? `${variants.length} 个周边商品` : `${variants.length} product variants`}
                        </div>
                        {variants.map(v => {
                          const vs = STATUS_STYLE[v.status] || STATUS_STYLE.pending;
                          const mockupUrl = (v.mockups || [])[0];
                          return (
                            <div key={v.id} style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '12px', background: 'var(--layers-white)',
                              borderRadius: 'var(--radius-lg)', border: '1px solid var(--layers-border)',
                            }}>
                              {mockupUrl ? (
                                <img
                                  src={mockupUrl}
                                  alt={v.category}
                                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in' }}
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  onClick={() => setLightboxImg(mockupUrl)}
                                />
                              ) : (
                                <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'var(--layers-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <ImageIcon size={20} color="var(--layers-text-muted)" />
                                </div>
                              )}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                                  {CATEGORY_LABELS[v.category] || v.category}
                                </div>
                                {v.purchaseUrl && (
                                  <a href={v.purchaseUrl} target="_blank" rel="noopener" style={{ fontSize: '11px', color: 'var(--layers-brand)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                    <ExternalLink size={10} />
                                    {lang === 'zh' ? '购买链接' : 'Purchase'}
                                  </a>
                                )}
                              </div>
                              <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 600, background: vs.bg, color: vs.color }}>
                                {vs.label}
                              </span>
                              {/* Creator shelf controls */}
                              {v.status === 'approved' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleShelf(v.id); }}
                                  disabled={toggling === v.id}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none', cursor: 'pointer' }}
                                  title={lang === 'zh' ? '下架（可重新上架）' : 'Unlist (can relist later)'}
                                >
                                  {toggling === v.id ? '...' : <><ToggleLeft size={13} />{lang === 'zh' ? '下架' : 'Unlist'}</>}
                                </button>
                              )}
                              {v.status === 'pending' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleShelf(v.id); }}
                                  disabled={toggling === v.id}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: 'var(--layers-success)', border: 'none', cursor: 'pointer' }}
                                  title={lang === 'zh' ? '重新上架' : 'Relist'}
                                >
                                  {toggling === v.id ? '...' : <><ToggleRight size={13} />{lang === 'zh' ? '上架' : 'Relist'}</>}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Delete artwork button */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--layers-border)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setDeleteTarget({ id: aw.id, title: aw.title || '(无标题)' })}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                        {lang === 'zh' ? '永久删除作品' : 'Delete Artwork'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }} onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="preview" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }} />
          <button onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', width: '44px', height: '44px', borderRadius: '50%' }}>×</button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--layers-white)', borderRadius: 'var(--radius-xl)', padding: '32px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{lang === 'zh' ? '确认永久删除' : 'Confirm Permanent Deletion'}</div>
                <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '2px' }}>{deleteTarget.title}</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              {lang === 'zh'
                ? <>此操作不可逆。作品及所有周边将永久删除。<br/><br/><strong>删除 ≠ 下架：</strong>下架后可在"我的作品"中重新上架；删除则需重新上传并等待审批。</>
                : <>This action is permanent. The artwork and all its variants will be deleted forever.<br/><br/><strong>Delete ≠ Unlist:</strong> Unlisting keeps your artwork for relisting later. Deletion requires re-upload and re-approval.</>}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '8px 20px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, background: 'var(--layers-gray-100)', color: 'var(--layers-text)', border: 'none', cursor: 'pointer' }}>
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: '8px 20px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? (lang === 'zh' ? '删除中...' : 'Deleting...') : (lang === 'zh' ? '确认删除' : 'Delete Forever')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
