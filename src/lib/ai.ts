import prisma from './prisma';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * AI Shopping Assistant
 * Uses Google Gemini API when available, or smart rule-based fallback over DB catalog.
 */
export async function getShoppingAssistantReply(userMessage: string): Promise<string> {
  const query = userMessage.toLowerCase().trim();

  // Fetch active products from DB to ground the assistant
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { name: true, price: true, stock: true, badge: true, slug: true },
    take: 15,
  });

  const catalogContext = products
    .map(
      (p) =>
        `- ${p.name} (দাম: ৳${p.price}, স্টক: ${p.stock > 0 ? `${p.stock} টি আছে` : 'স্টক শেষ'}${p.badge ? `, ব্যাজ: ${p.badge}` : ''})`
    )
    .join('\n');

  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are the friendly AI Beauty & Shopping Assistant for "Sokher Store" (a top Bangladeshi cosmetics & skincare e-commerce).
Respond helpfully in warm, polite Bengali (with English cosmetic terms where natural).
Use ONLY this actual catalog data to answer price, stock, and product questions:

${catalogContext}

Customer Question: "${userMessage}"
Guide them to relevant products, mention current prices in ৳ (Taka), and suggest related items if applicable. Keep responses concise and friendly.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
    } catch (e) {
      console.error('Gemini API call failed, falling back to local intelligence:', e);
    }
  }

  // Smart local catalog matching fallback
  const matching = products.filter((p) => {
    const pName = p.name.toLowerCase();
    return query.split(' ').some((word) => word.length > 2 && pName.includes(word));
  });

  if (matching.length > 0) {
    const list = matching.map((p) => `• ${p.name} - ৳${p.price} (${p.stock > 0 ? 'স্টকে আছে' : 'স্টক আউট'})`).join('\n');
    return `শখের স্টোরে আপনার পছন্দের পণ্যগুলো দেখুন:\n\n${list}\n\nপণ্যটি কার্টে যোগ করে সহজেই অর্ডার করতে পারেন! আর কোনো তথ্য জানার থাকলে আমাকে জিজ্ঞেস করতে পারেন।`;
  }

  return `নমস্কার! শখের স্টোরে আপনাকে স্বাগতম। আমাদের স্কিনকেয়ার, মেকআপ, হেয়ার কেয়ার ও বডি কেয়ারের অরিজিনাল পণ্যগুলো দেখতে আমাদের শপ পেইজ ঘুরে দেখতে পারেন। আপনি কি কোনো নির্দিষ্ট পণ্য খুঁজছেন?`;
}

/**
 * Smart Search Normalizer
 * Handles phonetic Bangla & common cosmetic aliases
 */
export function normalizeSearchKeywords(query: string): string[] {
  const q = query.toLowerCase().trim();
  const keywords = [q];

  const aliasMap: { [key: string]: string[] } = {
    ক্রিম: ['cream', 'ponds', 'bright beauty'],
    ফাউন্ডেশন: ['foundation', 'fit me', 'maybelline'],
    শ্যাম্পু: ['shampoo', 'elseve', 'loreal'],
    লিপস্টিক: ['lipstick', 'lakme', 'matte'],
    ফেসওয়াশ: ['face wash', 'simple', 'cleanser'],
    fawndation: ['foundation'],
    shampu: ['shampoo'],
    lipstik: ['lipstick'],
    skinkare: ['skincare'],
  };

  for (const [key, aliases] of Object.entries(aliasMap)) {
    if (q.includes(key)) {
      keywords.push(...aliases);
    }
  }

  return Array.from(new Set(keywords));
}

/**
 * Admin AI Product Description Generator
 */
export async function generateProductDescription(name: string, category: string, features?: string): Promise<{ bangla: string; english: string }> {
  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate an engaging, SEO-optimized e-commerce product description for:
Product Name: ${name}
Category: ${category}
Key Features: ${features || 'Premium original cosmetic product'}

Format response strictly as JSON:
{
  "bangla": "A persuasive 2-3 paragraph product description in Bengali highlighting benefits and authenticity",
  "english": "A crisp, persuasive 2-3 paragraph product description in English"
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonMatch = rawText?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Gemini description generation failed:', e);
    }
  }

  // High quality default template
  return {
    bangla: `${name} শখের স্টোরের একটি ১০০% অরিজিনাল এবং প্রিমিয়াম কোয়ালিটি পণ্য। এটি আপনার ত্বকের স্বাভাবিক সৌন্দর্য ধরে রাখতে সাহায্য করে এবং প্রতিদিনের ব্যবহারে দেয় দীর্ঘস্থায়ী ফ্রেশ লুক। ডার্মাটোলজিক্যালি পরীক্ষিত এবং শতভাগ নির্ভরযোগ্য।`,
    english: `${name} is an authentic, premium skincare and beauty essential from Sokher Store. Formulated with high-grade ingredients to enhance your natural beauty while protecting your skin daily. 100% genuine and safe for regular use.`,
  };
}

/**
 * Dashboard AI Sales Insights
 */
export async function generateSalesInsights(): Promise<string> {
  const [totalOrders, completedOrders, products] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      where: { orderStatus: { in: ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'] } },
      select: { totalAmount: true },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { name: true, stock: true },
    }),
  ]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStock = products.filter((p) => p.stock < 15);

  return `📊 শখের স্টোর AI ইনসাইট: মোট সফল অর্ডার সংখ্যা ${completedOrders.length} টি এবং সর্বমোট বিক্রয় ৳${totalRevenue.toLocaleString()}। বর্তমানে ${lowStock.length} টি পণ্যের স্টক ১৫ এর নিচে রয়েছে (যেমন: ${lowStock.slice(0, 3).map((p) => p.name).join(', ') || 'কোনো সংকট নেই'})। নিয়মিত সরবরাহ নিশ্চিত করতে সময়মতো রিস্টক করুন।`;
}
