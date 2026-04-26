import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, getAllOrders, updateOrderStatus } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, CreditCard, Truck, CheckCircle,
  Clock, Package, RefreshCw, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@mangowala.com';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800',  icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800',      icon: Package },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800',  icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800',    icon: CheckCircle },
} as const;

const NEXT_STATUS: Record<string, Order['status']> = {
  pending:   'confirmed',
  confirmed: 'shipped',
  shipped:   'delivered',
};

export function AdminDashboard() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    getAllOrders().then((data) => { setOrders(data); setLoading(false); });
  }, [user]);

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new as Order, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => prev.map((o) => o.id === (payload.new as Order).id ? payload.new as Order : o));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next || !id) return;
    setUpdatingId(id);
    await updateOrderStatus(id, next);
    setUpdatingId(null);
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalOrders = orders.length;
  const upiCount = orders.filter((o) => o.payment_type === 'upi').length;
  const codCount = orders.filter((o) => o.payment_type === 'cod').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#FFF8F0]"
    >
      {/* Header */}
      <div className="bg-white border-b border-[#FF6B00]/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1a1a1a]">🥭 MangoWala Admin</h1>
            <p className="text-xs text-[#1a1a1a]/40 font-bold">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: ShoppingBag, label: 'Total Orders', value: totalOrders, color: 'bg-[#FF6B00]' },
            { icon: CreditCard,  label: 'UPI Paid',     value: upiCount,    color: 'bg-green-500' },
            { icon: Truck,       label: 'COD',           value: codCount,    color: 'bg-blue-500' },
            { icon: CheckCircle, label: 'Revenue',       value: `₹${totalRevenue.toLocaleString()}`, color: 'bg-[#FFD700]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-3xl p-5 shadow-lg border border-black/5">
              <div className={`w-11 h-11 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-black text-[#1a1a1a]">{stat.value}</p>
              <p className="text-xs font-bold text-[#1a1a1a]/40 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-[#FF6B00]/10 flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1a1a1a]">Live Orders</h2>
            <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Realtime
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20 text-[#1a1a1a]/30">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No orders yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FFF8F0]">
                    <tr>
                      {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-black text-[#1a1a1a]/50 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FF6B00]/5">
                    {orders.map((order) => {
                      const status = order.status || 'pending';
                      const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                      const nextStatus = NEXT_STATUS[status];
                      return (
                        <tr key={order.id} className="hover:bg-[#FFF8F0]/50 transition-colors">
                          <td className="px-5 py-4 font-black text-[#FF6B00] text-sm">
                            #{order.id?.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-[#1a1a1a]">{order.customer_name}</p>
                            <p className="text-xs text-[#1a1a1a]/40 font-bold">{order.phone}</p>
                          </td>
                          <td className="px-5 py-4 max-w-[200px]">
                            <p className="text-sm text-[#1a1a1a]/70 line-clamp-2">
                              {order.items.map(i => `${i.name} (${i.selectedWeight}kg×${i.quantity})`).join(', ')}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-black text-[#1a1a1a]">₹{order.total.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${order.payment_type === 'upi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {order.payment_type}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-[#1a1a1a]/40 font-bold">
                            {new Date(order.created_at!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-5 py-4">
                            {nextStatus && (
                              <button
                                onClick={() => handleStatusUpdate(order.id!, status)}
                                disabled={updatingId === order.id}
                                className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-black hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap"
                              >
                                {updatingId === order.id ? '...' : `Mark ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                              </button>
                            )}
                            {!nextStatus && <span className="text-xs text-green-600 font-black">✓ Complete</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[#FF6B00]/5">
                {orders.map((order) => {
                  const status = order.status || 'pending';
                  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const nextStatus = NEXT_STATUS[status];
                  return (
                    <div key={order.id} className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#FF6B00]">#{order.id?.slice(0, 8).toUpperCase()}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <div>
                        <p className="font-black text-[#1a1a1a]">{order.customer_name}</p>
                        <p className="text-sm text-[#1a1a1a]/50">{order.phone}</p>
                      </div>
                      <p className="text-sm text-[#1a1a1a]/60">
                        {order.items.map(i => `${i.name} (${i.selectedWeight}kg×${i.quantity})`).join(', ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                           <span className="text-xl font-black text-[#1a1a1a]">₹{order.total.toLocaleString()}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${order.payment_type === 'upi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.payment_type.toUpperCase()}
                          </span>
                        </div>
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusUpdate(order.id!, status)}
                            disabled={updatingId === order.id}
                            className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-black hover:opacity-90 disabled:opacity-50"
                          >
                            {updatingId === order.id ? '...' : `→ ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
