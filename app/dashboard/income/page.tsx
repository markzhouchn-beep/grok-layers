'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

interface Earning {
  id: string;
  productTitle: string;
  category: string;
  salePrice: number;
  currency: string;
  royaltyRate: number;
  royaltyAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

interface Summary {
  total: number;
  totalPending: number;
  totalPaid: number;
}

export default function DashboardIncomePage() {
  const { lang } = useLang();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, totalPending: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/income', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.success) {
          setEarnings(j.data.earnings || []);
          setSummary(j.data.summary || { total: 0, totalPending: 0, totalPaid: 0 });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = earnings.filter(e => e.status === 'pending');
  const paid = earnings.filter(e => e.status === 'paid');

  const fmt = (n: number) => n === 0 ? '$0.00' : `$${n.toFixed(2)}`;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
          {lang === 'zh' ? '收入结算' : 'Earnings'}
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>
          {lang === 'zh' ? '你的收入明细，PayPal 自动结算' : 'Your earnings, settled via PayPal'}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {[
          {
            label: lang === 'zh' ? '总收入（USD）' : 'Total (USD)',
            value: fmt(summary.total),
            icon: <DollarSign size={18} />,
            color: 'var(--layers-text)',
          },
          {
            label: lang === 'zh' ? '待结算' : 'Pending',
            value: fmt(summary.totalPending),
            icon: <Clock size={18} />,
            color: 'var(--layers-brand)',
          },
          {
            label: lang === 'zh' ? '已结算' : 'Paid',
            value: fmt(summary.totalPaid),
            icon: <TrendingUp size={18} />,
            color: 'var(--layers-success)',
          },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--layers-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--layers-border)',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--layers-text-muted)' }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{stat.label}</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              color: stat.color,
            }}>
              {loading ? '—' : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* PayPal fee explanation */}
      {earnings.length > 0 && (
        <div style={{
          padding: '20px',
          background: 'rgba(212,98,58,0.06)',
          border: '1px solid rgba(212,98,58,0.2)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '32px',
          fontSize: '14px',
          color: 'var(--layers-text-muted)',
          lineHeight: 1.7,
        }}>
          <strong style={{ color: 'var(--layers-text)' }}>{lang === 'zh' ? 'PayPal 结算说明：' : 'PayPal Settlement:'}</strong>
          {lang === 'zh'
            ? ' 每笔订单扣除 2.99% + $0.30 作为平台手续费。实际到账以 PayPal 通知为准。'
            : ' 2.99% + $0.30 per transaction. Actual amount received follows PayPal notification.'}
        </div>
      )}

      {/* Earnings table */}
      <div style={{
        background: 'var(--layers-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--layers-border)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)', fontSize: '14px' }}>
            {lang === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        ) : earnings.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--layers-text-muted)', fontSize: '14px' }}>
            {lang === 'zh' ? '暂无收入记录' : 'No earnings yet'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--layers-gray-50)', borderBottom: '1px solid var(--layers-border)' }}>
                {['商品', '类目', '售价', '版税比例', '版税金额', '手续费', '实际到手', '状态', '日期'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--layers-text-muted)', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {earnings.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < earnings.length - 1 ? '1px solid var(--layers-border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{e.productTitle}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)', textTransform: 'capitalize' }}>{e.category}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{e.currency}{e.salePrice.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{(e.royaltyRate * 100).toFixed(0)}%</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-success)', fontWeight: 600 }}>+{e.currency}{e.royaltyAmount.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)' }}>-{e.currency}{e.platformFee.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>{e.currency}{e.netAmount.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: e.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(212,98,58,0.1)',
                      color: e.status === 'paid' ? 'var(--layers-success)' : 'var(--layers-brand)',
                    }}>
                      {e.status === 'paid' ? (lang === 'zh' ? '已结算' : 'Paid') : (lang === 'zh' ? '待结算' : 'Pending')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--layers-text-muted)' }}>{e.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
