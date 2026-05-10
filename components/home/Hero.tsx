'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function Hero() {
  const { t, lang } = useLang();

  return (
    <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Abstract background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600&q=75)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.25,
        zIndex: 0,
      }}
      />
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(15,15,14,0.45) 0%, rgba(15,15,14,0.75) 100%)',
        zIndex: 1,
      }} />

      <div className="hero-inner" style={{ position: 'relative', zIndex: 2 }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(212,98,58,0.15)',
          borderRadius: '9999px',
          marginBottom: '24px',
          fontSize: '13px',
          color: 'rgba(244,241,235,0.85)',
          fontWeight: 500,
        }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--layers-brand)', borderRadius: '50%', display: 'inline-block' }} />
          {t.hero.eyebrow}
        </div>

        <h1 className="hero-title" style={{ whiteSpace: 'pre-line' }}>
          {t.hero.title}
        </h1>
        <p className="hero-subtitle" style={{ whiteSpace: 'pre-line' }}>
          {t.hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="hero-actions" style={{ marginTop: '28px' }}>
          <Link href="/shop" className="btn btn-primary btn-lg">
            {t.hero.cta1}
          </Link>
          <Link href="/become-a-vendor" className="btn btn-lg btn-outline-light">
            {t.hero.cta2}
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">{lang === 'zh' ? '持续增长中' : 'Growing'}</span>
            <span className="hero-stat-label">{t.hero.stats.artists}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">{lang === 'zh' ? '全球覆盖' : 'Global'}</span>
            <span className="hero-stat-label">{t.hero.stats.countries}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">48h</span>
            <span className="hero-stat-label">{t.hero.stats.reviewTime}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
