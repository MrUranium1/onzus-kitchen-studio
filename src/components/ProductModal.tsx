import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X } from 'lucide-react';
import { Product } from '../data/products';
import { cn } from '../lib/utils';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  return (
    <AnimatePresence>
      {product && (
        <div 
          className="fixed inset-0 z-[600] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-cream rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-biscuit flex justify-between items-center bg-white/50">
              <h3 className="font-display text-2xl text-espresso">{product.name}</h3>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full flex items-center justify-center text-mocha/70 hover:text-espresso hover:bg-biscuit/20 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-biscuit">
                  <img src={product.img} className="w-full h-full object-cover" alt={product.name}/>
                </div>
                
                <div className="flex flex-col">
                  <div>
                     <p className="text-3xl font-bold text-rust mb-3">৳{product.price}</p>
                     <div className="flex gap-1 mb-4 text-yellow-400">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={cn("w-4 h-4 fill-current", i >= product.rating && "text-gray-200 fill-none")} />
                       ))}
                       <span className="text-mocha/50 text-xs font-body ml-2 self-center">(Based on {product.reviews} reviews)</span>
                     </div>
                     <div className="h-px w-full bg-biscuit/30 mb-5"></div>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-mocha/80 leading-relaxed font-body text-sm mb-6">
                      {product.longDesc || "Freshly baked with love using our exclusive home recipes. Crafted with premium ingredients to ensure the perfect taste and texture."}
                    </p>
                    
                    {product.ribbon && (
                      <div className="inline-block bg-honey/20 text-caramel border border-honey/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                        {product.ribbon} Selection
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { onAddToCart(product); onClose(); }}
                    className="w-full bg-espresso hover:bg-mocha text-cream font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-xl hover:shadow-espresso/20 flex items-center justify-center gap-2"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
