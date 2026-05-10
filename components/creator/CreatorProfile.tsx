'use client';

import Link from 'next/link';
import { MapPin, Globe, MessageCircle, ExternalLink, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { useLang } from '@/lib/i18n';

interface Creator {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;
  banner: string;
  bio: string;
  bioEn: string;
  artStyle: string;
  location: string;
  followerCount: number;
  productCount: number;
  joinDate: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    rednote?: string;
  };
}

interface Product {
  id: string;
  artworkId: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  mockups: string[];
  purchaseUrl?: string;
  status: string;
  category: string;
}

interface Artwork {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  status: string;
  category: string;
  createdAt: string;
}

const VARIANT_LABELS: Record<string, string> = {
  't-shirts': 'T恤', 'hoodies': '卫衣', 'art-prints': '版画',
  'phone-cases': '手机壳', 'mugs': '马克杯', 'tote-bags': '帆布袋',
};

export default function CreatorProfile({
  creator,
  products,
  artworks,
}: {
  creator: Creator;
  products: Product[];
  artworks: Artwork[];
}) {
  const { lang } = useLang();
  const name = lang === 'zh' ? creator.name : creator.nameEn;
  const bio = lang === 'zh' ? creator.bio : creator.bioEn;
  const joinYear = new Date(creator.joinDate).getFullYear();

  // Group products by artworkId
  const productsByArtwork = new Map<string, Product[]>();
  for (const p of products) {
    if (!productsByArtwork.has(p.artworkId)) productsByArtwork.set(p.artworkId, []);
    productsByArtwork.get(p.artworkId)!.push(p);
  }

  // Sort artworks by createdAt desc
  const sortedArtworks = [...artworks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      {/* Banner */}
      <div style={{
        height: '280px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img src={creator.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))' }} />
      </div>

      {/* Profile Card — overlaps banner */}
      <div style={{
        maxWidth: '960px',
        margin: '-60px auto 0',
        padding: '0 24px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          background: 'var(--layers-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--layers-border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}>
          {/* Avatar + Basic Info */}
          <div style={{ padding: '24px 32px 28px', display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%',
              border: '4px solid var(--layers-bg)', boxShadow: 'var(--shadow-card)',
              overflow: 'hidden', flexShrink: 0, marginTop: '-48px', position: 'relative', zIndex: 3,
            }}>
              <img src={creator.avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1, paddingTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>{name}</h1>
                <span style={{ padding: '3px 10px', borderRadius: '9999px', background: 'rgba(34,197,94,0.1)', color: 'var(--layers-success)', fontSize: '12px', fontWeight: 600 }}>
                  {lang === 'zh' ? '已认证创作者' : 'Verified Creator'}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--layers-text-muted)', marginBottom: '10px' }}>
                {creator.artStyle}
                {creator.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '12px' }}><MapPin size={13} />{creator.location}</span>}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--layers-text)', lineHeight: 1.7, maxWidth: '520px' }}>{bio}</p>
            </div>

            {/* Social links */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', flexShrink: 0 }}>
              {creator.socialLinks.instagram && (
                <a href={`https://instagram.com/${creator.socialLinks.instagram}`} target="_blank" rel="noopener" style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid var(--layers-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--layers-text-muted)', textDecoration: 'none' }}>
                  <Globe size={16} />
                </a>
              )}
              {creator.socialLinks.rednote && (
                <a href={`https://www.xiaohongshu.com/user/profile/${creator.socialLinks.rednote}`} target="_blank" rel="noopener" style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid var(--layers-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--layers-text-muted)', textDecoration: 'none' }}>
                  <MessageCircle size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ borderTop: '1px solid var(--layers-border)', padding: '16px 32px', display: 'flex', gap: '40px' }}>
            {[
              { value: creator.followerCount.toLocaleString(), label: lang === 'zh' ? '粉丝' : 'Followers' },
              { value: String(artworks.length), label: lang === 'zh' ? '作品' : 'Artworks' },
              { value: String(joinYear), label: lang === 'zh' ? '入驻年份' : 'Joined' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--layers-text)' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Artworks with Variants */}
        {sortedArtworks.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
              {lang === 'zh' ? 'TA 的作品' : 'Artworks & Products'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sortedArtworks.map(aw => {
                const variants = productsByArtwork.get(aw.id) || [];
                const variantCount = variants.length;

                return (
                  <div key={aw.id} style={{
                    background: 'var(--layers-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--layers-border)',
                    overflow: 'hidden',
                  }}>
                    {/* Artwork header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                      <img
                        src={aw.artworkUrl}
                        alt={aw.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--layers-gray-100)' }}
                        onError={e => { (e.target as HTMLImageElement).src = '/images/mockups/tshirt-1.jpg'; }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                          {aw.title || '(无标题)'}
                        </div>
                        {variantCount > 0 ? (
                          <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                            {lang === 'zh' ? `${variantCount} 个周边商品` : `${variantCount} product variants`}
                            {variants.some(v => v.purchaseUrl) && ` · ${lang === 'zh' ? '可购买' : 'available for purchase'}`}
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', color: 'var(--layers-text-muted)' }}>
                            {lang === 'zh' ? '暂无周边商品' : 'No product variants yet'}
                          </div>
                        )}
                      </div>
                      {variantCount > 0 && (
                        <Link
                          href={`/shop?artwork=${aw.id}&creator=${creator.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '6px 14px', borderRadius: '8px',
                            background: 'var(--layers-brand)', color: '#fff',
                            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                          }}
                        >
                          {lang === 'zh' ? '查看全部' : 'View All'} <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
                        </Link>
                      )}
                    </div>

                    {/* Variant grid */}
                    {variantCount > 0 && (
                      <div style={{
                        borderTop: '1px solid var(--layers-border)',
                        padding: '16px 20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: '12px',
                      }}>
                        {variants.slice(0, 6).map(v => {
                          const mockupUrl = (v.mockups || [])[0];
                          return (
                            <div key={v.id} style={{
                              background: 'var(--layers-surface)',
                              borderRadius: 'var(--radius-lg)',
                              border: '1px solid var(--layers-border)',
                              overflow: 'hidden',
                            }}>
                              {mockupUrl ? (
                                <img
                                  src={mockupUrl}
                                  alt={v.category}
                                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', background: 'var(--layers-gray-100)' }}
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div style={{ width: '100%', aspectRatio: '1', background: 'var(--layers-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <ImageIcon size={24} color="var(--layers-text-muted)" />
                                </div>
                              )}
                              <div style={{ padding: '10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                                  {VARIANT_LABELS[v.category] || v.category}
                                </div>
                                {v.purchaseUrl ? (
                                  <a href={v.purchaseUrl} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--layers-brand)', textDecoration: 'none', fontWeight: 500 }}>
                                    <ExternalLink size={10} />
                                    {lang === 'zh' ? '购买' : 'Buy'}
                                  </a>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--layers-text-muted)' }}>{lang === 'zh' ? '即将上线' : 'Coming soon'}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ height: '80px' }} />
    </div>
  );
}
