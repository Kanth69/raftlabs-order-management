import { describe, it, expect, beforeEach } from 'vitest';
import { orderStore } from '@/lib/store';
import { GET as getMenu } from '@/app/api/menu/route';
import { POST as createOrder, GET as getOrders } from '@/app/api/orders/route';
import { GET as getOrderById, PATCH as updateOrderStatus } from '@/app/api/orders/[id]/route';
import { NextRequest } from 'next/server';

function createJsonRequest(url: string, method: string, body?: unknown): NextRequest {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

describe('API Endpoints (TDD)', () => {
  beforeEach(() => {
    orderStore.reset();
  });

  describe('GET /api/menu', () => {
    it('returns full menu items with 200 OK', async () => {
      const req = createJsonRequest('http://localhost:3000/api/menu', 'GET');
      const res = await getMenu(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('filters menu items by category query parameter', async () => {
      const req = createJsonRequest('http://localhost:3000/api/menu?category=Burgers', 'GET');
      const res = await getMenu(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.every((item: { category: string }) => item.category === 'Burgers')).toBe(true);
    });
  });

  describe('POST /api/orders & GET /api/orders', () => {
    it('creates a new order with valid payload (201 Created)', async () => {
      const payload = {
        items: [
          { menuItemId: 'menu-1', quantity: 2 },
          { menuItemId: 'menu-7', quantity: 1 },
        ],
        deliveryDetails: {
          name: 'Sarah Connor',
          address: '404 Skynet Boulevard',
          phone: '+1 555-888-9999',
        },
      };

      const req = createJsonRequest('http://localhost:3000/api/orders', 'POST', payload);
      const res = await createOrder(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toMatch(/^ORD-\d{6}$/);
      expect(json.data.status).toBe('ORDER_RECEIVED');
      expect(json.data.deliveryDetails.name).toBe('Sarah Connor');
    });

    it('returns 400 Bad Request when validation fails', async () => {
      const invalidPayload = {
        items: [],
        deliveryDetails: {
          name: 'S', // Name too short
          address: '',
          phone: 'invalid',
        },
      };

      const req = createJsonRequest('http://localhost:3000/api/orders', 'POST', invalidPayload);
      const res = await createOrder(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    it('returns 400 Bad Request if menuItemId does not exist', async () => {
      const invalidItemPayload = {
        items: [{ menuItemId: 'ghost-item', quantity: 1 }],
        deliveryDetails: {
          name: 'Sarah Connor',
          address: '404 Skynet Boulevard',
          phone: '+1 555-888-9999',
        },
      };

      const req = createJsonRequest('http://localhost:3000/api/orders', 'POST', invalidItemPayload);
      const res = await createOrder(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('does not exist');
    });

    it('lists all orders with GET /api/orders', async () => {
      // Place one order first
      orderStore.createOrder({
        items: [{ menuItemId: 'menu-1', quantity: 1 }],
        deliveryDetails: {
          name: 'Sarah Connor',
          address: '404 Skynet Boulevard',
          phone: '+1 555-888-9999',
        },
        simulateRealTime: false,
      });

      const res = await getOrders();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.length).toBe(1);
    });
  });

  describe('GET /api/orders/[id] & PATCH /api/orders/[id]/status', () => {
    it('retrieves order by id', async () => {
      const { order } = orderStore.createOrder({
        items: [{ menuItemId: 'menu-1', quantity: 1 }],
        deliveryDetails: {
          name: 'Sarah Connor',
          address: '404 Skynet Boulevard',
          phone: '+1 555-888-9999',
        },
        simulateRealTime: false,
      });

      const req = createJsonRequest(`http://localhost:3000/api/orders/${order!.id}`, 'GET');
      const res = await getOrderById(req, { params: { id: order!.id } });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.id).toBe(order!.id);
    });

    it('returns 404 for non-existent order id', async () => {
      const req = createJsonRequest('http://localhost:3000/api/orders/ORD-999999', 'GET');
      const res = await getOrderById(req, { params: { id: 'ORD-999999' } });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
    });

    it('updates order status via PATCH', async () => {
      const { order } = orderStore.createOrder({
        items: [{ menuItemId: 'menu-1', quantity: 1 }],
        deliveryDetails: {
          name: 'Sarah Connor',
          address: '404 Skynet Boulevard',
          phone: '+1 555-888-9999',
        },
        simulateRealTime: false,
      });

      const req = createJsonRequest(
        `http://localhost:3000/api/orders/${order!.id}/status`,
        'PATCH',
        { status: 'PREPARING' }
      );
      const res = await updateOrderStatus(req, { params: { id: order!.id } });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.status).toBe('PREPARING');
      expect(json.data.statusTimeline.length).toBe(2);
    });

    it('rejects invalid status values on PATCH', async () => {
      const { order } = orderStore.createOrder({
        items: [{ menuItemId: 'menu-1', quantity: 1 }],
        deliveryDetails: {
          name: 'Sarah Connor',
          address: '404 Skynet Boulevard',
          phone: '+1 555-888-9999',
        },
        simulateRealTime: false,
      });

      const req = createJsonRequest(
        `http://localhost:3000/api/orders/${order!.id}/status`,
        'PATCH',
        { status: 'INVALID_STATUS' }
      );
      const res = await updateOrderStatus(req, { params: { id: order!.id } });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });
});
