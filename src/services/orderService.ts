import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  getDocs,
  query,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CartItem } from '../context/CartContext';

const COLLECTION_NAME = 'orders';

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  phoneNumber: string;
  items: CartItem[];
  totalAmount: number;
  location: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: any;
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

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const orderId = `ORD-${Date.now()}`;
    const docRef = doc(db, COLLECTION_NAME, orderId);
    
    await setDoc(docRef, cleanData({
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
    }));
    
    return orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
};

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, cleanData(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return [];
  }
};
