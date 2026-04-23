import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../context/AuthContext';
import { getProfile, saveOrder } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, CreditCard, QrCode, CheckCircle,
  Smartphone, MapPin, User, Phone, Truck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'upi' | 'cod'>('upi');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (user) {
      getProfile(user.id).then((profile) => {
        if (profile) setFormData({ name: profile.name, phone: profile.phone, address: profile.address, pincode: profile.pincode });
      });
    }
  }, [user]);

  const upiId = import.meta.env.VITE_UPI_ID || 'yourname@bank';
  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';
  // Universal upi:// link — works for both button tap deep-linking and in-app QR scanners.
  // Standard format used by all printed/digital QR codes in India.
  // IMPORTANT: Do NOT encodeURIComponent the UPI ID — GPay requires the raw @ symbol.
  const upiLink = `upi://pay?pa=${upiId}&pn=MangoWala&am=${cartTotal}&cu=INR&tn=Mango+Order`;
  const upiQrValue = upiLink;

  const buildWhatsAppMessage = (id: string) => {
    const itemsSummary = cart.map(i => `${i.name}(${i.selectedWeight}kg x${i.quantity})`).join(', ');
    const msg = `Hi! New Order 🥭 #${id.slice(0, 8).toUpperCase()} | ${itemsSummary} | ₹${cartTotal} | ${paymentType.toUpperCase()} | ${formData.name} | ${formData.phone}`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleConfirmOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please complete your delivery details by logging in or signing up.');
      return;
    }
    setIsSubmitting(true);
    try {
      const id = await saveOrder({
        customer_id: user?.id || 'guest',
        customer_name: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.pincode}`,
        items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, selectedWeight: item.selectedWeight })),
        amount: cartTotal,
        payment_type: paymentType,
        status: 'pending',
      });

      if (id) {
        setOrderId(id);
        clearCart();
        // Open WhatsApp
        window.open(buildWhatsAppMessage(id), '_blank');
      }
    } catch (err) {
      console.error('Failed to save order', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Order Success Screen ────────────────────────────────────────────────────
  if (orderId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-4 py-20 text-center"
      >
        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-3">Order Placed! 🥭</h1>
        <p className="text-[#1a1a1a]/60 text-lg max-w-sm mb-2">
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-[#1a1a1a]/50 max-w-sm mb-10">
          We've sent the details on WhatsApp. We'll contact you shortly to confirm your order.
        </p>
        {paymentType === 'upi' && (
          <a
            href={upiLink}
            className="mb-6 w-full max-w-xs py-4 bg-[#FF6B00] text-white text-center rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <Smartphone className="w-5 h-5" />
            Pay ₹{cartTotal} via UPI App
          </a>
        )}
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => navigate('/orders')} className="px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
            Track Order
          </button>
          <button onClick={() => navigate('/')} className="px-8 py-4 bg-[#FFD700] text-[#1a1a1a] rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
            Back to Shop
          </button>
        </div>
      </motion.div>
    );
  }

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/" className="text-[#FF6B00] font-bold underline">Back to Shop</Link>
      </motion.div>
    );
  }

  // ── Main Checkout ───────────────────────────────────────────────────────────
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#FFF8F0] pt-24 pb-20"
    >
      <div className="max-w-2xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-[#FF6B00] font-bold mb-8 hover:gap-3 transition-all">
          <ArrowLeft className="w-5 h-5" /> Back to Shop
        </Link>
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8">Checkout</h1>

        {/* Delivery Details */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#FF6B00]/10 mb-6">
          <h2 className="text-lg font-black mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6B00]" /> Delivery Details
          </h2>
          {!user && (
            <div className="mb-6 p-4 bg-[#FFF8F0] rounded-2xl flex items-center justify-between border border-[#FF6B00]/20">
              <p className="text-sm font-bold text-[#1a1a1a]/60">Login for faster checkout</p>
              <Link to="/login" className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-black hover:scale-105 transition-all">Login</Link>
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/30" />
              <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoComplete="name" className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a]" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/30" />
              <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} autoComplete="tel" className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a]" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#1a1a1a]/30" />
              <textarea placeholder="Delivery Address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} autoComplete="street-address" rows={2} className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a] resize-none" />
            </div>
            <div className="relative">
              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/30" />
              <input type="text" inputMode="numeric" placeholder="Pincode" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} autoComplete="postal-code" className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a]" />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#FF6B00]/10 mb-6">
          <h2 className="text-lg font-black mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedWeight}`} className="flex justify-between items-center py-2 border-b border-[#FF6B00]/5 last:border-0">
                <div>
                  <p className="font-black text-[#1a1a1a]">{item.name} × {item.quantity}</p>
                  <p className="text-xs font-bold text-[#FF6B00] uppercase">{item.selectedWeight}kg Pack</p>
                </div>
                <p className="font-bold">₹{(item.price * item.selectedWeight * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-[#FF6B00]/20">
            <span className="font-black text-[#1a1a1a] text-lg">Total</span>
            <span className="text-2xl font-black text-[#FF6B00]">₹{cartTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Type */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#FF6B00]/10 mb-6">
          <h2 className="text-lg font-black mb-5">Payment Method</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPaymentType('upi')}
              className={`py-4 px-4 rounded-2xl font-black flex flex-col items-center gap-2 border-2 transition-all ${paymentType === 'upi' ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-lg scale-[1.02]' : 'bg-[#FFF8F0] text-[#1a1a1a] border-[#FF6B00]/20 hover:border-[#FF6B00]/50'}`}
            >
              <CreditCard className="w-6 h-6" />
              UPI / GPay
            </button>
            <button
              onClick={() => setPaymentType('cod')}
              className={`py-4 px-4 rounded-2xl font-black flex flex-col items-center gap-2 border-2 transition-all ${paymentType === 'cod' ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-lg scale-[1.02]' : 'bg-[#FFF8F0] text-[#1a1a1a] border-[#FF6B00]/20 hover:border-[#FF6B00]/50'}`}
            >
              <Truck className="w-6 h-6" />
              Cash on Delivery
            </button>
          </div>

          {/* UPI Options */}
          {paymentType === 'upi' && (
            <div className="space-y-3">
              <a
                href={upiLink}
                className="block w-full py-4 bg-green-500 text-white text-center rounded-2xl font-black shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Open GPay / PhonePe / Paytm
              </a>
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full py-3 bg-[#FFF8F0] border-2 border-[#FF6B00]/20 rounded-2xl font-bold text-[#1a1a1a] flex items-center justify-center gap-2 hover:border-[#FF6B00]/50 transition-all"
              >
                <QrCode className="w-5 h-5 text-[#FF6B00]" />
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
              {showQR && (
                <div className="flex flex-col items-center py-4 animate-in zoom-in-95">
                  <div className="bg-white p-4 rounded-3xl shadow-inner border-4 border-[#FFD700]/30">
                    <QRCodeSVG value={upiQrValue} size={200} level="M" />
                  </div>
                  <p className="text-sm text-center mt-3 text-[#1a1a1a]/60 font-bold">
                    Open <span className="text-[#FF6B00]">GPay / PhonePe / Paytm</span>
                  </p>
                  <p className="text-xs text-center mt-1 text-[#1a1a1a]/40">
                    Tap <span className="font-bold">Scan QR</span> inside the app → point at this code
                  </p>
                  <p className="text-[10px] text-center mt-2 text-[#1a1a1a]/30 font-mono break-all max-w-xs">
                    Pay to: {upiId}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
          className="w-full py-5 bg-[#FF6B00] text-white rounded-3xl font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Placing Order...' : `Confirm Order · ₹${cartTotal.toLocaleString()}`}
        </button>
        <p className="text-xs text-center mt-3 text-[#1a1a1a]/40 font-bold">
          You'll receive a WhatsApp confirmation after placing the order.
        </p>
      </div>
    </motion.div>
  );
}
