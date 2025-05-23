import React, { use, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./contexts/AuthContext";
import { customFonts } from "./utils/fonts";
import * as Font from "expo-font";


export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load custom fonts to use across app
  const loadFonts = async () => {
    await Font.loadAsync(customFonts);
    setFontsLoaded(true);
  };
  useEffect(() => {
    loadFonts();
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
