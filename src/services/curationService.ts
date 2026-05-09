import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  query, 
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const COLLECTION_NAME = 'home_curation';

export interface CurationItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  order: number;
}

export const getCurationItems = async (): Promise<CurationItem[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CurationItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return [];
  }
};

export const saveCurationItems = async (items: CurationItem[]): Promise<void> => {
  try {
    // For simplicity, we'll overwrite the items
    // First, get all current IDs to cleanup if necessary
    const currentItems = await getCurationItems();
    const currentIds = currentItems.map(i => i.id);
    const newIds = items.map(i => i.id);
    
    // Delete items that are no longer present
    for (const id of currentIds) {
      if (!newIds.includes(id)) {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
      }
    }

    // Save/Update new items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const docRef = doc(db, COLLECTION_NAME, item.id);
      await setDoc(docRef, { ...item, order: i });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTION_NAME);
    throw error;
  }
};

export const addCurationItem = async (item: Omit<CurationItem, 'id'>): Promise<string> => {
  try {
    const id = Date.now().toString();
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, { ...item, id });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
};
