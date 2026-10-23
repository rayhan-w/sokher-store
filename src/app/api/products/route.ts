import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parsePrice, parseOptionalPrice } from '@/lib/price-parser';
import { requireAdmin, getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const subcategorySlug = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const badge = searchParams.get('badge');
    const isFeatured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status'); // Admin can pass status=ALL or DRAFT
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));

    const session = await getSessionUser();
    const isAdmin = session?.role === 'ADMIN';

    // Storefront only ever sees ACTIVE products
    const where: any = {};

    if (isAdmin && status) {
      if (status !== 'ALL') {
        where.status = status;
      }
    } else {
      where.status = 'ACTIVE';
    }

    if (badge) {
      where.badge = badge;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (categorySlug) {
      where.categories = {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      };
    }

    if (subcategorySlug) {
      where.subcategory = {
        slug: subcategorySlug,
      };
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { viewCount: 'desc' };

    const totalCount = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        subcategory: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Format products with calculated rating and categories
    const formatted = products.map((p) => {
      const totalRatings = p.reviews.length;
      const avgRating = totalRatings > 0
        ? Math.round((p.reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings) * 10) / 10
        : 5.0; // Default high rating for presentation

      return {
        ...p,
        images: JSON.parse(p.images || '[]'),
        specification: p.specification ? JSON.parse(p.specification) : null,
        variants: p.variants ? JSON.parse(p.variants) : null,
        categories: p.categories.map((c) => c.category),
        rating: avgRating,
        reviewCount: totalRatings,
      };
    });

    return NextResponse.json({
      products: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস (Unauthorized admin access)' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug: customSlug,
      sku,
      price: rawPrice,
      regularPrice: rawRegularPrice,
      stock,
      badge,
      isFeatured,
      status = 'ACTIVE',
      images = [],
      description,
      specification,
      variants,
      categoryIds = [],
      subcategoryId,
      seoTitle,
      seoDescription,
    } = body;

    // 1. Validate Name
    if (!name || String(name).trim() === '') {
      return NextResponse.json({ error: 'পণ্যের নাম আবশ্যক (Product name is required).' }, { status: 400 });
    }

    // 2. Validate Price (Rule #1: Price save bug prevention)
    const parsedPrice = parsePrice(rawPrice, 'মূল্য (Price)');
    if (parsedPrice.error) {
      return NextResponse.json({ error: parsedPrice.error }, { status: 400 });
    }

    const parsedRegularPrice = parseOptionalPrice(rawRegularPrice);
    if (parsedRegularPrice.error) {
      return NextResponse.json({ error: parsedRegularPrice.error }, { status: 400 });
    }

    // 3. Validate & Enforce Unique SKU (Rule #2 & Rule #8)
    if (!sku || String(sku).trim() === '') {
      return NextResponse.json({ error: 'SKU আবশ্যক (SKU is required).' }, { status: 400 });
    }
    const cleanSku = String(sku).trim().toUpperCase();
    const existingSku = await prisma.product.findUnique({
      where: { sku: cleanSku },
    });
    if (existingSku) {
      return NextResponse.json(
        { error: `এই SKU "${cleanSku}" দিয়ে আগেই পণ্য আছে। ইউনিক SKU দিন (Duplicate SKU).` },
        { status: 400 }
      );
    }

    // 4. Generate or Validate Unique Slug
    let slug = customSlug
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 5. Create Product
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        sku: cleanSku,
        price: parsedPrice.value,
        regularPrice: parsedRegularPrice.value,
        stock: parseInt(stock) >= 0 ? parseInt(stock) : 0,
        badge: badge?.trim() || null,
        isFeatured: Boolean(isFeatured),
        status: status === 'DRAFT' ? 'DRAFT' : 'ACTIVE',
        images: JSON.stringify(Array.isArray(images) ? images : [images]),
        description: description?.trim() || null,
        specification: specification ? JSON.stringify(specification) : null,
        variants: variants ? JSON.stringify(variants) : null,
        subcategoryId: subcategoryId || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        categories: {
          create: (categoryIds as string[]).map((catId) => ({
            categoryId: catId,
          })),
        },
      },
      include: {
        categories: { include: { category: true } },
        subcategory: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...newProduct,
        images: JSON.parse(newProduct.images || '[]'),
      },
      message: 'পণ্য সফলভাবে তৈরি হয়েছে (Product created successfully).',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'পণ্য তৈরিতে ব্যর্থ' }, { status: 500 });
  }
}
