import { NextResponse } from 'next/server';
import { generateProductDescription } from '@/lib/ai';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { name, category, features } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'পণ্যের নাম দিন।' }, { status: 400 });
    }

    const descriptions = await generateProductDescription(name, category || 'Cosmetics', features);
    return NextResponse.json({ success: true, descriptions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
