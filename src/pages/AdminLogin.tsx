import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Sparkles, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithGoogle, loginWithEmail, user, isAdmin, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin/dashboard');
    } else if (!loading && user && !isAdmin) {
      setError('Access denied. You do not have admin privileges.');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in your Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid admin credentials.');
      } else if (err.message && err.message.includes('linked to a Google account')) {
        setError('Use "Sign in with Google" for this email address.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center p-4 hero-bg">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(232,168,76,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] p-10 sm:p-14 max-w-[500px] w-full relative z-10 border border-white/20"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-caramel rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="text-4xl relative z-10">🧁</span>
          </div>
          <h1 className="font-script text-4xl text-espresso mb-2">Onzu's Kitchen</h1>
          <p className="text-mocha/60 text-sm font-body uppercase tracking-[0.2em] font-bold">Admin Dashboard</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold font-body mb-6 border border-red-100 flex items-center gap-3"
          >
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0">❌</div>
            {error}
          </motion.div>
        )}

        <div className="space-y-6">
          <form onSubmit={handleManualLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-espresso uppercase tracking-widest pl-2">Admin Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-5 py-4 bg-cream/30 border-2 border-biscuit rounded-2xl outline-none focus:border-caramel transition-all text-sm font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-espresso uppercase tracking-widest pl-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-cream/30 border-2 border-biscuit rounded-2xl outline-none focus:border-caramel transition-all text-sm font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-espresso text-cream font-bold py-5 rounded-[1.5rem] shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" /> Login with Credentials
            </button>
          </form>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-biscuit"></div></div>
            <span className="relative px-4 bg-white text-[10px] uppercase tracking-widest text-mocha/40 font-bold">Recommended</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-biscuit text-espresso font-bold py-5 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Chrome className="w-5 h-5" /> Sign in with Google
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-biscuit text-center">
          <Link to="/" className="text-mocha/40 hover:text-espresso text-[11px] font-bold uppercase tracking-widest transition-colors">
            ← Back to Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
