import { MenuItem, Order, OrderStatus, DeliveryDetails, OrderItem } from '@/types';
import { EventEmitter } from 'events';

// Initial Seed Menu Items
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Artisan Margherita Pizza',
    description: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil, extra virgin olive oil.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    category: 'Pizzas',
    isVegetarian: true,
    rating: 4.9,
    prepTimeMinutes: 20,
  },
  {
    id: 'menu-2',
    name: 'Spicy Pepperoni & Hot Honey Pizza',
    description: 'Crispy artisanal pepperoni, aged mozzarella, chili flakes, drizzled with spicy habanero honey.',
    price: 399,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
    category: 'Pizzas',
    isVegetarian: false,
    rating: 4.8,
    prepTimeMinutes: 22,
  },
  {
    id: 'menu-3',
    name: 'Truffle Mushroom Pizza',
    description: 'Roasted wild mushrooms, fontina cheese, truffle cream sauce, fresh thyme on sourdough crust.',
    price: 449,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    category: 'Pizzas',
    isVegetarian: true,
    rating: 4.9,
    prepTimeMinutes: 25,
  },
  {
    id: 'menu-4',
    name: 'Double Truffle Smash Burger',
    description: 'Two smashed Angus beef patties, Swiss cheese, caramelized onions, black truffle aioli on brioche.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    category: 'Burgers',
    isVegetarian: false,
    rating: 4.9,
    prepTimeMinutes: 15,
  },
  {
    id: 'menu-5',
    name: 'Crispy Chipotle Chicken Burger',
    description: 'Buttermilk fried chicken breast, pickled jalapeños, purple cabbage slaw, smoky chipotle mayo.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
    category: 'Burgers',
    isVegetarian: false,
    rating: 4.7,
    prepTimeMinutes: 18,
  },
  {
    id: 'menu-6',
    name: 'Beyond Avocado Vegan Burger',
    description: '100% plant-based grilled patty, sliced Hass avocado, vegan gouda, lettuce, heirloom tomato.',
    price: 279,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80',
    category: 'Burgers',
    isVegetarian: true,
    rating: 4.6,
    prepTimeMinutes: 15,
  },
  {
    id: 'menu-7',
    name: 'Parmesan Truffle Fries',
    description: 'Double-cooked crispy Idaho potato fries tossed in white truffle oil, grated aged Parmesan, parsley.',
    price: 149,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    category: 'Sides & Drinks',
    isVegetarian: true,
    rating: 4.8,
    prepTimeMinutes: 10,
  },
  {
    id: 'menu-8',
    name: 'Craft Cold Brew Coffee',
    description: 'Single-origin Ethiopian beans steeped for 18 hours, served chilled over ice.',
    price: 129,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    category: 'Sides & Drinks',
    isVegetarian: true,
    rating: 4.9,
    prepTimeMinutes: 5,
  },
  {
    id: 'menu-9',
    name: 'Molten Belgian Chocolate Lava Cake',
    description: 'Warm chocolate cake with a gooey dark chocolate center, topped with powdered sugar.',
    price: 169,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    category: 'Desserts',
    isVegetarian: true,
    rating: 5.0,
    prepTimeMinutes: 12,
  },
];

export const STATUS_PROGRESSION: OrderStatus[] = [
  'ORDER_RECEIVED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  ORDER_RECEIVED: 'Your order has been received by the kitchen and confirmed.',
  PREPARING: 'Our chef is preparing your meal with fresh ingredients.',
  OUT_FOR_DELIVERY: 'Your food is packed and our courier is on the way to your address.',
  DELIVERED: 'Your order has been successfully delivered. Enjoy your meal!',
};

class OrderStore {
  private menu: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private emitter: EventEmitter = new EventEmitter();
  private simulationTimers: Map<string, NodeJS.Timeout[]> = new Map();

  constructor() {
    this.initMenu();
  }

  private initMenu() {
    this.menu.clear();
    INITIAL_MENU_ITEMS.forEach((item) => {
      this.menu.set(item.id, item);
    });
  }

  public getMenu(category?: string): MenuItem[] {
    const all = Array.from(this.menu.values());
    if (category && category !== 'All') {
      return all.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }
    return all;
  }

