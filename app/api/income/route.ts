import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface Creator {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active';
}

interface Order {
  id: string;
  creatorId: string;
  productTitle: string;
  category: string;
  salePrice: number;
  currency: string;
  royaltyRate: number;
  royaltyAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('layers_creator');
  if (!sessionCookie) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    const creatorId = session.id;

    // Load orders for this creator
    const ordersPath = join(process.cwd(), 'data', 'orders.jsonl');
    let earnings: Order[] = [];

    if (existsSync(ordersPath)) {
      const content = readFileSync(ordersPath, 'utf-8');
      earnings = content.split('\n').filter(Boolean).map(line => {
        const o = JSON.parse(line) as Order;
        if (o.creatorId === creatorId) return o;
        return null;
      }).filter(Boolean) as Order[];
    }

    const pending = earnings.filter(e => e.status === 'pending');
    const paid = earnings.filter(e => e.status === 'paid');
    const totalPending = pending.reduce((sum, e) => sum + e.netAmount, 0);
    const totalPaid = paid.reduce((sum, e) => sum + e.netAmount, 0);

    return NextResponse.json({
      success: true,
      data: {
        earnings,
        summary: {
          total: totalPending + totalPaid,
          totalPending,
          totalPaid,
        },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
