import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '@/lib/store';
import { updateOrderStatusSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;
    const order = orderStore.getOrder(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order with ID '${id}' was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order by id:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while fetching order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload in request body' },
        { status: 400 }
      );
    }

    const parseResult = updateOrderStatusSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((i) => i.message).join('; ');
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const { status } = parseResult.data;
    const { order, error } = orderStore.updateOrderStatus(id, status);

    if (error || !order) {
      const statusCode = error?.includes('not found') ? 404 : 400;
      return NextResponse.json(
        { success: false, error: error || 'Failed to update order status' },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to '${status}' successfully`,
      data: order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while updating order status' },
      { status: 500 }
    );
  }
}
