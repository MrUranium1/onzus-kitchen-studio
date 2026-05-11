import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const COLLECTION_NAME = 'users';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
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
