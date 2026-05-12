'use client';

import { ExternalLink } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  titleEn?: string;
  price: string;
  currency: string;
  imageUrl: string;
  artistName: string;
  artistId: string;
  category: string;
  purchaseUrl?: string;
  artworkId?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const {
    id, title, price, currency, imageUrl,
    artistName, artistId, category, purchaseUrl, artworkId,
  } = product;

  // Card wrapper — if has purchaseUrl, links directly to store; else just div
  const CardWrapper = purchaseUrl
    ? ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
        <a
          href={purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none', ...style }}
        >
          {children}
        </a>
      )
    : ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
        <div style={style}>{children}</div>
      );

  return (
    <div style={{
      background: 'var(--layers-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--layers-border)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Image — click goes to external store */}
      <CardWrapper style={{ display: 'block', position: 'relative' }}>
        <div style={{ aspectRatio: '1', background: 'var(--layers-gray-100)', overflow: 'hidden' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                (img.parentElement!.querySelector('.img-fallback') as HTMLElement)!.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="img-fallback" style={{ display: imageUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--layers-text-muted)', fontSize: '13px' }}>
            No Image
          </div>
        </div>
      </CardWrapper>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        {/* Title — click goes to external store */}
        <CardWrapper>
          <div style={{
            fontSize: '14px', fontWeight: 600, color: 'var(--layers-text)',
            marginBottom: '6px', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </div>
        </CardWrapper>

        {/* Artist */}
        <a href={`/creator/${artistId}`} style={{
          fontSize: '12px', color: 'var(--layers-text-muted)',
          textDecoration: 'none', marginBottom: '10px', display: 'block',
        }}>
          {artistName}
        </a>

        {/* Price + Buy button */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--layers-text)' }}>
            {currency}{price}
          </span>

          {purchaseUrl ? (
            <a
              href={purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', borderRadius: '8px',
                background: 'var(--layers-brand)', color: '#fff',
                fontSize: '11px', fontWeight: 600, textDecoration: 'none',
              }}
            >
              <ExternalLink size={10} />
              Buy
            </a>
          ) : (
            <span style={{
              fontSize: '11px', color: 'var(--layers-text-muted)', padding: '5px 10px',
            }}>
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
