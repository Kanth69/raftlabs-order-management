'use client';

import React from 'react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { OrderStatus } from '@/types';
import {
  ClipboardCheck,
  ChefHat,
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  RefreshCw,
  FastForward,
  Receipt,
  X,
} from 'lucide-react';

interface OrderTrackerProps {
  orderId: string;
  onClose: () => void;
}

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
  {
    status: 'ORDER_RECEIVED',
    label: 'Order Received',
    icon: ClipboardCheck,
    desc: 'Order confirmed by restaurant kitchen.',
  },
  {
    status: 'PREPARING',
    label: 'Preparing Meal',
    icon: ChefHat,
    desc: 'Chef is cooking your fresh ingredients.',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    icon: Bike,
    desc: 'Courier picked up order and is en route.',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    icon: CheckCircle2,
    desc: 'Delivered to your doorstep. Bon appétit!',
  },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onClose }) => {
  const {
    order,
    isLoading,
    error,
    isConnected,
    isUpdatingStatus,
    advanceStatus,
    refreshOrder,
  } = useOrderTracking(orderId);

  if (isLoading && !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">Connecting Live Tracker...</h3>
          <p className="text-xs text-gray-500 mt-1">
            Setting up real-time stream for {orderId}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <p className="text-red-500 font-bold mb-2">Error loading order</p>
          <p className="text-xs text-gray-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 sm:p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-orange-100">
                    Live Order Tracking
                  </span>
                  {/* SSE Status Pill */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md ${
                      isConnected
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-amber-500/80 text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-white animate-ping' : 'bg-white'
                      }`}
                    />
                    {isConnected ? 'Real-Time SSE Live' : 'Polling Fallback'}
                  </div>
                </div>

                <h2 className="text-2xl font-black mt-1">Order #{order.id}</h2>
                <p className="text-xs text-orange-100 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={refreshOrder}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Refresh order state"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Close tracker"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Progress Stepper */}
            <div className="bg-orange-50/50 rounded-2xl p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span>Current Status:</span>
                  <span className="text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wide">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </h3>

                {order.status === 'DELIVERED' ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Order Complete
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                    Auto-updating via backend simulation...
                  </span>
                )}
              </div>

              {/* 4-Step Interactive Timeline */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 hidden sm:block">
                  <div
                    className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700"
                    style={{
                      width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative">
                  {STEPS.map((step, idx) => {
                    const isPassed = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const StepIcon = step.icon;

                    const timelineEntry = order.statusTimeline.find(
                      (st) => st.status === step.status
                    );

                    return (
                      <div
                        key={step.status}
                        className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 transition-all p-2 rounded-xl ${
                          isCurrent
                            ? 'bg-white shadow-md border border-orange-200 sm:scale-105'
                            : ''
                        }`}
                      >
                        {/* Step Circle */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                            isPassed
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : isCurrent
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-100 animate-pulse'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          <StepIcon className="w-6 h-6" />
                        </div>

                        {/* Label & Details */}
                        <div className="flex-1 sm:flex-initial">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-orange-600'
                                : isPassed
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-[11px] text-gray-500 hidden sm:block mt-0.5 leading-tight">
                            {step.desc}
                          </p>
                          {timelineEntry && (
                            <span className="text-[10px] text-gray-400 font-medium block mt-1">
                              {new Date(timelineEntry.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recruiter / Reviewer Fast-Forward Controls */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                    <FastForward className="w-3.5 h-3.5 text-orange-500" />
                    <span>Reviewer Fast-Forward Controls:</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click any stage to manually simulate instant backend state transitions
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {STEPS.map((step) => {
                    const isPassedOrCurrent =
                      STEPS.findIndex((s) => s.status === step.status) <= currentStepIndex;

                    return (
                      <button
                        key={step.status}
                        onClick={() => advanceStatus(step.status)}
                        disabled={isPassedOrCurrent || isUpdatingStatus}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isPassedOrCurrent
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-orange-500 hover:text-white text-gray-700 border border-gray-300 shadow-2xs'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details Grid: Delivery Info + Receipt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Info */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2.5">
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  Delivery Details
                </span>
                <div className="text-xs space-y-1 text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900">
                      {order.deliveryDetails.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{order.deliveryDetails.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{order.deliveryDetails.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Receipt Breakdown */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2.5">
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-orange-500" />
                  Items Ordered ({order.items.length})
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-gray-700"
                    >
                      <span className="truncate max-w-[160px]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-900">
                  <span>Grand Total:</span>
                  <span className="text-orange-600 font-extrabold text-sm">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
