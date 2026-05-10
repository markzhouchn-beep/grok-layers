import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash, randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'layers-salt-v1').digest('hex');
}

function generateTempPassword(): string {
  // 10 chars: 3 letters + 2 digits + 3 letters + 2 digits
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const pick = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${pick(3)}${Math.floor(Math.random() * 90 + 10)}${pick(3)}${Math.floor(Math.random() * 90 + 10)}`;
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
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

function getDbPath() {
  return join(process.cwd(), 'data', 'creators.jsonl');
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  if (!transporter) {
    console.log(`[Approval] SMTP not configured — would have sent credentials to ${creator.email}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: creator.email,
      subject: `【Layers】您的入驻申请已通过：${creator.name}`,
      html: `
        <h2>您好 ${creator.name}，恭喜您的入驻申请已通过！</h2>
        <p>我们已为您创建了创作者账号，请使用以下临时密码登录：</p>
        <div style="background:#f5f5f5;padding:16px 24px;border-radius:8px;font-size:20px;font-weight:700;letter-spacing:2px;margin:20px 0;font-family:monospace;">
          ${tempPassword}
        </div>
        <p>请登录后立即前往「账户设置」修改密码：</p>
        <p><a href="${siteUrl}/login" style="color:#d4623a;">${siteUrl}/login</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="font-size:12px;color:#888;">Layers 创作者平台</p>
      `,
      text: `您好 ${creator.name}，您的入驻申请已通过！临时密码：${tempPassword}，请登录后尽快修改密码。登录地址：${siteUrl}/login`,
    });
    console.log(`[Approval] Email sent to ${creator.email}`);
  } catch (err) {
    console.error(`[Approval] Email failed for ${creator.email}:`, err);
  }
}

async function sendRejectionEmail(creator: Creator) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Rejection] SMTP not configured — would have notified ${creator.email}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: creator.email,
      subject: `【Layers】您的入驻申请结果通知`,
      html: `
        <h2>您好 ${creator.name}，感谢您的入驻申请。</h2>
        <p>经过审核，我们暂时无法通过您的申请。如果您有任何疑问，欢迎联系我们。</p>
        <p>您可以重新提交入驻申请，我们会重新审核。</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="font-size:12px;color:#888;">Layers 创作者平台</p>
      `,
      text: `您好 ${creator.name}，感谢您的入驻申请。经过审核，我们暂时无法通过您的申请。如有疑问欢迎联系我们。`,
    });
    console.log(`[Rejection] Email sent to ${creator.email}`);
  } catch (err) {
    console.error(`[Rejection] Email failed for ${creator.email}:`, err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, wechat, portfolio, art_style } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const dbPath = getDbPath();
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    if (existsSync(dbPath)) {
      const content = readFileSync(dbPath, 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      for (const line of lines) {
        const creator: Creator = JSON.parse(line);
        if (creator.email === email) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }
      }
    }

    const id = `c_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const creator: Creator = {
      id,
      name,
      email,
      passwordHash: hashPassword(password),
      wechat: wechat || '',
      portfolio: portfolio || '',
      art_style: art_style || '',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    appendFileSync(dbPath, JSON.stringify(creator) + '\n');

    return NextResponse.json({ success: true, data: { id, name, email } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/admin/creators — approve (with temp password email) or reject creator
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Creator id required' }, { status: 400 });
    }

    if (!status || !['active', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: false, message: 'No creators found' }, { status: 404 });
    }

    const content = readFileSync(dbPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    const creators: Creator[] = [];
    let found = false;

    for (const line of lines) {
      const c: Creator = JSON.parse(line);
      if (c.id === id) {
        found = true;
        if (status === 'active') {
          // Generate temp password and email credentials
          // If admin passes tempPassword in body, use it (for testing); otherwise generate random
          const tempPassword = body.tempPassword || generateTempPassword();
          c.passwordHash = hashPassword(tempPassword);
          c.status = 'active';
          await sendApprovalEmail(c, tempPassword);
        } else if (status === 'rejected') {
          c.status = 'rejected';
          await sendRejectionEmail(c);
        }
      }
      creators.push(c);
    }

    if (!found) {
      return NextResponse.json({ success: false, message: 'Creator not found' }, { status: 404 });
    }

    writeFileSync(dbPath, creators.map(c => JSON.stringify(c)).join('\n') + '\n');
    return NextResponse.json({ success: true, status: status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: true, data: [] });
    }
    const content = readFileSync(dbPath, 'utf-8');
    const creators = content.split('\n').filter(Boolean).map(line => {
      const c: Creator = JSON.parse(line);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        wechat: c.wechat,
        portfolio: c.portfolio,
        art_style: c.art_style,
        status: c.status,
        created_at: c.created_at,
      };
    });
    const filtered = creators.filter(c => !c.email.endsWith("@layers.local"));
    return NextResponse.json({ success: true, data: filtered });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
