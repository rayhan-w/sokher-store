import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'লগআউট সফল হয়েছে।' });
  response.cookies.delete('sokher_auth_token');
  return response;
}
