import { z } from 'zod';

export const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

export const orderItemInputSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(50, 'Quantity cannot exceed 50 per item'),
});

export const deliveryDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  address: z
    .string()
    .trim()
    .min(5, 'Delivery address must be at least 5 characters')
    .max(300, 'Address cannot exceed 300 characters'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid phone number (at least 7-15 digits)'),
});

export const placeOrderSchema = z.object({
  items: z
    .array(orderItemInputSchema)
    .min(1, 'Cart cannot be empty. Please select at least one item.'),
  deliveryDetails: deliveryDetailsSchema,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['ORDER_RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type DeliveryDetailsInput = z.infer<typeof deliveryDetailsSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
