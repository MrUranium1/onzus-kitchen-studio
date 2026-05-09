import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream pt-14 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧁</span>
              <span className="font-script text-2xl text-honey">Onzu's Kitchen</span>
            </div>
            <p className="font-body text-biscuit/60 text-sm leading-relaxed mb-5 max-w-xs">
              A cozy home bakery in Dhaka, crafting fresh baked goods daily with premium ingredients and family recipes passed down with love.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-mocha hover:bg-caramel rounded-xl flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-mocha hover:bg-caramel rounded-xl flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/8801719262956" className="w-9 h-9 bg-mocha hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-honey mb-4">Quick Links</h4>
            <ul className="space-y-2 font-body text-sm text-biscuit/60">
              <li><Link to="/" className="hover:text-honey transition-colors">🏠 Home</Link></li>
              <li><Link to="/menu" className="hover:text-honey transition-colors">🧁 Menu</Link></li>
              <li><Link to="/about" className="hover:text-honey transition-colors">💛 About Us</Link></li>
              <li><Link to="/gallery" className="hover:text-honey transition-colors">📸 Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-honey transition-colors">📞 Contact</Link></li>
              <li><Link to="/cart" className="hover:text-honey transition-colors">🛒 Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-honey mb-4">Get in Touch</h4>
            <ul className="space-y-3 font-body text-sm text-biscuit/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Mohammadpur, Dhaka 1207, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+8801719262956" className="hover:text-honey transition-colors">+880 1719-262956</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:hello@onzuskitchen.com" className="hover:text-honey transition-colors">hello@onzuskitchen.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Orders: 8 AM – 8 PM daily</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-mocha/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-body text-biscuit/40">
          <p>© 2025 Onzu's Kitchen. All rights reserved. Made with ❤️ in Dhaka.</p>
          <p>Freshly baked, freshly delivered.</p>
        </div>
      </div>
    </footer>
  );
}
