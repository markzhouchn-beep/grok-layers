import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface Artwork {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  titleEn: string;
  artworkUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  category: string;
}

function getDbPath() {
  return join(process.cwd(), 'data', 'artworks.jsonl');
}

function loadArtworks(): Artwork[] {
  const dbPath = getDbPath();
  if (!existsSync(dbPath)) return [];
  return readFileSync(dbPath, 'utf-8').split('\n').filter(Boolean).map(line => JSON.parse(line) as Artwork);
}

function saveArtworks(artworks: Artwork[]) {
  const dbPath = getDbPath();
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(dbPath, artworks.map(a => JSON.stringify(a)).join('\n') + '\n');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId');
  const status = searchParams.get('status');
  const id = searchParams.get('id');

  let artworks = loadArtworks();

  if (id) {
    const a = artworks.find(a => a.id === id);
    return NextResponse.json({ success: true, data: a || null });
  }
  if (creatorId) artworks = artworks.filter(a => a.creatorId === creatorId);
  if (status && status !== 'all') artworks = artworks.filter(a => a.status === status);

  artworks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ success: true, data: artworks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, title, titleEn, artworkBase64, category } = body;

    if (!creatorId || !artworkBase64 || !category) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    let creatorName = 'Unknown Creator';
    const creatorsPath = join(process.cwd(), 'data', 'creators.jsonl');
    if (existsSync(creatorsPath)) {
      const content = readFileSync(creatorsPath, 'utf-8');
      for (const line of content.split('\n').filter(Boolean)) {
        const c = JSON.parse(line);
        if (c.id === creatorId) { creatorName = c.name; break; }
      }
    }

    const imgDir = join(process.cwd(), 'public', 'uploads', 'creators', creatorId);
    if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

    const ext = artworkBase64.startsWith('data:image/png') ? 'png' : 'jpg';
    const imgId = `art_${Date.now()}`;
    const imgPath = join(imgDir, `${imgId}.${ext}`);
    const imgUrl = `/uploads/creators/${creatorId}/${imgId}.${ext}`;

    const base64Data = artworkBase64.replace(/^data:image\/\w+;base64,/, '');
    require('fs').writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));

    const artwork: Artwork = {
      id: `aw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      creatorId,
      creatorName,
      title: title || '',
      titleEn: titleEn || '',
      artworkUrl: imgUrl,
      status: 'pending',
      category,
      createdAt: new Date().toISOString(),
    };

    const dbPath = getDbPath();
    appendFileSync(dbPath, JSON.stringify(artwork) + '\n');

    return NextResponse.json({ success: true, data: artwork });
  } catch (error) {
    console.error('[Artworks POST Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const creatorId = searchParams.get('creatorId');

    if (!id || !creatorId) {
      return NextResponse.json({ success: false, message: 'Missing id or creatorId' }, { status: 400 });
    }

    const artworks = loadArtworks();
    const artwork = artworks.find(a => a.id === id);

    if (!artwork) {
      return NextResponse.json({ success: false, message: 'Artwork not found' }, { status: 404 });
    }

    if (artwork.creatorId !== creatorId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Permanently delete: artwork + all related products
    const remaining = artworks.filter(a => a.id !== id);
    saveArtworks(remaining);

    const { existsSync, readFileSync, unlinkSync, writeFileSync } = require('fs');
    const { join } = require('path');

    // Delete artwork image file
    if (artwork.artworkUrl) {
      const imgPath = join(process.cwd(), 'public', artwork.artworkUrl);
      if (existsSync(imgPath)) {
        try { unlinkSync(imgPath); } catch {}
      }
    }

    // Delete all related products
    const productsPath = join(process.cwd(), 'data', 'products.jsonl');
    if (existsSync(productsPath)) {
      const lines = readFileSync(productsPath, 'utf-8').split('\n').filter(Boolean);
      const products = lines.map((l: string) => JSON.parse(l)) as any[];
      const remainingProducts = products.filter((p: any) => p.artworkId !== id);
      writeFileSync(productsPath, remainingProducts.map((p: any) => JSON.stringify(p)).join('\n') + '\n');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Artworks DELETE Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, rejectionReason }: { id: string; status?: string; rejectionReason?: string } = body;

    const artworks = loadArtworks();
    const idx = artworks.findIndex(a => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Artwork not found' }, { status: 404 });
    }

    if (status) {
      artworks[idx].status = status as any;
      if (status !== 'approved') {
        const { existsSync, readFileSync, writeFileSync: wf } = require('fs');
        const { join } = require('path');
        const productsPath = join(process.cwd(), 'data', 'products.jsonl');
        if (existsSync(productsPath)) {
          const lines = readFileSync(productsPath, 'utf-8').split('\n').filter(Boolean);
          const products = lines.map((l: string) => JSON.parse(l)) as any[];
          const related = products.filter((p: any) => p.artworkId === id);
          const other = products.filter((p: any) => p.artworkId !== id);
          if (related.length > 0) {
            const updated = other.concat(related.map((p: any) => ({ ...p, status: 'pending' })));
            wf(productsPath, updated.map((p: any) => JSON.stringify(p)).join('\n') + '\n');
          }
        }
      }
    }
    const rej = rejectionReason;
    if (rej !== undefined) artworks[idx].rejectionReason = rej;

    saveArtworks(artworks);
    return NextResponse.json({ success: true, data: artworks[idx] });
  } catch (error) {
    console.error('[Artworks PATCH Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
