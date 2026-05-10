import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'layers-salt-v1').digest('hex');
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
    let email: string, password: string;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      // Form submission — parse URL-encoded body
      const text = await request.text();
      const params = new URLSearchParams(text);
      email = params.get('email') || '';
      password = params.get('password') || '';
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const content = readFileSync(dbPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    let found: Creator | null = null;
    for (const line of lines) {
      const creator: Creator = JSON.parse(line);
      if (creator.email === email && creator.passwordHash === hashPassword(password)) {
        found = creator;
        break;
      }
    }

    if (!found) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    if (found.status === 'pending') {
      return NextResponse.json({ success: false, message: 'Account pending approval. Please check your email after admin reviews your application.' }, { status: 403 });
    }

    if (found.passwordHash === 'PENDING_APPROVAL') {
      // Account was registered but never approved — shouldn't happen for active accounts
      return NextResponse.json({ success: false, message: 'Account not activated. Please contact support.' }, { status: 403 });
    }

    const session = Buffer.from(JSON.stringify({ id: found.id, email: found.email, role: 'creator' })).toString('base64');

    // Form POST → redirect to dashboard
    if (!contentType.includes('application/json')) {
      const response = NextResponse.redirect(new URL('/dashboard/products', request.url));
      response.cookies.set('layers_creator', session, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return response;
    }

    // JSON API → return success
    const response = NextResponse.json({
      success: true,
      data: { id: found.id, name: found.name, email: found.email, status: found.status },
    });
    response.cookies.set('layers_creator', session, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      httpOnly: true,
    });
    return response;
  } catch (error) {
    console.error('[Login Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
