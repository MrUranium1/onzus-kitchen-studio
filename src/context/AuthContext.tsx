import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
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

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      // Force user update in state
      setUser({
        uid: userCredential.user.uid,
        name: name,
        email: email,
        photoURL: undefined
      });
    } catch (error: any) {
      console.error("Email signup failed:", error);
      throw error;
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
      loginWithGoogle, 
      loginWithEmail,
      signUpWithEmail,
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
