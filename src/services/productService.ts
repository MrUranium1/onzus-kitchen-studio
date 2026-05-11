import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../data/products';

const COLLECTION_NAME = 'products';

const cleanData = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'id'> & { id?: string | number }): Promise<string> => {
  try {
    // We use a custom ID (Date.now().toString()) or let Firebase generate one
    const id = product.id?.toString() || Date.now().toString();
    const docRef = doc(db, COLLECTION_NAME, id);
    // Include id in the document data as the rules expect it
    await setDoc(docRef, cleanData({ ...product, id: isNaN(Number(id)) ? id : Number(id) }));
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
};

export const updateProduct = async (id: string | number, product: Partial<Product>): Promise<void> => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id.toString());
    // Using setDoc with merge: true handles both updates and creations more robustly
    // than updateDoc (which fails if document doesn't exist)
    await setDoc(docRef, cleanData(product), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const deleteProduct = async (id: string | number): Promise<void> => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id.toString());
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};
