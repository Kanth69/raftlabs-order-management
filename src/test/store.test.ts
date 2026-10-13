import { describe, it, expect, beforeEach } from 'vitest';
import { orderStore, INITIAL_MENU_ITEMS } from '@/lib/store';
import { placeOrderSchema, updateOrderStatusSchema } from '@/lib/validation';

describe('Validation Schemas (Input Validation TDD)', () => {
  it('should validate valid order payload successfully', () => {
    const validData = {
      items: [{ menuItemId: 'menu-1', quantity: 2 }],
      deliveryDetails: {
        name: 'Jane Doe',
        address: '123 Tech Park, Suite 4',
        phone: '+1 555-123-4567',
      },
    };

    const parsed = placeOrderSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('should reject order with empty items array', () => {
    const invalidData = {
      items: [],
      deliveryDetails: {
        name: 'Jane Doe',
        address: '123 Tech Park',
        phone: '+1 555-123-4567',
      },
    };

    const parsed = placeOrderSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      expect(messages.some((msg) => msg.includes('Cart cannot be empty'))).toBe(true);
    }
  });

  it('should reject invalid phone numbers', () => {
    const invalidPhoneData = {
      items: [{ menuItemId: 'menu-1', quantity: 1 }],
      deliveryDetails: {
        name: 'Jane Doe',
        address: '123 Tech Park',
        phone: '123', // Too short
      },
    };

    const parsed = placeOrderSchema.safeParse(invalidPhoneData);
    expect(parsed.success).toBe(false);
  });

  it('should reject too short addresses', () => {
    const invalidAddressData = {
      items: [{ menuItemId: 'menu-1', quantity: 1 }],
      deliveryDetails: {
        name: 'Jane Doe',
        address: 'St', // Less than 5 chars
        phone: '+1 555-123-4567',
      },
    };

    const parsed = placeOrderSchema.safeParse(invalidAddressData);
    expect(parsed.success).toBe(false);
  });

  it('should validate allowed status strings and reject invalid statuses', () => {
    expect(updateOrderStatusSchema.safeParse({ status: 'PREPARING' }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: 'DELIVERED' }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: 'UNKNOWN_STATUS' }).success).toBe(false);
  });
});

describe('OrderStore & Business Logic (TDD)', () => {
  beforeEach(() => {
    orderStore.reset();
  });

  it('should retrieve all menu items', () => {
    const menu = orderStore.getMenu();
    expect(menu.length).toBe(INITIAL_MENU_ITEMS.length);
    expect(menu[0]).toHaveProperty('name');
    expect(menu[0]).toHaveProperty('price');
    expect(menu[0]).toHaveProperty('image');
  });

  it('should filter menu items by category', () => {
    const pizzas = orderStore.getMenu('Pizzas');
    expect(pizzas.every((item) => item.category === 'Pizzas')).toBe(true);
    expect(pizzas.length).toBeGreaterThan(0);
  });

  it('should create an order with accurate total and initial status', () => {
    const result = orderStore.createOrder({
      items: [
        { menuItemId: 'menu-1', quantity: 2 },
        { menuItemId: 'menu-7', quantity: 1 },
      ],
      deliveryDetails: {
        name: 'Alex Developer',
        address: '742 Evergreen Terrace',
        phone: '+1 800-555-0199',
      },
      simulateRealTime: false,
    });

    expect(result.error).toBeUndefined();
    expect(result.order).toBeDefined();

    const order = result.order!;
    expect(order.id).toMatch(/^ORD-\d{6}$/);
    expect(order.status).toBe('ORDER_RECEIVED');
    expect(order.items.length).toBe(2);

    const expectedTotal = 299 * 2 + 149;
    expect(order.totalAmount).toBe(expectedTotal);
    expect(order.statusTimeline.length).toBe(1);
    expect(order.statusTimeline[0].status).toBe('ORDER_RECEIVED');
  });

  it('should return error if item does not exist in menu', () => {
    const result = orderStore.createOrder({
      items: [{ menuItemId: 'non-existent-id', quantity: 1 }],
      deliveryDetails: {
        name: 'Alex',
        address: '742 Evergreen Terrace',
        phone: '+1 800-555-0199',
      },
      simulateRealTime: false,
    });

    expect(result.order).toBeNull();
    expect(result.error).toContain('does not exist');
  });

  it('should advance order status through state machine', () => {
    const { order } = orderStore.createOrder({
      items: [{ menuItemId: 'menu-1', quantity: 1 }],
      deliveryDetails: {
        name: 'Alex',
        address: '742 Evergreen Terrace',
        phone: '+1 800-555-0199',
      },
      simulateRealTime: false,
    });

    const orderId = order!.id;

    // Advance to PREPARING
    const step1 = orderStore.updateOrderStatus(orderId, 'PREPARING');
    expect(step1.error).toBeUndefined();
    expect(step1.order?.status).toBe('PREPARING');
    expect(step1.order?.statusTimeline.length).toBe(2);

    // Advance to OUT_FOR_DELIVERY
    const step2 = orderStore.updateOrderStatus(orderId, 'OUT_FOR_DELIVERY');
    expect(step2.order?.status).toBe('OUT_FOR_DELIVERY');

    // Advance to DELIVERED
    const step3 = orderStore.updateOrderStatus(orderId, 'DELIVERED');
    expect(step3.order?.status).toBe('DELIVERED');

    // Reject backward transition
    const backwardAttempt = orderStore.updateOrderStatus(orderId, 'PREPARING');
    expect(backwardAttempt.error).toBeDefined();
    expect(backwardAttempt.error).toContain('Cannot transition backward');
  });

  it('should notify subscriber when status updates in real-time', () => {
    const { order } = orderStore.createOrder({
      items: [{ menuItemId: 'menu-1', quantity: 1 }],
      deliveryDetails: {
        name: 'Alex',
        address: '742 Evergreen Terrace',
        phone: '+1 800-555-0199',
      },
      simulateRealTime: false,
    });

    let receivedUpdateStatus: string | null = null;
    const unsubscribe = orderStore.subscribeToOrder(order!.id, (updatedOrder) => {
      receivedUpdateStatus = updatedOrder.status;
    });

    orderStore.updateOrderStatus(order!.id, 'PREPARING');
    expect(receivedUpdateStatus).toBe('PREPARING');

    unsubscribe();
  });
});
