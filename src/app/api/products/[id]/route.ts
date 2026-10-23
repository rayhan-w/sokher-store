import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parsePrice, parseOptionalPrice } from '@/lib/price-parser';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        categories: {
          include: { category: true },
        },
        subcategory: true,
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'পণ্যটি পাওয়া যায়নি (Product not found)' }, { status: 404 });
    }

    // Atomically increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    const totalRatings = product.reviews.length;
    const avgRating = totalRatings > 0
      ? Math.round((product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings) * 10) / 10
      : 5.0;

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        specification: product.specification ? JSON.parse(product.specification) : null,
        variants: product.variants ? JSON.parse(product.variants) : null,
        categories: product.categories.map((c) => c.category),
        rating: avgRating,
        reviewCount: totalRatings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'পণ্যটি পাওয়া যায়নি' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    // 1. Name & Slug
    if (body.name !== undefined) {
      if (String(body.name).trim() === '') {
        return NextResponse.json({ error: 'পণ্যের নাম ফাঁকা রাখা যাবে না।' }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.slug !== undefined && body.slug !== existing.slug) {
      const cleanSlug = body.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slugConflict = await prisma.product.findFirst({
        where: { slug: cleanSlug, NOT: { id: existing.id } },
      });
      if (slugConflict) {
        return NextResponse.json({ error: 'এই Slug দিয়ে অন্য পণ্য আছে।' }, { status: 400 });
      }
      updateData.slug = cleanSlug;
    }

    // 2. Price Parsing (Rule #1)
    if (body.price !== undefined) {
      const parsed = parsePrice(body.price, 'মূল্য (Price)');
      if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
      updateData.price = parsed.value;
    }

    // Regular Price: Preserved unless explicitly changed!
    if (body.regularPrice !== undefined) {
      const parsedReg = parseOptionalPrice(body.regularPrice);
      if (parsedReg.error) return NextResponse.json({ error: parsedReg.error }, { status: 400 });
      updateData.regularPrice = parsedReg.value;
    }

    // 3. SKU Validation & Preservation (Rule #2 & #8)
    if (body.sku !== undefined) {
      if (String(body.sku).trim() === '') {
        return NextResponse.json({ error: 'SKU ফাঁকা রাখা যাবে না।' }, { status: 400 });
      }
      const cleanSku = String(body.sku).trim().toUpperCase();
      if (cleanSku !== existing.sku) {
        const skuConflict = await prisma.product.findUnique({ where: { sku: cleanSku } });
        if (skuConflict) {
          return NextResponse.json({ error: `এই SKU "${cleanSku}" অন্য পণ্যে ব্যবহৃত হয়েছে।` }, { status: 400 });
        }
      }
      updateData.sku = cleanSku;
    }

    // 4. Stock
    if (body.stock !== undefined) {
      updateData.stock = parseInt(body.stock) >= 0 ? parseInt(body.stock) : 0;
    }

    // 5. Badge & Flags
    if (body.badge !== undefined) updateData.badge = body.badge?.trim() || null;
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.status !== undefined) updateData.status = body.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE';

    // 6. Subcategory (Rule #2: Must save & persist)
    if (body.subcategoryId !== undefined) {
      updateData.subcategoryId = body.subcategoryId || null;
    }

    // 7. Images & Details
    if (body.images !== undefined) {
      updateData.images = JSON.stringify(Array.isArray(body.images) ? body.images : [body.images]);
    }
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.specification !== undefined) {
      updateData.specification = body.specification ? JSON.stringify(body.specification) : null;
    }
    if (body.variants !== undefined) {
      updateData.variants = body.variants ? JSON.stringify(body.variants) : null;
    }
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle?.trim() || null;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription?.trim() || null;

    // Handle Category Multi-select updates
    if (Array.isArray(body.categoryIds)) {
      await prisma.productCategory.deleteMany({
        where: { productId: existing.id },
      });
      await prisma.productCategory.createMany({
        data: body.categoryIds.map((catId: string) => ({
          productId: existing.id,
          categoryId: catId,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        categories: { include: { category: true } },
        subcategory: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...updated,
        images: JSON.parse(updated.images || '[]'),
      },
      message: 'পণ্য সফলভাবে আপডেট করা হয়েছে (Saved successfully).',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'আপডেট ব্যর্থ' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'পণ্যটি পাওয়া যায়নি' }, { status: 404 });
    }

    // Delete product - Prisma cascading deletes productCategories and orderItems setNull
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'পণ্যটি স্থায়ীভাবে মুছে ফেলা হয়েছে (Product deleted successfully).',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'ডিলিট ব্যর্থ' }, { status: 500 });
  }
}
