'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function CTABanner() {
  const { t } = useLang();

  return (
    <section className="cta-banner">
      <div className="container">
        <h2 className="cta-title">{t.cta.title}</h2>
        <p className="cta-subtitle">{t.cta.subtitle}</p>
        <div className="cta-actions">
          <Link href="/become-a-vendor" className="btn btn-primary btn-lg">
            {t.cta.cta1}
          </Link>
          <Link href="/shop" className="btn btn-lg btn-outline-light">
            {t.cta.cta2}
          </Link>
        </div>
      </div>
    </section>
  );
}
