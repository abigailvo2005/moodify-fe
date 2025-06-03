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
      console.log("User data saved to AsyncStorage:", jsonValue);
    } catch (e) {
      console.log("Failed to save user", e);
    }
  },

  // Get user from storage
  getUser: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log("Failed to get user", e);
      return null;
    }
  },

  // Delete user from storage (Logout)
  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.log("Failed to remove user", e);
    }
  },
};