'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, User, Image as ImageIcon } from 'lucide-react';
import { useCreatorAuth } from '@/lib/auth/CreatorAuth';

interface ProfileData {
  name: string;
  avatar?: string;
  banner?: string;
  portfolio?: string;
  art_style?: string;
  wechat?: string;
}

export default function CreatorEditPage() {
  const { creator } = useCreatorAuth();
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile data
  useEffect(() => {
    if (!creator?.id) return;
    fetch(`/api/creators/profile?id=${creator.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.data) {
          const d: ProfileData = j.data;
          if (d.name) setName(d.name);
          if (d.avatar) setPreviewAvatar(d.avatar);
          if (d.banner) setPreviewBanner(d.banner);
          if (d.portfolio) setPortfolio(d.portfolio);
          if (d.art_style) setArtStyle(d.art_style);
        }
      })
      .catch(() => {});
  }, [creator?.id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setPreviewBanner(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator?.id) return;
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, string> = { name };
      if (avatarFile) body.avatar = await fileToBase64(avatarFile);
      if (bannerFile) body.banner = await fileToBase64(bannerFile);
      if (portfolio !== undefined) body.portfolio = portfolio;
      if (artStyle !== undefined) body.art_style = artStyle;

      const res = await fetch('/api/creators/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        setSaved(true);
        setAvatarFile(null);
        setBannerFile(null);
        // Update preview with returned URLs if new files were uploaded
        if (json.data?.avatar) setPreviewAvatar(json.data.avatar);
        if (json.data?.banner) setPreviewBanner(json.data.banner);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.message || '保存失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard" style={{ fontSize: '13px', color: 'var(--layers-text-muted)', textDecoration: 'none' }}>
          ← 返回创作者后台
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginTop: '12px' }}>
          编辑我的主页
        </h1>
        <p style={{ color: 'var(--layers-text-muted)', fontSize: '14px', marginTop: '8px' }}>
          自定义你的创作者主页外观
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Banner Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--layers-text)' }}>
            主页横幅 / Banner
          </label>
          <div style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '2px dashed var(--layers-border)',
            position: 'relative',
            height: '200px',
            background: 'var(--layers-gray-50)',
          }}>
            {previewBanner ? (
              <img src={previewBanner} alt="banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--layers-text-muted)' }}>
                <ImageIcon size={32} />
                <span style={{ fontSize: '14px' }}>点击下方按钮上传Banner图</span>
                <span style={{ fontSize: '12px' }}>建议尺寸 1200×400，JPG/PNG</span>
              </div>
            )}
            <label style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              padding: '8px 16px',
              background: 'var(--layers-navy)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Upload size={14} />
              上传Banner
              <input type="file" accept="image/*" onChange={handleBannerChange} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--layers-text)' }}>
            头像 / Avatar
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--layers-gray-100)',
              border: '3px solid var(--layers-border)',
              flexShrink: 0,
            }}>
              {previewAvatar ? (
                <img src={previewAvatar} alt="avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <User size={36} color="var(--layers-gray-300)" />
                </div>
              )}
            </div>
            <label style={{
              padding: '8px 20px',
              background: 'var(--layers-white)',
              border: '1.5px solid var(--layers-border)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--layers-text)',
            }}>
              <Upload size={14} />
              上传头像
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginTop: '8px' }}>
            建议正方形图片，最小 200×200，JPG/PNG
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--layers-text)' }}>
            显示名称 / Display Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Portfolio */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--layers-text)' }}>
            作品集链接 / Portfolio URL
          </label>
          <input
            type="url"
            value={portfolio}
            onChange={e => setPortfolio(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Art Style */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--layers-text)' }}>
            艺术风格 / Art Style
          </label>
          <input
            type="text"
            value={artStyle}
            onChange={e => setArtStyle(e.target.value)}
            placeholder="例如：抽象几何、水墨、插画..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--layers-border)', borderRadius: 'var(--radius-lg)', fontSize: '14px', background: 'var(--layers-bg)', color: 'var(--layers-text)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              background: 'var(--layers-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
          {saved && (
            <span style={{ color: 'var(--layers-success)', fontSize: '14px', fontWeight: 500 }}>
              ✓ 已保存
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
