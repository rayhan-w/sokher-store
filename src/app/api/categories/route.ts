import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        subcategories: true,
        productCategories: {
          where: {
            product: {
              status: 'ACTIVE',
            },
          },
          select: {
            productId: true,
          },
        },
      },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      description: c.description,
      order: c.order,
      subcategories: c.subcategories,
      productCount: c.productCategories.length, // Real DB-calculated count!
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { name, slug: customSlug, image, description, order = 0 } = await request.json();

    if (!name || String(name).trim() === '') {
      return NextResponse.json({ error: 'ক্যাটাগরির নাম আবশ্যক।' }, { status: 400 });
    }

    let slug = customSlug
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Rule: Slug must be site-wide unique
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        image: image || null,
        description: description?.trim() || null,
        order: parseInt(order) || 0,
      },
      include: { subcategories: true },
    });

    return NextResponse.json({
      success: true,
      category: { ...category, productCount: 0 },
      message: 'ক্যাটাগরি তৈরি হয়েছে।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
