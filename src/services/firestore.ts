import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc as fsSetDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

type Unsubscribe = () => void;

export interface CollectionService<T extends { id: string }> {
  subscribe: (onData: (items: T[]) => void, onError: (error: Error) => void) => Unsubscribe;
  getAll: () => Promise<T[]>;
  setDoc: (id: string, data: T) => Promise<void>;
  update: (id: string, partial: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  exists: () => Promise<boolean>;
}

export function createCollectionService<T extends { id: string }>(
  collectionName: string,
): CollectionService<T> {
  return {
    subscribe(onData, onError) {
      return onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
          onData(items);
        },
        onError,
      );
    },

    async getAll() {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
    },

    async setDoc(id, data) {
      await fsSetDoc(doc(db, collectionName, id), data);
    },

    async update(id, partial) {
      await updateDoc(doc(db, collectionName, id), partial as Record<string, unknown>);
    },

    async delete(id) {
      await deleteDoc(doc(db, collectionName, id));
    },

    async exists() {
      const snapshot = await getDocs(query(collection(db, collectionName), limit(1)));
      return !snapshot.empty;
    },
  };
}
