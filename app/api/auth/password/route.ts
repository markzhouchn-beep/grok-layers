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

export async function PATCH(request: NextRequest) {
  try {
    const { id, currentPassword, newPassword } = await request.json();

    if (!id || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const content = readFileSync(dbPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    let found = false;
    let newLines: string[] = [];

    for (const line of lines) {
      const creator: Creator = JSON.parse(line);
      if (creator.id === id) {
        if (hashPassword(currentPassword) !== creator.passwordHash) {
          return NextResponse.json({ error: 'Current password incorrect' }, { status: 401 });
        }
        creator.passwordHash = hashPassword(newPassword);
        newLines.push(JSON.stringify(creator));
        found = true;
      } else {
        newLines.push(line);
      }
    }

    if (!found) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    writeFileSync(dbPath, newLines.join('\n') + '\n');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
