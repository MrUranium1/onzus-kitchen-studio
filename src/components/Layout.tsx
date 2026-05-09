import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { Send } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16 md:pt-20">
        <Outlet />
      </main>

      <Footer />
      
      <AuthModal />

      {/* Floating WhatsApp */}
      <a 
        href="https://wa.me/8801719262956" 
        target="_blank" 
        rel="noreferrer"
        className="wa-float fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <Send className="w-7 h-7 rotate-45" />
      </a>
    </div>
  );
}
