import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const dbPath = join(process.cwd(), 'data', 'applications.jsonl');
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: true, data: [] });
    }
    const content = readFileSync(dbPath, 'utf-8');
    const applications = content.split('\n').filter(Boolean).map(line => JSON.parse(line));
    // Sort by created_at descending
    applications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({ success: true, data: applications });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
