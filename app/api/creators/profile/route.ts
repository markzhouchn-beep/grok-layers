import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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

function saveImageBase64(creatorId: string, field: 'avatar' | 'banner', base64Data: string): string | null {
  try {
    const dir = join(process.cwd(), 'public', 'uploads', 'creators', creatorId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const ext = base64Data.startsWith('data:image/png') ? 'png' : 'jpg';
    const filename = `${field}_${Date.now()}.${ext}`;
    const filepath = join(dir, filename);
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    require('fs').writeFileSync(filepath, Buffer.from(base64Content, 'base64'));
    return `/uploads/creators/${creatorId}/${filename}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    const content = readFileSync(dbPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    const creator = lines.find(line => JSON.parse(line).id === id);
    if (!creator) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }
    const c: Creator = JSON.parse(creator);
    return NextResponse.json({
      success: true,
      data: { id: c.id, name: c.name, email: c.email, avatar: c.avatar, banner: c.banner, wechat: c.wechat, portfolio: c.portfolio, art_style: c.art_style, status: c.status }
    });
  }

  const sessionCookie = request.cookies.get('layers_creator');
  if (!sessionCookie) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
  const creatorId = session.id;
  const dbPath = getDbPath();
  if (!existsSync(dbPath)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  const content = readFileSync(dbPath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  const line = lines.find((l: string) => JSON.parse(l).id === creatorId);
  if (!line) {
    return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
  }
  const c: Creator = JSON.parse(line);
  return NextResponse.json({
    success: true,
    data: { id: c.id, name: c.name, email: c.email, avatar: c.avatar, banner: c.banner, wechat: c.wechat, portfolio: c.portfolio, art_style: c.art_style, status: c.status }
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('layers_creator');
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    const creatorId = session.id;
    const body = await request.json();
    const { name, avatar, banner } = body;

    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const content = readFileSync(dbPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    let targetIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const c: Creator = JSON.parse(lines[i]);
      if (c.id === creatorId) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    const creator: Creator = JSON.parse(lines[targetIndex]);
    if (name !== undefined) creator.name = name;

    // Handle avatar: if base64 data-URL, save to file; if plain URL, save as-is
    if (avatar !== undefined) {
      if (avatar.startsWith('data:image/')) {
        const savedUrl = saveImageBase64(creatorId, 'avatar', avatar);
        if (savedUrl) creator.avatar = savedUrl;
      } else {
        creator.avatar = avatar;
      }
    }

    // Handle banner: same logic
    if (banner !== undefined) {
      if (banner.startsWith('data:image/')) {
        const savedUrl = saveImageBase64(creatorId, 'banner', banner);
        if (savedUrl) creator.banner = savedUrl;
      } else {
        creator.banner = banner;
      }
    }

    lines[targetIndex] = JSON.stringify(creator);
    writeFileSync(dbPath, lines.join('\n') + '\n');

    return NextResponse.json({ success: true, data: { id: creator.id, name: creator.name, avatar: creator.avatar, banner: creator.banner } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
