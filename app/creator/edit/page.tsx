'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, User, Image as ImageIcon } from 'lucide-react';

export default function CreatorEditPage() {
  const router = useRouter();
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewAvatar(url);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewBanner(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // In production: upload files to storage + call PATCH /api/creators/:id
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/creators" style={{ fontSize: '13px', color: 'var(--layers-text-muted)', textDecoration: 'none' }}>
          ← { /* ← */ '返回创作者管理'}
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
        <div className="form-group">
          <label className="form-label" htmlFor="name">显示名称 / Display Name</label>
          <input
            id="name"
            type="text"
            className="form-input"
            placeholder="你的艺名或真名"
            defaultValue="赵毅"
          />
        </div>

        {/* Bio */}
        <div className="form-group">
          <label className="form-label" htmlFor="bio">个人简介 / Bio</label>
          <textarea
            id="bio"
            className="form-input"
            rows={4}
            placeholder="介绍一下你自己和你的艺术风格..."
            defaultValue="抽象几何艺术家，作品曾在上海当代艺术展展出。热爱用纯粹的几何语言探索城市与自然的关系。"
          />
        </div>

        {/* Instagram */}
        <div className="form-group">
          <label className="form-label" htmlFor="instagram">Instagram</label>
          <input
            id="instagram"
            type="text"
            className="form-input"
            placeholder="your.instagram.username"
            defaultValue="zhaoyi.art"
          />
        </div>

        {/*小红书 */}
        <div className="form-group">
          <label className="form-label" htmlFor="rednote">小红书 / RedNote</label>
          <input
            id="rednote"
            type="text"
            className="form-input"
            placeholder="你的小红书主页链接"
            defaultValue="赵毅艺术"
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="submit"
            className="btn btn-primary"
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
