'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Order, OrderStatus } from '@/types';

export function useOrderTracking(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch single order snapshot
  const fetchOrder = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch order');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Network error while fetching order.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchOrder(orderId);

    // Establish Server-Sent Events stream
    const eventSource = new EventSource(`/api/orders/${orderId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.order) {
          setOrder(payload.order);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // Close on error and attempt fallback polling
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [orderId, fetchOrder]);

  // Manual status advancement (for instant recruiter testing / controls)
  const advanceStatus = async (targetStatus: OrderStatus) => {
    if (!orderId) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
      } else {
        alert(json.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to manually update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return {
    order,
    isLoading,
    error,
    isConnected,
    isUpdatingStatus,
    advanceStatus,
    refreshOrder: () => orderId && fetchOrder(orderId),
  };
}
