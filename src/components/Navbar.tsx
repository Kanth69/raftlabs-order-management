'use client';

import React from 'react';
import { ShoppingBag, Utensils, History } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  onOpenHistory: () => void;
  activeOrderId: string | null;
  onOpenActiveOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  activeOrderId,
  onOpenActiveOrder,
}) => {
  const { totalItems, totalAmount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-gray-900">
                  Raft<span className="text-orange-500">Bites</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  Fast Delivery
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Order Management & Live Tracker
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Active Order Button */}
            {activeOrderId && (
              <button
                onClick={onOpenActiveOrder}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors animate-pulse"
                title="Track Active Order"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline">Track Active Order</span>
                <span className="sm:hidden">Tracking</span>
              </button>
            )}

            {/* Order History */}
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
              title="View Past Orders"
            >
              <History className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Orders</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
              {totalAmount > 0 && (
                <span className="hidden md:inline font-bold border-l border-white/30 pl-2">
                  ₹{totalAmount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
