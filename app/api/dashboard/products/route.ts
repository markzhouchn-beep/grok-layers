import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from 'fs';
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
  status: 'pending' | 'approved';
  category: string;
  createdAt: string;
}

function getDbPath() {
  return join(process.cwd(), 'data', 'products.jsonl');
}

function getCreatorsDbPath() {
  return join(process.cwd(), 'data', 'creators.jsonl');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId');

  const dbPath = getDbPath();
  if (!existsSync(dbPath)) {
    return NextResponse.json({ success: true, data: [] });
  }

  const content = readFileSync(dbPath, 'utf-8');
  let products: CreatorProduct[] = [];
  for (const line of content.split('\n').filter(Boolean)) {
    const p = JSON.parse(line);
    if (!creatorId || p.creatorId === creatorId) {
      products.push(p);
    }
  }

  return NextResponse.json({ success: true, data: products });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, action } = body;
    // action: 'toggle_shelf' — creator toggles approved ↔ pending
    // Only approved products can be toggled by creator
    if (!productId || action !== 'toggle_shelf') {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    const dbPath = getDbPath();
    if (!existsSync(dbPath)) {
      return NextResponse.json({ success: false, message: 'No products found' }, { status: 404 });
    }

    const lines = readFileSync(dbPath, 'utf-8').split('\n').filter(Boolean);
    const products = lines.map((l: string) => JSON.parse(l)) as any[];
    const idx = products.findIndex((p: any) => p.id === productId);

    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const p = products[idx];
    // Only approved products can be toggled by creator
    if (p.status !== 'approved' && p.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'Only approved products can be toggled' }, { status: 403 });
    }

    // Toggle: approved → pending (off shelf), pending → approved (back on shelf)
    products[idx] = { ...p, status: p.status === 'approved' ? 'pending' : 'approved' };

    writeFileSync(dbPath, products.map((pr: any) => JSON.stringify(pr)).join('\n') + '\n');
    return NextResponse.json({ success: true, data: products[idx] });
  } catch (error) {
    console.error('[Products PATCH Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, title, titleEn, artworkBase64, category } = body;

    if (!creatorId || !title || !artworkBase64 || !category) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Look up creator name from creators.jsonl
    let creatorName = 'Unknown Creator';
    const creatorsPath = getCreatorsDbPath();
    if (existsSync(creatorsPath)) {
      const content = readFileSync(creatorsPath, 'utf-8');
      for (const line of content.split('\n').filter(Boolean)) {
        const c = JSON.parse(line);
        if (c.id === creatorId) {
          creatorName = c.name;
          break;
        }
      }
    }

    // Save artwork image
    const imgDir = join(process.cwd(), 'public', 'uploads', 'creators', creatorId);
    if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

    const ext = artworkBase64.startsWith('data:image/png') ? 'png' : 'jpg';
    const imgId = `art_${Date.now()}`;
    const imgPath = join(imgDir, `${imgId}.${ext}`);
    const imgUrl = `/uploads/creators/${creatorId}/${imgId}.${ext}`;

    const base64Data = artworkBase64.replace(/^data:image\/\w+;base64,/, '');
    require('fs').writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));

    const product: CreatorProduct = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      creatorId,
      creatorName,
      title,
      titleEn: titleEn || '',
      artworkUrl: imgUrl,
      mockups: [],
      status: 'pending',
      category,
      createdAt: new Date().toISOString(),
    };

    const dbPath = getDbPath();
    appendFileSync(dbPath, JSON.stringify(product) + '\n');

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('[Products POST Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
