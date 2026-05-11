import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  Lock, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  ExternalLink,
  Loader2,
  Camera,
  Save,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile } from '../services/userService';
import { getOrdersByUser, Order } from '../services/orderService';
import { cn } from '../lib/utils';
import { updateProfile, updatePassword, getAuth } from 'firebase/auth';

export default function MyAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, orderData] = await Promise.all([
          getUserProfile(user.uid),
          getOrdersByUser(user.uid)
        ]);
        
        if (profileData) {
          setProfile(profileData);
          setName(profileData.name || '');
          setPhone(profileData.phoneNumber || '');
          setAddress(profileData.address || '');
        } else {
          // Initialize profile if it doesn't exist
          setName(user.name || '');
        }
        
        setOrders(orderData);
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setActionLoading(true);
    setMessage(null);

    try {
      // 1. Update Firebase Auth Display Name
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      // 2. Update Firestore Profile
      await updateUserProfile(user.uid, {
        name,
        phoneNumber: phone,
        address
      });

      setProfile(prev => prev ? { ...prev, name, phoneNumber: phone, address } : null);
      setIsEditing(false);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setMessage({ text: 'Password changed successfully!', type: 'success' });
        setShowPasswordChange(false);
        setNewPassword('');
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to change password.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'preparing': return 'bg-honey/10 text-honey border-honey/20';
      case 'ready': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-mocha/5 text-mocha/60 border-mocha/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-caramel mx-auto mb-4" />
          <p className="font-display text-xl text-espresso">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-10 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-espresso mb-2">My Account</h1>
            <p className="font-body text-mocha/60">Manage your profile, view orders, and more.</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-rust font-bold bg-white px-6 py-2.5 rounded-full shadow-sm border border-biscuit hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-8 p-4 rounded-2xl flex items-center gap-3 font-body text-sm font-bold",
              message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar / Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-[2rem] shadow-xl border border-biscuit p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-caramel/20 to-honey/20" />
              
              <div className="relative mt-4 mb-6 inline-block">
                <div className="w-24 h-24 rounded-full bg-cream border-4 border-white shadow-lg overflow-hidden flex items-center justify-center mx-auto">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-display text-caramel font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-biscuit text-caramel hover:text-rust transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="font-display text-2xl text-espresso mb-1">{profile?.name || user?.name}</h2>
              <p className="text-mocha/50 font-body text-sm mb-6 pb-6 border-b border-biscuit/50">{user?.email}</p>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm font-body">
                  <div className="w-8 h-8 rounded-xl bg-mocha/5 flex items-center justify-center text-mocha/40 group-hover:bg-caramel/10 group-hover:text-caramel transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-mocha/30">Phone</p>
                    <p className="text-mocha/80">{profile?.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm font-body">
                  <div className="w-8 h-8 rounded-xl bg-mocha/5 flex items-center justify-center text-mocha/40 group-hover:bg-caramel/10 group-hover:text-caramel transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-mocha/30">Default Address</p>
                    <p className="text-mocha/80 truncate max-w-[180px]">{profile?.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="mt-8 w-full bg-caramel/10 hover:bg-caramel text-caramel hover:text-white font-bold py-3 rounded-2xl transition-all duration-300"
              >
                Edit Profile
              </button>
            </section>

            {/* Account Actions */}
            <section className="bg-white rounded-[2rem] shadow-xl border border-biscuit p-6 space-y-2">
              <h3 className="px-2 mb-4 font-display text-lg text-espresso">Quick Links</h3>
              <Link to="/orders" className="flex items-center justify-between p-3 rounded-2xl hover:bg-cream transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-mocha/5 flex items-center justify-center text-mocha/40 group-hover:text-rust transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="font-body text-sm text-mocha/80 group-hover:text-mocha font-bold">My Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-mocha/20 group-hover:text-mocha group-hover:translate-x-1 transition-all" />
              </Link>
              <button 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-cream transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-mocha/5 flex items-center justify-center text-mocha/40 group-hover:text-rust transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="font-body text-sm text-mocha/80 group-hover:text-mocha font-bold">Security Settings</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-mocha/20 group-hover:text-mocha transition-all", showPasswordChange && "rotate-90")} />
              </button>

              <Link to="/account" className="flex items-center justify-between p-3 rounded-2xl hover:bg-cream transition-colors group opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-mocha/5 flex items-center justify-center text-mocha/40 group-hover:text-rust transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-body text-sm text-mocha/80 group-hover:text-mocha font-bold">Address Book</span>
                </div>
                <span className="text-[10px] font-bold text-mocha/30 uppercase tracking-widest mr-2">Coming Soon</span>
              </Link>

              <AnimatePresence>
                {showPasswordChange && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleChangePassword} className="p-3 bg-cream/50 rounded-2xl space-y-3 mt-1">
                      <input 
                        type="password" 
                        placeholder="New password (min 6 chars)"
                        className="w-full bg-white border border-biscuit rounded-xl px-4 py-2.5 text-xs outline-none focus:border-caramel"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button 
                        disabled={actionLoading}
                        className="w-full bg-espresso text-cream text-[10px] font-bold uppercase tracking-widest py-2 rounded-xl hover:bg-mocha disabled:opacity-50"
                      >
                        {actionLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order History Summary */}
            <section className="bg-white rounded-[2.5rem] shadow-xl border border-biscuit overflow-hidden">
              <div className="px-8 py-6 border-b border-biscuit flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-honey/10 flex items-center justify-center text-honey">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl text-espresso">Recent Orders</h3>
                </div>
                <Link to="/orders" className="text-[10px] font-bold text-caramel uppercase tracking-widest hover:text-rust flex items-center gap-1.5 transition-colors">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-biscuit/40 max-h-[500px] overflow-y-auto">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-6 hover:bg-cream/30 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-mocha/30 uppercase tracking-[0.2em] mb-1">Order ID</p>
                          <p className="font-mono text-sm font-bold text-mocha">{order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-mocha/30 uppercase tracking-[0.2em] mb-1">Amount</p>
                          <p className="font-body text-rust font-bold">৳{order.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                          getStatusColor(order.status)
                        )}>
                          {order.status === 'delivered' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {order.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-body text-mocha/60">
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="bg-biscuit/30 px-2.5 py-1 rounded-lg">
                              {item.name} ×{item.qty}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-mocha/40 self-center">+{order.items.length - 2} more items</span>
                          )}
                        </div>
                        <Link to={`/orders?id=${order.id}`} className="text-caramel hover:underline inline-flex items-center gap-1">
                          Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-biscuit/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-mocha/20" />
                    </div>
                    <p className="font-display text-xl text-mocha/40 mb-2">No orders yet</p>
                    <p className="font-body text-sm text-mocha/30 mb-6">Start your journey with a fresh treat!</p>
                    <Link to="/menu" className="inline-flex items-center gap-2 bg-espresso text-cream px-8 py-3 rounded-full font-bold text-sm hover:translate-y-px transition-all">
                      Browse Menu
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !actionLoading && setIsEditing(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-cream rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="px-10 py-8 bg-hero-bg text-cream relative">
                <h2 className="font-display text-3xl">Edit Profile</h2>
                <p className="text-biscuit/70 text-sm font-body">Update your personal information.</p>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="absolute top-8 right-10 text-cream/50 hover:text-cream transition-colors"
                >
                  <AlertCircle className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-10 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-biscuit" />
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-biscuit" />
                    <input 
                      type="tel" 
                      className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors"
                      placeholder="+880 1XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Default Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-biscuit" />
                    <textarea 
                      rows={3}
                      className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors resize-none"
                      placeholder="Street, Area, Dhaka..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-8 py-4 rounded-2xl border-2 border-biscuit text-mocha font-bold hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={actionLoading}
                    type="submit"
                    className="flex-1 bg-espresso hover:bg-mocha text-cream font-bold px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
