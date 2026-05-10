'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { CheckCircle } from 'lucide-react';

export default function VendorPage() {
  const { lang, t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', wechat: '', portfolio: '', art_style: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // No password needed here — admin generates temp password on approval
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, email: form.email, wechat: form.wechat, portfolio: form.portfolio, art_style: form.art_style }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const json = await res.json();
        alert(json.message || (lang === 'zh' ? '提交失败，请重试' : 'Submission failed. Please try again.'));
      }
    } catch {
      alert(lang === 'zh' ? '网络错误，请重试' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--layers-navy) 0%, var(--layers-navy-mid) 100%)',
        padding: '80px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,107,0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '20px',
            letterSpacing: '-0.02em',
          }}>
            {t.vendor.heroTitle}
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            {t.vendor.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="section" style={{ background: 'var(--layers-gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t.vendor.formTitle}</h2>
            <p className="section-subtitle">{t.vendor.formSubtitle}</p>
          </div>

          {submitted ? (
            <div style={{
              maxWidth: '560px',
              margin: '0 auto',
              textAlign: 'center',
              padding: '48px',
              background: 'var(--layers-white)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={28} color="var(--layers-success)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
                {t.vendor.submittedTitle}
              </h3>
              <p style={{ color: 'var(--layers-text-muted)', fontSize: '15px' }}>
                {t.vendor.submittedText}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="vendor-form-card"
              style={{ marginTop: '0' }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="name">{t.vendor.nameLabel}</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder={t.vendor.namePlaceholder}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">{t.vendor.emailLabel}</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder={t.vendor.emailPlaceholder}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="wechat">{lang === 'zh' ? '微信（选填）' : 'WeChat (optional)'}</label>
                <input
                  id="wechat"
                  type="text"
                  className="form-input"
                  placeholder={lang === 'zh' ? '你的微信号' : 'Your WeChat ID'}
                  value={form.wechat}
                  onChange={(e) => setForm({ ...form, wechat: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="portfolio">{t.vendor.portfolioLabel}</label>
                <input
                  id="portfolio"
                  type="text"
                  className="form-input"
                  placeholder={t.vendor.portfolioPlaceholder}
                  value={form.portfolio}
                  onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="art_style">{t.vendor.artStyleLabel}</label>
                <input
                  id="art_style"
                  type="text"
                  className="form-input"
                  placeholder={t.vendor.artStylePlaceholder}
                  value={form.art_style}
                  onChange={(e) => setForm({ ...form, art_style: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? (lang === 'zh' ? '提交中...' : 'Submitting...') : t.vendor.submit}
              </button>

              <p style={{ fontSize: '12px', color: 'var(--layers-text-muted)', textAlign: 'center', marginTop: '16px' }}>
                {t.vendor.submitNote}
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
