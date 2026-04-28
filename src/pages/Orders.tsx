// Orders.tsx — Customer order tracking with per-order Supabase realtime subscription
//
// Supabase Setup Checklist:
// 1. Enable Realtime on orders table:
//    Supabase Dashboard → Table Editor → orders → Enable Realtime toggle ON
// 2. RLS policy must allow SELECT for authenticated users on orders:
//    CREATE POLICY "Users can view own orders" ON orders
//    FOR SELECT USING (auth.uid() = customer_id);
// 3. Filter realtime by row (filter: id=eq.X) to avoid leaking other orders to customers

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OrderStatusStepper } from '../components/OrderStatusStepper';

// ── Per-Order Realtime Hook ──────────────────────────────────────────────────
function useOrderRealtime(orderId: string | undefined, onUpdate: (updated: Order) => void) {
  useEffect(() => {
    if (!orderId) return;

    // Subscribe only to updates for this specific order (row-level filter)
    // This prevents customer A seeing customer B's order updates
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          onUpdate(payload.new as Order);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, onUpdate]);
}

// ── Single Order Card ─────────────────────────────────────────────────────────
function OrderCard({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [justUpdated, setJustUpdated] = useState(false);

  // Keep local order in sync with parent prop (initial load updates)
  useEffect(() => { setOrder(initialOrder); }, [initialOrder]);

  // Per-order realtime subscription
  useOrderRealtime(order.id, (updated) => {
    // Guard: only apply if status actually changed
    if (updated.status !== order.status) {
      setOrder(updated);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 3000);
    }
  });

  const shortId = order.id?.slice(0, 8).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl shadow-lg border overflow-hidden transition-all duration-500 ${
        justUpdated ? 'border-amber-400 shadow-amber-100 shadow-xl' : 'border-slate-100'
      }`}
    >
      {/* Live updated badge */}
      {justUpdated && (
        <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          Status just updated!
        </div>
      )}

      {/* Order Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-50 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Order</p>
          <p className="font-black text-slate-800 text-lg">#{shortId}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {new Date(order.created_at!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total</p>
            <p className="text-xl font-black text-slate-800">₹{order.total.toLocaleString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            order.payment_type === 'upi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {order.payment_type}
          </span>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Live Tracking
        </p>
        <OrderStatusStepper status={order.status || 'pending'} />
      </div>

      {/* Items */}
      <div className="px-6 pb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">🥭</div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                <p className="text-xs text-slate-400 font-medium">
                  {item.selectedWeight != null
                    ? `${Math.abs(item.selectedWeight)}${item.selectedWeight < 0 ? ' dozen' : 'kg'}`
                    : ''
                  } × {item.quantity}
                </p>
              </div>
              <span className="ml-auto font-black text-slate-700 text-sm flex-shrink-0">
                ₹{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Orders Page ──────────────────────────────────────────────────────────
export function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch of all orders for this customer
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const fetchOrders = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) setOrders(data);
        setLoading(false);
      };
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  // List-level realtime: catch any new orders placed by this customer
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`customer-orders-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          if (newOrder.customer_id === user.id) {
            setOrders((prev) => [newOrder, ...prev]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading || authLoading) {
    return (
      <div className="pt-32 flex flex-col items-center gap-4">
        <span className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading your orders…</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-28 pb-20 min-h-screen bg-slate-50"
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">My Orders</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              Live updates enabled
            </p>
          </div>
          {orders.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-full text-amber-700 font-bold text-sm">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </div>
          )}
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 text-amber-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No orders yet</h2>
            <p className="text-slate-400 mb-8 font-medium">You haven't ordered any delicious mangoes yet.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-200 transition-all hover:scale-105"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} initialOrder={order} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
