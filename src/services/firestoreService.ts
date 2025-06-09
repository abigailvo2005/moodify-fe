// src/services/firestoreService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  WhereFilterOp,
  writeBatch,
  serverTimestamp,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase"; // Make sure this imports the correct db instance

type WhereCondition = {
  field: string;
  operator: WhereFilterOp;
  value: any;
};

class FirestoreService {
  // GET all documents from collection
  async getAll<T>(collectionName: string): Promise<T[]> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.log(`Error getting ${collectionName}:`, error);
      throw error;
    }
  }

  // GET document by ID
  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.log(`Error getting document ${id}:`, error);
      throw error;
    }
  }

  // CREATE new document
  async create<T>(collectionName: string, data: Omit<T, "id">): Promise<T> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { id: docRef.id, ...data } as T;
    } catch (error) {
      console.log(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // UPDATE document
  async update<T>(
    collectionName: string,
    id: string,
    data: Partial<Omit<T, "id">>
  ): Promise<T> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      const updated = await this.getById<T>(collectionName, id);
      return updated!;
    } catch (error) {
      console.log(`Error updating document ${id}:`, error);
      throw error;
    }
  }

  // DELETE document
  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.log(`Error deleting document ${id}:`, error);
      throw error;
    }
  }

  // QUERY with WHERE conditions
  async queryWhere<T>(
    collectionName: string,
    conditions: WhereCondition[]
  ): Promise<T[]> {
    try {
      console.log(`🔍 Querying ${collectionName} with conditions:`, conditions);

      let queryConstraints: any[] = [];

      // Build query constraints
      conditions.forEach((condition) => {
        queryConstraints.push(
          where(condition.field, condition.operator, condition.value)
        );
      });

      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);

      console.log(
        `✅ Query successful. Found ${snapshot.docs.length} documents`
      );

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.log(`❌ Error querying ${collectionName}:`, error);
      console.log("Error details:", {
        code: error.code,
        message: error.message,
        collectionName,
        conditions,
      });
      throw error;
    }
  }

  // QUERY with pagination
  async queryWithPagination<T>(
    collectionName: string,
    conditions: WhereCondition[] = [],
    orderByField?: string,
    limitCount?: number,
    startAfterDoc?: DocumentSnapshot
  ): Promise<{ data: T[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let queryConstraints: any[] = [];

      // Add where conditions
      conditions.forEach((condition) => {
        queryConstraints.push(
          where(condition.field, condition.operator, condition.value)
        );
      });

      // Add orderBy
      if (orderByField) {
        queryConstraints.push(orderBy(orderByField));
      }

      // Add startAfter for pagination
      if (startAfterDoc) {
        queryConstraints.push(startAfter(startAfterDoc));
      }

      // Add limit
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }

      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      const lastDoc =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      return { data, lastDoc };
    } catch (error) {
      console.log(`Error in paginated query for ${collectionName}:`, error);
      throw error;
    }
  }

  // REAL-TIME listener
  onSnapshot<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    conditions: WhereCondition[] = []
  ): () => void {
    try {
      let queryConstraints: any[] = [];

      conditions.forEach((condition) => {
        queryConstraints.push(
          where(condition.field, condition.operator, condition.value)
        );
      });

      const q = query(collection(db, collectionName), ...queryConstraints);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        callback(data);
      });

      return unsubscribe;
    } catch (error) {
      console.log(`Error setting up listener for ${collectionName}:`, error);
      throw error;
    }
  }

  // BATCH operations
  async batchWrite(
    operations: Array<{
      type: "create" | "update" | "delete";
      collection: string;
      id?: string;
      data?: any;
    }>
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      operations.forEach((op) => {
        const docRef = op.id
          ? doc(db, op.collection, op.id)
          : doc(collection(db, op.collection));

        switch (op.type) {
          case "create":
            batch.set(docRef, {
              ...op.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            break;
          case "update":
            batch.update(docRef, {
              ...op.data,
              updatedAt: serverTimestamp(),
            });
            break;
          case "delete":
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
    } catch (error) {
      console.log("Error in batch operation:", error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
