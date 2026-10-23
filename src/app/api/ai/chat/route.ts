import { NextResponse } from 'next/server';
import { getShoppingAssistantReply } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || String(message).trim() === '') {
      return NextResponse.json({ reply: 'দয়া করে কিছু লিখুন।' });
    }

    const reply = await getShoppingAssistantReply(message);
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({
      reply: 'দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
    });
  }
}
