import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS, Product } from '../data/products';
import { getProducts, createProduct } from '../services/productService';
import { Star, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import ProductModal from '../components/ProductModal';

export default function Menu() {
  const { addToCart } = useCart();
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        let items = await getProducts();
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [category, searchTerm, menuItems]);

  const categories = [
    { id: 'all', label: '🍽 All Items' },
    { id: 'cakes', label: '🎂 Cakes' },
    { id: 'pastries', label: '🥐 Pastries' },
    { id: 'cookies', label: '🍪 Cookies' },
    { id: 'breads', label: '🍞 Breads' },
    { id: 'muffins', label: '🧁 Muffins' },
    { id: 'specials', label: '⭐ Specials' },
  ];

  const filteredProducts = menuItems.filter(p => {
    const matchesCategory = category === 'all' || p.category.includes(category);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="z-content">
      {/* Hero */}
      <section className="bg-hero-bg pt-28 pb-16 px-4 text-center hero-bg">
        <p className="font-script text-honey text-2xl mb-2">Fresh from Our Oven</p>
        <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">Our <em className="text-honey not-italic">Menu</em></h1>
        <p className="font-body text-biscuit/80 max-w-lg mx-auto leading-relaxed">
          Explore our full range of handcrafted baked goods — made fresh daily with love.
        </p>
      </section>

      {/* Category Tabs & Search */}
      <div className="sticky top-16 md:top-20 z-40 bg-cream/95 backdrop-blur border-b border-biscuit shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setCategory(cat.id)} 
                className={cn(
                  "tab-btn text-xs font-bold font-body px-4 py-2 rounded-full border border-biscuit transition-all whitespace-nowrap",
                  category === cat.id ? "bg-espresso text-cream" : "hover:bg-espresso hover:text-cream"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mocha/40" />
            <input 
              type="text" 
              placeholder="Search menu..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-biscuit rounded-full text-sm font-body outline-none focus:border-caramel"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-14 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
             <Loader2 className="w-12 h-12 animate-spin text-espresso mb-4" />
             <p className="font-body text-sm tracking-widest uppercase">Fetching Menu...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="product-card bg-white rounded-3xl overflow-hidden shadow-md relative reveal cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {product.ribbon && <div className="ribbon">{product.ribbon}</div>}
                <div className="overflow-hidden h-52">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1 h-14">
                    <h3 className="font-display text-lg text-espresso leading-tight">{product.name}</h3>
                    <span className="text-rust font-bold font-body ml-2 shrink-0">৳{product.price}</span>
                  </div>
                  <p className="text-mocha/60 text-xs font-body mb-3">{product.shortDesc}</p>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-3 h-3 fill-current", i >= product.rating ? "text-gray-200 fill-none" : "text-yellow-400 fill-yellow-400")} />
                    ))}
                    <span className="text-mocha/50 text-xs font-body self-center ml-1">({product.reviews})</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="w-full bg-espresso hover:bg-mocha text-cream font-bold text-sm py-2.5 rounded-xl font-body active:scale-95 transition-transform"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽</p>
            <h3 className="font-display text-2xl text-espresso mb-2">No items found</h3>
            <button 
              onClick={() => { setCategory('all'); setSearchTerm(''); }}
              className="mt-4 bg-espresso text-cream px-6 py-3 rounded-full font-body font-bold text-sm hover:bg-mocha transition-colors"
            >
              View All Items
            </button>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}
