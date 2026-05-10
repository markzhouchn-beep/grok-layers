'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Package, Users, FileText, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const NAV_ITEMS = [
  { href: '/admin/artworks', label: '作品审核', labelEn: 'Artworks', icon: Package },
  { href: '/admin/manage/products', label: '周边管理', labelEn: 'Products', icon: ShoppingBag },
  { href: '/admin/applications', label: '入驻申请', labelEn: 'Applications', icon: FileText },
  { href: '/admin/creators', label: '创作者', labelEn: 'Creators', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Login page has no sidebar
  if (pathname === '/admin/login') return <>{children}</>;

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
            Admin Panel
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
                {lang === 'zh' ? item.label : item.labelEn}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 20px' }}>
          <Link href="/" style={{
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
            {lang === 'zh' ? '返回主页' : 'Back to Site'}
          </Link>
          <button
            onClick={handleLogout}
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
            {lang === 'zh' ? '退出登录' : 'Logout'}
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
