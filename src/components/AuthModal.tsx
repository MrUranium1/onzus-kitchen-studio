import React, { useState } from 'react';
import { X, Chrome, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithEmail, signUpWithEmail, loading } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  if (!isAuthModalOpen) return null;

  const resetState = () => {
    setShowEmailForm(false);
    setIsSignUp(false);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    resetState();
    closeAuthModal();
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      handleClose();
    } catch (error) {
      console.error("Google login error:", error);
      setError('Google sign-in failed.');
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      handleClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email sign-in is disabled in Firebase.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[500] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-cream rounded-3xl shadow-2xl w-full max-w-sm border border-biscuit overflow-hidden h-auto"
      >
        {/* Header */}
        <div className="bg-hero-bg text-cream px-8 pt-8 pb-6 relative hero-bg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-cream flex items-center justify-center shadow-sm border-2 border-honey/20">
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
            <span className="font-script text-honey text-2xl">Onzu's Kitchen</span>
          </div>
          <p className="font-display text-2xl text-cream">Login or <em className="text-honey not-italic">Sign Up</em></p>
          <p className="text-biscuit/70 text-xs font-body mt-1">Order fresh and track your history.</p>
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-cream/50 hover:text-cream text-2xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 py-10">
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.div 
                key="social"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="text-sm font-body text-mocha/70 mb-8 leading-relaxed text-center">
                  Quickly sign in with your Google account to start ordering your favorite treats.
                </p>

                {error && <p className="text-red-500 text-[10px] font-bold text-center mb-4 uppercase">{error}</p>}

                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-espresso hover:bg-mocha text-cream font-bold py-4 rounded-2xl font-body text-sm tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5" />
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-biscuit"></div></div>
                  <span className="relative px-4 bg-cream text-[10px] uppercase tracking-widest text-mocha/40 font-bold">or</span>
                </div>

                <button 
                  onClick={() => setShowEmailForm(true)}
                  className="w-full bg-white border-2 border-biscuit text-espresso hover:bg-cream/50 font-bold py-4 rounded-2xl font-body text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Mail className="w-5 h-5" />
                  Sign in with Email
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
                onSubmit={handleEmailAction}
              >
                <div className="flex items-center justify-between mb-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setIsSignUp(false);
                    }}
                    className="text-[10px] font-bold text-mocha/40 hover:text-espresso uppercase tracking-widest flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  <span className="text-[10px] font-bold text-caramel uppercase tracking-widest">{isSignUp ? 'Create Account' : 'Email Login'}</span>
                </div>

                {isSignUp && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-4 h-4 text-biscuit" />
                    <input 
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors font-body"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-4 h-4 text-biscuit" />
                  <input 
                    type="email"
                    required
                    placeholder="Email address"
                    className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors font-body"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-4 h-4 text-biscuit" />
                  <input 
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-colors font-body"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase">{error}</p>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-espresso hover:bg-mocha text-cream font-bold py-4 rounded-2xl font-body text-sm tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSignUp ? <ChevronRight className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-[10px] font-bold text-mocha/60 hover:text-caramel uppercase tracking-widest"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-[10px] text-mocha/40 mt-8 font-body text-center">
            By continuing, you agree to Onzu's Kitchen terms of service and privacy policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
