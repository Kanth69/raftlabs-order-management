import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { MenuCard } from '@/components/MenuCard';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { MenuItem } from '@/types';

const mockMenuItem: MenuItem = {
  id: 'menu-1',
  name: 'Artisan Margherita Pizza',
  description: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil.',
  price: 14.99,
  image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3',
  category: 'Pizzas',
  isVegetarian: true,
  rating: 4.9,
  prepTimeMinutes: 20,
};

const CartDrawerTestWrapper: React.FC = () => {
  const { addToCart, setIsCartOpen } = useCart();

  return (
    <div>
      <button onClick={() => { addToCart(mockMenuItem); setIsCartOpen(true); }}>
        Open Cart With Item
      </button>
      <CartDrawer onProceedToCheckout={vi.fn()} />
    </div>
  );
};

describe('UI Components (TDD)', () => {
  describe('MenuCard Component', () => {
    it('renders food details: title, description, category, and price', () => {
      render(
        <CartProvider>
          <MenuCard item={mockMenuItem} />
        </CartProvider>
      );

      expect(screen.getByText('Artisan Margherita Pizza')).toBeInTheDocument();
      expect(
        screen.getByText('San Marzano tomatoes, fresh buffalo mozzarella, fresh basil.')
      ).toBeInTheDocument();
      expect(screen.getByText('Pizzas')).toBeInTheDocument();
      expect(screen.getByText('$14.99')).toBeInTheDocument();
      expect(screen.getByText('Veg')).toBeInTheDocument();
    });

    it('clicking Add button adds item to cart and displays quantity selector', () => {
      render(
        <CartProvider>
          <MenuCard item={mockMenuItem} />
        </CartProvider>
      );

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      // Quantity should now show 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('CartDrawer Component', () => {
    it('renders selected item and checkout trigger', () => {
      render(
        <CartProvider>
          <CartDrawerTestWrapper />
        </CartProvider>
      );

      fireEvent.click(screen.getByText('Open Cart With Item'));
      expect(screen.getByText('Your Order Cart')).toBeInTheDocument();
      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });
  });

  describe('CheckoutModal Component', () => {
    it('renders form inputs for name, phone, and address', () => {
      render(
        <CartProvider>
          <CheckoutModal isOpen={true} onClose={vi.fn()} onOrderSuccess={vi.fn()} />
        </CartProvider>
      );

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delivery address/i)).toBeInTheDocument();
    });

    it('displays client-side validation errors when submitting empty form', () => {
      render(
        <CartProvider>
          <CheckoutModal isOpen={true} onClose={vi.fn()} onOrderSuccess={vi.fn()} />
        </CartProvider>
      );

      const submitButton = screen.getByRole('button', { name: /confirm & place order/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
      expect(screen.getByText(/delivery address must be at least 5 characters/i)).toBeInTheDocument();
    });
  });
});
