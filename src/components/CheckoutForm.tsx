import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { saveCustomer, saveOrder } from '../lib/supabase';
import { sendWhatsAppOrder } from '../lib/whatsapp';

export const CheckoutForm = ({ onBack }: { onBack: () => void }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Warn on dirty form before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, isSuccess]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.pincode.trim() || formData.pincode.length < 6) newErrors.pincode = 'Valid pincode required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsDirty(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Save customer to Supabase
      const customerId = await saveCustomer(formData);

      // 2. Save the order to Supabase
      if (customerId) {
        await saveOrder({
          customer_id: customerId,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total: cartTotal,
          status: 'pending',
        });
      }

      // 3. Open WhatsApp with the pre-filled order message
      sendWhatsAppOrder(formData, cart, cartTotal);

      // 4. Clear cart and show success
      clearCart();
      setIsDirty(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Order failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h3 className="text-3xl font-black mb-3 text-dark">Order Sent! 🥭</h3>
        <p className="text-dark/70 text-lg mb-2 font-medium">Your order has been saved & WhatsApp has opened.</p>
        <p className="text-dark/50 text-sm mb-8 flex items-center gap-1">
          <MessageCircle className="w-4 h-4 text-green-500" />
          Just press <strong className="text-green-600 ml-1 mr-1">Send</strong> on WhatsApp to confirm.
        </p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-mango text-dark rounded-xl font-bold hover:bg-mango-light transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <button onClick={onBack} className="self-start mb-6 text-mango-dark font-semibold hover:underline bg-transparent border-none">
        ← Back to Cart
      </button>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-dark mb-2">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors"
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1" aria-live="polite">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-dark mb-2">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors"
            placeholder="+91 9876543210"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1" aria-live="polite">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-dark mb-2">Street Address</label>
          <textarea
            id="address"
            name="address"
            autoComplete="street-address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors resize-none"
            placeholder="House/Flat No., Street, Area"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1" aria-live="polite">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="pincode" className="block text-sm font-semibold text-dark mb-2">Pincode</label>
          <input
            id="pincode"
            name="pincode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={formData.pincode}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors"
            placeholder="110001"
          />
          {errors.pincode && <p className="text-red-500 text-sm mt-1" aria-live="polite">{errors.pincode}</p>}
        </div>

        <div className="mt-8 pt-6 border-t border-dark/10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg text-dark/70 font-medium">Total to Pay</span>
            <span className="text-2xl font-bold text-dark">₹{cartTotal}</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#25D366] text-white font-bold rounded-xl text-lg shadow-lg hover:bg-[#1ebe5c] transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed touch-manipulation focus-visible:ring-2 flex items-center justify-center gap-3"
          >
            <MessageCircle className="w-5 h-5" />
            {isSubmitting ? 'Placing order…' : 'Confirm & Send via WhatsApp'}
          </button>
        </div>
      </form>
    </div>
  );
};
