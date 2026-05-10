'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n';

export default function CreatorRegisterPage() {
  const { t } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    wechat: '',
    portfolio: '',
    artStyle: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || '注册失败');
      } else {
        // Auto login after register
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const loginJson = await loginRes.json();
        if (loginRes.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--layers-bg)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--layers-white)',
        border: '1px solid var(--layers-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--layers-text)',
            marginBottom: '8px',
          }}>
            创作者注册
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--layers-text-muted)' }}>
            加入 Layers，开始你的全球变现之旅
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              姓名 *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                background: 'var(--layers-bg)',
                color: 'var(--layers-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="你的艺名或真名"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              邮箱 *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                background: 'var(--layers-bg)',
                color: 'var(--layers-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="登录账号"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              密码 *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                background: 'var(--layers-bg)',
                color: 'var(--layers-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="至少 6 位"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              微信（选填）
            </label>
            <input
              type="text"
              value={form.wechat}
              onChange={e => setForm(f => ({ ...f, wechat: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                background: 'var(--layers-bg)',
                color: 'var(--layers-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="方便我们联系你"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              作品集链接
            </label>
            <input
              type="text"
              value={form.portfolio}
              onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                background: 'var(--layers-bg)',
                color: 'var(--layers-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="Instagram / 小红书 / Behance 等"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              艺术风格
            </label>
            <input
              type="text"
              value={form.artStyle}
              onChange={e => setForm(f => ({ ...f, artStyle: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                background: 'var(--layers-bg)',
                color: 'var(--layers-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="如：抽象水墨、街头插画、浮世绘风格"
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-lg)',
              color: '#dc2626',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: 'var(--layers-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--layers-text-muted)',
        }}>
          已有账号？{' '}
          <Link href="/login" style={{ color: 'var(--layers-brand)', fontWeight: 600 }}>
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}
