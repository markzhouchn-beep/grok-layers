'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link href="/" className="site-logo" style={{ color: '#fff' }}>
              Layers<span style={{ color: 'var(--layers-brand)' }}>.</span>
            </Link>
            <p>{t.footer.tagline}</p>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h4>{t.footer.shop}</h4>
            <Link href="/shop">{t.footer.allProducts}</Link>
            <Link href="/shop?category=t-shirts">{t.footer.tshirts}</Link>
            <Link href="/shop?category=art-prints">{t.footer.prints}</Link>
            <Link href="/shop?category=mugs">{t.footer.mugs}</Link>
            <Link href="/shop?category=phone-cases">{t.footer.phoneCases}</Link>
          </div>

          {/* Creators */}
          <div className="footer-col">
            <h4>{t.footer.creators}</h4>
            <Link href="/become-a-vendor">{t.footer.apply}</Link>
            <Link href="/how-it-works">{t.footer.howItWorks}</Link>
            <Link href="/pricing">{t.footer.pricing}</Link>
            <Link href="/faq">{t.footer.faq}</Link>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>{t.footer.support}</h4>
            <Link href="/about">{t.footer.about}</Link>
            <Link href="/contact">{t.footer.contact}</Link>
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t.footer.copyright.replace('{year}', String(year))}</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Instagram</Link>
            <Link href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>小红书</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