  public getMenuItem(id: string): MenuItem | undefined {
    return this.menu.get(id);
  }

  public createOrder(input: {
    items: { menuItemId: string; quantity: number }[];
    deliveryDetails: DeliveryDetails;
    simulateRealTime?: boolean;
    simulationDelayMs?: number;
  }): { order: Order | null; error?: string } {
    const orderItems: OrderItem[] = [];
    let calculatedTotal = 0;

    for (const itemInput of input.items) {
      const menuItem = this.menu.get(itemInput.menuItemId);
      if (!menuItem) {
        return { order: null, error: `Menu item with ID '${itemInput.menuItemId}' does not exist.` };
      }
      const itemSubtotal = menuItem.price * itemInput.quantity;
      calculatedTotal += itemSubtotal;

      orderItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: itemInput.quantity,
        image: menuItem.image,
      });
    }

    const now = new Date().toISOString();
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      items: orderItems,
      totalAmount: Math.round(calculatedTotal * 100) / 100,
      deliveryDetails: input.deliveryDetails,
      status: 'ORDER_RECEIVED',
      statusTimeline: [
        {
          status: 'ORDER_RECEIVED',
          timestamp: now,
          note: STATUS_DESCRIPTIONS.ORDER_RECEIVED,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(orderId, newOrder);
    this.emitter.emit(`order:${orderId}`, newOrder);

    // Default: simulate real-time status progression if requested (enabled by default)
    if (input.simulateRealTime !== false) {
      this.startRealTimeSimulation(orderId, input.simulationDelayMs ?? 6000);
    }

    return { order: newOrder };
  }

  public getOrder(id: string): Order | undefined {
    return this.orders.get(id);
  }

  public getAllOrders(): Order[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateOrderStatus(id: string, newStatus: OrderStatus): { order: Order | null; error?: string } {
    const order = this.orders.get(id);
    if (!order) {
      return { order: null, error: `Order with ID '${id}' not found.` };
    }

    if (order.status === newStatus) {
      return { order };
    }

    const currentIndex = STATUS_PROGRESSION.indexOf(order.status);
    const nextIndex = STATUS_PROGRESSION.indexOf(newStatus);

    if (nextIndex < currentIndex) {
      return {
        order: null,
        error: `Cannot transition backward from status '${order.status}' to '${newStatus}'.`,
      };
    }

    const now = new Date().toISOString();
    order.status = newStatus;
    order.updatedAt = now;
    order.statusTimeline.push({
      status: newStatus,
      timestamp: now,
      note: STATUS_DESCRIPTIONS[newStatus],
    });

    this.orders.set(id, order);
    this.emitter.emit(`order:${id}`, order);
    return { order };
  }

  public subscribeToOrder(id: string, listener: (order: Order) => void): () => void {
    const eventName = `order:${id}`;
    this.emitter.on(eventName, listener);
    return () => {
      this.emitter.off(eventName, listener);
    };
  }

  public startRealTimeSimulation(orderId: string, stepDelayMs: number = 6000): void {
    this.clearSimulation(orderId);

    const steps: OrderStatus[] = ['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const timers: NodeJS.Timeout[] = [];

    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        const currentOrder = this.orders.get(orderId);
        if (currentOrder && currentOrder.status !== 'DELIVERED') {
          this.updateOrderStatus(orderId, step);
        }
      }, stepDelayMs * (index + 1));

      timers.push(timer);
    });

    this.simulationTimers.set(orderId, timers);
  }

  public clearSimulation(orderId: string): void {
    const existing = this.simulationTimers.get(orderId);
    if (existing) {
      existing.forEach(clearTimeout);
      this.simulationTimers.delete(orderId);
    }
  }

  public reset(): void {
    this.simulationTimers.forEach((timers) => timers.forEach(clearTimeout));
    this.simulationTimers.clear();
    this.orders.clear();
    this.initMenu();
  }
}

// Global singleton instance for serverless / dev reload persistence
const globalStore = global as unknown as { __orderStore?: OrderStore };

export const orderStore: OrderStore =
  globalStore.__orderStore ?? (globalStore.__orderStore = new OrderStore());
