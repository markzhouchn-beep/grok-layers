'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

const NUMS = ['01', '02', '03'];

export default function HowItWorks() {
  const { t } = useLang();
  const steps = [
    { title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
  ];

  return (
    <section className="section" id="how">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t.howItWorks.title}</h2>
          <p className="section-subtitle">{t.howItWorks.subtitle}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '56px',
        }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                background: 'var(--layers-gray-100)',
                border: '1px solid var(--layers-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '40px 32px',
                textAlign: 'center',
                transition: 'border-color var(--transition-normal)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '52px',
                fontWeight: 800,
                color: 'var(--layers-brand)',
                lineHeight: 1,
                marginBottom: '24px',
                letterSpacing: '-0.04em',
                opacity: 0.4,
              }}>
                {NUMS[i]}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--layers-text)',
                marginBottom: '12px',
                letterSpacing: '-0.01em',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--layers-text-muted)',
                lineHeight: 1.75,
                maxWidth: '260px',
                margin: '0 auto',
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '56px' }}>
          <Link href="/become-a-vendor" className="btn btn-primary btn-lg">
            {t.howItWorks.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
