import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User as UserIcon, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { getCartCount } = useCart();
  const { user, logout, openAuthModal, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
    ...(isAdmin ? [{ name: 'Admin Dashboard', href: '/admin/dashboard' }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      id="navbar" 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-cream/95 backdrop-blur shadow-sm py-2" : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md group-hover:scale-110 transition-transform bg-cream flex items-center justify-center border-2 border-caramel/20">
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
            <div className="leading-tight">
              <span className="font-script text-xl md:text-2xl text-espresso tracking-wide">Onzu's Kitchen</span>
              <p className="text-xs text-caramel font-body hidden sm:block" style={{ marginTop: '-3px' }}>Home Bakery · Dhaka</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 font-body text-sm font-bold text-mocha">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href} 
                className={cn(
                  "hover:text-rust transition-colors relative pb-0.5",
                  isActive(link.href) ? "text-rust border-b-2 border-rust" : ""
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/8801719262956" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-md"
            >
              <Send className="w-3 h-3 rotate-45" /> Order Now
            </a>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-biscuit rounded-full transition-colors group">
              <ShoppingCart className="w-6 h-6 text-espresso group-hover:text-rust transition-colors" />
              <span id="cart-count" className={cn(
                "absolute -top-1 -right-1 bg-rust text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center transition-transform",
                getCartCount() > 0 ? "scale-100" : "scale-0"
              )}>
                {getCartCount()}
              </span>
            </Link>

            {/* Account */}
            <div className="relative">
              <button 
                onClick={user ? () => setIsAccountDropdownOpen(!isAccountDropdownOpen) : openAuthModal}
                className="p-2 hover:bg-biscuit rounded-full transition-colors group flex items-center justify-center focus:outline-none"
              >
                {user ? (
                  <div className="w-7 h-7 rounded-full bg-caramel flex items-center justify-center shadow-md">
                    <span className="text-cream text-xs font-bold font-body">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                ) : (
                  <UserIcon className="w-6 h-6 text-espresso group-hover:text-rust transition-colors" />
                )}
              </button>

              {/* Account Dropdown */}
              {user && isAccountDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[190]" 
                    onClick={() => setIsAccountDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-cream rounded-2xl shadow-2xl border border-biscuit z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 bg-biscuit/50 border-b border-biscuit">
                      <p className="font-bold font-body text-espresso text-sm truncate">{user.name}</p>
                      <p className="text-mocha/50 text-xs font-body truncate">{user.email}</p>
                    </div>
                      <div className="py-2 text-sm font-bold text-mocha">
                        <Link 
                          to="/account" 
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="w-full text-left px-4 py-2.5 hover:bg-biscuit/60 transition-colors flex items-center gap-3"
                        >
                          My Account
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="w-full text-left px-4 py-2.5 hover:bg-biscuit/60 transition-colors flex items-center gap-3"
                        >
                          My Orders
                        </Link>
                        <div className="border-t border-biscuit mt-1 pt-1">
                          <button 
                            onClick={() => { logout(); setIsAccountDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-rust hover:bg-red-50 transition-colors flex items-center gap-3"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-biscuit transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-espresso" /> : <Menu className="w-6 h-6 text-espresso" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden bg-cream/95 backdrop-blur rounded-2xl mb-3 shadow-lg overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0"
        )}>
          <div className="px-4 flex flex-col gap-3 font-body text-mocha font-bold">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href} 
                className={cn(
                  "py-2 px-3 rounded-lg hover:bg-biscuit",
                  isActive(link.href) ? "bg-biscuit text-rust" : ""
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <>
                <Link 
                  to="/account" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-biscuit"
                >
                  My Account
                </Link>
                <Link 
                  to="/orders" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-biscuit"
                >
                  My Orders
                </Link>
              </>
            )}
            <a 
              href="https://wa.me/8801719262956" 
              target="_blank" 
              rel="noreferrer"
              className="py-2 px-3 rounded-lg bg-green-500 text-white flex items-center gap-2"
            >
              <Send className="w-4 h-4 rotate-45" /> WhatsApp Order
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
