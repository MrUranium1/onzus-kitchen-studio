import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product, PRODUCTS } from '../data/products';
import { Star, ChevronRight, Heart, Sparkles, Clock, ShieldCheck, Home as HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getProducts } from '../services/productService';
import { getCurationItems, CurationItem } from '../services/curationService';

export default function Home() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [specialProducts, setSpecialProducts] = useState<Product[]>([]);
  const [curationItems, setCurationItems] = useState<CurationItem[]>([]);
  const [activeCurationIdx, setActiveCurationIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (curationItems.length > 1) {
      const interval = setInterval(() => {
        setActiveCurationIdx(prev => (prev + 1) % curationItems.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [curationItems]);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const [allProducts, fetchedCuration] = await Promise.all([
          getProducts(),
          getCurationItems()
        ]);
        
        // Filter featured items
        let featured = allProducts
          .filter(p => p.featured)
          .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
        
        // If DB is empty, use initial static products as a bridge
        if (allProducts.length === 0) {
          featured = PRODUCTS.filter(p => [1,4,8,14].includes(p.id));
        }
        
        setFeaturedProducts(featured);

        // Filter special category items
        let specials = allProducts.filter(p => 
          p.category?.toLowerCase() === 'specials' || 
          p.category?.toLowerCase() === 'special'
        );

        if (allProducts.length === 0) {
          specials = PRODUCTS.filter(p => p.ribbon === 'SPECIAL');
        }
        setSpecialProducts(specials);

        setCurationItems(fetchedCuration);
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeContent();

    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Remove: const featuredProducts = PRODUCTS.slice(0, 6);

  return (
    <div className="z-content">
      {/* Hero Section */}
      <section className="hero-bg hero-dots min-h-[90vh] flex items-center pt-20 pb-16 px-4">
        <div className="absolute top-20 left-10 w-64 h-64 bg-honey/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-caramel/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <p className="font-script text-honey text-xl md:text-2xl mb-3 opacity-90 tracking-wide">
              {curationItems.length > 0 ? curationItems[activeCurationIdx].subtitle : "Welcome to"}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-cream leading-tight mb-4">
              {curationItems.length > 0 ? curationItems[activeCurationIdx].title : <>Onzu's<br/>Kitchen</>}
            </h1>
            {!curationItems[activeCurationIdx]?.title && <p className="font-script text-biscuit text-2xl md:text-3xl mb-6">Freshly Baked with Love at Home</p>}
            <p className="font-body text-biscuit/80 text-base md:text-lg max-w-md mx-auto md:mx-0 leading-relaxed mb-8">
              Every loaf, cake, and cookie is baked fresh each morning in our cozy home kitchen in Dhaka — crafted with the finest ingredients and a whole lot of heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/menu" className="bg-honey hover:bg-honey/90 text-espresso font-bold text-sm px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 tracking-wide text-center">
                Browse Our Menu ↗
              </Link>
              <Link to="/about" className="border-2 border-cream/40 hover:border-cream text-cream font-bold text-sm px-8 py-4 rounded-full transition-all duration-200 hover:bg-cream/10 tracking-wide text-center">
                Our Story
              </Link>
            </div>

            {curationItems.length > 1 && (
              <div className="flex justify-center md:justify-start gap-3 mt-8">
                {curationItems.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveCurationIdx(idx)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      activeCurationIdx === idx ? "bg-honey w-8" : "bg-cream/20 hover:bg-cream/40"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-md">
              <div className="rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.35)] border-4 border-honey/30 aspect-square md:aspect-auto md:h-96 bg-espresso/10">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeCurationIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    src={curationItems.length > 0 ? curationItems[activeCurationIdx].imageUrl : "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80"} 
                    alt="Fresh baked goods" 
                    className="w-full h-full object-cover" 
                  />
                </AnimatePresence>
              </div>
              <div className="absolute -top-4 -right-4 bg-rust text-cream rounded-2xl p-3 shadow-xl text-center rotate-6 w-24">
                <Sparkles className="w-5 h-5 mx-auto mb-1" />
                <p className="text-[10px] font-bold font-body leading-tight">Baked Fresh Daily</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-espresso text-cream rounded-2xl p-3 shadow-xl text-center -rotate-3 w-24">
                <Heart className="w-5 h-5 mx-auto mb-1 fill-current" />
                <p className="text-[10px] font-bold font-body leading-tight">Made with Love</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="bg-honey py-3 overflow-hidden">
        <div className="marquee-track text-espresso font-body text-sm font-bold">
          {['Fresh Muffins', 'Custom Cakes', 'Homemade Cookies', 'Buttery Croissants', 'Artisan Breads', 'Classic Pastries', 'Blueberry Scones'].map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="px-6 flex items-center gap-2">🧁 {item}</span>
              <span className="px-3 opacity-40">✦</span>
            </React.Fragment>
          ))}
          {/* Repeating for loop */}
          {['Fresh Muffins', 'Custom Cakes', 'Homemade Cookies', 'Buttery Croissants', 'Artisan Breads', 'Classic Pastries', 'Blueberry Scones'].map((item, idx) => (
            <React.Fragment key={idx + 7}>
              <span className="px-6 flex items-center gap-2">🧁 {item}</span>
              <span className="px-3 opacity-40">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="font-script text-caramel text-xl mb-2">Our Specialties</p>
            <h2 className="font-display text-4xl md:text-5xl text-espresso mb-4">Signature <em>Baked Goods</em></h2>
            <p className="text-mocha/70 font-body max-w-xl mx-auto leading-relaxed">
              Each item is crafted in small batches so every bite is fresh, flavourful, and full of love.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-16 bg-caramel/40"></div>
              <span className="text-caramel text-xl">✦</span>
              <div className="h-px w-16 bg-caramel/40"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100"></div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product.id} className="product-card bg-white rounded-3xl overflow-hidden shadow-md relative reveal">
                  {product.ribbon && <div className="ribbon">{product.ribbon}</div>}
                  <div className="overflow-hidden h-56">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-display text-xl text-espresso">{product.name}</h3>
                        <p className="text-mocha/60 text-xs font-body mt-0.5">{product.shortDesc}</p>
                      </div>
                      <span className="text-rust font-bold font-body text-lg">৳{product.price}</span>
                    </div>
                    <div className="flex gap-1 mb-4 flex-wrap items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3 fill-current", i >= product.rating && "text-gray-200 fill-none")} />
                        ))}
                      </div>
                      <span className="text-mocha/50 text-xs font-body ml-1">({product.reviews})</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-espresso hover:bg-mocha text-cream font-bold text-sm py-3 rounded-xl font-body tracking-wide transition-all active:scale-95"
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-dashed border-biscuit">
                <p className="font-body text-mocha/50">Our kitchen is busy baking new featured items!</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12 reveal">
            <Link to="/menu" className="inline-flex items-center gap-2 bg-caramel hover:bg-mocha text-cream font-bold text-sm px-10 py-4 rounded-full font-body tracking-wide transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-xl">
              View Full Menu
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Today's Specials */}
      <section className="py-20 px-4 bg-honey/5 border-y border-honey/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="font-script text-rust text-xl mb-2">Limited Time Offers</p>
            <h2 className="font-display text-4xl md:text-5xl text-espresso mb-4">Today's <em>Specials</em></h2>
            <p className="text-mocha/70 font-body max-w-xl mx-auto leading-relaxed">
              Discover our exclusive seasonal treats and one-of-a-kind bakes, available only while stocks last.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-16 bg-rust/30"></div>
              <Sparkles className="text-rust w-5 h-5" />
              <div className="h-px w-16 bg-rust/30"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-honey/10"></div>
              ))
            ) : specialProducts.length > 0 ? (
              specialProducts.map((product) => (
                <div key={product.id} className="product-card bg-white rounded-3xl overflow-hidden shadow-md relative reveal group">
                  <div className="absolute top-4 left-4 z-10 bg-rust text-cream text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">
                    Special
                  </div>
                  <div className="overflow-hidden h-56 relative">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-display text-xl text-espresso group-hover:text-rust transition-colors">{product.name}</h3>
                        <p className="text-mocha/60 text-xs font-body mt-1 line-clamp-2">{product.shortDesc}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-rust font-bold font-body text-xl block">৳{product.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex text-honey">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3 fill-current", i >= product.rating && "text-gray-200 fill-none")} />
                        ))}
                      </div>
                      <span className="text-mocha/40 text-[10px] font-bold uppercase tracking-wider">Top Rated</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-caramel hover:bg-rust text-cream font-bold text-sm py-3.5 rounded-xl font-body tracking-widest uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-honey/10 rounded-[3rem] border-2 border-dashed border-honey/30">
                <div className="w-20 h-20 bg-honey/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-caramel opacity-40" />
                </div>
                <h3 className="font-display text-2xl text-espresso mb-2">No specials available right now</h3>
                <p className="font-body text-mocha/60 max-w-sm mx-auto">Our bakers are dreaming up something extraordinary. Check back soon for fresh seasonal surprises!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="py-20 px-4 bg-espresso relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-caramel/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-honey/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-14 reveal">
            <p className="font-script text-honey text-xl mb-2">Why Families Love Us</p>
            <h2 className="font-display text-4xl md:text-5xl text-cream mb-4">The <em>Onzu's Kitchen</em> Promise</h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-16 bg-caramel/60"></div>
              <span className="text-honey text-xl">✦</span>
              <div className="h-px w-16 bg-caramel/60"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: 'Baked Fresh Daily', desc: 'Every item leaves our oven the same morning it reaches your door. No day-old goods — ever.' },
              { icon: HomeIcon, title: '100% Homemade', desc: 'Made from scratch in a real home kitchen. No factory shortcuts — just tried-and-true family recipes.' },
              { icon: ShieldCheck, title: 'Hygienic & Safe', desc: 'We follow strict food-safety practices. Packaging is clean, sealed, and tamper-proof.' },
              { icon: Clock, title: 'Custom Orders', desc: 'Birthdays, weddings, or gifting — we take custom orders with personalised messages.' }
            ].map((p, i) => (
              <div key={i} className="bg-mocha/40 border border-caramel/20 rounded-3xl p-6 text-center reveal hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-honey/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-7 h-7 text-honey" />
                </div>
                <h3 className="font-display text-xl text-cream mb-2">{p.title}</h3>
                <p className="text-biscuit/70 text-sm font-body leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
