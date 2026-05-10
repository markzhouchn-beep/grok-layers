'use client';

import { useState, useEffect, useRef } from 'react';
import { useCreatorAuth } from '@/lib/auth/CreatorAuth';
import { useLang } from '@/lib/i18n';
import { Share2, CheckCircle, Copy, ExternalLink, User, Image as ImageIcon, Upload } from 'lucide-react';

interface ProfileData {
  name: string;
  avatar: string;
  banner: string;
  portfolio: string;
  art_style: string;
  wechat: string;
}

interface ImageUploadState {
  file: File | null;
  preview: string;
  dataUrl: string;
}

export default function DashboardSettingsPage() {
  const { creator, refreshAuth } = useCreatorAuth();
  const { lang } = useLang();

  // Profile edit
  const [profile, setProfile] = useState<ProfileData>({ name: '', avatar: '', banner: '', portfolio: '', art_style: '', wechat: '' });
  const [avatarUpload, setAvatarUpload] = useState<ImageUploadState>({ file: null, preview: '', dataUrl: '' });
  const [bannerUpload, setBannerUpload] = useState<ImageUploadState>({ file: null, preview: '', dataUrl: '' });
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileInit, setProfileInit] = useState(false);

  // Password change
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Share
  const [copied, setCopied] = useState(false);
  const profileUrl = creator ? `${typeof window !== 'undefined' ? window.location.origin : ''}/creator/${creator.id}` : '';

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Load creator profile data
  useEffect(() => {
    if (!creator?.id) return;
    fetch(`/api/creators/profile?id=${creator.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.data) {
          const c = j.data;
          setProfile({
            name: c.name || '',
            avatar: c.avatar || '',
            banner: c.banner || '',
            portfolio: c.portfolio || '',
            art_style: c.art_style || '',
            wechat: c.wechat || '',
          });
          if (c.avatar) setAvatarUpload(prev => ({ ...prev, preview: c.avatar }));
          if (c.banner) setBannerUpload(prev => ({ ...prev, preview: c.banner }));
        }
      })
      .finally(() => setProfileInit(true));
  }, [creator?.id]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(lang === 'zh' ? '请选择图片文件' : 'Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarUpload({ file, preview: dataUrl, dataUrl });
    };
    reader.readAsDataURL(file);
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(lang === 'zh' ? '请选择图片文件' : 'Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBannerUpload({ file, preview: dataUrl, dataUrl });
    };
    reader.readAsDataURL(file);
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const payload: Record<string, string> = {
        name: profile.name,
      };
      // Only include image data if user selected a new file
      if (avatarUpload.dataUrl) payload.avatar = avatarUpload.dataUrl;
      if (bannerUpload.dataUrl) payload.banner = bannerUpload.dataUrl;

      const res = await fetch('/api/creators/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setProfileMsg({ type: 'success', text: lang === 'zh' ? '主页设置已更新！' : 'Profile updated!' });
        await refreshAuth();
        // Update previews to persist showing the saved image
        if (avatarUpload.dataUrl) setAvatarUpload(prev => ({ ...prev, file: null }));
        if (bannerUpload.dataUrl) setBannerUpload(prev => ({ ...prev, file: null }));
      } else {
        setProfileMsg({ type: 'error', text: json.error || 'Update failed' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: lang === 'zh' ? '网络错误' : 'Network error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwdForm.newPwd !== pwdForm.confirm) {
      setPwdMsg({ type: 'error', text: lang === 'zh' ? '两次密码不一致' : 'Passwords do not match' });
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: creator?.id, currentPassword: pwdForm.current, newPassword: pwdForm.newPwd }),
      });
      const json = await res.json();
      if (res.ok) {
        setPwdMsg({ type: 'success', text: lang === 'zh' ? '密码修改成功！' : 'Password changed!' });
        setPwdForm({ current: '', newPwd: '', confirm: '' });
      } else {
        setPwdMsg({ type: 'error', text: json.error || 'Error' });
      }
    } catch {
      setPwdMsg({ type: 'error', text: lang === 'zh' ? '网络错误' : 'Network error' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = profileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--layers-border)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '14px',
    background: 'var(--layers-bg)',
    color: 'var(--layers-text)',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  // Avatar upload area
  const AvatarUploadArea = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Current/new avatar preview */}
        <div
          onClick={() => avatarInputRef.current?.click()}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '2px dashed var(--layers-border)',
            background: avatarUpload.preview ? 'transparent' : 'var(--layers-gray-100)',
            backgroundImage: avatarUpload.preview ? `url(${avatarUpload.preview})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--layers-text-muted)',
            transition: 'border-color 0.2s',
          }}
        >
          {!avatarUpload.preview && <User size={28} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', marginBottom: '4px' }}>
            {lang === 'zh' ? '上传头像' : 'Upload Avatar'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', marginBottom: '8px' }}>
            {lang === 'zh' ? '正方形，最小 200×200px，JPG/PNG' : 'Square, min 200×200px, JPG/PNG'}
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'var(--layers-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Upload size={13} />
            {lang === 'zh' ? '选择图片' : 'Choose Image'}
          </button>
        </div>
      </div>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
      />
      {avatarUpload.file && (
        <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={12} color="var(--layers-success)" />
          {lang === 'zh' ? '已选择: ' : 'Selected: '}{avatarUpload.file.name}
          {lang === 'zh' ? '（点击上方区域可重新选择）' : ' (click above to change)'}
        </div>
      )}
    </div>
  );

  // Banner upload area
  const BannerUploadArea = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        onClick={() => bannerInputRef.current?.click()}
        style={{
          width: '100%',
          height: '100px',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--layers-border)',
          background: bannerUpload.preview ? 'transparent' : 'var(--layers-gray-100)',
          backgroundImage: bannerUpload.preview ? `url(${bannerUpload.preview})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--layers-text-muted)',
          gap: '8px',
          fontSize: '13px',
          transition: 'border-color 0.2s',
        }}
      >
        {!bannerUpload.preview && (
          <>
            <ImageIcon size={20} />
            {lang === 'zh' ? '点击上传背景横幅' : 'Click to upload banner'}
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)' }}>
          {lang === 'zh' ? '建议尺寸 1200×400px，JPG/PNG，最大 5MB' : 'Recommended 1200×400px, JPG/PNG, max 5MB'}
        </div>
        <button
          type="button"
          onClick={() => bannerInputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'var(--layers-gray-100)',
            color: 'var(--layers-text)',
            border: '1px solid var(--layers-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Upload size={12} />
          {bannerUpload.file ? (lang === 'zh' ? '重新选择' : 'Change') : (lang === 'zh' ? '选择图片' : 'Choose')}
        </button>
      </div>
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleBannerChange}
        style={{ display: 'none' }}
      />
      {bannerUpload.file && (
        <div style={{ fontSize: '12px', color: 'var(--layers-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={12} color="var(--layers-success)" />
          {lang === 'zh' ? '已选择: ' : 'Selected: '}{bannerUpload.file.name}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '28px' }}>
        {lang === 'zh' ? '账户设置' : 'Account Settings'}
      </h1>

      {/* Profile Edit */}
      <div style={{
        background: 'var(--layers-surface)',
        border: '1px solid var(--layers-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} />
          {lang === 'zh' ? '主页设置' : 'Edit Profile'}
        </h2>

        {!profileInit ? (
          <div style={{ color: 'var(--layers-text-muted)', fontSize: '14px' }}>{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
        ) : (
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar upload */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                {lang === 'zh' ? '头像图片' : 'Avatar Image'}
              </label>
              <AvatarUploadArea />
            </div>

            {/* Banner upload */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                {lang === 'zh' ? '背景横幅' : 'Banner Image'}
              </label>
              <BannerUploadArea />
            </div>

            {/* Name */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                {lang === 'zh' ? '显示名称 *' : 'Display Name *'}
              </label>
              <input
                required
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                style={inputStyle}
                placeholder={lang === 'zh' ? '例如：赵毅的艺术空间' : 'e.g. Zhao Yi Art'}
              />
            </div>

            {/* Portfolio / Bio */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
                {lang === 'zh' ? '个人简介' : 'Bio'}
              </label>
              <textarea
                value={profile.portfolio}
                onChange={e => setProfile(p => ({ ...p, portfolio: e.target.value }))}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder={lang === 'zh' ? '介绍一下你的艺术风格和创作理念' : 'Describe your art style and philosophy'}
              />
            </div>

            {profileMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '13px',
                background: profileMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
                color: profileMsg.type === 'success' ? 'var(--layers-success)' : '#dc2626',
                border: `1px solid ${profileMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
              }}>
                {profileMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              style={{
                padding: '11px',
                background: 'var(--layers-brand)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: profileLoading ? 'not-allowed' : 'pointer',
                opacity: profileLoading ? 0.6 : 1,
              }}
            >
              {profileLoading ? (lang === 'zh' ? '保存中...' : 'Saving...') : (lang === 'zh' ? '保存主页设置' : 'Save Profile')}
            </button>
          </form>
        )}
      </div>

      {/* Share Profile */}
      <div style={{
        background: 'var(--layers-surface)',
        border: '1px solid var(--layers-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={16} />
          {lang === 'zh' ? '分享我的主页' : 'Share My Page'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--layers-text-muted)', marginBottom: '16px' }}>
          {lang === 'zh'
            ? '把你的创作者主页分享到 Instagram、小红书或微信，让更多人看到你的作品'
            : 'Share your creator page on Instagram, 小红书 or WeChat to attract more followers'}
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            readOnly
            value={profileUrl}
            style={{
              flex: '1 1 200px',
              padding: '10px 14px',
              border: '1px solid var(--layers-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
              fontFamily: 'monospace',
              background: 'var(--layers-gray-50)',
              color: 'var(--layers-text)',
              outline: 'none',
              minWidth: 0,
            }}
          />
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: copied ? 'var(--layers-success)' : 'var(--layers-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied ? (lang === 'zh' ? '已复制' : 'Copied!') : (lang === 'zh' ? '复制链接' : 'Copy Link')}
          </button>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              background: 'var(--layers-gray-100)',
              border: '1px solid var(--layers-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--layers-text)',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            {lang === 'zh' ? '查看' : 'View'}
          </a>
        </div>
      </div>

      {/* Change Password */}
      <div style={{
        background: 'var(--layers-surface)',
        border: '1px solid var(--layers-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>
          {lang === 'zh' ? '修改密码' : 'Change Password'}
        </h2>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              {lang === 'zh' ? '当前密码' : 'Current Password'}
            </label>
            <input
              type="password"
              required
              value={pwdForm.current}
              onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              {lang === 'zh' ? '新密码' : 'New Password'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={pwdForm.newPwd}
              onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--layers-text)', display: 'block', marginBottom: '6px' }}>
              {lang === 'zh' ? '确认新密码' : 'Confirm New Password'}
            </label>
            <input
              type="password"
              required
              value={pwdForm.confirm}
              onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {pwdMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
              background: pwdMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
              color: pwdMsg.type === 'success' ? 'var(--layers-success)' : '#dc2626',
              border: `1px solid ${pwdMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
            }}>
              {pwdMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pwdLoading}
            style={{
              padding: '11px',
              background: 'var(--layers-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: pwdLoading ? 'not-allowed' : 'pointer',
              opacity: pwdLoading ? 0.6 : 1,
            }}
          >
            {pwdLoading ? (lang === 'zh' ? '保存中...' : 'Saving...') : (lang === 'zh' ? '保存新密码' : 'Save Password')}
          </button>
        </form>
      </div>
    </div>
  );
}
