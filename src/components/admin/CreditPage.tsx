import React, { useState, useEffect } from 'react';
import { getCreditCustomers, addCreditCustomer, updateCreditStatus, deleteCreditCustomer } from '../../lib/supabase';
import type { CreditCustomer } from '../../lib/supabase';
import { Users, IndianRupee, Plus, Trash2, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export function CreditPage() {
  const [customers, setCustomers] = useState<CreditCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getCreditCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !amount) return;

    setIsSubmitting(true);
    const success = await addCreditCustomer({
      customer_name: name,
      phone,
      order_id: orderId || null,
      amount: parseFloat(amount),
      note: note || null,
      status: 'pending'
    });

    if (success) {
      // Reset form
      setName('');
      setPhone('');
      setOrderId('');
      setAmount('');
      setNote('');
      await loadData();
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    
    // Optimistic UI update
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as 'pending' | 'paid' } : c));
    
    const success = await updateCreditStatus(id, newStatus as 'pending' | 'paid');
    if (!success) {
      // Revert on failure
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: currentStatus as 'pending' | 'paid' } : c));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this credit entry?')) return;
    
    setCustomers(prev => prev.filter(c => c.id !== id));
    const success = await deleteCreditCustomer(id);
    if (!success) {
      await loadData(); // Reload on failure
    }
  };

  const pendingCustomers = customers.filter(c => c.status === 'pending');
  const totalOutstanding = pendingCustomers.reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Credit Customers</h1>
        <p className="text-slate-400 text-sm mt-0.5">Track customers with outstanding balances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border-l-4 border-amber-500 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Outstanding</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">₹{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border-l-4 border-blue-500 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Customers</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{pendingCustomers.length}</p>
          </div>
        </div>
      </div>

      {/* Add New Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" />
            Add Credit Entry
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Customer Name *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number *</label>
              <input 
                type="text" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Amount Owed (₹) *</label>
              <input 
                type="number" 
                required
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="1500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Order ID (Optional)</label>
              <input 
                type="text" 
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="Order UUID or short ID"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">Note (Optional)</label>
            <input 
              type="text" 
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              placeholder="e.g. Will pay next Friday"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-md shadow-amber-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Entry
          </button>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Status', 'Customer', 'Amount', 'Order ID', 'Note', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm font-medium">
                    No credit entries found.
                  </td>
                </tr>
              ) : (
                customers.map(c => {
                  const isPaid = c.status === 'paid';
                  return (
                    <tr key={c.id} className={clsx("transition-colors", isPaid ? "bg-slate-50/50" : "hover:bg-amber-50/30")}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => c.id && handleToggleStatus(c.id, c.status || 'pending')}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer",
                            isPaid ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          )}
                        >
                          {isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                          {isPaid ? 'Paid' : 'Pending'}
                        </button>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className={clsx(isPaid && "line-through text-slate-400")}>
                          <p className="font-bold text-slate-800 text-sm">{c.customer_name}</p>
                          <p className="text-xs text-slate-500">{c.phone}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={clsx("font-black text-sm", isPaid ? "text-slate-400 line-through" : "text-green-600")}>
                          ₹{c.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className={clsx(isPaid && "text-slate-400 line-through")}>
                          {c.order_id ? `#${c.order_id.slice(0, 8).toUpperCase()}` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                        <span className={clsx(isPaid && "text-slate-400 line-through")}>{c.note || '-'}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => c.id && handleDelete(c.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
