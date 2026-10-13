import { NextRequest, NextResponse } from 'next/server';
import { orderStore } from '@/lib/store';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const initialOrder = orderStore.getOrder(id);

  if (!initialOrder) {
    return NextResponse.json(
      { success: false, error: `Order with ID '${id}' was not found.` },
      { status: 404 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial order state immediately upon connection
      const initialPayload = `data: ${JSON.stringify({ type: 'CONNECTED', order: initialOrder })}\n\n`;
      controller.enqueue(encoder.encode(initialPayload));

      // 2. Subscribe to real-time status changes
      const unsubscribe = orderStore.subscribeToOrder(id, (updatedOrder: Order) => {
        try {
          const payload = `data: ${JSON.stringify({ type: 'STATUS_UPDATE', order: updatedOrder })}\n\n`;
          controller.enqueue(encoder.encode(payload));

          if (updatedOrder.status === 'DELIVERED') {
            // Optional close or keep stream open
          }
        } catch (err) {
          console.error('Error streaming order update:', err);
        }
      });

      // 3. Keep-alive heartbeat every 15 seconds to prevent gateway timeouts
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, 15000);

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(heartbeatTimer);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
