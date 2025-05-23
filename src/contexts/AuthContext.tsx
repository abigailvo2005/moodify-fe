import React, { createContext, useContext, useEffect, useState } from "react";
import { StorageService } from "../services/storageService";
import { User } from "../types";

// Define the shape of the context data
// This includes the user object and a function to update the user
type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  removeUser: () => void;
};

// Create the context with a default value
// The default value is an object with user as null and setUser as a no-op function
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  removeUser: () => {},
});

// Custom hook to use the AuthContext - this allows us to access the context easily in any component
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

  // Function to remove user from context and storage - this is used for logout
  const removeUser = async () => {
    await StorageService.removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
};
