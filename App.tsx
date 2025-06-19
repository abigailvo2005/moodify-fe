import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { customFonts } from "./src/utils/fonts";
import { ChatProvider } from "./src/contexts/ChatContext";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load custom fonts to use across app
  const loadFonts = async () => {
    try {
      await Font.loadAsync(customFonts);
      setFontsLoaded(true);
      console.log("✅ Custom fonts loaded successfully");
    } catch (error) {
      console.error("❌ Error loading fonts:", error);
      // Set to true anyway to prevent infinite loading
      setFontsLoaded(true);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#deb9b6" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <RootNavigator />
      </ChatProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
