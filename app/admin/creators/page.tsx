'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';

interface Creator {
  id: string;
  name: string;
  email: string;
  wechat?: string;
  portfolio?: string;
  art_style?: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  followerCount?: number;
  productCount?: number;
}

interface NewCreator {
  name: string;
  email: string;
  password: string;
  wechat: string;
  portfolio: string;
  art_style: string;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function AdminCreatorsPage() {
  const { lang } = useLang();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState<{ name: string; email: string; password: string } | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState<NewCreator>({ name: '', email: '', password: '', wechat: '', portfolio: '', art_style: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/creators')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setCreators(j.data); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        setShowSuccess({ name: form.name, email: form.email, password: form.password });
        setForm({ name: '', email: '', password: '', wechat: '', portfolio: '', art_style: '' });
        setShowModal(false);
        // Refresh list
        const listRes = await fetch('/api/admin/creators');
        const listJson = await listRes.json();
        if (listJson?.data) setCreators(listJson.data);
      } else {
        setError(json.error || '创建失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (id: string, email: string) => {
    if (!confirm(lang === 'zh' ? `确定要重置 ${email} 的密码吗？` : `Reset password for ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setResetResult({ email, password: json.password });
      } else {
        alert(lang === 'zh' ? '重置失败' : 'Reset failed');
      }
    } catch {
      alert(lang === 'zh' ? '网络错误' : 'Network error');
    }
  };

  const handleToggleBan = async (id: string, isCurrentlyBanned: boolean) => {
    const action = isCurrentlyBanned ? 'unban' : 'ban';
    const msg = isCurrentlyBanned
      ? (lang === 'zh' ? '确定要解封此账号吗？' : 'Unban this creator?')
      : (lang === 'zh' ? '确定要封禁此账号吗？' : 'Ban this creator?');
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // Refresh list
        const listRes = await fetch('/api/admin/creators');
        const listJson = await listRes.json();
        if (listJson?.data) setCreators(listJson.data);
      } else {
        alert(lang === 'zh' ? '操作失败' : 'Action failed');
      }
    } catch {
      alert(lang === 'zh' ? '网络错误' : 'Network error');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm(lang === 'zh' ? '确定要通过此申请吗？' : 'Approve this application?')) return;
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const listRes = await fetch('/api/admin/creators');
        const listJson = await listRes.json();
        if (listJson?.data) setCreators(listJson.data);
      } else {
        alert(lang === 'zh' ? '审批失败' : 'Approval failed');
      }
    } catch {
      alert(lang === 'zh' ? '网络错误' : 'Network error');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm(lang === 'zh' ? '确定要拒绝此申请吗？此操作不可撤销。' : 'Reject this application? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (res.ok) {
        const listRes = await fetch('/api/admin/creators');
        const listJson = await listRes.json();
        if (listJson?.data) setCreators(listJson.data);
      } else {
        alert(lang === 'zh' ? '拒绝失败' : 'Rejection failed');
      }
    } catch {
      alert(lang === 'zh' ? '网络错误' : 'Network error');
    }
  };

  const activeCount = creators.filter(c => c.status === 'active').length;

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            {lang === 'zh' ? '创作者管理' : 'Creator Management'}
          </h1>
          <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
            {lang === 'zh'
              ? `共 ${creators.length} 位创作者，${activeCount} 位活跃`
              : `${creators.length} creators, ${activeCount} active`}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          style={{
            padding: '10px 20px',
            background: 'var(--layers-brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + {lang === 'zh' ? '新增创作者' : 'Add Creator'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: lang === 'zh' ? '创作者总数' : 'Total Creators', value: creators.length, color: 'var(--layers-brand)' },
          { label: lang === 'zh' ? '活跃创作者' : 'Active', value: activeCount, color: 'var(--layers-success)' },
          { label: lang === 'zh' ? '待审批' : 'Pending', value: creators.filter(c => c.status === 'pending').length, color: '#f59e0b' },
          { label: lang === 'zh' ? '已封禁' : 'Suspended', value: creators.filter(c => c.status === 'suspended').length, color: 'var(--layers-error)' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--layers-white)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--layers-border)',
            padding: '24px',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--layers-white)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--layers-border)',
        overflow: 'hidden',
      }}>
        {creators.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)', fontSize: '14px' }}>
            {lang === 'zh' ? '暂无创作者' : 'No creators yet'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--layers-gray-50)', borderBottom: '1px solid var(--layers-border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                  {lang === 'zh' ? '创作者' : 'Creator'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                  {lang === 'zh' ? '联系方式' : 'Contact'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                  {lang === 'zh' ? '艺术风格' : 'Art Style'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                  {lang === 'zh' ? '状态' : 'Status'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                  {lang === 'zh' ? '主页' : 'Page'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                  {lang === 'zh' ? '操作' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {creators.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < creators.length - 1 ? '1px solid var(--layers-border)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--layers-text)' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '2px' }}>{c.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                    {c.wechat || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                    {c.art_style || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: c.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                      color: c.status === 'active' ? 'var(--layers-success)' : '#f59e0b',
                    }}>
                      {c.status === 'active' ? (lang === 'zh' ? '活跃' : 'Active') : (lang === 'zh' ? '待审批' : 'Pending')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <a
                      href={`/creator/${c.id}`}
                      target="_blank"
                      rel="noopener"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--layers-border)',
                        background: 'transparent',
                        color: 'var(--layers-text)',
                        fontSize: '12px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'zh' ? '查看' : 'View'}
                    </a>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleResetPassword(c.id, c.email)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--layers-border)',
                          background: 'transparent',
                          color: 'var(--layers-text)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {lang === 'zh' ? '重置密码' : 'Reset Pwd'}
                      </button>
                      <button
                        onClick={() => handleToggleBan(c.id, c.status === 'suspended')}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid',
                          borderColor: c.status === 'suspended' ? 'var(--layers-success)' : 'var(--layers-error)',
                          background: 'transparent',
                          color: c.status === 'suspended' ? 'var(--layers-success)' : 'var(--layers-error)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.status === 'suspended' ? (lang === 'zh' ? '解封' : 'Unban') : (lang === 'zh' ? '封禁' : 'Ban')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: 'var(--layers-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: 'var(--shadow-elevated)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>
              {lang === 'zh' ? '新增创作者' : 'Add Creator'}
            </h2>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'zh' ? '姓名 *' : 'Name *'}
                </label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'zh' ? '邮箱 *' : 'Email *'}
                </label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'zh' ? '密码 *' : 'Password *'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}
                    style={{ padding: '10px 14px', background: 'var(--layers-gray-100)', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {lang === 'zh' ? '自动生成' : 'Auto'}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'zh' ? '微信（选填）' : 'WeChat (optional)'}
                </label>
                <input value={form.wechat} onChange={e => setForm(f => ({ ...f, wechat: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'zh' ? '作品集链接（选填）' : 'Portfolio URL (optional)'}
                </label>
                <input value={form.portfolio} onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                  {lang === 'zh' ? '艺术风格（选填）' : 'Art Style (optional)'}
                </label>
                <input value={form.art_style} onChange={e => setForm(f => ({ ...f, art_style: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {error && (
                <div style={{ padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', color: '#dc2626', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '11px', background: 'var(--layers-gray-100)', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', cursor: 'pointer' }}>
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button type="submit" disabled={creating}
                  style={{ flex: 1, padding: '11px', background: 'var(--layers-brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1 }}>
                  {creating ? (lang === 'zh' ? '创建中...' : 'Creating...') : (lang === 'zh' ? '创建账户' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: 'var(--layers-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: 'var(--shadow-elevated)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--layers-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {lang === 'zh' ? '账户创建成功！' : 'Account Created!'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                {lang === 'zh' ? '把以下信息发给创作者：' : 'Send these credentials to the creator:'}
              </p>
            </div>

            <div style={{ background: 'var(--layers-gray-50)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--layers-text-muted)' }}>Email</span>
                <span style={{ fontWeight: 600, color: 'var(--layers-text)', fontFamily: 'monospace' }}>{showSuccess.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--layers-text-muted)' }}>Password</span>
                <span style={{ fontWeight: 600, color: 'var(--layers-brand)', fontFamily: 'monospace' }}>{showSuccess.password}</span>
              </div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-lg)', padding: '12px', fontSize: '12px', color: '#c2410c', marginBottom: '20px' }}>
              {lang === 'zh'
                ? '⚠️ 密码只显示一次，请立即告知创作者'
                : '⚠️ Password shown only once — notify the creator now'}
            </div>

            <button onClick={() => setShowSuccess(null)}
              style={{ width: '100%', padding: '11px', background: 'var(--layers-brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              {lang === 'zh' ? '知道了' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Result Modal */}
      {resetResult && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1002,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: 'var(--layers-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: 'var(--shadow-elevated)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(212,98,58,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--layers-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {lang === 'zh' ? '密码已重置！' : 'Password Reset!'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                {lang === 'zh' ? '新密码（请告知创作者）：' : 'New password (notify the creator):'}
              </p>
            </div>

            <div style={{ background: 'var(--layers-gray-50)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--layers-text-muted)' }}>Email</span>
                <span style={{ fontWeight: 600, color: 'var(--layers-text)', fontFamily: 'monospace' }}>{resetResult.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--layers-text-muted)' }}>Password</span>
                <span style={{ fontWeight: 600, color: 'var(--layers-brand)', fontFamily: 'monospace' }}>{resetResult.password}</span>
              </div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-lg)', padding: '12px', fontSize: '12px', color: '#c2410c', marginBottom: '20px' }}>
              {lang === 'zh'
                ? '⚠️ 密码只显示一次，请立即告知创作者'
                : '⚠️ Password shown only once — notify the creator now'}
            </div>

            <button onClick={() => setResetResult(null)}
              style={{ width: '100%', padding: '11px', background: 'var(--layers-brand)', color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              {lang === 'zh' ? '知道了' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
