import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { id } = params;
    const { name, slug: customSlug, image, description, order } = await request.json();

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'ক্যাটাগরি পাওয়া যায়নি।' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image || null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (order !== undefined) updateData.order = parseInt(order) || 0;

    if (customSlug && customSlug !== existing.slug) {
      const cleanSlug = customSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const conflict = await prisma.category.findFirst({
        where: { slug: cleanSlug, NOT: { id: existing.id } },
      });
      if (conflict) {
        return NextResponse.json({ error: 'এই Slug টি অন্য ক্যাটাগরিতে ব্যবহৃত হয়েছে।' }, { status: 400 });
      }
      updateData.slug = cleanSlug;
    }

    const updated = await prisma.category.update({
      where: { id: existing.id },
      data: updateData,
      include: { subcategories: true },
    });

    return NextResponse.json({
      success: true,
      category: updated,
      message: 'ক্যাটাগরি আপডেট হয়েছে।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { id } = params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        productCategories: {
          include: {
            product: {
              include: {
                categories: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'ক্যাটাগরি পাওয়া যায়নি।' }, { status: 404 });
    }

    // Rule: Never delete products! Ensure products with only this category get reassigned to 'uncategorized'
    let uncategorized = await prisma.category.findUnique({ where: { slug: 'uncategorized' } });
    if (!uncategorized) {
      uncategorized = await prisma.category.create({
        data: {
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Default category for uncategorized items',
        },
      });
    }

    for (const pc of category.productCategories) {
      // If product has no other categories, reassign to uncategorized
      if (pc.product.categories.length <= 1 && uncategorized.id !== category.id) {
        await prisma.productCategory.create({
          data: {
            productId: pc.productId,
            categoryId: uncategorized.id,
          },
        }).catch(() => {});
      }
    }

    // Delete the category safely
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'ক্যাটাগরি ডিলিট করা হয়েছে এবং পণ্যগুলো নিরাপদে সংরক্ষিত আছে।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
