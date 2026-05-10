import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface Product {
  id: string;
  artworkId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  mockups: string[];
  purchaseUrl?: string;
  price?: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  createdAt: string;
}

function getProductsDbPath() {
  return join(process.cwd(), 'data', 'products.jsonl');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const dbPath = getProductsDbPath();
  if (!existsSync(dbPath)) {
    return NextResponse.json({ success: true, data: [] });
  }

  const content = readFileSync(dbPath, 'utf-8');
  let products: Product[] = [];

  for (const line of content.split('\n').filter(Boolean)) {
    try {
      const p = JSON.parse(line);
      if (p.status === 'approved') {
        products.push(p);
      }
    } catch {
      // skip malformed lines
    }
  }

  // Filter by category
  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  // Filter by search (title or creatorName)
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
        (p.creatorName && p.creatorName.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ success: true, data: products });
}
