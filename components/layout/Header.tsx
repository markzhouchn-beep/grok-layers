'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { useCreatorAuth } from '@/lib/auth/CreatorAuth';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { lang, toggleLang, t } = useLang();
  const { creator, loading } = useCreatorAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="site-logo">
          Layers<span className="accent">.</span>
        </Link>

        {/* Nav */}
        <nav className="primary-nav">
          <Link href="/shop" className="nav-link">{t.nav.explore}</Link>
          <Link href="/become-a-vendor" className="nav-link">{t.nav.becomeCreator}</Link>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <button
            className="lang-toggle"
            onClick={toggleLang}
            aria-label="Toggle language"
          >
            {lang === 'zh' ? 'EN' : '中文'}
          </button>
          {loading ? null : creator ? (
            <>
              <Link href="/dashboard/products" style={{
                fontSize: '13px', fontWeight: 600,
                color: 'var(--layers-brand)', padding: '6px 10px',
                borderRadius: 'var(--radius-md)', textDecoration: 'none',
              }}>
                {creator.name}
              </Link>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/';
                }}
                style={{
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--layers-text-muted)', padding: '6px 10px',
                  borderRadius: 'var(--radius-md)', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                }}
              >
                {lang === 'zh' ? '退出' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: '13px', fontWeight: 600,
                color: 'var(--layers-text-muted)', padding: '6px 10px',
                borderRadius: 'var(--radius-md)', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--layers-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--layers-text-muted)')}
              >
                {t.nav.signin}
              </Link>
              <Link href="/become-a-vendor" className="btn btn-primary btn-sm">
                {t.nav.becomeCreator}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
