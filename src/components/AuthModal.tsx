import React, { useState, useEffect } from 'react';
import { X, Chrome, Mail, Lock, LogIn, ChevronRight, User, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithEmail, signUpWithEmail, sendOTP, verifyOTP, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [resending, setResending] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const resetState = () => {
    setShowEmailForm(false);
    setIsSignUp(false);
    setStep('details');
    setResending(false);
    setName('');
    setEmail('');
    setPassword('');
    setOtp('');
    setError('');
    setSuccess('');
    setShowPassword(false);
    setCountdown(0);
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

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    try {
      await sendOTP(email);
      setSuccess('A new code has been sent to your email.');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      if (isSignUp) {
        if (step === 'details') {
          if (!name.trim()) {
            setError('Name is required');
            return;
          }
          if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
          }
          await signUpWithEmail(email, password, name);
          setStep('otp');
          setCountdown(60);
          setSuccess('We’ve sent a 6-digit verification code to your email.');
        } else {
          // Verify OTP
          if (otp.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
          }
          await verifyOTP(email, otp);
          setSuccess('Email verified! Logging you in...');
          
          // Now login
          await loginWithEmail(email, password);
          handleClose();
          navigate('/');
        }
      } else {
        await loginWithEmail(email, password);
        handleClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMessage = err.message || 'Authentication failed.';
      
      // Attempt to parse JSON error from handleFirestoreError
      try {
        if (typeof err.message === 'string' && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) errorMessage = parsed.error;
        }
      } catch (e) {}

      if (errorMessage.includes('not verified')) {
        setError('Your email is not verified. Let\'s verify it now.');
        // If login failed due to verification, we can trigger OTP flow
        try {
          await sendOTP(email);
          setIsSignUp(true);
          setStep('otp');
          setCountdown(60);
        } catch (otpErr) {
          setError('Email not verified. Failed to send verification code.');
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email sign-in is disabled in Firebase.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else {
        setError(errorMessage);
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
                      if (step === 'otp') {
                        setStep('details');
                        setOtp('');
                        setError('');
                        setSuccess('');
                      } else {
                        setShowEmailForm(false);
                        setIsSignUp(false);
                      }
                    }}
                    className="text-[10px] font-bold text-mocha/40 hover:text-espresso uppercase tracking-widest flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  <span className="text-[10px] font-bold text-caramel uppercase tracking-widest">
                    {step === 'otp' ? 'Verification' : (isSignUp ? 'Create Account' : 'Email Login')}
                  </span>
                </div>

                {isSignUp && step === 'details' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-4 w-4 h-4 text-biscuit group-focus-within:text-caramel transition-colors" />
                    <input 
                      type="text"
                      required
                      placeholder="Full Name *"
                      className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-all font-body"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                {step === 'details' && (
                  <>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-4 w-4 h-4 text-biscuit group-focus-within:text-caramel transition-colors" />
                      <input 
                        type="email"
                        required
                        placeholder="Email Address *"
                        className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-caramel transition-all font-body"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="relative group">
                      <Lock className="absolute left-4 top-4 w-4 h-4 text-biscuit group-focus-within:text-caramel transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Password *"
                        className="w-full bg-white border-2 border-biscuit rounded-2xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-caramel transition-all font-body"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-biscuit hover:text-caramel transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </>
                )}

                {step === 'otp' && (
                  <div className="space-y-6 pt-2">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-caramel border-2 border-caramel/10 border-dashed">
                        <KeyRound className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-mocha">Verify your email</p>
                      <p className="text-xs text-mocha/60 leading-relaxed px-4">
                        We've sent a 6-digit code to <span className="text-mocha font-bold">{email}</span>.
                      </p>
                    </div>

                    <div className="relative group">
                      <input 
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="000000"
                        className="w-full bg-white border-2 border-biscuit rounded-2xl px-4 py-4 text-center text-3xl font-display font-bold tracking-[0.5em] outline-none focus:border-caramel transition-all shadow-inner"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-mocha/40 uppercase font-bold tracking-widest mb-2">Didn't receive the code?</p>
                      <button 
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resending || countdown > 0}
                        className="text-xs font-bold text-caramel hover:underline disabled:opacity-50 flex items-center justify-center gap-1 mx-auto"
                      >
                        {resending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : countdown > 0 ? (
                          `Resend available in ${countdown}s`
                        ) : (
                          'Resend OTP'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isSignUp && step === 'details' && password && (
                  <div className="px-1 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-mocha/40">
                      <span>Password Strength</span>
                      <span className="flex gap-1 items-center">
                        {password.length < 6 ? 'Too Short' : 
                          password.length < 10 ? 'Fair' : 'Strong'}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-mocha/5 rounded-full overflow-hidden flex gap-0.5">
                      <div className={cn("h-full transition-all duration-500", password.length >= 6 ? "bg-caramel w-1/2" : "bg-red-400 w-1/4")} />
                      <div className={cn("h-full transition-all duration-500", password.length >= 10 ? "bg-emerald-500 w-1/2" : "bg-mocha/10 w-1/2")} />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-rust p-3 rounded-xl flex flex-col gap-2 border border-red-100"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{error}</span>
                    </div>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 border border-green-100"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{success}</span>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-espresso hover:bg-mocha text-cream font-bold py-4 rounded-2xl font-body text-sm tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    step === 'otp' ? null : (isSignUp ? <ChevronRight className="w-5 h-5" /> : <LogIn className="w-5 h-5" />)
                  )}
                  {loading ? 'Processing...' : (step === 'otp' ? 'Verify & Login' : (isSignUp ? 'Create Account' : 'Sign In'))}
                </button>

                {step === 'details' && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-[10px] font-bold text-mocha/60 hover:text-caramel uppercase tracking-widest"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                  </div>
                )}
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
