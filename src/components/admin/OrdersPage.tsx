import React, { useState, useEffect, useRef } from 'react';
import { supabase, getAllOrders, updateOrderStatus, createNotification, addCreditCustomer } from '../../lib/supabase';
import type { Order } from '../../lib/supabase';
import {
  Search, Clock, Package, Truck, CheckCircle, RefreshCw,
  X, MapPin, Phone, ShoppingCart, User, CreditCard, Calendar,
  ChevronRight, ArrowRight, BookOpen
} from 'lucide-react';
import { send } from '@emailjs/browser';
import { animate } from 'framer-motion';

// ── Config ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-400', icon: Clock,        dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-400',  icon: Package,      dot: 'bg-blue-400' },
  shipped:   { label: 'Shipped',   bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-400',icon: Truck,        dot: 'bg-violet-400' },
  delivered: { label: 'Delivered', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-400', icon: CheckCircle,  dot: 'bg-green-400' },
} as const;

const NEXT_STATUS: Record<string, Order['status']> = {
  pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered',
};
const ACTION_LABELS: Record<string, string> = {
  pending: 'Confirm', confirmed: 'Ship', shipped: 'Deliver',
};
const ACTION_COLORS: Record<string, string> = {
  pending:   'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
  confirmed: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200',
  shipped:   'bg-violet-500 hover:bg-violet-600 shadow-violet-200',
};

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'];

// ── Helpers ──────────────────────────────────────────────────────────────────
const sendStatusEmail = async (order: Order, newStatus: NonNullable<Order['status']>) => {
  const isConfirmed = newStatus === 'confirmed';
  const isDelivered = newStatus === 'delivered';

  if (!isConfirmed && !isDelivered) return;
  if (!order.email) {
    console.warn(`Skipping email notification: No email address found for order ${order.id}`);
    return;
  }

  const templateParams = {
    email: order.email,
    customer_name: order.customer_name,
    order_id: order.id,
    total: order.total,
    address: order.address,
    status_title: isConfirmed 
      ? 'Confirmed! 🎉' 
      : 'Out for Delivery! 🛵',
    status_message: isConfirmed
      ? 'Great news! Your Red Rose Mango order has been confirmed and is being prepared.'
      : 'Your mangoes are on the way! Our delivery partner will reach you soon.',
    status_footer: isConfirmed
      ? 'We will notify you again when your order is out for delivery.'
      : 'Thank you for choosing Red Rose Mango! Enjoy your mangoes. 🥭',
  };

  try {
    await send('service_odgq3zg', 'template_31khk8w', templateParams, 'B2JhHhac53YyZ7QXt');
    console.log('Email sent to', order.email);
  } catch (err) {
    console.error('EmailJS error:', err);
  }
};

const notifyTelegram = async (message: string) => {
  try {
    await fetch(`https://api.telegram.org/bot8742663223:AAGc92QDnHgzAiO6G-fUlJ8-T6WQyZqGLQs/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: '5898695862', text: message, parse_mode: 'HTML' }),
    });
  } catch (err) { console.error('Telegram failed:', err); }
};

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ value, prefix = '' }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  useEffect(() => {
    const node = ref.current; if (!node) return;
    const ctrl = animate(prev.current, value, {
      duration: 0.6,
      onUpdate: (v) => { node.textContent = prefix + Math.round(v).toLocaleString(); },
    });
    prev.current = value;
    return () => ctrl.stop();
  }, [value, prefix]);
  return <span ref={ref}>{prefix}0</span>;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, prefix = '' }: {
  label: string; value: number; icon: React.ElementType; accent: string; prefix?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 border-l-4 ${accent} shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent.replace('border-', 'bg-').replace('-500', '-50')}`}>
        <Icon className={`w-6 h-6 ${accent.replace('border-', 'text-')}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-0.5"><Counter value={value} prefix={prefix} /></p>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

// ── Slide-Over Panel ──────────────────────────────────────────────────────────
function OrderSlideOver({ order, onClose, onStatusUpdate, onMoveToCredit, updatingId }: {
  order: Order; onClose: () => void;
  onStatusUpdate: (order: Order, status: NonNullable<Order['status']>) => void;
  onMoveToCredit: (order: Order) => void;
  updatingId: string | null;
}) {
  const status = order.status || 'pending';
  const next = NEXT_STATUS[status];
  const actionLabel = ACTION_LABELS[status];
  const actionColor = ACTION_COLORS[status] || '';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Order Detail</p>
            <h2 className="text-lg font-black text-slate-800">#{order.id?.slice(0, 8).toUpperCase()}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Customer */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />Customer Info
            </h3>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <p className="font-bold text-slate-800 text-base">{order.customer_name}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${order.phone}`} className="hover:text-amber-600 font-medium">{order.phone}</a>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="whitespace-normal leading-relaxed">{order.address}</span>
              </div>
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5" />Order Items
            </h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-base">🥭</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.selectedWeight != null ? `${Math.abs(item.selectedWeight)}${item.selectedWeight < 0 ? ' dozen' : 'kg'}` : ''} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Payment & Total */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span className="font-semibold capitalize">{order.payment_type?.toUpperCase()} Payment</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${order.payment_type === 'upi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {order.payment_type === 'upi' ? (order.upi_reference_id || 'UPI') : order.payment_type?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-amber-100">
              <span className="font-bold text-slate-700">Order Total</span>
              <span className="text-2xl font-black text-amber-600">₹{order.total.toLocaleString()}</span>
            </div>
          </section>

          {/* Time */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{order.created_at ? new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 flex flex-col gap-3">
          {next && (
            <button
              onClick={() => onStatusUpdate(order, next)}
              disabled={updatingId === order.id}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white font-bold text-sm transition-all duration-200 shadow-lg cursor-pointer ${actionColor} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {updatingId === order.id
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <><ArrowRight className="w-4 h-4" />Mark as {actionLabel}</>
              }
            </button>
          )}
          <button
            onClick={() => { onMoveToCredit(order); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-sm transition-all duration-200 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" /> Add to Credit
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main OrdersPage ───────────────────────────────────────────────────────────
export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMoveToCredit = async (order: Order) => {
    if (!window.confirm(`Add order #${order.id?.slice(0,8).toUpperCase()} to Credit?`)) return;
    
    const success = await addCreditCustomer({
      customer_name: order.customer_name,
      phone: order.phone,
      order_id: order.id,
      amount: order.total,
      note: 'Auto-added from orders list',
      status: 'pending'
    });
    
    if (success) {
      showToast('Order added to Credit Tab', 'success');
    } else {
      showToast('Failed to add to Credit Tab', 'error');
    }
  };

  // Load + realtime
  useEffect(() => {
    getAllOrders().then((data) => { setOrders(data); setLoading(false); });
  }, []);

  useEffect(() => {
    const ch = supabase.channel('admin-orders-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (p) =>
        setOrders((prev) => [p.new as Order, ...prev]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (p) => {
        const updated = p.new as Order;
        setOrders((prev) => prev.map((o) => {
          if (o.id === updated.id) {
            if (o.status === updated.status) return o; // Guard against double state update
            return updated;
          }
          return o;
        }));
        setSelectedOrder((prev) => {
          if (prev && prev.id === updated.id) {
            if (prev.status === updated.status) return prev;
            return updated;
          }
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const handleStatusUpdate = async (order: Order, newStatus: NonNullable<Order['status']>) => {
    if (!newStatus || !order.id || updatingId === order.id) return;
    
    setUpdatingId(order.id);
    const originalOrder = { ...order };
    
    // Optimistic UI Update
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    if (selectedOrder?.id === order.id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    const success = await updateOrderStatus(order.id, newStatus);
    
    if (success) {
      showToast(`Order marked as ${newStatus}`, 'success');
      const shortId = order.id.slice(0, 8).toUpperCase();
      notifyTelegram(`🥭 <b>Order Updated</b>\n#${shortId} → <b>${newStatus.toUpperCase()}</b>\nCustomer: ${order.customer_name}\nPhone: ${order.phone}`);
      await sendStatusEmail(order, newStatus);

      // Create in-app notification for logged-in users
      if (order.customer_id && order.customer_id !== 'guest') {
        const firstName = order.customer_name ? order.customer_name.split(' ')[0] : 'Customer';
        let msg = `Hi ${firstName}, your order has been confirmed! 🥭`;
        if (newStatus === 'shipped') msg = `Hi ${firstName}, your order is on the way! 🚚`;
        if (newStatus === 'delivered') msg = `Hi ${firstName}, your mangoes have arrived! 🎉`;
        
        await createNotification({
          user_id: order.customer_id,
          order_id: order.id,
          message: msg,
          type: 'order'
        });
      }

      // Send push notification to all subscribed customers via server API
      try {
        const pushRes = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            customer_name: order.customer_name,
            newStatus,
          }),
        });
        if (pushRes.ok) {
          const pushData = await pushRes.json();
          console.log(`Push notifications sent: ${pushData.sent}, failed: ${pushData.failed}`);
        } else {
          console.error('Push notification API error:', pushRes.status, await pushRes.text());
        }
      } catch (err) {
        console.error('Push notification failed:', err);
      }
    } else {
      // Revert optimistic state on error
      setOrders((prev) => prev.map((o) => (o.id === order.id ? originalOrder : o)));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(originalOrder);
      }
      showToast('Update failed, try again', 'error');
    }
    
    setUpdatingId(null);
  };

  // Filtered orders
  const filtered = orders.filter((o) => {
    const status = o.status || 'pending';
    const tabMatch = activeTab === 'All' || status === activeTab.toLowerCase();
    const q = searchQuery.toLowerCase();
    const searchMatch = !q || o.customer_name?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
    let dateMatch = true;
    if (dateFilter && o.created_at) {
      dateMatch = o.created_at.startsWith(dateFilter);
    }
    return tabMatch && searchMatch && dateMatch;
  });

  // Stats
  const total = orders.length;
  const pending = orders.filter((o) => (o.status || 'pending') === 'pending').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const today = new Date().toDateString();
  const revenue = orders.filter((o) => o.created_at && new Date(o.created_at).toDateString() === today).reduce((s, o) => s + o.total, 0);

  // Tab counts
  const tabCount = (tab: string) => tab === 'All' ? orders.length : orders.filter((o) => (o.status || 'pending') === tab.toLowerCase()).length;

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="h-12 bg-slate-200 rounded-xl" />
        {[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-slate-200 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Orders</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage and track all customer orders in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Orders"    value={total}     icon={ShoppingCart}  accent="border-slate-400" />
        <StatCard label="Pending"         value={pending}   icon={Clock}         accent="border-amber-500" />
        <StatCard label="Revenue Today"   value={revenue}   icon={CreditCard}    accent="border-orange-500" prefix="₹" />
        <StatCard label="Delivered"       value={delivered} icon={CheckCircle}   accent="border-green-500" />
      </div>

      {/* Search + Date */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or order ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all cursor-pointer"
          />
        </div>
        {dateFilter && (
          <button onClick={() => setDateFilter('')} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count = tabCount(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-amber-300" />
          </div>
          <p className="font-bold text-slate-600 text-lg">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Time', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((order) => {
                  const status = order.status || 'pending';
                  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const next = NEXT_STATUS[status];
                  const actionLabel = ACTION_LABELS[status];
                  const actionColor = ACTION_COLORS[status];
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-amber-50/40 transition-colors duration-150 cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="font-mono text-sm font-bold text-slate-700">#{order.id?.slice(0, 8).toUpperCase()}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800 text-sm">{order.customer_name}</p>
                        <p className="text-xs text-slate-400 font-medium">{order.phone}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {order.items.reduce((a, i) => a + i.quantity, 0)} items
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-black text-slate-800">₹{order.total.toLocaleString()}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${order.payment_type === 'upi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.payment_type === 'upi' ? (order.upi_reference_id || 'UPI') : order.payment_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={status} /></td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">
                        {order.created_at ? new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {next ? (
                            <button
                              onClick={() => handleStatusUpdate(order, next)}
                              disabled={isUpdating}
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${actionColor}`}
                            >
                              {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><ArrowRight className="w-3.5 h-3.5" />{actionLabel}</>}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3.5 py-1.5 text-green-600 text-xs font-bold bg-green-50 rounded-lg border border-green-100">
                              <CheckCircle className="w-3.5 h-3.5" />Done
                            </span>
                          )}
                          <button
                            onClick={() => handleMoveToCredit(order)}
                            className="flex items-center justify-center p-1.5 text-slate-400 bg-slate-100 hover:bg-amber-100 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                            title="Add to Credit"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-Over */}
      {selectedOrder && (
        <OrderSlideOver
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          onMoveToCredit={handleMoveToCredit}
          updatingId={updatingId}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 animate-bounce ${
          toast.type === 'success' ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-red-500 text-white shadow-red-500/30'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
