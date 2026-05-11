import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Package, 
  Plus, 
  Search, 
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Product, PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getOrders, Order, updateOrder, createOrder } from '../services/orderService';
import { getCurationItems, saveCurationItems, addCurationItem, CurationItem } from '../services/curationService';
import { getInquiries, replyToInquiry, deleteInquiry, Inquiry } from '../services/inquiryService';
import { Loader2, RefreshCw, Upload, Image as ImageIcon, ArrowUp, ArrowDown, MoveVertical, MessageSquare } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export default function AdminDashboard() {
  const { user, isAdmin, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'orders' | 'curation' | 'messages'>('dashboard');
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [curationItems, setCurationItems] = useState<CurationItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isAddingCuration, setIsAddingCuration] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  const [curationFormData, setCurationFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
  });

  const navigate = useNavigate();

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Cakes',
    img: '',
    shortDesc: '',
    featured: false,
    isSpecial: false
  });

  // Manual Order Form State
  const [orderFormData, setOrderFormData] = useState({
    userId: 'manual-admin',
    customerName: 'Phone Order',
    phoneNumber: '',
    items: [] as any[],
    totalAmount: '',
    location: 'Kazipara, Mirpur, Dhaka 1216, Bangladesh',
  });

  useEffect(() => {
    // Auth and Admin check is now handled by AdminRoute component
  }, []);

  const fetchItems = async () => {
    const items = await getProducts();
    if (items.length === 0 && user && (isAdmin || ['hossainmehir2006@gmail.com', 'onzu080@gmail.com'].includes(user.email?.toLowerCase() || ''))) {
      // Auto-seed if empty for admin
      for (const p of PRODUCTS) {
        await createProduct({ ...p, featured: [1,4,8,14].includes(p.id) });
      }
      const newItems = await getProducts();
      setMenuItems(newItems);
    } else {
      setMenuItems(items);
    }
  };

  const fetchOrders = async () => {
    const fetchedOrders = await getOrders();
    setOrders(fetchedOrders);
  };

  const fetchCuration = async () => {
    const items = await getCurationItems();
    if (items.length === 0 && user && (isAdmin || ['hossainmehir2006@gmail.com', 'onzu080@gmail.com'].includes(user.email?.toLowerCase() || ''))) {
      const defaultBanners = [
        { imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1920&q=80', title: "Onzu's Kitchen", subtitle: "Artisan Breads", order: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80', title: "Sweet Delights", subtitle: "Custom Cakes", order: 1 }
      ];
      for (const b of defaultBanners) {
        await addCurationItem(b);
      }
      const newItems = await getCurationItems();
      setCurationItems(newItems);
    } else {
      setCurationItems(items);
    }
  };

  const fetchInquiriesData = async () => {
    const items = await getInquiries();
    setInquiries(items);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchItems(), fetchOrders(), fetchCuration(), fetchInquiriesData()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (user && (isAdmin || ['hossainmehir2006@gmail.com', 'onzu080@gmail.com'].includes(user.email?.toLowerCase() || ''))) {
      refreshData();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        price: editingItem.price.toString(),
        category: editingItem.category.charAt(0).toUpperCase() + editingItem.category.slice(1),
        img: editingItem.img,
        shortDesc: editingItem.shortDesc,
        featured: !!editingItem.featured,
        isSpecial: editingItem.ribbon === 'SPECIAL'
      });
      setImagePreview(editingItem.img);
      setIsAddingItem(true);
    } else {
      setFormData({
        name: '',
        price: '',
        category: 'Cakes',
        img: '',
        shortDesc: '',
        featured: false,
        isSpecial: false
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingItem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !curationFormData.imageUrl) {
      alert('Please select an image');
      return;
    }

    setIsUploading(true);
    try {
      let finalUrl = curationFormData.imageUrl;
      if (imageFile) {
        const fileRef = ref(storage, `curation/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(fileRef, imageFile);
        finalUrl = await getDownloadURL(snap.ref);
      }

      await addCurationItem({
        imageUrl: finalUrl,
        title: curationFormData.title,
        subtitle: curationFormData.subtitle,
        order: curationItems.length
      });

      await fetchCuration();
      setIsAddingCuration(false);
      setCurationFormData({ title: '', subtitle: '', imageUrl: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      alert('Failed to add banner');
    } finally {
      setIsUploading(false);
    }
  };

  const moveCuration = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...curationItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    const updatedWithOrder = newItems.map((item, idx) => ({ ...item, order: idx }));
    setCurationItems(updatedWithOrder);
    await saveCurationItems(updatedWithOrder);
  };

  const moveFeaturedProduct = async (index: number, direction: 'up' | 'down') => {
    const featuredItems = menuItems.filter(i => i.featured).sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featuredItems.length) return;

    const newFeatured = [...featuredItems];
    [newFeatured[index], newFeatured[targetIndex]] = [newFeatured[targetIndex], newFeatured[index]];

    // Update orders in the full menu items list
    for (let i = 0; i < newFeatured.length; i++) {
      const product = newFeatured[i];
      await updateProduct(product.id, { ...product, featuredOrder: i });
    }
    await fetchItems();
  };

  const [isReseeding, setIsReseeding] = useState(false);
  const [showReseedConfirm, setShowReseedConfirm] = useState(false);

  const removeCuration = async (id: string) => {
    try {
      const newItems = curationItems.filter(i => i.id !== id);
      setCurationItems(newItems);
      await saveCurationItems(newItems);
    } catch (error) {
      console.error(error);
      setErrorStatus('Failed to remove banner');
    }
  };


  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteItem = async (id: number | string) => {
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      setMenuItems(prev => prev.filter(i => i.id !== id));
      setDeletingId(null);
    } catch (error) {
      console.error("Delete failed:", error);
      setErrorStatus('Failed to delete item. Please check your permissions.');
    } finally {
      setIsDeleting(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState('');
  const [errorStatus, setErrorStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Stats & Revenue Calculations
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalAmount, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const getOrderDate = (order: Order) => {
    if (order.createdAt?.seconds) return new Date(order.createdAt.seconds * 1000);
    if (order.createdAt instanceof Date) return order.createdAt;
    return new Date(order.createdAt);
  };

  const todayRevenue = deliveredOrders
    .filter(o => getOrderDate(o) >= today)
    .reduce((s, o) => s + o.totalAmount, 0);

  const monthRevenue = deliveredOrders
    .filter(o => getOrderDate(o) >= thisMonth)
    .reduce((s, o) => s + o.totalAmount, 0);

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const stats = [
    { label: 'Menu Items', value: menuItems.length, icon: Package, color: 'text-caramel bg-caramel/10' },
    { label: 'Today Revenue*', value: `৳${todayRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 bg-green-600/10' },
    { label: 'Monthly Revenue*', value: `৳${monthRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-rust bg-rust/10' },
    { label: 'Total Revenue*', value: `৳${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-espresso bg-espresso/10' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.name || !formData.price || !formData.category) {
      setErrorStatus('Please fill in the name, price, and category.');
      return;
    }

    if (!imageFile && !formData.img && !editingItem) {
      setErrorStatus('Please provide an image (upload or URL).');
      return;
    }

    setIsUploading(true);
    setSuccessMessage('');
    setErrorStatus('');
    setUploadProgress(10); // Start progress
    
    try {
      let imageUrl = formData.img;

      // Upload image if file exists
      if (imageFile) {
        setUploadProgress(30);
        try {
          const fileExtension = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
          const fileRef = ref(storage, `products/${fileName}`);
          
          const snapshot = await uploadBytes(fileRef, imageFile);
          setUploadProgress(70);
          imageUrl = await getDownloadURL(snapshot.ref);
          setUploadProgress(90);
        } catch (uploadErr) {
          console.error("Storage upload failed:", uploadErr);
          throw new Error("Image upload failed. Please ensure your storage is accessible.");
        }
      }

      if (!imageUrl && !editingItem) {
        throw new Error("No image URL could be determined.");
      }

      const productData: any = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category.toLowerCase(),
        img: imageUrl || editingItem?.img || '',
        shortDesc: formData.shortDesc || 'Delicious artisan bake.',
        longDesc: editingItem?.longDesc || formData.shortDesc || 'Freshly baked with love using premium ingredients.',
        rating: editingItem?.rating || 5,
        reviews: editingItem?.reviews || Math.floor(Math.random() * 20) + 5,
        featured: formData.featured,
        ribbon: formData.isSpecial ? 'SPECIAL' : (editingItem?.ribbon === 'SPECIAL' ? '' : (editingItem?.ribbon || ''))
      };

      // Ensure ribbon is never undefined if it was special
      if (!formData.isSpecial && editingItem?.ribbon === 'SPECIAL') {
        productData.ribbon = '';
      }

      if (editingItem) {
        await updateProduct(editingItem.id, productData);
      } else {
        await createProduct(productData);
      }
      
      setUploadProgress(100);
      setSuccessMessage(editingItem ? 'Updated!' : 'Creation Published!');
      
      // Delay closing to show success
      setTimeout(async () => {
        // Clear states before fetching to prevent stale data UI flashes
        setIsAddingItem(false);
        setEditingItem(null);
        setFormData({ name: '', price: '', category: 'Cakes', img: '', shortDesc: '', featured: false, isSpecial: false });
        setImageFile(null);
        setImagePreview(null);
        setSuccessMessage('');
        setUploadProgress(0);

        // Fetch fresh data
        await fetchItems();
      }, 1500);

    } catch (error: any) {
      console.error("Submit failed:", error);
      setErrorStatus(error.message || 'Operation failed. Check if you have permission.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsRefreshing(true);
    try {
      await updateOrder(orderId, { status: newStatus as any });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      setSuccessMessage(`Order updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setErrorStatus('Failed to update status. Check permissions.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrder({
        userId: user?.uid || 'admin-manual',
        userName: orderFormData.customerName,
        phoneNumber: orderFormData.phoneNumber,
        items: [], // Simplified for manual admin entry
        totalAmount: Number(orderFormData.totalAmount),
        location: orderFormData.location
      });
      await fetchOrders();
      setIsAddingOrder(false);
      setOrderFormData({ userId: 'manual-admin', customerName: 'Phone Order', phoneNumber: '', items: [], totalAmount: '', location: 'Kazipara, Mirpur, Dhaka 1216, Bangladesh' });
    } catch (error) {
      alert('Failed to create order');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const isNowFeatured = !product.featured;
      const featuredItems = menuItems.filter(i => i.featured);
      const updateData: any = { featured: isNowFeatured };
      
      if (isNowFeatured) {
        // Assign next order
        const maxOrder = featuredItems.reduce((max, item) => Math.max(max, item.featuredOrder || 0), -1);
        updateData.featuredOrder = maxOrder + 1;
      }

      await updateProduct(product.id, { ...product, ...updateData });
      setMenuItems(menuItems.map(item => 
        item.id === product.id ? { ...item, ...updateData } : item
      ));
    } catch (error) {
      alert('Failed to update featured status');
    }
  };

  const filteredItems = menuItems.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiry || !replyText.trim()) return;

    setIsReplying(true);
    try {
      await replyToInquiry(activeInquiry.id, replyText);
      setInquiries(prev => prev.map(inq => 
        inq.id === activeInquiry.id 
          ? { ...inq, adminReply: replyText, status: 'replied', repliedAt: { seconds: Date.now() / 1000 } } 
          : inq
      ));
      setSuccessMessage('Reply sent successfully!');
      setTimeout(() => {
        setActiveInquiry(null);
        setReplyText('');
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorStatus('Failed to send reply.');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(inq => inq.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete message.');
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    return new Date(date).toLocaleString();
  };

  if (loading) return null;

  return (
    <div className="z-content min-h-screen bg-cream pb-20">
      {/* Hero */}
      <section className="bg-hero-bg pt-28 pb-16 px-4 text-center hero-bg">
        <div className="reveal">
          <p className="font-script text-honey text-2xl mb-2">Workspace</p>
          <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">Admin <em className="text-honey not-italic">Dashboard</em></h1>
          <p className="font-body text-biscuit/80 max-w-lg mx-auto leading-relaxed">Manage your kitchen, track orders, and curate your artisan menu with ease.</p>
        </div>
      </section>

      {/* Tabs / Navigation */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-xl p-2.5 flex flex-wrap gap-2 border border-biscuit">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'menu', label: 'Manage Menu' },
            { id: 'curation', label: 'Home Curation' },
            { id: 'orders', label: 'Orders' },
            { id: 'messages', label: 'Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-grow sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] font-bold text-sm tracking-wide transition-all",
                activeTab === tab.id 
                  ? "bg-espresso text-honey shadow-lg scale-[1.02]" 
                  : "text-mocha/60 hover:bg-biscuit/20"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-16">
        {/* Tab Content Rendering */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            
            {/* Revenue Overview Alert */}
            <div className="bg-green-50 border border-green-100 rounded-3xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-green-800 font-body">
                <span className="font-bold">Note:</span> Revenue figures below are calculated <span className="font-bold uppercase underline">only</span> from <span className="text-green-600">"Delivered"</span> orders.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-biscuit shadow-sm flex items-center gap-6 hover:shadow-xl transition-all group">
                  <div className={cn("w-16 h-16 rounded-[1.2rem] flex items-center justify-center transition-transform group-hover:scale-110", s.color)}>
                    <s.icon className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-mocha/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 truncate">{s.label}</p>
                    <p className="text-2xl font-display font-bold text-espresso truncate">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Breakdown */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-2xl text-espresso">Order Status Breakdown</h2>
                <div className="h-px flex-grow bg-biscuit/30"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { status: 'pending', label: 'Pending', count: statusCounts.pending, color: 'bg-amber-50 text-amber-600 border-amber-100', icon: '⏳' },
                  { status: 'preparing', label: 'Prepared', count: statusCounts.preparing, color: 'bg-blue-50 text-blue-600 border-blue-100', icon: '👩‍🍳' },
                  { status: 'ready', label: 'Ready', count: statusCounts.ready, color: 'bg-purple-50 text-purple-600 border-purple-100', icon: '✨' },
                  { status: 'delivered', label: 'Delivered', count: statusCounts.delivered, color: 'bg-green-50 text-green-600 border-green-100', icon: '✅' },
                  { status: 'cancelled', label: 'Canceled', count: statusCounts.cancelled, color: 'bg-red-50 text-red-600 border-red-100', icon: '❌' },
                ].map((item) => (
                  <div key={item.status} className={cn("p-6 rounded-[2rem] border transition-all hover:shadow-md text-center", item.color)}>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-2xl font-display font-bold mb-1">{item.count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-biscuit shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-biscuit flex justify-between items-center">
                     <h2 className="font-display text-2xl text-espresso">Recent Orders</h2>
                     <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-caramel hover:text-rust underline underline-offset-4">View All Activities</button>
                  </div>
                  <div className="p-8">
                     {orders.length > 0 ? (
                        <div className="space-y-4">
                           {orders.slice(0, 5).map(order => (
                              <div key={order.id} className="flex items-center justify-between p-5 bg-cream/30 rounded-3xl border border-biscuit hover:border-caramel/30 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-caramel/10 flex items-center justify-center text-caramel text-lg shadow-inner">🛒</div>
                                    <div>
                                       <p className="text-sm font-bold text-espresso">Order #{order.id.slice(-6)}</p>
                                       <p className="text-[10px] text-mocha/40 font-bold uppercase tracking-widest">{order.items.length} items • ৳{order.totalAmount.toLocaleString()}</p>
                                    </div>
                                 </div>
                                 <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                    order.status === 'pending' && 'bg-amber-50 text-amber-600 border-amber-100',
                                    order.status === 'preparing' && 'bg-blue-50 text-blue-600 border-blue-100',
                                    order.status === 'ready' && 'bg-purple-50 text-purple-600 border-purple-100',
                                    order.status === 'delivered' && 'bg-green-50 text-green-600 border-green-100',
                                    order.status === 'cancelled' && 'bg-red-50 text-red-600 border-red-100'
                                 )}>{order.status === 'preparing' ? 'Prepared' : order.status === 'cancelled' ? 'Canceled' : order.status}</span>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-16 opacity-30">
                           <Package className="w-16 h-16 mx-auto mb-4 text-mocha" />
                           <p className="text-sm font-bold tracking-[0.2em] uppercase text-mocha">No activity recorded yet</p>
                        </div>
                     )}
                  </div>
               </div>
               
               <div className="space-y-8">
                  <div className="bg-espresso text-cream p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
                     <h3 className="font-display text-3xl mb-8 relative z-10 text-honey">Quick Launch</h3>
                     <div className="space-y-4 relative z-10">
                        <button onClick={() => {setActiveTab('menu'); setIsAddingItem(true);}} className="w-full bg-caramel text-cream font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-3 hover:bg-caramel/90 transition-all active:scale-95 shadow-lg">
                           <Plus className="w-5 h-5" /> Add Menu Item
                        </button>
                        <button className="w-full bg-white/5 hover:bg-white/10 text-cream/70 font-bold py-4 rounded-2xl text-sm transition-all border border-white/10">
                           Full Inventory Check
                        </button>
                     </div>
                  </div>

                  <div className="bg-rust text-cream p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                     <h3 className="font-display text-2xl mb-3">Kitchen Alert</h3>
                     <p className="text-white/70 text-xs font-body mb-8 leading-relaxed">System identified 3 ingredients that might need restocking for upcoming pre-orders.</p>
                     <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-rust bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold">📦</div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* Home Curation Tab */}
        {activeTab === 'curation' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
            {/* Hero Banners Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="font-display text-3xl text-espresso mb-1">Hero Banners</h2>
                  <p className="text-mocha/40 text-sm font-body">Manage the large images and text displayed in your homepage hero section.</p>
                </div>
                <button 
                  onClick={() => setIsAddingCuration(true)}
                  className="bg-caramel text-cream font-bold px-8 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-mocha transition-all w-full md:w-auto"
                >
                  <Plus className="w-5 h-5" /> Add New Banner
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curationItems.map((item, idx) => (
                  <div key={item.id} className="bg-white p-4 rounded-[2.5rem] border border-biscuit shadow-sm flex flex-col group relative overflow-hidden">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-biscuit shadow-inner">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2 mb-4">
                      <h3 className="font-display text-lg text-espresso truncate">{item.title || 'Untitled Banner'}</h3>
                      <p className="text-mocha/40 text-[10px] font-body truncate">{item.subtitle || 'No subtitle provided'}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => moveCuration(idx, 'up')}
                        disabled={idx === 0}
                        className="p-2.5 bg-cream/30 hover:bg-cream rounded-xl disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="w-4 h-4 text-mocha" />
                      </button>
                      <button 
                        onClick={() => moveCuration(idx, 'down')}
                        disabled={idx === curationItems.length - 1}
                        className="p-2.5 bg-cream/30 hover:bg-cream rounded-xl disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="w-4 h-4 text-mocha" />
                      </button>
                      <button 
                        onClick={() => removeCuration(item.id)}
                        className="ml-auto p-2.5 bg-red-50 hover:bg-red-100 text-red-400 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute top-4 right-4 bg-espresso/80 backdrop-blur-sm text-honey px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                       Pos: {idx + 1}
                    </div>
                  </div>
                ))}
                
                {curationItems.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border-2 border-dashed border-biscuit flex flex-col items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-mocha/20 mb-4" />
                    <p className="text-mocha/40 font-bold uppercase tracking-widest text-xs">No banners set for the homepage</p>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-biscuit/40 w-full"></div>

            {/* Featured Products Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="font-display text-3xl text-espresso mb-1">Featured Products</h2>
                  <p className="text-mocha/40 text-sm font-body">Manage specific products to showcase in the "Signature Baked Goods" section.</p>
                </div>
                <div className="bg-honey/10 px-6 py-3 rounded-2xl border border-honey/20">
                  <p className="text-xs font-bold text-caramel uppercase tracking-widest">
                    Featured: <span className="text-espresso">{menuItems.filter(i => i.featured).length}</span>
                  </p>
                </div>
              </div>

              {/* Reorderable Featured List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-cream/50 p-8 rounded-[3rem] border border-dashed border-biscuit">
                {menuItems.filter(i => i.featured).sort((a,b) => (a.featuredOrder || 0) - (b.featuredOrder || 0)).map((item, idx, arr) => (
                  <div key={item.id} className="bg-white p-4 rounded-[2rem] border border-caramel/20 shadow-lg relative group overflow-hidden">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-biscuit shadow-inner">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="px-2 mb-3">
                      <h3 className="font-display text-espresso truncate text-sm">{item.name}</h3>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => moveFeaturedProduct(idx, 'up')}
                         disabled={idx === 0}
                         className="flex-1 py-2 bg-cream/30 hover:bg-cream rounded-xl disabled:opacity-30 transition-colors flex items-center justify-center"
                       >
                          <ArrowUp className="w-3 h-3 text-mocha" />
                       </button>
                       <button 
                         onClick={() => moveFeaturedProduct(idx, 'down')}
                         disabled={idx === arr.length - 1}
                         className="flex-1 py-2 bg-cream/30 hover:bg-cream rounded-xl disabled:opacity-30 transition-colors flex items-center justify-center"
                       >
                          <ArrowDown className="w-3 h-3 text-mocha" />
                       </button>
                       <button 
                         onClick={() => handleToggleFeatured(item)}
                         className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                         title="Unfeature"
                       >
                          <Trash2 className="w-3 h-3" />
                       </button>
                    </div>
                    <div className="absolute top-4 left-4 bg-caramel text-cream px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest">
                       Pin {idx + 1}
                    </div>
                  </div>
                ))}
                
                {menuItems.filter(i => i.featured).length === 0 && (
                  <div className="col-span-full py-10 text-center opacity-40">
                    <p className="text-xs font-bold uppercase tracking-widest">No featured items selected yet.</p>
                  </div>
                )}
              </div>

              <div className="pt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-grow bg-biscuit/40"></div>
                  <h3 className="font-display text-xl text-espresso/40">All Menu Items</h3>
                  <div className="h-px flex-grow bg-biscuit/40"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {menuItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "relative bg-white p-4 rounded-[2rem] border transition-all duration-300",
                        item.featured ? "border-caramel ring-4 ring-caramel/5 shadow-xl opacity-60" : "border-biscuit hover:border-caramel/30"
                      )}
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-biscuit shadow-inner">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-display text-lg text-espresso truncate mb-4">{item.name}</h3>
                      <button 
                        onClick={() => handleToggleFeatured(item)}
                        className={cn(
                          "w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                          item.featured 
                            ? "bg-cream text-mocha/30 border border-biscuit" 
                            : "bg-caramel text-cream shadow-md hover:bg-rust"
                        )}
                      >
                        {item.featured ? 'Remove from Home' : 'Feature Product'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs remain similar in content but adjusted for full width */}
        {activeTab === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-mocha/40" />
                <input 
                  type="text" 
                  placeholder="Seach menu items..." 
                  className="w-full pl-14 pr-6 py-4 bg-white border border-biscuit rounded-2xl outline-none focus:ring-4 focus:ring-caramel/10 focus:border-caramel transition-all text-sm font-body"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsAddingItem(true)}
                className="bg-espresso text-honey font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-mocha transition-all w-full md:w-auto"
              >
                <Plus className="w-5 h-5" /> Craft New Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-[2.5rem] border border-biscuit shadow-sm group hover:shadow-2xl transition-all"
                >
                  <div className="flex gap-6 mb-6">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 border border-biscuit shadow-inner">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-display text-xl text-espresso truncate mb-1">{item.name}</h3>
                      <p className="text-rust font-bold text-xl mb-3">৳{item.price.toLocaleString()}</p>
                      <div className="flex flex-wrap gap-2">
                         <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest border border-green-100">Live</span>
                         {item.featured && <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-widest border border-orange-100">Featured</span>}
                         {item.ribbon === 'SPECIAL' && <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-[9px] font-bold uppercase tracking-widest border border-purple-100">Special</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-mocha/60 text-xs font-body line-clamp-2 mb-8 min-h-[32px]">{item.shortDesc}</p>
                     <div className="flex gap-3 pt-6 border-t border-biscuit/40">
                        {deletingId === item.id ? (
                           <div className="flex-1 flex gap-2 animate-in fade-in zoom-in duration-200">
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                              >
                                 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                              </button>
                              <button 
                                onClick={() => setDeletingId(null)}
                                disabled={isDeleting}
                                className="px-4 py-3 bg-gray-100 text-mocha/60 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                              >
                                 Cancel
                              </button>
                           </div>
                        ) : (
                           <>
                              <button 
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsAddingItem(true);
                                }}
                                className="flex-1 py-3 text-xs font-bold text-mocha/70 hover:bg-cream/50 rounded-xl transition-all flex items-center justify-center gap-2 border border-biscuit"
                              >
                                 <Edit2 className="w-4 h-4" /> Edit Details
                              </button>
                              <button 
                                onClick={() => setDeletingId(item.id)} 
                                className="w-12 h-12 flex items-center justify-center border border-red-100 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete Product"
                              >
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </>
                        )}
                     </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="font-display text-3xl text-espresso mb-1">Kitchen Flow</h2>
                  <p className="text-mocha/40 text-sm font-body">Manage pending bakes and delivery logistics</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="p-4 bg-white border border-biscuit rounded-2xl text-mocha/40 hover:text-caramel hover:border-caramel/30 transition-all active:scale-95 shadow-sm"
                  >
                    <RefreshCw className={cn("w-6 h-6", isRefreshing && "animate-spin")} />
                  </button>
                  <button 
                    onClick={() => setIsAddingOrder(true)}
                    className="flex-grow md:flex-initial bg-caramel text-cream font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-caramel/90 active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Record Offline Order
                  </button>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-biscuit shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left font-body">
                      <thead>
                         <tr className="bg-cream/30 text-[10px] font-bold text-mocha/40 uppercase tracking-[0.2em]">
                            <th className="px-10 py-6">ID & Status</th>
                            <th className="px-10 py-6">Customer Profile</th>
                            <th className="px-10 py-6">Delivery Address</th>
                            <th className="px-10 py-6 text-right">Summary</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-biscuit/40">
                         {orders.map(order => (
                            <tr key={order.id} className="hover:bg-cream/20 transition-colors group">
                               <td className="px-10 py-8">
                                  <div className="flex flex-col gap-3">
                                     <span className="text-[10px] text-mocha/30 font-mono tracking-widest uppercase">#{order.id.slice(-8)}</span>
                                     <select 
                                        value={order.status}
                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                        className={cn(
                                           "w-max px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border-0 outline-none cursor-pointer transition-all shadow-sm",
                                           order.status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                                           order.status === 'preparing' ? 'bg-blue-50 text-blue-600' :
                                           order.status === 'ready' ? 'bg-purple-50 text-purple-600' :
                                           order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        )}
                                     >
                                        <option value="pending">Pending</option>
                                        <option value="preparing">Prepared</option>
                                        <option value="ready">Ready</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Canceled</option>
                                     </select>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="flex flex-col gap-2">
                                     <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-espresso">{order.userName || 'Guest'}</span>
                                        {order.userId !== 'guest' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                                     </div>
                                     <div className="flex items-center gap-2 text-[10px] text-mocha/60">
                                        <span className="bg-biscuit/20 px-2 py-0.5 rounded-md">{order.phoneNumber || 'No Phone'}</span>
                                        <span className="truncate max-w-[120px]">{order.userEmail}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <p className="text-xs text-mocha/70 font-body leading-relaxed line-clamp-2 max-w-[200px]" title={order.location}>
                                     {order.location}
                                  </p>
                               </td>
                               <td className="px-10 py-8 text-right">
                                  <div className="flex flex-col items-end">
                                     <span className="text-lg font-display font-bold text-rust">৳{order.totalAmount.toLocaleString()}</span>
                                     <span className="text-[10px] text-mocha/30 uppercase tracking-widest">{order.items.length} items</span>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                {orders.length === 0 && (
                   <div className="py-20 text-center">
                      <ShoppingBag className="w-16 h-16 text-biscuit mx-auto mb-4 opacity-40" />
                      <p className="text-mocha/40 font-bold uppercase tracking-widest text-xs">No orders waiting in queue</p>
                   </div>
                )}
             </div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="font-display text-3xl text-espresso mb-1">Customer Inquiries</h2>
                <p className="text-mocha/40 text-sm font-body">Manage messages and orders enquiries</p>
              </div>
              <button 
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-4 bg-white border border-biscuit rounded-2xl text-mocha/40 hover:text-caramel transition-all shadow-sm"
              >
                <RefreshCw className={cn("w-6 h-6", isRefreshing && "animate-spin")} />
              </button>
            </div>

            <div className="grid gap-6">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-white rounded-[2rem] border border-biscuit shadow-sm overflow-hidden hover:border-caramel/30 transition-all">
                  <div className="p-8">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-caramel/10 flex items-center justify-center text-xl shadow-inner">
                          {inquiry.userId === 'guest' ? '👤' : '⭐'}
                        </div>
                        <div>
                          <h3 className="font-display text-lg text-espresso">{inquiry.name}</h3>
                          <p className="text-[10px] text-mocha/40 font-bold uppercase tracking-widest">{inquiry.email} • {inquiry.phone || 'No Phone'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          inquiry.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'
                        )}>
                          {inquiry.status}
                        </span>
                        <button 
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-cream/30 p-6 rounded-2xl border border-biscuit">
                        <p className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest mb-2">Subject: {inquiry.subject}</p>
                        <p className="text-sm text-espresso font-body leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                        <p className="text-[10px] text-mocha/30 mt-4 text-right">{formatDate(inquiry.createdAt)}</p>
                      </div>

                      {inquiry.adminReply ? (
                        <div className="bg-caramel/5 p-6 rounded-2xl border border-caramel/20 ml-8 relative">
                          <div className="absolute -left-3 top-6 w-3 h-3 bg-caramel/10 border-l border-t border-caramel/20 rotate-45"></div>
                          <p className="text-[10px] font-bold text-caramel uppercase tracking-widest mb-2">Your Reply:</p>
                          <p className="text-sm text-espresso font-body leading-relaxed whitespace-pre-wrap">{inquiry.adminReply}</p>
                          <div className="flex justify-between items-center mt-4">
                             <button 
                               onClick={() => {
                                 setActiveInquiry(inquiry);
                                 setReplyText(inquiry.adminReply || '');
                               }}
                               className="text-[10px] font-bold text-caramel hover:underline uppercase tracking-widest"
                             >
                               Edit Reply
                             </button>
                             <p className="text-[10px] text-mocha/30 text-right">{formatDate(inquiry.repliedAt)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button 
                            onClick={() => setActiveInquiry(inquiry)}
                            className="bg-espresso text-honey font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2 hover:bg-mocha transition-all shadow-md"
                          >
                            <MessageSquare className="w-4 h-4" /> Reply Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {inquiries.length === 0 && (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-biscuit py-20 text-center">
                  <MessageSquare className="w-16 h-16 text-biscuit mx-auto mb-4 opacity-40" />
                  <p className="text-mocha/40 font-bold uppercase tracking-widest text-xs">No customer inquiries yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isAddingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm" onClick={() => {if(!isUploading && !successMessage){setIsAddingItem(false); setEditingItem(null);}}}>
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-[1.5rem] w-full max-w-[420px] shadow-2xl relative overflow-hidden"
                onClick={e => e.stopPropagation()}
             >
                {/* Progress Bar */}
                {isUploading && (
                  <div className="absolute top-0 left-0 h-1 bg-caramel transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                )}

                <div className="p-6">
                  {successMessage ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                      <h3 className="font-display text-2xl text-espresso">{successMessage}</h3>
                      <p className="text-mocha/40 text-sm font-body animate-pulse">Refreshing menu...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-5">
                         <h2 className="font-display text-xl text-espresso">{editingItem ? 'Update Item' : 'New Artisan Creation'}</h2>
                         <button onClick={() => {setIsAddingItem(false); setEditingItem(null);}} className="p-2 hover:bg-cream rounded-lg transition-colors"><X className="w-5 h-5 text-mocha/40" /></button>
                      </div>
                      
                      <form className="space-y-4" onSubmit={handleSubmit}>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Product Name</label>
                               <input 
                                 type="text" 
                                 required 
                                 className="w-full px-3 py-2 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel text-sm focus:bg-white transition-all shadow-sm" 
                                 placeholder="e.g. Choco Fudge" 
                                 value={formData.name}
                                 onChange={e => setFormData({...formData, name: e.target.value})}
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Price (৳)</label>
                               <input 
                                  type="number" 
                                  required 
                                  className="w-full px-3 py-2 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel font-bold text-rust text-sm focus:bg-white transition-all shadow-sm" 
                                  placeholder="00" 
                                  value={formData.price}
                                  onChange={e => setFormData({...formData, price: e.target.value})}
                               />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Category</label>
                               <select 
                                  className="w-full px-3 py-2 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel text-sm appearance-none cursor-pointer focus:bg-white transition-all shadow-sm"
                                  value={formData.category}
                                  onChange={e => setFormData({...formData, category: e.target.value})}
                               >
                                  <option>Cakes</option>
                                  <option>Cookies</option>
                                  <option>Pastries</option>
                                  <option>Breads</option>
                                  <option>Muffins</option>
                                  <option>Specials</option>
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Settings</label>
                                <div className="flex flex-col gap-2 p-2 bg-cream/30 border border-biscuit rounded-xl">
                                   <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    id="featured"
                                    className="w-4 h-4 rounded border-biscuit text-caramel focus:ring-caramel"
                                    checked={formData.featured}
                                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                                  />
                                      <label htmlFor="featured" className="text-[10px] font-bold text-mocha/60 cursor-pointer select-none">Featured Item</label>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        id="isSpecial"
                                        className="w-4 h-4 rounded border-biscuit text-rust focus:ring-rust"
                                        checked={formData.isSpecial}
                                        onChange={e => setFormData({...formData, isSpecial: e.target.checked})}
                                      />
                                      <label htmlFor="isSpecial" className="text-[10px] font-bold text-mocha/60 cursor-pointer select-none">Today's Special</label>
                                   </div>
                                </div>
                             </div>
                          </div>

                         <div className="space-y-1">
                            <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Image Representation</label>
                            <div className="flex gap-3 items-center p-3 bg-cream/20 border border-dashed border-biscuit rounded-2xl group transition-all hover:bg-cream/40">
                              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner border border-biscuit group-hover:scale-105 transition-transform">
                                {imagePreview ? (
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-mocha/20" />
                                )}
                              </div>
                              <div className="flex-col flex gap-1.5 min-w-0">
                                <label className="cursor-pointer bg-espresso text-honey px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-mocha transition-all inline-flex items-center gap-2 w-max shadow-md active:scale-95">
                                   <Upload className="w-3.5 h-3.5" />
                                   {imageFile ? 'Change' : 'Upload'}
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                     handleImageChange(e);
                                   }} />
                                </label>
                                {imageFile ? (
                                  <span className="text-[8px] text-green-600 font-bold truncate max-w-[120px] flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> {imageFile.name}
                                  </span>
                                ) : (
                                  <span className="text-[8px] text-mocha/40">Rec: Square JPG/PNG</span>
                                )}
                              </div>
                            </div>
                         </div>

                         <div className="space-y-1">
                            <input 
                              type="url" 
                              className="w-full px-3 py-2.5 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel text-[10px] font-mono focus:bg-white transition-all shadow-sm" 
                              placeholder="...or paste external URL" 
                              value={formData.img}
                              onChange={e => {
                                setFormData({...formData, img: e.target.value});
                                if (!imageFile) setImagePreview(e.target.value);
                              }}
                            />
                         </div>

                         <div className="space-y-1">
                            <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Marketing Hook</label>
                            <textarea 
                              rows={2} 
                              className="w-full px-3 py-2.5 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel resize-none text-xs font-body focus:bg-white transition-all shadow-sm" 
                              placeholder="Brief description..."
                              value={formData.shortDesc}
                              onChange={e => setFormData({...formData, shortDesc: e.target.value})}
                            ></textarea>
                         </div>

                         {errorStatus && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                              className="text-[10px] text-red-500 font-bold text-center bg-red-50 py-2.5 rounded-xl border border-red-100"
                            >
                              ⚠️ {errorStatus}
                            </motion.div>
                         ) }
                         
                         <button 
                            type="submit" 
                            disabled={isUploading}
                            className="w-full bg-caramel text-cream font-bold py-3.5 rounded-xl shadow-lg hover:bg-rust active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
                         >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                            {isUploading ? `Uploading...` : (editingItem ? 'Save Updates' : 'Publish Creation')}
                         </button>
                      </form>
                    </>
                  )}
                </div>
             </motion.div>
          </div>
        )}
        {isAddingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-espresso/40 backdrop-blur-md overflow-y-auto" onClick={() => setIsAddingOrder(false)}>
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 relative"
                onClick={e => e.stopPropagation()}
             >
                <div className="flex justify-between items-center mb-8">
                   <h2 className="font-display text-2xl text-espresso">New Manual Order</h2>
                   <button onClick={() => setIsAddingOrder(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <form className="space-y-6" onSubmit={handleManualOrderSubmit}>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-caramel" 
                        placeholder="e.g. Rahim Ahmed" 
                        value={orderFormData.customerName}
                        onChange={e => setOrderFormData({...orderFormData, customerName: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Phone</label>
                      <input 
                        type="tel" 
                        required 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-caramel" 
                        placeholder="01XXXXXXXXX" 
                        value={orderFormData.phoneNumber}
                        onChange={e => setOrderFormData({...orderFormData, phoneNumber: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Total Amount (৳)</label>
                      <input 
                        type="number" 
                        required 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-caramel font-bold text-rust" 
                        placeholder="e.g. 1200" 
                        value={orderFormData.totalAmount}
                        onChange={e => setOrderFormData({...orderFormData, totalAmount: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery Address</label>
                      <textarea 
                        rows={3} 
                        required
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-caramel resize-none" 
                        placeholder="Customer address..."
                        value={orderFormData.location}
                        onChange={e => setOrderFormData({...orderFormData, location: e.target.value})}
                      ></textarea>
                   </div>
                   
                   <button type="submit" className="w-full bg-espresso text-cream font-bold py-5 rounded-2xl shadow-xl hover:bg-mocha active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      <ShoppingBag className="w-5 h-5" /> Save Order
                   </button>
                </form>
             </motion.div>
          </div>
        )}

        {activeInquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm" onClick={() => setActiveInquiry(null)}>
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
             >
                <div className="p-8 border-b border-biscuit flex justify-between items-center">
                   <h2 className="font-display text-xl text-espresso">Reply to Enquiry</h2>
                   <button onClick={() => setActiveInquiry(null)} className="p-2 hover:bg-cream rounded-lg transition-colors"><X className="w-5 h-5 text-mocha/40" /></button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="bg-cream/30 p-5 rounded-2xl border border-biscuit text-sm">
                      <p className="font-bold text-espresso mb-1">{activeInquiry.name} wrote:</p>
                      <p className="text-mocha/70 italic">"{activeInquiry.message}"</p>
                   </div>

                   <form onSubmit={handleReplySubmit} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-mocha/40 uppercase tracking-widest pl-1">Your Remark / Response</label>
                         <textarea 
                            rows={5} 
                            required
                            className="w-full px-5 py-4 bg-cream/30 border border-biscuit rounded-2xl outline-none focus:border-caramel focus:bg-white transition-all text-sm resize-none" 
                            placeholder="Type your reply here..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                         ></textarea>
                      </div>

                      {successMessage && (
                        <div className="text-center py-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold border border-green-100">
                          {successMessage}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={isReplying || !replyText.trim()}
                        className="w-full bg-caramel text-cream font-bold py-4 rounded-2xl shadow-xl hover:bg-rust active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                         {isReplying ? 'Sending...' : 'Send Reply'}
                      </button>
                   </form>
                </div>
             </motion.div>
          </div>
        )}

        {isAddingCuration && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm" onClick={() => setIsAddingCuration(false)}>
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-[2rem] w-full max-w-[420px] shadow-2xl p-8 relative"
                onClick={e => e.stopPropagation()}
             >
                <div className="flex justify-between items-center mb-6">
                   <h2 className="font-display text-xl text-espresso">Add Hero Banner</h2>
                   <button onClick={() => setIsAddingCuration(false)} className="p-2 hover:bg-cream rounded-lg transition-colors"><X className="w-5 h-5 text-mocha/40" /></button>
                </div>
                
                <form className="space-y-4" onSubmit={handleCurationSubmit}>
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Main Heading (Title)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel text-sm" 
                        placeholder="e.g. Artisan Breads" 
                        value={curationFormData.title}
                        onChange={e => setCurationFormData({...curationFormData, title: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Subtext (Subtitle)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel text-sm" 
                        placeholder="e.g. Crafted with sourdough..." 
                        value={curationFormData.subtitle}
                        onChange={e => setCurationFormData({...curationFormData, subtitle: e.target.value})}
                      />
                   </div>

                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-mocha/40 uppercase tracking-widest ml-1">Banner Image</label>
                      <div className="flex gap-3 items-center p-3 bg-cream/20 border border-dashed border-biscuit rounded-2xl group transition-all hover:bg-cream/40">
                        <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner border border-biscuit">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-mocha/20" />
                          )}
                        </div>
                        <div className="flex-col flex gap-1.5 min-w-0">
                          <label className="cursor-pointer bg-espresso text-honey px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-mocha transition-all inline-flex items-center gap-2 w-max shadow-md">
                             <Upload className="w-3.5 h-3.5" />
                             {imageFile ? 'Change' : 'Upload Image'}
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                          </label>
                          {imageFile ? (
                            <span className="text-[8px] text-green-600 font-bold truncate max-w-[120px]">✓ {imageFile.name}</span>
                          ) : (
                            <span className="text-[8px] text-mocha/40">Rec: 1920x1080</span>
                          )}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <input 
                        type="url" 
                        className="w-full px-3 py-2 bg-cream/30 border border-biscuit rounded-xl outline-none focus:border-caramel text-[10px]" 
                        placeholder="...or paste absolute image URL" 
                        value={curationFormData.imageUrl}
                        onChange={e => {
                          setCurationFormData({...curationFormData, imageUrl: e.target.value});
                          if (!imageFile) setImagePreview(e.target.value);
                        }}
                      />
                   </div>
                   
                   <button 
                      type="submit" 
                      disabled={isUploading}
                      className="w-full bg-caramel text-cream font-bold py-3.5 rounded-xl shadow-lg hover:bg-rust active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
                   >
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                      {isUploading ? 'Uploading...' : 'Add to Homepage'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
