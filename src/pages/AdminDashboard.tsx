import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, getAllOrders, updateOrderStatus } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Truck, CheckCircle,
  Clock, Package, RefreshCw, LogOut, Search, ChevronDown, ChevronUp,
  MapPin, Phone, Mail, ShoppingCart, User, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import emailjs from '@emailjs/browser';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@mangowala.com';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 border-yellow-500',  icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-500',      icon: Package },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-800 border-purple-500',  icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-500',    icon: CheckCircle },
} as const;

const NEXT_STATUS: Record<string, Order['status']> = {
  pending:   'confirmed',
  confirmed: 'shipped',
  shipped:   'delivered',
};

const ACTION_LABELS: Record<string, string> = {
  pending: 'Confirm',
  confirmed: 'Pack',
  shipped: 'Dispatch',
};

const sendCustomerConfirmationEmail = async (order: Order) => {
  try {
    const shortId = order.id?.slice(0, 8).toUpperCase();
    const itemsSummary = Array.isArray(order.items)
      ? order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')
      : String(order.items);
    await emailjs.send(
      'service_odgq3zg',
      'template_ub1s3lc',
      {
        customer_name: order.customer_name,
        customer_email: order.email,
        order_id: shortId,
        items: itemsSummary,
        total: order.total,
        address: order.address,
      },
      'B2JhHhac53YyZ7QXt'
    );
  } catch (err) {
    console.error('Customer email failed:', err);
  }
};

const notifyTelegram = async (message: string) => {
  const botToken = "8742663223:AAGc92QDnHgzAiO6G-fUlJ8-T6WQyZqGLQs";
  const chatId = "5898695862";
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
  } catch (err) {
    console.error('Telegram failed:', err);
  }
};

function AnimatedCounter({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(prevValue.current, value, {
        duration: 0.8,
        onUpdate(v) {
          node.textContent = isCurrency ? `₹${Math.round(v).toLocaleString()}` : Math.round(v).toString();
        }
      });
      prevValue.current = value;
      return () => controls.stop();
    }
  }, [value, isCurrency]);

  return <span ref={nodeRef}>{isCurrency ? `₹0` : `0`}</span>;
}

