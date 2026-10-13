'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { deliveryDetailsSchema } from '@/lib/validation';
import { X, AlertCircle, Loader2, MapPin, User, Phone, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, totalAmount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = () => {
    const result = deliveryDetailsSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      setApiError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: cart.map((ci) => ({
          menuItemId: ci.item.id,
          quantity: ci.quantity,
        })),
        deliveryDetails: {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
        },
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.error || 'Failed to place order. Please try again.');
        return;
      }

      // Order created successfully!
      const newOrderId = json.data.id;
      clearCart();
      onClose();
      onOrderSuccess(newOrderId);
    } catch (err) {
      console.error('Order creation error:', err);
      setApiError('Network connection issue. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tax = Math.round(totalAmount * 0.05 * 100) / 100;
  const grandTotal = Math.round((totalAmount + tax) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-orange-100">
                  Step 2 of 2
                </span>
                <h3 className="text-xl font-extrabold mt-0.5">Delivery Details</h3>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-orange-100 mt-1">
              Enter your address & contact info to confirm delivery
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {apiError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Name Input */}
            <div>
              <label
                htmlFor="checkout-name"
                className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  id="checkout-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-200 text-red-900'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100 text-gray-900'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  id="checkout-phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210 or 9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-red-300 focus:ring-red-200 text-red-900'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100 text-gray-900'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Address Input */}
            <div>
              <label
                htmlFor="checkout-address"
                className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider"
              >
                Delivery Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <textarea
                  id="checkout-address"
                  rows={2}
                  placeholder="e.g. Flat 402, Green Glen Layout, Bellandur, Bengaluru"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.address
                      ? 'border-red-300 focus:ring-red-200 text-red-900'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100 text-gray-900'
                  }`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.address}</p>
              )}
            </div>

            {/* Order Summary Snapshot */}
            <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                <span>Items in Order:</span>
                <span>{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                <span>Free Delivery:</span>
                <span className="text-emerald-600 font-bold">₹0</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2 border-t border-orange-200/60">
                <span>Total Due:</span>
                <span className="text-base text-orange-600 font-extrabold">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Place Order (₹{grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
