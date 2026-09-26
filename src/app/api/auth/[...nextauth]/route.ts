import { handlers } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return await handlers.GET(req);
  } catch (error: any) {
    console.error('NextAuth GET Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'NextAuth Route Handler Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handlers.POST(req);
  } catch (error: any) {
    console.error('NextAuth POST Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'NextAuth Route Handler Error' },
      { status: 500 }
    );
  }
}
