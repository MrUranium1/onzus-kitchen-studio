import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const COLLECTION_NAME = 'users';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  phoneNumber?: string;
  address?: string;
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  landmark?: string;
  isDefault: boolean;
  createdAt?: any;
}

const cleanData = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${uid}`);
    return null;
  }
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, profile.uid);
    await setDoc(docRef, cleanData({
      ...profile,
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${profile.uid}`);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(docRef, cleanData({
      ...updates,
      updatedAt: serverTimestamp(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
    throw error;
  }
};

export const getAddresses = async (uid: string): Promise<SavedAddress[]> => {
  try {
    const colRef = collection(db, COLLECTION_NAME, uid, 'addresses');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedAddress));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `${COLLECTION_NAME}/${uid}/addresses`);
    return [];
  }
};

export const addAddress = async (uid: string, address: Omit<SavedAddress, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, COLLECTION_NAME, uid, 'addresses');
    
    // If setting as default, unset others first
    if (address.isDefault) {
      await clearDefaultAddress(uid);
    }

    const docRef = await addDoc(colRef, cleanData({
      ...address,
      createdAt: serverTimestamp()
    }));
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${uid}/addresses`);
    throw error;
  }
};

export const updateAddress = async (uid: string, addressId: string, updates: Partial<SavedAddress>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid, 'addresses', addressId);
    
    if (updates.isDefault) {
      await clearDefaultAddress(uid);
    }

    await updateDoc(docRef, cleanData(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}/addresses/${addressId}`);
    throw error;
  }
};

export const deleteAddress = async (uid: string, addressId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid, 'addresses', addressId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${uid}/addresses/${addressId}`);
    throw error;
  }
};

const clearDefaultAddress = async (uid: string) => {
  const colRef = collection(db, COLLECTION_NAME, uid, 'addresses');
  const snapshot = await getDocs(colRef);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(doc => {
    if (doc.data().isDefault) {
      batch.update(doc.ref, { isDefault: false });
    }
  });
  
  await batch.commit();
};
