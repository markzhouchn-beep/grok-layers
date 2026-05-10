import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

interface CreatorProduct {
  id: string;
  artworkId: string;         // links back to the original artwork
  creatorId: string;
  creatorName: string;
  title: string;             // display title (from artwork)
  titleEn: string;
  artworkUrl: string;        // original artwork image
  mockups: string[];        // multiple mockup image URLs
  purchaseUrl?: string;
  price?: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;         // variant type: t-shirts, mugs, etc.
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
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(dbPath, products.map(p => JSON.stringify(p)).join('\n') + '\n');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const artworkId = searchParams.get('artworkId');

  let products = loadProducts();

  if (status && status !== 'all') {
    products = products.filter(p => p.status === status);
  }
  if (artworkId) {
    products = products.filter(p => p.artworkId === artworkId);
  }

  return NextResponse.json({ success: true, data: products });
}

// POST /api/admin/manage/products - create product variants from an approved artwork
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { artworkId, variantTypes } = body;

    if (!artworkId || !variantTypes || !Array.isArray(variantTypes)) {
      return NextResponse.json({ success: false, message: 'artworkId and variantTypes[] are required' }, { status: 400 });
    }

    // Load artwork info
    const artworkPath = join(process.cwd(), 'data', 'artworks.jsonl');
    let artwork: any = null;
    if (existsSync(artworkPath)) {
      const content = readFileSync(artworkPath, 'utf-8');
      for (const line of content.split('\n').filter(Boolean)) {
        const a = JSON.parse(line);
        if (a.id === artworkId) { artwork = a; break; }
      }
    }
    if (!artwork) {
      return NextResponse.json({ success: false, message: 'Artwork not found' }, { status: 404 });
    }

    // Create a product variant for each type
    const products = loadProducts();
    const newProducts: CreatorProduct[] = [];

    for (const variantType of variantTypes) {
      const product: CreatorProduct = {
        id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        artworkId,
        creatorId: artwork.creatorId,
        creatorName: artwork.creatorName,
        title: artwork.title || 'Untitled',
        titleEn: artwork.titleEn || '',
        artworkUrl: artwork.artworkUrl,
        mockups: [],
        status: 'pending',
        category: variantType,
        createdAt: new Date().toISOString(),
      };
      products.push(product);
      newProducts.push(product);
    }

    saveProducts(products);
    return NextResponse.json({ success: true, data: newProducts });
  } catch (error) {
    console.error('[Admin Products POST Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, purchaseUrl, price } = body;

    const products = loadProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (status === 'approved') {
      const hasMockups = (products[idx].mockups || []).length > 0;
      if (!hasMockups) {
        return NextResponse.json({ success: false, message: 'Must upload at least 1 mockup before approving' }, { status: 400 });
      }
      if (!products[idx].purchaseUrl || products[idx].purchaseUrl.trim() === '') {
        return NextResponse.json({ success: false, message: 'Purchase URL is required before approving' }, { status: 400 });
      }
    }
    if (status) products[idx].status = status;
    if (purchaseUrl !== undefined) products[idx].purchaseUrl = purchaseUrl;
    if (price !== undefined) products[idx].price = price;

    saveProducts(products);
    return NextResponse.json({ success: true, data: products[idx] });
  } catch (error) {
    console.error('[Admin Products PATCH Error]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
