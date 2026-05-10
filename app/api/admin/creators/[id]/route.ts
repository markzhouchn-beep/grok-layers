import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash, randomBytes } from 'crypto';

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
      creator.status = 'active';
      lines[targetIndex] = JSON.stringify(creator);
      writeFileSync(dbPath, lines.join('\n') + '\n');
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
      return NextResponse.json({ success: true, password: newPassword });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}