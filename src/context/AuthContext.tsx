import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getUserProfile, createUserProfile } from '../services/userService';

interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<string>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loading: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsEmailVerified(firebaseUser.emailVerified);
        
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Guest',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined
        });

        // Check if user is admin
        const userEmail = firebaseUser.email?.toLowerCase() || '';
        const isHardcodedAdmin = ['hossainmehir2006@gmail.com', 'onzu080@gmail.com'].includes(userEmail);
        
        console.log(`User logged in: ${userEmail}, isHardcodedAdmin: ${isHardcodedAdmin}`);
        
        // Ensure user profile exists in Firestore
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            console.log("Initializing new user profile...");
            await createUserProfile({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Guest',
              email: userEmail,
              photoURL: firebaseUser.photoURL || undefined
            });
          }
        } catch (error) {
          console.error("Error creating/checking user profile:", error);
        }

        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          const hasAdminDoc = adminDoc.exists();
          setIsAdmin(hasAdminDoc || isHardcodedAdmin);
          
          console.log(`Admin status check: hasAdminDoc=${hasAdminDoc}, final isAdmin=${hasAdminDoc || isHardcodedAdmin}`);
          
          // Auto-provision if hardcoded admin but not in DB yet
          if (isHardcodedAdmin && !hasAdminDoc) {
            console.log("Auto-provisioning admin document...");
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'admins', firebaseUser.uid), { 
              email: userEmail,
              role: 'super-admin',
              createdAt: new Date().toISOString()
            });
            console.log("Admin document provisioned.");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(isHardcodedAdmin);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (emailInput: string, pass: string) => {
    const email = emailInput.toLowerCase().trim();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (!userCredential.user.emailVerified) {
        throw new Error('Email not verified. Please check your inbox.');
      }
    } catch (error: any) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const sendOTP = async (emailInput: string) => {
    const email = emailInput.toLowerCase().trim();
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
  };

  const verifyOTP = async (emailInput: string, otp: string) => {
    const email = emailInput.toLowerCase().trim();
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to verify OTP');
    return data.uid;
  };

  const signUpWithEmail = async (emailInput: string, pass: string, name: string) => {
    const email = emailInput.toLowerCase().trim();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Create firestore profile
      await createUserProfile({
        uid: userCredential.user.uid,
        email: email,
        name: name,
        role: 'user'
      });

      // Send OTP via our API
      await sendOTP(email);

      // Sign out since they need to verify via OTP before session is valid
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error("Email signup failed:", error);
      throw error;
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin,
      isEmailVerified,
      loginWithGoogle, 
      loginWithEmail,
      signUpWithEmail,
      sendOTP,
      verifyOTP,
      resendVerification,
      logout,
      loading,
      isAuthModalOpen, 
      openAuthModal: () => setIsAuthModalOpen(true), 
      closeAuthModal: () => setIsAuthModalOpen(false) 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
