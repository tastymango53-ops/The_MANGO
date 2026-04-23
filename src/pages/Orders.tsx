import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { ShoppingBag, Truck, Package, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

        if (!error && data) {
          setOrders(data);
        }
        setLoading(false);
      };

      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="pt-32 flex justify-center">
        <span className="w-12 h-12 border-4 border-mango/30 border-t-mango rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-offwhite min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black text-dark">My Orders</h1>
          <div className="bg-mango/10 px-4 py-2 rounded-full text-mango-dark font-bold border border-mango/20">
            {orders.length} Total Orders
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-mango/10">
            <div className="inline-flex p-6 bg-offwhite rounded-3xl mb-6">
              <ShoppingBag className="w-12 h-12 text-dark/20" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders found</h2>
            <p className="text-dark/50 mb-8 font-medium">You haven't ordered any delicious mangoes yet.</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-mango text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2.5rem] shadow-xl border border-mango/10 overflow-hidden">
                {/* Order Header */}
                <div className="p-8 border-b border-mango/5 bg-mango/5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-mango-dark uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-bold text-dark">#{order.id?.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-mango-dark uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold text-dark">{new Date(order.created_at!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-mango-dark uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-leaf-dark">₹{order.amount.toLocaleString()}</p>
                  </div>
                  <div className={clsx(
                    "px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider",
                    order.status === 'delivered' ? "bg-leaf text-white" : "bg-mango text-white"
                  )}>
                    {order.status}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-10 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-offwhite -translate-y-1/2 z-0" />
                    
                    {[
                      { icon: Clock, label: 'Confirmed', done: true },
                      { icon: Package, label: 'Packed', done: order.status !== 'pending' },
                      { icon: Truck, label: 'Shipped', done: order.status === 'shipped' || order.status === 'delivered' },
                      { icon: CheckCircle, label: 'Delivered', done: order.status === 'delivered' }
                    ].map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-4 shadow-lg",
                          step.done ? "bg-mango text-white border-white" : "bg-white text-dark/20 border-offwhite"
                        )}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        <span className={clsx(
                          "mt-2 text-[10px] font-black uppercase tracking-widest",
                          step.done ? "text-mango-dark" : "text-dark/20"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Items Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-offwhite rounded-2xl border border-mango/5">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-mango-dark">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-dark">{item.name}</p>
                          <p className="text-xs font-black text-mango-dark uppercase">{item.selectedWeight}kg Pack</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
