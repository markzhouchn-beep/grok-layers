'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

const CATEGORIES = [
  { key: 'all', href: '/shop' },
  { key: 't-shirts', href: '/shop?category=t-shirts' },
  { key: 'hoodies', href: '/shop?category=hoodies' },
  { key: 'art-prints', href: '/shop?category=art-prints' },
  { key: 'phone-cases', href: '/shop?category=phone-cases' },
  { key: 'mugs', href: '/shop?category=mugs' },
  { key: 'tote-bags', href: '/shop?category=tote-bags' },
  { key: 'stickers', href: '/shop?category=stickers' },
];

const LABELS_ZH = ['全部', 'T恤', '卫衣', '版画', '手机壳', '马克杯', '帆布袋', '贴纸'];
const LABELS_EN = ['All', 'T-Shirts', 'Hoodies', 'Art Prints', 'Phone Cases', 'Mugs', 'Tote Bags', 'Stickers'];

export default function CategoryPills() {
  const { lang } = useLang();
  const labels = lang === 'zh' ? LABELS_ZH : LABELS_EN;

  return (
    <section className="section-sm">
      <div className="container">
        <div className="category-pills">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.href} href={cat.href} className="category-pill">
              {labels[i]}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
