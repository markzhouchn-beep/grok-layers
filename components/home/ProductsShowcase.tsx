'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

const PRODUCTS = [
  { nameKey: 'tshirt', descKey: 'tshirtDesc', badgeKey: 'tshirtBadge', img: '/images/mockups/tshirt-1.jpg' },
  { nameKey: 'canvas', descKey: 'canvasDesc', badgeKey: 'canvasBadge', img: '/images/mockups/canvas-1.jpg' },
  { nameKey: 'mug', descKey: 'mugDesc', img: '/images/mockups/mug-1.jpg' },
  { nameKey: 'tote', descKey: 'toteDesc', img: '/images/mockups/tote-1.png' },
];

export default function ProductsShowcase() {
  const { t } = useLang();
  const showcase = t.showcase;

  return (
    <section className="section" style={{ background: 'var(--layers-gray-50)' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{showcase.title}</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginTop: '48px',
        }}>
          {PRODUCTS.map((p, i) => {
            const name = showcase[p.nameKey as keyof typeof showcase] as string;
            const desc = showcase[p.descKey as keyof typeof showcase] as string;
            const badge = p.badgeKey ? (showcase[p.badgeKey as keyof typeof showcase] as string) : null;

            return (
              <div
                key={i}
                style={{
                  background: 'var(--layers-white)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all var(--transition-normal)',
                  position: 'relative',
                }}
              >
                {badge && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 2,
                    background: 'var(--layers-brand)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                  }}>
                    {badge}
                  </div>
                )}

                <div style={{
                  aspectRatio: '1/1',
                  background: 'var(--layers-gray-100)',
                  overflow: 'hidden',
                }}>
                  <img
                    src={p.img}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ padding: '16px' }}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--layers-text)',
                    marginBottom: '4px',
                  }}>
                    {name}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--layers-text-muted)', margin: 0 }}>
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
