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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-cream flex items-center justify-center shadow-sm border-2 border-honey/20">
                <img 
                  src="https://scontent.fdac33-1.fna.fbcdn.net/v/t39.30808-6/470977332_122104213982660798_3500586346432379768_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=53a332&_nc_ohc=WNahI8lZD3IQ7kNvwHfn8IV&_nc_oc=AdoCQINqI7ll1YKgAVLroZeXi9nDJTDKt613UvvO7bkRGk5ZJcRhluxHqV6ahQapk8I&_nc_zt=23&_nc_ht=scontent.fdac33-1.fna&_nc_gid=NZnrTgTHNuYinWR8CwCHuw&_nc_ss=7b2a8&oh=00_Af5Fx-X_tMIQBkB61uwo5H6VMB_up7ou19E89Ubs5DI-Iw&oe=6A073C92" 
                  alt="Onzu's Kitchen Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/992/992717.png';
                  }}
                />
              </div>
              <span className="font-script text-2xl text-honey">Onzu's Kitchen</span>
            </div>
            <p className="font-body text-biscuit/60 text-sm leading-relaxed mb-5 max-w-xs">
              A cozy home bakery in Dhaka, crafting fresh baked goods daily with premium ingredients and family recipes passed down with love.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/onzuskitchen" target="_blank" rel="noreferrer" className="w-9 h-9 bg-mocha hover:bg-caramel rounded-xl flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/onzus_kitchen/" target="_blank" rel="noreferrer" className="w-9 h-9 bg-mocha hover:bg-caramel rounded-xl flex items-center justify-center transition-colors">
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
              <li><Link to="/" className="hover:text-honey transition-colors">Home</Link></li>
              <li><Link to="/menu" className="hover:text-honey transition-colors">Menu</Link></li>
              <li><Link to="/about" className="hover:text-honey transition-colors">About Us</Link></li>
              <li><Link to="/gallery" className="hover:text-honey transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-honey transition-colors">Contact</Link></li>
              <li><Link to="/cart" className="hover:text-honey transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-honey mb-4">Get in Touch</h4>
            <ul className="space-y-3 font-body text-sm text-biscuit/60">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Kazipara, Mirpur, Dhaka 1216, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+8801719262956" className="hover:text-honey transition-colors">+880 1719-262956</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:onzu080@gmail.com" className="hover:text-honey transition-colors">onzu080@gmail.com</a>
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
