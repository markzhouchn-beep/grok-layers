import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, appendFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import nodemailer from 'nodemailer';

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'layers-salt-v1').digest('hex');
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

async function sendNewCreatorNotification(creator: Creator) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Register] SMTP not configured — skipping email notification.');
    return;
  }
  const notifyEmail = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notifyEmail,
      subject: `【Layers】新创作者入驻申请：${creator.name}`,
      html: `
        <h2>新的创作者入驻申请</h2>
        <ul>
          <li><strong>姓名/艺名：</strong>${creator.name}</li>
          <li><strong>邮箱：</strong>${creator.email}</li>
          <li><strong>微信：</strong>${creator.wechat || '未提供'}</li>
          <li><strong>作品集链接：</strong>${creator.portfolio || '未提供'}</li>
          <li><strong>艺术风格：</strong>${creator.art_style || '未填写'}</li>
          <li><strong>申请时间：</strong>${creator.created_at}</li>
        </ul>
        <p>请登录管理后台审核：<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/applications">点击这里</a></p>
      `,
      text: `新创作者入驻申请 — 姓名: ${creator.name}, 邮箱: ${creator.email}, 微信: ${creator.wechat || '未提供'}, 作品集: ${creator.portfolio || '未提供'}, 风格: ${creator.art_style || '未填写'}, 时间: ${creator.created_at}`,
    });
    console.log('[Register] Notification email sent for:', creator.email);
  } catch (err) {
    console.error('[Register] Email send failed:', err);
  }
}

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
  status: 'pending' | 'active';
  created_at: string;
}

function getDbPath() {
  return join(process.cwd(), 'data', 'creators.jsonl');
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, wechat, portfolio, art_style } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }

    const dbPath = getDbPath();
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Check if email already registered
    if (existsSync(dbPath)) {
      const content = readFileSync(dbPath, 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      for (const line of lines) {
        const creator: Creator = JSON.parse(line);
        if (creator.email === email) {
          return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
        }
      }
    }

    const creator: Creator = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      // Password is set by admin on approval (system generates temp password)
      passwordHash: 'PENDING_APPROVAL',
      wechat: wechat || '',
      portfolio: portfolio || '',
      art_style: art_style || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    appendFileSync(dbPath, JSON.stringify(creator) + '\n');

    // Send email notification to admin (if SMTP configured)
    await sendNewCreatorNotification(creator);

    // Do NOT set session cookie here — creator is pending approval
    // They will log in manually after admin approves their application
    return NextResponse.json({
      success: true,
      data: { id: creator.id, name: creator.name, email: creator.email, status: creator.status },
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
