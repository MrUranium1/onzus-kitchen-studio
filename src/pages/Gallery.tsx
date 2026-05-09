import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getProducts } from '../services/productService';

export default function Gallery() {
  const [filter, setCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<{ src: string, alt: string } | null>(null);
  const [images, setImages] = useState<{ cat: string, src: string, alt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const products = await getProducts();
        const productImages = products.map(p => ({
          cat: p.category,
          src: p.img,
          alt: p.name
        }));
        setImages(productImages);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const categories = [
    { id: 'all', label: '🖼 All' },
    { id: 'cakes', label: '🎂 Cakes' },
    { id: 'pastries', label: '🥐 Pastries' },
    { id: 'cookies', label: '🍪 Cookies' },
    { id: 'breads', label: '🍞 Breads' },
    { id: 'specials', label: '⭐ Specials' },
  ];

  const filteredImages = images.filter(img => filter === 'all' || img.cat.includes(filter));

  return (
    <div className="z-content">
      {/* Hero */}
      <section className="bg-hero-bg pt-28 pb-16 px-4 text-center hero-bg">
        <p className="font-script text-honey text-2xl mb-2">From Our Kitchen</p>
        <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">Photo <em className="text-honey not-italic">Gallery</em></h1>
        <p className="font-body text-biscuit/80 max-w-lg mx-auto leading-relaxed">A peek inside our world — from morning bakes to joyful deliveries.</p>
      </section>

      {/* Filter Tabs */}
      <div className="bg-cream border-b border-biscuit sticky top-16 md:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 py-4 whitespace-nowrap">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setCategory(cat.id)} 
                className={cn(
                  "px-6 py-2.5 rounded-full border border-biscuit text-xs font-bold font-body transition-all active:scale-95",
                  filter === cat.id ? "bg-espresso text-cream" : "bg-white text-espresso hover:bg-biscuit"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 min-h-[400px] flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-caramel animate-spin mb-4" />
            <p className="font-body text-mocha/50 font-bold tracking-widest uppercase text-xs">Loading Artisan Collection...</p>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img, idx) => (
                <motion.div 
                  key={img.src + idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-3xl cursor-pointer break-inside-avoid shadow-md border hover:shadow-2xl transition-all border-biscuit"
                  onClick={() => setSelectedImage(img)}
                >
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-auto object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 duration-300">
                    <p className="text-white font-display text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.alt}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center">
            <ImageIcon className="w-12 h-12 text-biscuit mx-auto mb-4 opacity-50" />
            <p className="font-body text-mocha/50">No images found for this category.</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-6 right-8 text-white hover:text-honey transition-colors z-[610]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-10 h-10" />
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.src.includes('firebasestorage') || selectedImage.src.includes('data:image') ? selectedImage.src : selectedImage.src.split('?')[0] + '?w=1200&q=90'} 
                alt={selectedImage.alt}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white/10"
              />
              <p className="mt-8 text-white font-display text-2xl bg-espresso/40 backdrop-blur px-8 py-3 rounded-full">{selectedImage.alt}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suggestion Section */}
      <section className="py-20 px-4 text-center bg-biscuit/20 border-t border-biscuit">
        <div className="max-w-xl mx-auto">
          <p className="font-script text-caramel text-xl mb-2">Like What You See?</p>
          <h2 className="font-display text-3xl text-espresso mb-8">Order Your Favourites Today</h2>
          <Link to="/menu" className="inline-flex items-center gap-3 bg-espresso text-cream font-bold text-sm px-10 py-4 rounded-full font-body tracking-wide hover:-translate-y-1 hover:bg-mocha transition-all shadow-lg active:scale-95">
            🧁 Browse Full Menu
          </Link>
        </div>
      </section>
    </div>
  );
}
