'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { CheckCircle, Clock, XCircle, UserPlus, ExternalLink, ChevronDown, User, Mail, AlertCircle } from 'lucide-react';

interface Creator {
  id: string;
  name: string;
  email: string;
  wechat?: string;
  portfolio?: string;
  art_style?: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

export default function AdminApplicationsPage() {
  const { lang } = useLang();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCreators();
  }, []);

  function fetchCreators() {
    setLoading(true);
    fetch('/api/admin/creators')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setCreators(j.data || []); })
      .finally(() => setLoading(false));
  }

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'active' }),
      });
      const json = await res.json();
      if (json.success) {
        setCreators(prev => prev.map(c => c.id === id ? { ...c, status: 'active' } : c));
        setActionMsg({ id, type: 'success', text: lang === 'zh' ? '已批准并发送临时密码邮件！' : 'Approved — temp password email sent!' });
        setExpandedId(null);
      } else {
        setActionMsg({ id, type: 'error', text: json.message || 'Failed' });
      }
    } catch {
      setActionMsg({ id, type: 'error', text: lang === 'zh' ? '网络错误' : 'Network error' });
    } finally {
      setActivatingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      const json = await res.json();
      if (json.success) {
        setCreators(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
        setActionMsg({ id, type: 'success', text: lang === 'zh' ? '已拒绝并发送通知邮件' : 'Rejected — notification email sent' });
        setExpandedId(null);
      } else {
        setActionMsg({ id, type: 'error', text: json.message || 'Failed' });
      }
    } catch {
      setActionMsg({ id, type: 'error', text: lang === 'zh' ? '网络错误' : 'Network error' });
    } finally {
      setRejectingId(null);
    }
  };

  const pendingApps = creators.filter(c => c.status === 'pending');
  const activeCount = creators.filter(c => c.status === 'active').length;
  const rejectedCount = creators.filter(c => c.status === 'rejected').length;

  const statusBadge = (status: Creator['status']) => {
    if (status === 'pending') return <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{lang === 'zh' ? '待审批' : 'Pending'}</span>;
    if (status === 'active') return <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{lang === 'zh' ? '已通过' : 'Approved'}</span>;
    if (status === 'rejected') return <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>{lang === 'zh' ? '已拒绝' : 'Rejected'}</span>;
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          {lang === 'zh' ? '入驻申请' : 'Applications'}
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
          {lang === 'zh'
            ? `待审批 ${pendingApps.length} · 已通过 ${activeCount} · 已拒绝 ${rejectedCount}`
            : `${pendingApps.length} pending · ${activeCount} approved · ${rejectedCount} rejected`}
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
      ) : pendingApps.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)' }}>
          {lang === 'zh' ? '暂无待审批申请' : 'No pending applications'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingApps.map(c => {
            const isExpanded = expandedId === c.id;
            const isActivating = activatingId === c.id;
            const isRejecting = rejectingId === c.id;
            const msg = actionMsg?.id === c.id ? actionMsg : null;

            return (
              <div key={c.id} style={{
                background: 'var(--layers-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--layers-border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px', cursor: 'pointer',
                }} onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(212,98,58,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={18} color="var(--layers-brand)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Mail size={12} /> {c.email}
                      {c.wechat ? <span style={{ marginLeft: '12px' }}>微信: {c.wechat}</span> : null}
                    </div>
                  </div>
                  {statusBadge('pending')}
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--layers-text-muted)', display: 'flex', padding: 0 }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} />}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--layers-border)', padding: '16px 20px', background: 'var(--layers-bg)' }}>
                    {c.art_style && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)' }}>{lang === 'zh' ? '艺术风格' : 'Art Style'}: </span>
                        <span style={{ fontSize: '13px' }}>{c.art_style}</span>
                      </div>
                    )}
                    {c.portfolio && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)' }}>{lang === 'zh' ? '作品集' : 'Portfolio'}: </span>
                        <a href={c.portfolio} target="_blank" rel="noopener" style={{ fontSize: '13px', color: 'var(--layers-brand)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          {c.portfolio} <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginBottom: '12px' }}>
                      {lang === 'zh' ? '申请时间' : 'Applied'}: {new Date(c.created_at).toLocaleString('zh-CN')}
                    </div>

                    {msg && (
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
                        background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
                        color: msg.type === 'success' ? 'var(--layers-success)' : '#dc2626',
                        border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
                      }}>
                        {msg.text}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleActivate(c.id)}
                        disabled={isActivating || isRejecting}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '8px',
                          background: isActivating ? '#9ca3af' : 'var(--layers-success)', color: '#fff',
                          fontSize: '13px', fontWeight: 600, border: 'none', cursor: isActivating ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <CheckCircle size={14} />
                        {isActivating ? (lang === 'zh' ? '处理中...' : 'Processing...') : (lang === 'zh' ? '批准通过' : 'Approve')}
                      </button>
                      <button
                        onClick={() => handleReject(c.id)}
                        disabled={isActivating || isRejecting}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '8px',
                          background: isRejecting ? '#9ca3af' : '#dc2626', color: '#fff',
                          fontSize: '13px', fontWeight: 600, border: 'none', cursor: isRejecting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <XCircle size={14} />
                        {isRejecting ? (lang === 'zh' ? '处理中...' : 'Processing...') : (lang === 'zh' ? '拒绝' : 'Reject')}
                      </button>
                      <a
                        href={`/creator/${c.id}`}
                        target="_blank"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '8px',
                          border: '1.5px solid var(--layers-border)',
                          background: 'transparent', color: 'var(--layers-text)',
                          fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={14} />
                        {lang === 'zh' ? '预览主页' : 'Preview Page'}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejected creators */}
      {rejectedCount > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={18} color="#dc2626" />
            {lang === 'zh' ? `已拒绝 ${rejectedCount} 位` : `${rejectedCount} Rejected`}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {creators.filter(c => c.status === 'rejected').map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                background: 'var(--layers-white)',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <XCircle size={14} color="#dc2626" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)' }}>{c.email}</div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--layers-text-muted)' }}>
                  {new Date(c.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved creators summary */}
      {activeCount > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="var(--layers-success)" />
            {lang === 'zh' ? `已通过 ${activeCount} 位创作者` : `${activeCount} Approved Creators`}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {creators.filter(c => c.status === 'active').map(c => (
              <a key={c.id} href={`/creator/${c.id}`} target="_blank" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px',
                background: 'var(--layers-white)',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                color: 'inherit',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle size={16} color="var(--layers-success)" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--layers-text-muted)' }}>{c.email}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
