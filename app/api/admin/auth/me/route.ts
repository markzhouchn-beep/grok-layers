import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const admin = request.cookies.get('layers_admin');
  if (admin?.value === '1') {
    return NextResponse.json({ success: true, data: { username: 'admin' } });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
