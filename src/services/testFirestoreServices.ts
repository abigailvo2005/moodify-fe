// src/testFirestoreService.ts
import { firestoreService } from "./firestoreService";
import { COLLECTIONS } from "./firebase";

interface TestUser {
  id: string;
  username: string;
  email: string;
}

export const testFirestoreService = async () => {
  try {
    console.log("🧪 Testing Firestore Service...");

    // Test 1: Create a test user
    console.log("📝 Test 1: Creating user...");
    const newUser = await firestoreService.create<TestUser>(COLLECTIONS.USERS, {
      username: "testuser_" + Date.now(),
      email: "test@example.com",
    });
    console.log("✅ User created:", newUser);

    // Test 2: Get user by ID
    console.log("📖 Test 2: Getting user by ID...");
    const retrievedUser = await firestoreService.getById<TestUser>(
      COLLECTIONS.USERS,
      newUser.id
    );
    console.log("✅ User retrieved:", retrievedUser);

    // Test 3: Update user
    console.log("✏️ Test 3: Updating user...");
    const updatedUser = await firestoreService.update<TestUser>(
      COLLECTIONS.USERS,
      newUser.id,
      {
        email: "updated@example.com",
      }
    );
    console.log("✅ User updated:", updatedUser);

    // Test 4: Query users
    console.log("🔍 Test 4: Querying users...");
    const users = await firestoreService.queryWhere<TestUser>(
      COLLECTIONS.USERS,
      [{ field: "username", operator: "==", value: newUser.username }]
    );
    console.log("✅ Query result:", users);

    // Test 5: Get all users
    console.log("📋 Test 5: Getting all users...");
    const allUsers = await firestoreService.getAll<TestUser>(COLLECTIONS.USERS);
    console.log("✅ All users count:", allUsers.length);

    // Test 6: Delete test user
    console.log("🗑️ Test 6: Deleting test user...");
    await firestoreService.delete(COLLECTIONS.USERS, newUser.id);
    console.log("✅ User deleted");

    console.log("🎉 All tests passed! Firestore service is working correctly.");
    return true;
  } catch (error) {
    console.error("❌ Firestore service test failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    } else if (typeof error === "object" && error !== null) {
      console.error("Error details:", {
        message: (error as any).message,
        code: (error as any).code,
        stack: (error as any).stack,
      });
    } else {
      console.error("Unknown error type:", error);
    }
    return false;
  }
};

// Usage in component:
/*
import { testFirestoreService } from './testFirestoreService';

// In your component
const handleTestFirestore = async () => {
  const success = await testFirestoreService();
  if (success) {
    alert('✅ Firestore is working!');
  } else {
    alert('❌ Firestore test failed. Check console.');
  }
};
*/
