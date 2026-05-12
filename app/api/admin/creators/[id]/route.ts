import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash, randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

interface Creator {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  wechat?: string;
  portfolio?: string;
  art_style?: string;
  avatar?: string;
  banner?: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  created_at: string;
}

function getDbPath() {
  return join(process.cwd(), 'data', 'creators.jsonl');
}

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'layers-salt-v1').digest('hex');
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

async function sendApprovalEmail(creator: Creator, tempPassword: string) {
  const transporter = createTransporter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://layershop.store';
  if (!transporter) {
    console.log('[Approval] SMTP not configured — would have sent password email to:', creator.email);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: creator.email,
      subject: '【Layers】您的入驻申请已通过 · Your Application is Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #d4623a;">🎉 恭喜！您的入驻申请已通过</h2>
          <p>您好 <strong>${creator.name}</strong>，</p>
          <p>您的创作者申请已通过审核，以下是您的临时登录密码：</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px 24px; margin: 20px 0; text-align: center;">
            <span style="font-size: 24px; font-family: monospace; letter-spacing: 4px; color: #333;">${tempPassword}</span>
          </div>
          <p style="font-size: 13px; color: #666;">请登录后立即修改密码。</p>
          <a href="${siteUrl}/login" style="display: inline-block; background: #d4623a; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px;">立即登录 →</a>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">如果您没有申请过 Layers 创作者账号，请忽略此邮件。</p>
        </div>
      `,
      text: `恭喜！您的 Layers 创作者申请已通过。临时密码: ${tempPassword} 请登录 https://layershop.store/login 修改密码。`,
    });
    console.log('[Approval] Password email sent to:', creator.email);
  } catch (err) {
    console.error('[Approval] Email send failed for', creator.email, err);
  }
}

async function sendPasswordResetEmail(creator: Creator, newPassword: string) {
  const transporter = createTransporter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://layershop.store';
  if (!transporter) {
    console.log('[ResetPassword] SMTP not configured — would have sent reset email to:', creator.email);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: creator.email,
      subject: '【Layers】密码重置 · Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #d4623a;">密码已重置</h2>
          <p>您好 <strong>${creator.name}</strong>，</p>
          <p>您的密码已被管理员重置，新密码为：</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px 24px; margin: 20px 0; text-align: center;">
            <span style="font-size: 24px; font-family: monospace; letter-spacing: 4px; color: #333;">${newPassword}</span>
          </div>
          <p style="font-size: 13px; color: #666;">请登录后立即修改密码。</p>
          <a href="${siteUrl}/login" style="display: inline-block; background: #d4623a; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px;">立即登录 →</a>
        </div>
      `,
      text: `您的 Layers 密码已重置。新密码: ${newPassword} 请登录 https://layershop.store/login 修改密码。`,
    });
    console.log('[ResetPassword] Email sent to:', creator.email);
  } catch (err) {
    console.error('[ResetPassword] Email send failed for', creator.email, err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    const content = readFileSync(dbPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    let targetIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const creator: Creator = JSON.parse(lines[i]);
      if (creator.id === id) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    const creator: Creator = JSON.parse(lines[targetIndex]);

    if (action === 'ban') {
      creator.status = 'suspended';
      lines[targetIndex] = JSON.stringify(creator);
      writeFileSync(dbPath, lines.join('\n') + '\n');
      return NextResponse.json({ success: true, status: creator.status });
    }

    if (action === 'unban') {
      creator.status = 'active';
      lines[targetIndex] = JSON.stringify(creator);
      writeFileSync(dbPath, lines.join('\n') + '\n');
      return NextResponse.json({ success: true, status: creator.status });
    }

    if (action === 'approve') {
      const newPassword = generatePassword();
      creator.passwordHash = hashPassword(newPassword);
      creator.status = 'active';
      lines[targetIndex] = JSON.stringify(creator);
      writeFileSync(dbPath, lines.join('\n') + '\n');
      await sendApprovalEmail(creator, newPassword);
      return NextResponse.json({ success: true, status: creator.status });
    }

    if (action === 'reject') {
      // Remove the creator from the database
      lines.splice(targetIndex, 1);
      writeFileSync(dbPath, lines.join('\n') + '\n');
      return NextResponse.json({ success: true });
    }

    if (action === 'reset_password') {
      const newPassword = generatePassword();
      creator.passwordHash = hashPassword(newPassword);
      lines[targetIndex] = JSON.stringify(creator);
      writeFileSync(dbPath, lines.join('\n') + '\n');
      await sendPasswordResetEmail(creator, newPassword);
      return NextResponse.json({ success: true, password: newPassword });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}