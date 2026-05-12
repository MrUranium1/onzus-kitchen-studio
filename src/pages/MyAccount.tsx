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
  AlertCircle,
  MessageSquare,
  MessageCircle,
  Plus,
  Trash2,
  Edit2,
  Briefcase,
  Home as HomeIcon,
  Map,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile, getAddresses, addAddress, updateAddress, deleteAddress, SavedAddress } from '../services/userService';
import { getOrdersByUser, Order } from '../services/orderService';
import { getUserInquiries, Inquiry } from '../services/inquiryService';
import { cn } from '../lib/utils';
import { updateProfile, updatePassword, getAuth } from 'firebase/auth';

export default function MyAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Address Form State
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addressFull, setAddressFull] = useState('');
  const [addressLandmark, setAddressLandmark] = useState('');
  const [addressIsDefault, setAddressIsDefault] = useState(false);

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
        const [profileData, orderData, inquiryData, addressData] = await Promise.all([
          getUserProfile(user.uid),
          getOrdersByUser(user.uid),
          getUserInquiries(user.uid),
          getAddresses(user.uid)
        ]);
        
        if (profileData) {
          setProfile(profileData);
          setName(profileData.name || user.displayName || '');
          setPhone(profileData.phoneNumber || '');
          setAddress(profileData.address || '');
        } else {
          // Initialize profile if it doesn't exist
          setName(user.displayName || '');
          setPhone('');
        }
        
        setOrders(orderData);
        setInquiries(inquiryData);
        setAddresses(addressData);
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

      setProfile({
        uid: user.uid,
        email: user.email || '',
        name,
        phoneNumber: phone,
        address
      });
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

  const formatDate = (date: any) => {
    if (!date) return '-';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const handleOpenAddressModal = (addr: SavedAddress | null = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressLabel(addr.label);
      setAddressFull(addr.fullAddress);
      setAddressLandmark(addr.landmark || '');
      setAddressIsDefault(addr.isDefault);
    } else {
      setEditingAddress(null);
      setAddressLabel('Home');
      setAddressFull('');
      setAddressLandmark('');
      setAddressIsDefault(addresses.length === 0); // Default if first address
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setActionLoading(true);
    setMessage(null);
    try {
      const addressData = {
        label: addressLabel,
        fullAddress: addressFull,
        landmark: addressLandmark,
        isDefault: addressIsDefault
      };

      if (editingAddress) {
        await updateAddress(user.uid, editingAddress.id, addressData);
      } else {
        await addAddress(user.uid, addressData);
      }

      const updatedAddresses = await getAddresses(user.uid);
      setAddresses(updatedAddresses);
      setIsAddressModalOpen(false);
      setMessage({ text: 'Address book updated!', type: 'success' });
    } catch (error: any) {
      console.error("Save address error:", error);
      let errorText = 'Failed to save address.';
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error) errorText = `Error: ${parsed.error}`;
      } catch (e) {
        if (error.message) errorText = error.message;
      }
      setMessage({ text: errorText, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    
    if (!addressId) {
      console.error("No addressId provided to handleDeleteAddress");
      return;
    }

    setDeletingId(addressId);
    setMessage(null);
    
    try {
      console.log(`Deleting address ${addressId} for user ${user.uid}`);
      await deleteAddress(user.uid, addressId);
      
      setAddresses(prev => prev.filter(a => a.id !== addressId));
      setMessage({ text: 'Address deleted successfully!', type: 'success' });
      setConfirmDeleteId(null);
    } catch (error: any) {
      console.error("Delete address error:", error);
      let errorText = 'Failed to delete address.';
      
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error) errorText = `Error: ${parsed.error}`;
      } catch (e) {
        errorText = error.message || 'Failed to delete address. Please try again.';
      }
      
      setMessage({ text: errorText, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const setAsDefault = async (addr: SavedAddress) => {
    if (!user || addr.isDefault) return;
    try {
      await updateAddress(user.uid, addr.id, { isDefault: true });
      const updated = await getAddresses(user.uid);
      setAddresses(updated);
    } catch (error) {
      console.error("Error setting default address:", error);
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
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-display text-caramel font-bold">
                      {(user?.displayName || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-biscuit text-caramel hover:text-rust transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {(!profile?.name || !profile?.phoneNumber) && !loading && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2 text-amber-700 text-[10px] font-bold uppercase tracking-widest justify-center">
                  <AlertCircle className="w-3 h-3" />
                  Complete your profile
                </div>
              )}

              <h2 className="font-display text-2xl text-espresso mb-1">{profile?.name || user?.displayName || 'Artisan Baker'}</h2>
              <p className="text-mocha/50 font-body text-sm mb-6 pb-6 border-b border-biscuit/50">{user?.email}</p>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm font-body">
                  <div className="w-8 h-8 rounded-xl bg-mocha/5 flex items-center justify-center text-mocha/40 group-hover:bg-caramel/10 group-hover:text-caramel transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-mocha/30">Phone</p>
                    <p className="text-mocha/80">{profile?.phoneNumber || phone || 'Not provided'}</p>
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

                <button 
                  onClick={() => {
                    const el = document.getElementById('address-book');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-cream transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-mocha/5 flex items-center justify-center text-mocha/40 group-hover:text-rust transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="font-body text-sm text-mocha/80 group-hover:text-mocha font-bold">Address Book</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-mocha/20 group-hover:text-mocha group-hover:translate-x-1 transition-all" />
                </button>

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

            {/* Address Book Section */}
            <section id="address-book" className="bg-white rounded-[2.5rem] shadow-xl border border-biscuit overflow-hidden">
              <div className="px-8 py-6 border-b border-biscuit flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-caramel/10 flex items-center justify-center text-caramel">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl text-espresso">Address Book</h3>
                </div>
                <button 
                  onClick={() => handleOpenAddressModal()}
                  className="bg-espresso text-cream px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-mocha transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              <div className="p-8">
                {addresses.length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <Map className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-body text-sm">Your address book is empty.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={cn(
                          "relative group p-6 rounded-3xl border-2 transition-all duration-300",
                          addr.isDefault 
                            ? "bg-caramel/5 border-caramel shadow-md" 
                            : "bg-white border-biscuit/40 hover:border-caramel/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white border border-biscuit/40 flex items-center justify-center text-mocha/60">
                              {addr.label === 'Home' ? <HomeIcon className="w-4 h-4" /> : 
                               addr.label === 'Work' ? <Briefcase className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                            </div>
                            <span className="font-display text-lg text-espresso">{addr.label}</span>
                          </div>
                          {addr.isDefault && (
                            <span className="bg-caramel text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Default</span>
                          )}
                        </div>
                        <p className="text-sm font-body text-mocha/80 mb-6 leading-relaxed min-h-[40px]">{addr.fullAddress}</p>
                        
                          <div className="flex items-center gap-3 pt-4 border-t border-biscuit/20">
                            <button 
                              type="button"
                              onClick={() => handleOpenAddressModal(addr)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-caramel hover:bg-caramel/10 text-[10px] font-bold uppercase transition-colors"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            
                            {confirmDeleteId === addr.id ? (
                              <div className="flex items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase text-mocha/40 hover:bg-mocha/5"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="button"
                                  disabled={deletingId === addr.id}
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-rust text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
                                >
                                  {deletingId === addr.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(addr.id);
                                }}
                                className="p-3 rounded-xl text-rust hover:bg-red-50 transition-colors relative z-10"
                                aria-label="Delete address"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>

                        {!addr.isDefault && (
                          <button 
                            onClick={() => setAsDefault(addr)}
                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-biscuit/40 flex items-center justify-center text-mocha/20 hover:text-caramel hover:border-caramel opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            title="Set as Default"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* My Messages / Replies Section */}
            <section className="bg-white rounded-[2.5rem] shadow-xl border border-biscuit overflow-hidden">
              <div className="px-8 py-6 border-b border-biscuit flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-mocha/10 flex items-center justify-center text-mocha">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl text-espresso">My Messages</h3>
                </div>
                <Link to="/contact" className="text-[10px] font-bold text-caramel uppercase tracking-widest hover:text-rust flex items-center gap-1.5 transition-colors">
                  Send New <Plus className="w-4 h-4" />
                </Link>
              </div>

              <div className="divide-y divide-biscuit/40 max-h-[600px] overflow-y-auto">
                {inquiries.length > 0 ? (
                  inquiries.map((inq) => (
                    <div key={inq.id} className="p-8 hover:bg-cream/20 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-mocha/30 uppercase tracking-widest mb-1">{formatDate(inq.createdAt)}</p>
                          <h4 className="font-display text-lg text-espresso">{inq.subject}</h4>
                        </div>
                        <span className={cn(
                          "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          inq.status === 'replied' ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {inq.status === 'replied' ? 'Replied' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-cream/40 p-5 rounded-2xl border border-biscuit/40">
                          <p className="text-sm text-mocha/70 font-body leading-relaxed">{inq.message}</p>
                        </div>

                        {inq.adminReply && (
                          <div className="bg-caramel/5 p-5 rounded-2xl border border-caramel/20 ml-6 relative">
                            <div className="absolute -left-2.5 top-5 w-2.5 h-2.5 bg-caramel/5 border-l border-t border-caramel/20 rotate-45" />
                            <p className="text-[10px] font-bold text-caramel uppercase tracking-widest mb-2 flex items-center gap-2">
                              <MessageCircle className="w-3 h-3" /> Admin Reply:
                            </p>
                            <p className="text-sm text-espresso font-medium font-body leading-relaxed">{inq.adminReply}</p>
                            <p className="text-[10px] text-mocha/30 mt-3 text-right">Replied on {formatDate(inq.repliedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-mocha/10" />
                    </div>
                    <p className="font-display text-xl text-mocha/40 mb-2">No messages yet</p>
                    <p className="font-body text-sm text-mocha/30">Need help or a custom cake? Just ask!</p>
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
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-10 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Email Address (Non-editable)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-biscuit" />
                    <input 
                      type="email" 
                      readOnly
                      disabled
                      className="w-full bg-cream/10 border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none text-mocha/50 cursor-not-allowed" 
                      value={user?.email || ''}
                    />
                  </div>
                </div>

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
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Quick Default Address</label>
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

      {/* Address Book Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !actionLoading && setIsAddressModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-cream rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="px-10 py-8 bg-hero-bg text-cream relative">
                <h2 className="font-display text-3xl">{editingAddress ? 'Edit Address' : 'New Address'}</h2>
                <p className="text-biscuit/70 text-sm font-body">Where should we deliver your treats?</p>
                <button 
                  onClick={() => setIsAddressModalOpen(false)}
                  className="absolute top-8 right-10 text-cream/50 hover:text-cream transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="p-10 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Label</label>
                  <div className="flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setAddressLabel(l)}
                        className={cn(
                          "flex-1 py-3 rounded-2xl border-2 font-bold text-xs transition-all",
                          addressLabel === l 
                            ? "bg-caramel border-caramel text-white shadow-md shadow-caramel/20" 
                            : "bg-white border-biscuit text-mocha/40 hover:border-biscuit/60"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Full Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-biscuit" />
                    <textarea 
                      required
                      rows={3}
                      className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors resize-none"
                      placeholder="House/Flat No, Street, Area, City..."
                      value={addressFull}
                      onChange={(e) => setAddressFull(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Landmark</label>
                  <div className="relative">
                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-biscuit" />
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors"
                      placeholder="Near XYZ School"
                      value={addressLandmark}
                      onChange={(e) => setAddressLandmark(e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={addressIsDefault}
                      onChange={(e) => setAddressIsDefault(e.target.checked)}
                    />
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                      addressIsDefault ? "bg-caramel border-caramel" : "bg-white border-biscuit group-hover:border-caramel/50"
                    )}>
                      {addressIsDefault && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-mocha/60 uppercase tracking-widest">Set as default address</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
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
                    Save Address
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
