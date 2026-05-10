import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface Creator {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  wechat?: string;
  portfolio?: string;
  art_style?: string;
  avatar?: string;
  banner?: string;
  status: 'pending' | 'active';
  created_at: string;
}

// Mock data for demo creators (used when no real data exists)
const MOCK_CREATORS = [
  {
    id: 'a1',
    name: '赵毅',
    nameEn: 'Zhao Yi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao-yi',
    banner: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&h=400&fit=crop',
    bio: '抽象几何艺术家，作品曾在上海当代艺术展展出。热爱用纯粹的几何语言探索城市与自然的关系。',
    bioEn: 'Abstract geometric artist exploring the relationship between urban spaces and nature through pure geometric forms.',
    artStyle: 'Abstract / Geometric',
    location: '上海',
    followerCount: 0,
    productCount: 0,
    joinDate: '2026-01-15',
    socialLinks: { instagram: 'zhaoyi.art', rednote: '赵毅艺术' },
  },
  {
    id: 'a2',
    name: '林梅',
    nameEn: 'Lin Mei',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin-mei',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
    bio: '极简线条艺术家，创作涵盖插画、海报和品牌设计。相信少即是多。',
    bioEn: 'Minimalist line artist working across illustration, poster design and branding.',
    artStyle: 'Minimal / Line Art',
    location: '深圳',
    followerCount: 0,
    productCount: 0,
    joinDate: '2026-02-20',
    socialLinks: { rednote: '林梅的极简世界' },
  },
  {
    id: 'a3',
    name: '陈霄',
    nameEn: 'Chen Xiao',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen-xiao',
    banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=400&fit=crop',
    bio: '水墨画家，专注东方美学与现代表现形式的融合。作品销往美国、法国、日本。',
    bioEn: 'Ink wash painter blending traditional Eastern aesthetics with contemporary expression.',
    artStyle: 'Ink Wash / Asian Art',
    location: '北京',
    followerCount: 0,
    productCount: 0,
    joinDate: '2025-12-10',
    socialLinks: { instagram: 'chenxiao.art', twitter: 'chenxiao_ink' },
  },
  {
    id: 'a4',
    name: '王芳',
    nameEn: 'Wang Fang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang-fang',
    banner: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop',
    bio: '植物水彩插画师，用水彩记录花草植物的细节之美。',
    bioEn: 'Botanical watercolor illustrator capturing the delicate beauty of flora.',
    artStyle: 'Watercolor / Botanical',
    location: '杭州',
    followerCount: 0,
    productCount: 0,
    joinDate: '2026-03-05',
    socialLinks: { instagram: 'wangfang.botanical' },
  },
];

function getCreatorsDbPath() {
  return join(process.cwd(), 'data', 'creators.jsonl');
}

function loadRealCreators(): Creator[] {
  const path = getCreatorsDbPath();
  if (!existsSync(path)) return [];
  const content = readFileSync(path, 'utf-8');
  return content.split('\n').filter(Boolean).map(line => JSON.parse(line) as Creator);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    // First check real creators
    const real = loadRealCreators();
    const realCreator = real.find(c => c.id === id);

    if (realCreator) {
      const creator = {
        id: realCreator.id,
        name: realCreator.name,
        nameEn: realCreator.name,
        avatar: realCreator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${realCreator.id}`,
        banner: realCreator.banner || 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&h=400&fit=crop',
        bio: realCreator.portfolio || '',
        bioEn: realCreator.portfolio || '',
        artStyle: realCreator.art_style || '',
        location: '',
        followerCount: 0,
        productCount: 0,
        joinDate: realCreator.created_at,
        socialLinks: { rednote: realCreator.wechat || '' },
      };
      return NextResponse.json({ success: true, data: { creator, products: [] } });
    }

    // Fall back to mock
    const mock = (MOCK_CREATORS as any).find((c: any) => c.id === id);
    if (!mock) {
      return NextResponse.json({ success: false, message: 'Creator not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { creator: mock, products: [] } });
  }

  // List all creators (real + mock)
  const real = loadRealCreators();
  const realData = real.map(c => ({
    id: c.id,
    name: c.name,
    nameEn: c.name,
    avatar: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}`,
    banner: c.banner || '',
    bio: '',
    bioEn: '',
    artStyle: c.art_style || '',
    location: '',
    followerCount: 0,
    productCount: 0,
    joinDate: c.created_at,
    socialLinks: { rednote: c.wechat || '' },
    _source: 'real',
  }));

  const mockData = MOCK_CREATORS.map(c => ({ ...c, _source: 'mock' }));
  return NextResponse.json({ success: true, data: [...realData, ...mockData] });
}