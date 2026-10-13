import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '@/lib/store';
import { placeOrderSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = orderStore.getAllOrders();
    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload in request body' },
        { status: 400 }
      );
    }

    const parseResult = placeOrderSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((i) => i.message).join('; ');
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { items, deliveryDetails } = parseResult.data;

    // Optional simulation delay can be configured or defaulted to 6 seconds per step
    const { order, error } = orderStore.createOrder({
      items,
      deliveryDetails,
      simulateRealTime: true,
      simulationDelayMs: 6000,
    });

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: error || 'Failed to create order' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully and entered kitchen queue',
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating order' },
      { status: 500 }
    );
  }
}
