'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { lang } = useLang();

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
        maxWidth: '380px',
        background: 'var(--layers-surface)',
        border: '1px solid var(--layers-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--layers-brand)',
            marginBottom: '6px',
          }}>
            Layers Admin
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--layers-text-muted)' }}>
            {lang === 'zh' ? '管理员登录' : 'Administrator Login'}
          </p>
        </div>

        {/* Pure HTML form — browser handles cookie + redirect automatically */}
        <form action="/api/admin/auth/login" method="POST">
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              {lang === 'zh' ? '管理员账号' : 'Username'}
            </label>
            <input
              type="text"
              name="username"
              required
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
              placeholder="admin"
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              {lang === 'zh' ? '密码' : 'Password'}
            </label>
            <input
              type="password"
              name="password"
              required
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '11px',
              background: 'var(--layers-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {lang === 'zh' ? '登录' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--layers-text-muted)', textDecoration: 'none' }}>
            ← {lang === 'zh' ? '返回首页' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}