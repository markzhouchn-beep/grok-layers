import { NextRequest, NextResponse } from 'next/server';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import nodemailer from 'nodemailer';

interface VendorApplication {
  name: string;
  email: string;
  wechat?: string;
  portfolio?: string;
  art_style?: string;
  submitted_at: string;
  ip?: string;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

async function sendNotification(application: VendorApplication) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Contact API] SMTP not configured — skipping email. Application logged to file.');
    return;
  }

  const notifyEmail = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: notifyEmail,
      subject: `【Layers】新入驻申请：${application.name}`,
      html: `
        <h2>新的创作者入驻申请</h2>
        <ul>
          <li><strong>姓名/艺名：</strong>${application.name}</li>
          <li><strong>邮箱：</strong>${application.email}</li>
          <li><strong>微信：</strong>${application.wechat || '未提供'}</li>
          <li><strong>作品集链接：</strong>${application.portfolio || '未提供'}</li>
          <li><strong>艺术风格：</strong>${application.art_style || '未填写'}</li>
          <li><strong>提交时间：</strong>${application.submitted_at}</li>
          <li><strong>IP：</strong>${application.ip || 'unknown'}</li>
        </ul>
      `,
      text: `新入驻申请 — 姓名: ${application.name}, 邮箱: ${application.email}, 作品集: ${application.portfolio || '未提供'}, 风格: ${application.art_style || '未填写'}, 时间: ${application.submitted_at}`,
    });
    console.log('[Contact API] Notification email sent.');
  } catch (err) {
    console.error('[Contact API] Email send failed:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, wechat, portfolio, art_style } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const application: VendorApplication = {
      name,
      email,
      wechat: wechat || '',
      portfolio: portfolio || '',
      art_style: art_style || '',
      submitted_at: new Date().toISOString(),
      ip,
    };

    // Always persist to file
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    const filePath = join(dataDir, 'applications.jsonl');
    appendFileSync(filePath, JSON.stringify(application) + '\n');

    // Send email notification (if SMTP configured)
    await sendNotification(application);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
