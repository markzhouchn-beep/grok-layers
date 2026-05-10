import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface CreatorProduct {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  mockupUrls: Record<string, string>;
  purchaseUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId');

  const dbPath = join(process.cwd(), 'data', 'products.jsonl');
  if (!existsSync(dbPath)) {
    return NextResponse.json({ success: true, data: [] });
  }

  const content = readFileSync(dbPath, 'utf-8');
  const products: CreatorProduct[] = [];
  for (const line of content.split('\n').filter(Boolean)) {
    const p = JSON.parse(line);
    if (p.creatorId === creatorId && p.status === 'approved') {
      products.push(p);
    }
  }

  return NextResponse.json({ success: true, data: products });
}
