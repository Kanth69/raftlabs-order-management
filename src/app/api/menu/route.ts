import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const items = orderStore.getMenu(category);
    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while fetching menu items',
      },
      { status: 500 }
    );
  }
}