export function AdminDashboard() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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

  const handleStatusUpdate = async (order: Order, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next || !order.id) return;
    
    setUpdatingId(order.id);
    await updateOrderStatus(order.id, next);
    setUpdatingId(null);

    const shortId = order.id.slice(0, 8).toUpperCase();
    
    // Telegram Notification
    notifyTelegram(`🥭 <b>Order Updated</b>\nOrder #${shortId} → <b>${next.toUpperCase()}</b>\nCustomer: ${order.customer_name}\nPhone: ${order.phone}`);

    // Email Notification
    if (currentStatus === 'pending' || !currentStatus) {
      await sendCustomerConfirmationEmail(order);
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || !o.status).length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  
  const today = new Date().setHours(0,0,0,0);
  const revenueToday = orders
    .filter((o) => new Date(o.created_at || 0).setHours(0,0,0,0) === today)
    .reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter(order => {
    const status = order.status || 'pending';
    const matchesFilter = filter === 'All' || status === filter.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      order.customer_name?.toLowerCase().includes(searchLower) || 
      order.id?.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF5FF] font-['Fira_Sans',_sans-serif]">
        <div className="bg-white shadow-sm sticky top-0 z-50 h-[73px] border-b border-[#A78BFA]/20" />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 h-[116px] animate-pulse">
                <div className="h-4 bg-[#FAF5FF] rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-[#FAF5FF] rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 h-[400px] animate-pulse">
            <div className="h-8 bg-[#FAF5FF] rounded mb-6"></div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-[#FAF5FF] rounded mb-3"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5FF] font-['Fira_Sans',_sans-serif] text-[#4C1D95]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-[#A78BFA]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥭</span>
            <h1 className="text-2xl font-black bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">
              MangoWala Admin
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-[#4C1D95]/60 hidden md:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500 relative overflow-hidden group">
            <ShoppingBag className="absolute top-6 right-6 text-purple-100 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-sm font-semibold text-[#4C1D95]/60 uppercase tracking-wider mb-2">Total Orders</h3>
            <div className="text-3xl font-black text-[#4C1D95]">
              <AnimatedCounter value={totalOrders} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-500 relative overflow-hidden group">
            <Clock className="absolute top-6 right-6 text-yellow-100 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-sm font-semibold text-[#4C1D95]/60 uppercase tracking-wider mb-2">Pending Orders</h3>
            <div className="text-3xl font-black text-[#4C1D95]">
              <AnimatedCounter value={pendingOrders} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-[#F97316] relative overflow-hidden group">
            <CreditCard className="absolute top-6 right-6 text-orange-100 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-sm font-semibold text-[#4C1D95]/60 uppercase tracking-wider mb-2">Revenue Today</h3>
            <div className="text-3xl font-black text-[#4C1D95]">
              <AnimatedCounter value={revenueToday} isCurrency />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500 relative overflow-hidden group">
            <CheckCircle className="absolute top-6 right-6 text-green-100 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-sm font-semibold text-[#4C1D95]/60 uppercase tracking-wider mb-2">Delivered Orders</h3>
            <div className="text-3xl font-black text-[#4C1D95]">
              <AnimatedCounter value={deliveredOrders} />
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-16 text-center border border-[#A78BFA]/20"
          >
            <div className="w-24 h-24 bg-[#FAF5FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-[#A78BFA]" />
            </div>
            <h2 className="text-2xl font-bold text-[#4C1D95] mb-2">No orders yet</h2>
            <p className="text-[#4C1D95]/60 max-w-md mx-auto">When customers place orders, they will appear here in real-time.</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-start lg:items-center">
              <div className="flex flex-wrap gap-2">
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 cursor-pointer ${
                      filter === f 
                        ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20' 
                        : 'bg-white text-[#4C1D95] border border-[#A78BFA]/30 hover:bg-[#FAF5FF]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A78BFA] w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#A78BFA]/30 bg-white text-[#4C1D95] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] transition-all duration-300 placeholder:text-[#A78BFA]/70 shadow-sm"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#A78BFA]/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[#FAF5FF] border-b border-[#A78BFA]/20">
                    <tr>
                      {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Time', 'Action'].map((h) => (
                        <th key={h} className="px-6 py-4 text-xs font-bold text-[#4C1D95]/70 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#A78BFA]/10">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-[#4C1D95]/60 font-medium">
                          No orders match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order, index) => {
                        const status = order.status || 'pending';
                        const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                        const nextStatus = NEXT_STATUS[status];
                        const actionLabel = ACTION_LABELS[status];
                        const isExpanded = expandedRows[order.id!];

                        return (
                          <React.Fragment key={order.id}>
                            <tr 
                              className={`group transition-all duration-300 cursor-pointer ${
                                index % 2 === 0 ? 'bg-white' : 'bg-[#FAF5FF]/30'
                              } hover:bg-[#FAF5FF]`}
                              onClick={() => setExpandedRows(prev => ({...prev, [order.id!]: !prev[order.id!]}))}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#A78BFA]" /> : <ChevronDown className="w-4 h-4 text-[#A78BFA]" />}
                                  <span className="font-mono text-sm font-bold text-[#7C3AED]">#{order.id?.slice(0, 8).toUpperCase()}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-[#4C1D95]">{order.customer_name}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-[#4C1D95]/70 bg-[#A78BFA]/10 px-2 py-1 rounded-md inline-block">
                                  {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                                </p>
                              </td>
                              <td className="px-6 py-4 font-black text-[#4C1D95]">₹{order.total.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                                  order.payment_type === 'upi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {order.payment_type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color} border`}>
                                  <cfg.icon className="w-3 h-3" />
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-[#4C1D95]/60 font-semibold">
                                {new Date(order.created_at!).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                {nextStatus ? (
                                  <button
                                    onClick={() => handleStatusUpdate(order, status)}
                                    disabled={updatingId === order.id}
                                    className="min-w-[90px] px-4 py-2 bg-[#F97316] text-white rounded-lg text-xs font-bold hover:bg-[#ea580c] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-sm shadow-[#F97316]/20 cursor-pointer"
                                  >
                                    {updatingId === order.id ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      actionLabel
                                    )}
                                  </button>
                                ) : (
                                  <span className="min-w-[90px] px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold flex items-center justify-center cursor-not-allowed border border-gray-200">
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Done
                                  </span>
                                )}
                              </td>
                            </tr>
                            
                            {/* Expandable Row */}
                            <AnimatePresence>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={8} className="p-0 border-b border-[#A78BFA]/10 bg-[#FAF5FF]/50">
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-l-4 border-[#7C3AED] m-4 bg-white rounded-xl shadow-sm">
                                        
                                        {/* Customer Details */}
                                        <div className="space-y-4">
                                          <h4 className="font-bold text-[#4C1D95] border-b border-[#A78BFA]/20 pb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#7C3AED]" /> Customer Details
                                          </h4>
                                          <div className="space-y-3 text-sm font-medium text-[#4C1D95]/80">
                                            <div className="flex items-start gap-3">
                                              <Phone className="w-4 h-4 mt-0.5 text-[#A78BFA]" />
                                              <span>{order.phone}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                              <Mail className="w-4 h-4 mt-0.5 text-[#A78BFA]" />
                                              <span>{order.email || 'No email provided'}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                              <MapPin className="w-4 h-4 mt-0.5 text-[#A78BFA]" />
                                              <span className="whitespace-normal">
                                                {order.address?.street}, {order.address?.city},<br/>
                                                {order.address?.state} - {order.address?.pincode}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-4">
                                          <h4 className="font-bold text-[#4C1D95] border-b border-[#A78BFA]/20 pb-2 flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4 text-[#7C3AED]" /> Order Items
                                          </h4>
                                          <div className="space-y-2">
                                            {order.items.map((item, i) => (
                                              <div key={i} className="flex justify-between items-center text-sm p-2.5 rounded-lg bg-[#FAF5FF] border border-[#A78BFA]/10">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1 shadow-sm">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                  </div>
                                                  <div>
                                                    <p className="font-bold text-[#4C1D95]">{item.name}</p>
                                                    <p className="text-xs font-semibold text-[#4C1D95]/60">{item.selectedWeight}kg × {item.quantity}</p>
                                                  </div>
                                                </div>
                                                <span className="font-bold text-[#4C1D95]">₹{(item.price * item.quantity).toLocaleString()}</span>
                                              </div>
                                            ))}
                                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#A78BFA]/20">
                                              <span className="font-bold text-[#4C1D95]">Total</span>
                                              <span className="font-black text-[#7C3AED] text-lg">₹{order.total.toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </div>

                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
