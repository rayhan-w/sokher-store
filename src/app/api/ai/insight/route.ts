import { NextResponse } from 'next/server';
import { generateSalesInsights } from '@/lib/ai';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const insight = await generateSalesInsights();
    return NextResponse.json({ success: true, insight });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
