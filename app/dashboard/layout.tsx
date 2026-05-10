'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCreatorAuth } from '@/lib/auth/CreatorAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Package, LayoutDashboard, DollarSign, Settings, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard/products', label: '我的作品', labelEn: 'My Artworks', icon: Package },
  { href: '/dashboard/income', label: '收入结算', labelEn: 'Earnings', icon: DollarSign },
  { href: '/dashboard/settings', label: '主页设置', labelEn: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { creator, loading, logout } = useCreatorAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!creator || (creator as any).status === 'pending' || (creator as any).status === 'rejected')) {
      router.push('/login');
    }
  }, [loading, creator, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--layers-bg)' }}>
        <div style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  if (!creator) return null;

  // Show login page if on login route
  if (pathname === '/dashboard/login') return <>{children}</>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--layers-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--layers-navy)',
        padding: '24px 0',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, textDecoration: 'none' }}>
            Layers<span style={{ color: 'var(--layers-brand)' }}>.</span>
          </Link>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            {creator.name}
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? '3px solid var(--layers-brand)' : '3px solid transparent',
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 20px' }}>
          <Link href={`/creator/${creator.id}`} target="_blank" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 0',
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            fontSize: '13px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <LayoutDashboard size={14} />
            查看我的主页
          </Link>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 0',
              color: 'rgba(255,255,255,0.4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
            }}
          >
            <LogOut size={14} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
