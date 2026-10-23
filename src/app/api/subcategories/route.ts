import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { name, categoryId, slug: customSlug } = await request.json();

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'সাবক্যাটাগরির নাম এবং ক্যাটাগরি আইডি আবশ্যক।' }, { status: 400 });
    }

    let slug = customSlug
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.subcategory.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name: name.trim(),
        slug,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      subcategory,
      message: 'সাবক্যাটাগরি তৈরি হয়েছে।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
