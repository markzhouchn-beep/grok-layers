'use client';

import { useLang } from '@/lib/i18n';

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? 'var(--layers-brand)' : 'none'} stroke="var(--layers-brand)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { t } = useLang();
  const testimonials = t.testimonials;

  const reviews = [
    {
      name: testimonials.reviewer1Name,
      role: testimonials.reviewer1Role,
      text: testimonials.reviewer1Text,
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    },
    {
      name: testimonials.reviewer2Name,
      role: testimonials.reviewer2Role,
      text: testimonials.reviewer2Text,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      name: testimonials.reviewer3Name,
      role: testimonials.reviewer3Role,
      text: testimonials.reviewer3Text,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{testimonials.title}</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginTop: '48px',
        }}>
          {reviews.map((t, i) => (
            <div
              key={i}
              style={{
                background: 'var(--layers-white)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px',
                border: '1px solid var(--layers-border)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stars count={5} />

              <blockquote style={{
                fontSize: '14px',
                lineHeight: 1.75,
                color: 'var(--layers-text)',
                margin: '0 0 24px',
                flex: 1,
                fontStyle: 'normal',
              }}>
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: t.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--layers-text)',
                  }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)' }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
