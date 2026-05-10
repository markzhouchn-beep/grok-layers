import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface CreatorProduct {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  mockups: string[];
  purchaseUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  createdAt: string;
}

function getDbPath() {
  return join(process.cwd(), 'data', 'products.jsonl');
}

function loadProducts(): CreatorProduct[] {
  const dbPath = getDbPath();
  if (!existsSync(dbPath)) return [];
  return readFileSync(dbPath, 'utf-8').split('\n').filter(Boolean).map(line => JSON.parse(line));
}

function saveProducts(products: CreatorProduct[]) {
  const dbPath = getDbPath();
  writeFileSync(dbPath, products.map(p => JSON.stringify(p)).join('\n') + '\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, base64 } = body;

    if (!productId || !type || !base64) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const products = loadProducts();
    const product = products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Save mockup file - generate unique filename with index
    const imgDir = join(process.cwd(), 'public', 'uploads', 'mockups', productId);
    if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

    const ext = base64.startsWith('data:image/png') ? 'png' : 'jpg';
    const existing = (product.mockups || []).filter((u: string) => u.includes(productId)).length;
    const fileName = `mockup_${existing + 1}.${ext}`;
    const filePath = join(imgDir, fileName);
    const url = `/uploads/mockups/${productId}/${fileName}`;

    const data = base64.replace(/^data:image\/\w+;base64,/, '');
    require('fs').writeFileSync(filePath, Buffer.from(data, 'base64'));

    // Update product mockups array
    product.mockups = [...(product.mockups || []), url];
    saveProducts(products);

    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error('[Mockup Upload Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
