// src/contexts/AuthContext.tsx 
import React, { createContext, useContext, useEffect, useState } from "react";
import { StorageService } from "../services/storageService";
import { User } from "../types";

// Define the shape of the context data
type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  removeUser: () => void;
};

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  removeUser: () => {},
});

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await StorageService.getUser();
      setUser(savedUser);
    };
    loadUser();
  }, []);

  // Updated: Function to remove user and clear chat
  const removeUser = async () => {
    try {
      await StorageService.removeUser();
      setUser(null);

      // Clear chat history when logging out
      console.log("👤 User logged out, chat will be cleared");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
};
