'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Star, Clock } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartEntry = cart.find((ci) => ci.item.id === item.id);
  const quantity = cartEntry ? cartEntry.quantity : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-black/60 text-white backdrop-blur-md">
            {item.category}
          </span>
          {item.isVegetarian !== undefined && (
            <span
              className={`px-2 py-1 text-[11px] font-bold rounded-full backdrop-blur-md flex items-center gap-1 ${
                item.isVegetarian
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              {item.isVegetarian ? 'Veg' : 'Non-Veg'}
            </span>
          )}
        </div>

        {/* Prep Time & Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {item.rating && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/90 text-amber-600 text-xs font-bold shadow-sm backdrop-blur-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {item.rating}
            </span>
          )}
          {item.prepTimeMinutes && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {item.prepTimeMinutes}m
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Price</span>
            <span className="text-xl font-extrabold text-gray-900">
              ₹{item.price}
            </span>
          </div>

          <div>
            {quantity === 0 ? (
              <button
                onClick={() => addToCart(item)}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-500 text-xs sm:text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-orange-100 text-orange-600 font-bold transition-colors shadow-xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs sm:text-sm font-bold text-orange-700 min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors shadow-xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
