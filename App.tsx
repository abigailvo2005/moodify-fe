import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { customFonts } from "./src/utils/fonts";
import { ChatProvider } from "./src/contexts/ChatContext";

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
      <ChatProvider>
        <RootNavigator />
      </ChatProvider>
    </AuthProvider>
  );
}
