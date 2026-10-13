'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { X, RefreshCw, ArrowRight, Package } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOrders(json.data);
        }
      })
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Order History</h2>
              <p className="text-xs text-gray-500">
                View all previous orders and track active deliveries
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-xs flex flex-col items-center">
                <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mb-2" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">No orders placed yet</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Your placed orders will show up here.
                </p>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all bg-white flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">#{ord.id}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700 animate-pulse'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'} • $
                      {ord.totalAmount.toFixed(2)} • To: {ord.deliveryDetails.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Placed: {new Date(ord.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectOrder(ord.id);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
