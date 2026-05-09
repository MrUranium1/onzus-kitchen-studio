import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Clock, Package, CheckCircle2, ChevronRight, Inbox, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrders, Order } from '../services/orderService';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (user) {
        try {
          const allOrders = await getOrders();
          const myOrders = allOrders
            .filter(o => o.userId === user.uid)
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
              const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
              return dateB - dateA;
            });
          setOrders(myOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMyOrders();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center bg-cream">
        <Loader2 className="w-12 h-12 text-caramel animate-spin mb-4" />
        <p className="font-body text-mocha/50 font-bold tracking-widest uppercase text-xs">Fetching your history...</p>
      </div>
    );
  }

  return (
    <div className="z-content min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-hero-bg pt-28 pb-16 px-4 text-center hero-bg">
        <p className="font-script text-honey text-2xl mb-2">My History</p>
        <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">Your <em className="text-honey not-italic">Orders</em></h1>
        <p className="font-body text-biscuit/80 max-w-lg mx-auto leading-relaxed">Track your recent bakes and browse through your sweet journey with us.</p>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        {orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order, idx) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-biscuit group hover:shadow-2xl transition-all"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <p className="text-[10px] font-bold text-mocha/40 uppercase tracking-[0.2em] mb-1">Order ID: #{order.id.slice(-8)}</p>
                      <p className="text-xs font-body text-mocha/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Processing...'}
                      </p>
                    </div>
                    <div className={cn(
                      "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                      order.status === 'pending' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                      order.status === 'preparing' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                      order.status === 'ready' ? 'bg-purple-50 text-purple-500 border border-purple-100' :
                      order.status === 'delivered' ? 'bg-green-50 text-green-500 border border-green-100' :
                      'bg-red-50 text-red-500 border border-red-100'
                    )}>
                      {getStatusIcon(order.status)}
                      {order.status === 'preparing' ? 'Prepared' : order.status === 'cancelled' ? 'Canceled' : order.status}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-biscuit/20 flex items-center justify-center font-bold text-[10px] text-caramel">{item.qty}x</div>
                           <span className="font-bold text-espresso">{item.name}</span>
                        </div>
                        <span className="font-body text-mocha/60">৳{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-biscuit flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div className="text-left w-full md:w-auto">
                      <p className="text-[10px] font-bold text-mocha/30 uppercase tracking-widest mb-1">Delivered to</p>
                      <p className="text-xs font-body text-mocha/60 max-w-[250px] truncate">{order.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-mocha/30 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-3xl font-display font-bold text-rust">৳{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-biscuit">
            <Inbox className="w-16 h-16 text-biscuit mx-auto mb-6 opacity-40" />
            <h2 className="font-display text-2xl text-espresso mb-4">No orders yet!</h2>
            <p className="font-body text-mocha/50 max-w-xs mx-auto mb-10 leading-relaxed">
              Your treat history is currently empty. Head over to our menu and pick something delicious!
            </p>
            <Link to="/menu" className="inline-flex items-center gap-2 bg-espresso text-cream font-bold py-4 px-10 rounded-full hover:bg-mocha transition-all active:scale-95 shadow-lg">
              Visit Kitchen <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending': return <Clock className="w-3.5 h-3.5 animate-pulse" />;
    case 'preparing': return <Package className="w-3.5 h-3.5" />;
    case 'ready': return <Sparkles className="w-3.5 h-3.5" />;
    case 'delivered': return <CheckCircle2 className="w-3.5 h-3.5" />;
    default: return null;
  }
}
