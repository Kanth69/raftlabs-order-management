'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem } from '@/types';
import { Navbar } from '@/components/Navbar';
import { MenuCard } from '@/components/MenuCard';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTracker } from '@/components/OrderTracker';
import { OrderHistoryModal } from '@/components/OrderHistoryModal';
import {
  Search,
  Sparkles,
  Truck,
  ShieldCheck,
  Radio,
  ArrowRight,
  Pizza,
} from 'lucide-react';

const CATEGORIES = ['All', 'Pizzas', 'Burgers', 'Sides & Drinks', 'Desserts'] as const;

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(true);

  // Modals & Tracking state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Restore latest active order id from localStorage if present
  useEffect(() => {
    try {
      const savedActiveOrder = localStorage.getItem('raftbites_active_order');
      if (savedActiveOrder) {
        setActiveTrackingOrderId(savedActiveOrder);
      }
    } catch {}
  }, []);

  // Fetch menu from backend API
  useEffect(() => {
    async function loadMenu() {
      setIsLoadingMenu(true);
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMenuItems(json.data);
        }
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setIsLoadingMenu(false);
      }
    }
    loadMenu();
  }, []);

  // Handle successful order creation
  const handleOrderSuccess = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    try {
      localStorage.setItem('raftbites_active_order', orderId);
    } catch {}
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Top Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        activeOrderId={activeTrackingOrderId}
        onOpenActiveOrder={() => {
          if (activeTrackingOrderId) {
            // Trigger tracking modal
            setActiveTrackingOrderId(activeTrackingOrderId);
          }
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-transparent pt-8 pb-10 sm:py-14 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/90 text-orange-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>RaftLabs Sr Full Stack Assessment</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Order Fresh Eats with{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Live Status Tracking
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Explore artisanal pizzas, smash burgers & treats. Place your order and
              watch real-time status transitions powered by Server-Sent Events.
            </p>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs">
                <Truck className="w-4 h-4 text-orange-500" /> Free Delivery
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Live SSE Stream
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-blue-500" /> TDD Verified API
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="pt-4 max-w-md mx-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search pizzas, smash burgers, desserts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white text-sm rounded-2xl border border-gray-200 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Browsing Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-6">
        {/* Category Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              const count =
                category === 'All'
                  ? menuItems.length
                  : menuItems.filter((i) => i.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{filteredItems.length}</strong> delicious items
          </span>
        </div>

        {/* Menu Grid */}
        {isLoadingMenu ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
            <Pizza className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 text-base">No food items found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search query or switching categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Active Order Tracker Pill (sticky bottom-right) */}
      {activeTrackingOrderId && (
        <aside
          aria-label="Active order tracking bar"
          className="fixed bottom-5 right-5 z-40 bg-gray-900 text-white rounded-2xl p-3.5 shadow-2xl border border-gray-800 flex items-center gap-3.5 animate-in slide-in-from-bottom-5"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Active Order #{activeTrackingOrderId}</p>
            <p className="text-[11px] text-gray-400">Live SSE Tracking Available</p>
          </div>
          <button
            onClick={() => setActiveTrackingOrderId(activeTrackingOrderId)}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>Track</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Tracker Modal */}
      {activeTrackingOrderId && (
        <OrderTracker
          orderId={activeTrackingOrderId}
          onClose={() => setActiveTrackingOrderId(null)}
        />
      )}

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectOrder={(orderId) => setActiveTrackingOrderId(orderId)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <p>
          RaftBites • Built for <strong>RaftLabs Sr Full Stack Developer Assessment</strong>
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          Stack: Next.js 14 • React • TypeScript • Tailwind CSS • Vitest TDD • Server-Sent Events (SSE)
        </p>
      </footer>
    </div>
  );
}
