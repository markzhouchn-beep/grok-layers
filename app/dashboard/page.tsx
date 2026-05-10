'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /dashboard/products
    router.replace('/dashboard/products');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>Loading...</div>
    </div>
  );
}
