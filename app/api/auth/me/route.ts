import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface Creator {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active';
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('layers_creator');
  if (!sessionCookie) {
    return NextResponse.json({ success: false, data: null });
  }

  try {
    const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));

    const dbPath = join(process.cwd(), 'data', 'creators.jsonl');
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: false, data: null });
    }

    const content = readFileSync(dbPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    for (const line of lines) {
      const creator: Creator = JSON.parse(line);
      if (creator.id === session.id) {
        return NextResponse.json({ success: true, data: { id: creator.id, name: creator.name, email: creator.email, status: creator.status } });
      }
    }
  } catch {
    // invalid session
  }

  return NextResponse.json({ success: false, data: null });
}
