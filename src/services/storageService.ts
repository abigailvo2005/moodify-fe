// src/services/storageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// Key to store user data
const USER_KEY = "@current_user";

export const StorageService = {
  // Save user to storage (Login)
  saveUser: async (userData: any) => {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(USER_KEY, jsonValue);
      console.log("✅ User data saved to AsyncStorage");
    } catch (e) {
      console.log("❌ Failed to save user", e);
    }
  },

  // Get user from storage
  getUser: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_KEY);
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("📱 Retrieved user from storage:", user ? 'Found' : 'Not found');
      return user;
    } catch (e) {
      console.log("❌ Failed to get user", e);
      return null;
    }
  },

  // Delete user from storage (Logout)
  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      console.log("✅ User data removed from storage");
    } catch (e) {
      console.log("❌ Failed to remove user", e);
    }
  },

  // Additional helper methods for Expo
  
  // Clear all AsyncStorage (for debugging)
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      console.log("✅ All AsyncStorage data cleared");
    } catch (e) {
      console.log("❌ Failed to clear AsyncStorage", e);
    }
  },

  // Get all keys (for debugging)
  getAllKeys: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log("🔑 AsyncStorage keys:", keys);
      return keys;
    } catch (e) {
      console.log("❌ Failed to get keys", e);
      return [];
    }
  }
};