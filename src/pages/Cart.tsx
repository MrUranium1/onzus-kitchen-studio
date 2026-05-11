import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ShieldCheck, Sparkles, MessageCircle, X, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Cart() {
  const { cart, changeQty, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user, openAuthModal, loading: authLoading } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<{ code: string, pct: number } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const subtotal = getCartTotal();
  const discountAmt = activeDiscount ? Math.round(subtotal * activeDiscount.pct / 100) : 0;
  const deliveryFee = subtotal - discountAmt >= 1000 ? 0 : 80;
  const total = subtotal - discountAmt + deliveryFee;

  const applyPromo = () => {
    const codes: Record<string, number> = { 'ONZU10': 10, 'WELCOME': 15, 'BAKE20': 20 };
    const code = promoCode.toUpperCase();
    if (codes[code]) {
      setActiveDiscount({ code, pct: codes[code] });
      setPromoCode('');
    }
  };

  const getWALink = (orderId?: string) => {
    const items = cart.map(i => `• ${i.name} x${i.qty} = ৳${(i.price * i.qty).toLocaleString()}`).join('\n');
    const orderStr = orderId ? `Order ID: ${orderId}\n` : '';
    const locationStr = location ? `Delivery Address: ${location}\n` : '';
    const msg = encodeURIComponent(`Hi Onzu's Kitchen! I'd like to place an order 🧁\n\n${orderStr}${locationStr}${items}\n\nSubtotal: ৳${subtotal.toLocaleString()}\nTotal: ৳${total.toLocaleString()}\n\nPlease confirm availability. Thank you!`);
    return `https://wa.me/8801719262956?text=${msg}`;
  };

  const handleCheckout = async () => {
    if (!location.trim()) {
      alert("Please provide a delivery location first!");
      return;
    }

    if (!phoneNumber.trim()) {
      alert("Please provide a phone number!");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderId = await createOrder({
        userId: user?.uid || 'guest',
        userEmail: user?.email || guestEmail || 'guest@onzu.kitchen',
        userName: user?.displayName || 'Guest',
        phoneNumber: phoneNumber,
        items: cart,
        totalAmount: total,
        location: location
      });
      
      setOrderDetails({ id: orderId, total });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0 && !showSuccessModal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-20 text-center bg-cream z-content">
        <div className="relative mb-8">
           <div className="w-24 h-24 bg-biscuit/40 rounded-full flex items-center justify-center">
             <ShoppingBag className="w-12 h-12 text-mocha/30" />
           </div>
           <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cream flex items-center justify-center rounded-full">🧁</div>
        </div>
        <h2 className="font-display text-3xl text-espresso mb-3">Your cart is empty</h2>
        <p className="font-body text-mocha/60 text-base mb-10 max-w-xs mx-auto">Looks like you haven't added any of our delicious bakes yet.</p>
        <Link 
          to="/menu" 
          className="bg-espresso text-cream font-bold text-sm px-10 py-4 rounded-full font-body tracking-wide transition-all shadow-lg active:scale-95 hover:bg-mocha"
        >
          🧁 Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="z-content min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-hero-bg pt-28 pb-14 px-4 text-center hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(242,224,200,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
        <div className="relative z-10">
          <p className="font-script text-honey text-2xl mb-1">Almost There!</p>
          <h1 className="font-display text-5xl md:text-6xl text-cream mb-2">Your <em className="text-honey not-italic">Cart</em></h1>
          <p className="font-body text-biscuit/70 text-sm max-w-xs mx-auto uppercase tracking-[0.2em] font-bold opacity-60">Handcrafted just for you</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10 items-start">
        {/* Cart Items */}
        <div className="flex-grow w-full lg:w-3/5">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-biscuit">
            <h2 className="font-display text-2xl text-espresso">Order Items <span className="text-mocha/40 font-body text-lg font-normal ml-1">({cart.reduce((s,i)=>s+i.qty,0)})</span></h2>
            <div className="flex items-center gap-3">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                  <span className="text-[10px] font-bold text-rust uppercase tracking-widest">Are you sure?</span>
                  <button 
                    onClick={() => { clearCart(); setShowClearConfirm(false); }}
                    className="text-[10px] font-bold text-white bg-rust px-3 py-1.5 rounded-lg hover:bg-rust/90 transition-all shadow-sm"
                  >
                    Yes, Clear
                  </button>
                  <button 
                    onClick={() => setShowClearConfirm(false)}
                    className="text-[10px] font-bold text-mocha/40 hover:text-mocha transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowClearConfirm(true)} className="text-xs font-bold text-mocha/40 hover:text-rust transition-colors flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="testi-card rounded-2xl p-4 sm:p-5 flex gap-5 items-center bg-white shadow-sm border border-biscuit hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-display text-lg text-espresso leading-tight mb-1 truncate">{item.name}</h3>
                    <p className="text-rust font-bold font-body text-sm">৳{item.price.toLocaleString()}<span className="text-mocha/40 font-normal ml-1 italic">each</span></p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center bg-biscuit/40 rounded-full p-1 border border-biscuit">
                        <button onClick={() => changeQty(item.id, -1)} className="w-8 h-8 rounded-full bg-white hover:bg-caramel hover:text-cream text-espresso flex items-center justify-center transition-all shadow-sm"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center font-bold text-espresso text-sm">{item.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)} className="w-8 h-8 rounded-full bg-white hover:bg-caramel hover:text-cream text-espresso flex items-center justify-center transition-all shadow-sm"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pr-1">
                    <p className="font-bold font-display text-xl text-espresso">৳{(item.price * item.qty).toLocaleString()}</p>
                    <button onClick={() => removeFromCart(item.id)} className="mt-3 text-mocha/30 hover:text-rust transition-colors active:scale-90"><Trash2 className="w-5 h-5 mx-auto" /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <Link to="/menu" className="inline-flex items-center gap-2 mt-8 text-sm font-bold font-body text-mocha/60 hover:text-rust transition-colors group">
            <ShoppingBag className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-2/5 shrink-0 lg:sticky lg:top-24">
          <div className="testi-card rounded-[2rem] p-8 shadow-xl border border-biscuit relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-caramel/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <h2 className="font-display text-3xl text-espresso mb-8">Order Summary</h2>

            {/* Contact & Location */}
            <div className="mb-8 space-y-4">
              <div className="bg-cream/30 p-5 rounded-2xl border border-biscuit">
                {!user && (
                   <div className="mb-4">
                      <label className="text-[10px] font-bold text-mocha uppercase tracking-[0.2em] mb-2 block">Email (Optional for Guest)</label>
                      <input 
                        type="email"
                        className="w-full bg-white border-2 border-biscuit rounded-xl px-4 py-2 text-sm outline-none focus:border-caramel transition-all font-body"
                        placeholder="you@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                   </div>
                )}

                <div className="mb-4">
                  <label className="text-[10px] font-bold text-mocha uppercase tracking-[0.2em] mb-2 block">Phone Number *</label>
                  <input 
                    type="tel"
                    required
                    className="w-full bg-white border-2 border-biscuit rounded-xl px-4 py-2 text-sm outline-none focus:border-caramel transition-all font-body font-bold"
                    placeholder="01XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-mocha uppercase tracking-[0.2em] mb-2 block">Delivery Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-caramel" />
                    <textarea 
                      rows={2}
                      required
                      className="w-full bg-white border-2 border-biscuit rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-caramel transition-all resize-none font-body"
                      placeholder="Street, Area, City..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo */}
            <div className="mb-8">
              <label className="block text-[10px] font-bold text-mocha uppercase tracking-[0.2em] mb-3 pl-1">Promo Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-grow bg-cream/30 border-2 border-biscuit rounded-2xl px-5 py-3 outline-none focus:border-caramel transition-all text-sm font-body uppercase placeholder:normal-case font-bold" 
                  placeholder="Enter code..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button 
                  onClick={applyPromo}
                  className="bg-espresso text-cream px-6 rounded-2xl font-bold text-xs hover:bg-mocha active:scale-95 transition-all shadow-md"
                >
                  Apply
                </button>
              </div>
              {activeDiscount && <p className="text-green-600 font-bold text-[10px] mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {activeDiscount.code} applied: {activeDiscount.pct}% off!</p>}
            </div>

            <div className="h-px bg-biscuit/60 mb-6"></div>

            {/* Details */}
            <div className="space-y-4 font-body text-base">
              <div className="flex justify-between text-mocha/70">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              {activeDiscount && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount ({activeDiscount.pct}%)</span>
                  <span>-৳{discountAmt.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-mocha/70">
                <span>Delivery</span>
                {deliveryFee === 0 ? <span className="text-green-600 font-bold">Free 🎉</span> : <span>৳{deliveryFee}</span>}
              </div>
              
              <div className="h-px bg-biscuit/60 my-4"></div>
              
              <div className="flex justify-between items-center">
                <span className="font-display text-2xl text-espresso">Total</span>
                <span className="font-display text-3xl text-rust">৳{total.toLocaleString()}</span>
              </div>
              
              <div className="bg-cream/50 rounded-2xl p-4 mt-6">
                {deliveryFee > 0 ? (
                  <p className="text-xs text-mocha/60 leading-relaxed italic"><span className="text-caramel font-bold italic">Bakers Tip:</span> Add ৳{(1000 - (subtotal-discountAmt)).toLocaleString()} more for free delivery!</p>
                ) : (
                  <p className="text-xs text-green-600 font-bold leading-relaxed flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> You qualify for free delivery!</p>
                )}
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isPlacingOrder || authLoading}
              className="w-full bg-espresso hover:bg-mocha text-cream font-bold py-5 rounded-3xl mt-2 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 tracking-wider text-sm flex items-center justify-center gap-3"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlacingOrder ? (
                <>Placing Order <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : (
                <>Order Now <CreditCard className="w-4 h-4" /></>
              )}
            </button>
            <div className="mt-8 flex justify-center gap-6 opacity-30">
               <span className="text-[10px] font-bold border rounded px-1">BKASH</span>
               <span className="text-[10px] font-bold border rounded px-1">NAGAD</span>
               <span className="text-[10px] font-bold border rounded px-1">CASH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-cream rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center border border-biscuit relative"
            >
              <button onClick={() => { setShowSuccessModal(false); clearCart(); }} className="absolute top-6 right-6 text-mocha/40 hover:text-espresso"><X className="w-6 h-6" /></button>
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="font-display text-4xl text-espresso mb-4">Order Placed!</h2>
              {orderDetails && (
                <p className="text-[10px] font-bold text-caramel uppercase tracking-[0.2em] mb-4">Order ID: {orderDetails.id}</p>
              )}
              <p className="font-body text-mocha/70 text-base mb-8 leading-relaxed">
                Thank you for your order! We'll WhatsApp you within <strong>15 minutes</strong> to confirm your details.
              </p>
              
              <div className="bg-white/60 border border-biscuit rounded-3xl p-6 mb-8 text-left space-y-2">
                <p className="text-[10px] font-bold text-mocha tracking-[0.2em] uppercase mb-2">Order Summary</p>
                <div className="max-h-32 overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {cart.map(i => (
                    <div key={i.id} className="flex justify-between text-sm text-mocha/80">
                      <span>{i.name} × {i.qty}</span>
                      <span className="font-bold">৳{(i.price * i.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-biscuit pt-3 mt-3 flex justify-between items-center">
                  <span className="font-display text-xl text-espresso">Total Amount</span>
                  <span className="font-display text-2xl text-rust font-bold">৳{orderDetails?.total.toLocaleString()}</span>
                </div>
              </div>

              <a 
                href={getWALink(orderDetails?.id)} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-3xl mb-4 transition-all shadow-xl active:scale-95"
              >
                <MessageCircle className="w-6 h-6 fill-current" /> Chat on WhatsApp
              </a>
              <button 
                onClick={() => { setShowSuccessModal(false); clearCart(); }} 
                className="w-full py-4 text-mocha/40 hover:text-espresso font-bold text-sm transition-colors uppercase tracking-widest"
              >
                Back to Menu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
