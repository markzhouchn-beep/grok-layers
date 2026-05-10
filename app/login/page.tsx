'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreatorAuth } from '@/lib/auth/CreatorAuth';

export default function CreatorLoginPage() {
  const router = useRouter();
  const { login } = useCreatorAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push('/dashboard/products');
    } else {
      setError(result.message || '登录失败');
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
        background: 'var(--layers-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--layers-border)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-elevated)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--layers-text)',
            textDecoration: 'none',
          }}>
            Layers<span style={{ color: 'var(--layers-brand)' }}>.</span>
          </Link>
          <div style={{ fontSize: '14px', color: 'var(--layers-text-muted)', marginTop: '8px' }}>
            创作者登录
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--layers-text)',
              marginBottom: '6px',
            }} htmlFor="email">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                background: 'var(--layers-bg)',
                color: 'var(--layers-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--layers-text)',
              marginBottom: '6px',
            }} htmlFor="password">
              密码
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  border: '1px solid var(--layers-border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '14px',
                  background: 'var(--layers-bg)',
                  color: 'var(--layers-text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--layers-text-muted)',
                  padding: '4px',
                  fontSize: '13px',
                }}
              >
                {showPassword ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(212,98,58,0.1)',
              color: 'var(--layers-brand)',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: loading ? 'var(--layers-gray-300)' : 'var(--layers-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--layers-text-muted)', marginTop: '24px' }}>
          还没有账号？ <Link href="/become-a-vendor" style={{ color: 'var(--layers-brand)' }}>申请入驻</Link>
        </p>
      </div>
    </div>
  );
}
