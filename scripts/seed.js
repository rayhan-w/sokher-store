const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Sokher Store...');

  // 1. Create Default Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sokherstore.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Sokher Store Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      phone: '01700000000',
    },
  });
  console.log(`Admin user ready: ${admin.email}`);

  // Also create a demo customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@sokherstore.com' },
    update: {},
    create: {
      name: 'Tanvir Ahmed',
      email: 'customer@sokherstore.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '01811122233',
    },
  });

  // 2. Seed Store Settings
  const defaultTrustBar = JSON.stringify([
    {
      icon: 'Truck',
      title: 'Fast Delivery',
      subtitle: 'All over Bangladesh',
    },
    {
      icon: 'ShieldCheck',
      title: '100% Genuine',
      subtitle: 'Original Products',
    },
    {
      icon: 'Headphones',
      title: '24/7 Support',
      subtitle: "We're here to help",
    },
    {
      icon: 'RotateCcw',
      title: 'Easy Return',
      subtitle: 'Hassle free policy',
    },
  ]);

  await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {
      trustBarItems: defaultTrustBar,
    },
    create: {
      id: 'default',
      storeName: 'Sokher Store',
      tagline: 'Your Beauty, Our Passion',
      logoUrl: '/images/logo-icon.jpg',
      primaryColor: '#e11d2e',
      announcementText: 'Free Shipping on orders over ৳999 | 100% Authentic Products | Easy Return & Refund',
      isAnnouncementActive: true,
      contactPhone: '+880 1700-000000',
      contactEmail: 'support@sokherstore.com',
      contactAddress: 'Mirpur, Dhaka, Bangladesh',
      whatsappNumber: '+880 1700-000000',
      facebookUrl: 'https://facebook.com/sokherstore',
      instagramUrl: 'https://instagram.com/sokherstore',
      deliveryDhaka: 70,
      deliveryDhakaSuburbs: 100,
      deliveryOutsideDhaka: 130,
      freeDeliveryThreshold: 999,
      bkashNumber: '01712345678',
      nagadNumber: '01812345678',
      trustBarItems: defaultTrustBar,
    },
  });
  console.log('Store settings initialized.');

  // 3. Seed Categories
  const categoriesData = [
    {
      name: 'Skincare',
      slug: 'skincare',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
      description: 'Pamper your skin with our premium dermatologist-tested skincare essentials.',
      order: 1,
      subcategories: ['Face Wash', 'Day Cream', 'Moisturizer', 'Serums'],
    },
    {
      name: 'Makeup',
      slug: 'makeup',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
      description: 'Enhance your natural beauty with top-tier foundations, lipsticks and cosmetics.',
      order: 2,
      subcategories: ['Foundation', 'Lipstick', 'Eyeliner', 'Mascara'],
    },
    {
      name: 'Hair Care',
      slug: 'hair-care',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
      description: 'Nourishing shampoos, conditioners, and hair serums for luscious hair.',
      order: 3,
      subcategories: ['Shampoo', 'Conditioner', 'Hair Oil'],
    },
    {
      name: 'Fragrance',
      slug: 'fragrance',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=80',
      description: 'Mesmerizing perfumes, body mists, and luxury scents.',
      order: 4,
      subcategories: ['Perfumes', 'Body Mists'],
    },
    {
      name: 'Body Care',
      slug: 'body-care',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
      description: 'Full body lotions, body washes, and nourishing butters.',
      order: 5,
      subcategories: ['Body Lotions', 'Body Wash'],
    },
    {
      name: 'Personal Care',
      slug: 'personal-care',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
      description: 'Daily oral hygiene, cleansing, and care items.',
      order: 6,
      subcategories: ['Oral Care', 'Hygiene'],
    },
    {
      name: 'Men Care',
      slug: 'men-care',
      image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80',
      description: "Men's grooming, beard oils, face wash, and styling.",
      order: 7,
      subcategories: ['Men Face Wash', 'Beard Care'],
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80',
      description: 'High-quality makeup brush sets, sponges, and cosmetic tools.',
      order: 8,
      subcategories: ['Brushes', 'Sponges', 'Mirrors'],
    },
  ];

  const categoryMap = {};
  const subcategoryMap = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        image: cat.image,
        description: cat.description,
        order: cat.order,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        order: cat.order,
      },
    });
    categoryMap[cat.slug] = createdCat;

    for (const subName of cat.subcategories) {
      const subSlug = `${cat.slug}-${subName.toLowerCase().replace(/\s+/g, '-')}`;
      const createdSub = await prisma.subcategory.upsert({
        where: { slug: subSlug },
        update: { name: subName },
        create: {
          name: subName,
          slug: subSlug,
          categoryId: createdCat.id,
        },
      });
      subcategoryMap[subSlug] = createdSub;
    }
  }
  console.log(`Seeded ${categoriesData.length} categories with subcategories.`);

  // 4. Seed Reference Demo Products
  const productsData = [
    {
      name: "Pond's Bright Beauty Day Cream",
      slug: "ponds-bright-beauty-day-cream",
      sku: "PND-BB-DC-50G",
      price: 350,
      regularPrice: 450,
      stock: 85,
      badge: "Best Seller",
      isFeatured: true,
      status: "ACTIVE",
      categorySlugs: ["skincare"],
      subcategorySlug: "skincare-day-cream",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
      ]),
      description: "Pond's Bright Beauty Day Cream with Vitamin B3+ and Gluta-Boost technology helps eliminate dark spots and brightens your skin tone from within with SPF 15 PA++ protection.",
      specification: JSON.stringify({
        "Brand": "Pond's",
        "Weight": "50g",
        "Skin Type": "All Skin Types",
        "Country of Origin": "India",
        "Benefits": "Spot-less Glow, Sun Protection",
      }),
      variants: null,
      seoTitle: "Buy Pond's Bright Beauty Day Cream 50g in Bangladesh - Sokher Store",
      seoDescription: "Authentic Pond's Bright Beauty Day Cream at best price in BD with fast home delivery.",
    },
    {
      name: "Maybelline Fit Me Matte + Poreless Foundation",
      slug: "maybelline-fit-me-foundation",
      sku: "MAY-FM-FND-128",
      price: 1150,
      regularPrice: 1350,
      stock: 50,
      badge: "New",
      isFeatured: true,
      status: "ACTIVE",
      categorySlugs: ["makeup"],
      subcategorySlug: "makeup-foundation",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80",
      ]),
      description: "Maybelline Fit Me Matte + Poreless liquid foundation is formulated with micro-powders that control shine and blur pores for a natural, seamless finish that lasts all day.",
      specification: JSON.stringify({
        "Brand": "Maybelline New York",
        "Volume": "30ml",
        "Finish": "Matte + Poreless",
        "Coverage": "Medium to Full",
        "Dermatologist Tested": "Yes",
      }),
      variants: JSON.stringify([
        { name: "Shade 115 Ivory", sku: "MAY-FM-115", price: 1150, stock: 15 },
        { name: "Shade 120 Classic Ivory", sku: "MAY-FM-120", price: 1150, stock: 15 },
        { name: "Shade 128 Warm Nude", sku: "MAY-FM-128", price: 1150, stock: 20 },
      ]),
      seoTitle: "Maybelline Fit Me Matte + Poreless Foundation Price in BD - Sokher Store",
      seoDescription: "100% Original Maybelline Fit Me foundation shades available for all skin tones.",
    },
    {
      name: "L'Oréal Paris Elseve Shampoo",
      slug: "loreal-paris-elseve-shampoo",
      sku: "LOR-ELS-SHP-280",
      price: 690,
      regularPrice: 850,
      stock: 65,
      badge: "Hot",
      isFeatured: true,
      status: "ACTIVE",
      categorySlugs: ["hair-care"],
      subcategorySlug: "hair-care-shampoo",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80",
      ]),
      description: "L'Oréal Paris Elseve Total Repair 5 shampoo tackles 5 hair problems: hair fall, dryness, roughness, dullness, and split ends with concentrated ceramide cement.",
      specification: JSON.stringify({
        "Brand": "L'Oréal Paris",
        "Volume": "280ml",
        "Hair Type": "Damaged / Dry",
        "Target": "5 Problems, 1 Solution",
      }),
      variants: null,
      seoTitle: "L'Oréal Paris Elseve Total Repair 5 Shampoo - Sokher Store",
      seoDescription: "Revitalize damaged hair with L'Oréal Paris Elseve shampoo.",
    },
    {
      name: "Lakmé 9 to 5 Matte Lipstick",
      slug: "lakme-9-to-5-matte-lipstick",
      sku: "LAK-9TO5-LIP-RED",
      price: 450,
      regularPrice: 600,
      stock: 40,
      badge: "Best Seller",
      isFeatured: true,
      status: "ACTIVE",
      categorySlugs: ["makeup"],
      subcategorySlug: "makeup-lipstick",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800&auto=format&fit=crop&q=80",
      ]),
      description: "Lakmé 9 to 5 Primer + Matte Lip Color gives you an intense matte payoff that glides smoothly and stays all day without drying your lips.",
      specification: JSON.stringify({
        "Brand": "Lakmé",
        "Weight": "3.6g",
        "Finish": "Built-in Primer Matte",
        "Formulation": "Stick",
      }),
      variants: JSON.stringify([
        { name: "Red Coat", sku: "LAK-LIP-RED", price: 450, stock: 15 },
        { name: "Pink Bureau", sku: "LAK-LIP-PNK", price: 450, stock: 15 },
        { name: "Maple Map", sku: "LAK-LIP-MPL", price: 450, stock: 10 },
      ]),
      seoTitle: "Lakmé 9 to 5 Matte Lipstick - Buy Online in Bangladesh",
      seoDescription: "Rich matte lipstick by Lakmé at Sokher Store.",
    },
    {
      name: "Simple Refreshing Face Wash",
      slug: "simple-refreshing-face-wash",
      sku: "SMP-REF-FW-150",
      price: 320,
      regularPrice: 400,
      stock: 90,
      badge: "New",
      isFeatured: true,
      status: "ACTIVE",
      categorySlugs: ["skincare"],
      subcategorySlug: "skincare-face-wash",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
      ]),
      description: "Simple Kind to Skin Refreshing Facial Wash 100% soap-free gel cleanser removes dirt, oil, and impurities without stripping natural skin moisture.",
      specification: JSON.stringify({
        "Brand": "Simple",
        "Volume": "150ml",
        "Skin Type": "Sensitive / All",
        "Alcohol Free": "Yes",
        "Fragrance Free": "Yes",
      }),
      variants: null,
      seoTitle: "Simple Refreshing Facial Wash 150ml in BD - Sokher Store",
      seoDescription: "Gentle soap-free face wash for sensitive skin at Sokher Store.",
    },
  ];

  for (const prod of productsData) {
    const subcat = prod.subcategorySlug ? subcategoryMap[prod.subcategorySlug] : null;

    const product = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        regularPrice: prod.regularPrice,
        stock: prod.stock,
        badge: prod.badge,
        isFeatured: prod.isFeatured,
        status: prod.status,
        images: prod.images,
        description: prod.description,
        specification: prod.specification,
        variants: prod.variants,
        subcategoryId: subcat ? subcat.id : null,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        price: prod.price,
        regularPrice: prod.regularPrice,
        stock: prod.stock,
        badge: prod.badge,
        isFeatured: prod.isFeatured,
        status: prod.status,
        images: prod.images,
        description: prod.description,
        specification: prod.specification,
        variants: prod.variants,
        subcategoryId: subcat ? subcat.id : null,
      },
    });

    // Link Categories
    for (const catSlug of prod.categorySlugs) {
      const cat = categoryMap[catSlug];
      if (cat) {
        await prisma.productCategory.upsert({
          where: {
            productId_categoryId: {
              productId: product.id,
              categoryId: cat.id,
            },
          },
          update: {},
          create: {
            productId: product.id,
            categoryId: cat.id,
          },
        });
      }
    }

    // Add initial verified reviews
    await prisma.review.createMany({
      data: [
        {
          productId: product.id,
          customerName: 'Nusrat Jahan',
          rating: 5,
          comment: 'Very authentic product! Received fast delivery in Chittagong. Recommended!',
          isVerified: true,
          status: 'APPROVED',
        },
        {
          productId: product.id,
          customerName: 'Sadia Rahman',
          rating: 4,
          comment: 'Great quality and packaging was very secure. Will order again.',
          isVerified: true,
          status: 'APPROVED',
        },
      ],
    });
  }
  console.log(`Seeded ${productsData.length} demo products with reviews.`);

  // 5. Seed Banners (Hero Slider & Promo Banner)
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        type: 'HERO_SLIDER',
        title: 'Your Beauty, Our Passion',
        subtitle: 'Discover premium cosmetics & skincare products for a more confident you.',
        badge: 'BEAUTY • SKINCARE • SELF CARE',
        buttonText: 'Shop Now',
        buttonUrl: '/shop',
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
        order: 1,
        isActive: true,
      },
      {
        type: 'PROMO_BANNER',
        title: 'Glow Naturally',
        subtitle: 'Healthy skin. Happy you.',
        badge: 'SKINCARE SPECIAL',
        buttonText: 'Shop Skincare',
        buttonUrl: '/category/skincare',
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&auto=format&fit=crop&q=80',
        order: 1,
        isActive: true,
      },
    ],
  });
  console.log('Seeded Hero Slider & Promo Banner.');

  // 6. Seed Coupons
  await prisma.coupon.upsert({
    where: { code: 'SOKHER10' },
    update: {},
    create: {
      code: 'SOKHER10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscountCap: 200,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'BEAUTY50' },
    update: {},
    create: {
      code: 'BEAUTY50',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderAmount: 800,
      isActive: true,
    },
  });
  console.log('Coupons seeded.');

  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
