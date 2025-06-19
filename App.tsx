// App.tsx 
import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { customFonts } from "./src/utils/fonts";
import { ChatProvider } from "./src/contexts/ChatContext";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(false);

  // ✅ Enhanced font loading with Android-specific handling
  const loadFonts = async () => {
    try {
      console.log("🔤 Loading fonts for platform:", Platform.OS);

      if (Platform.OS === "android") {
        // Android: Load fonts with extra delay to ensure proper loading
        await Font.loadAsync(customFonts);

        // Extra delay for Android to ensure fonts are fully registered
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("✅ Android fonts loaded with delay");
      } else {
        // iOS: Normal loading
        await Font.loadAsync(customFonts);
        console.log("✅ iOS fonts loaded normally");
      }

      setFontsLoaded(true);
      console.log("✅ All custom fonts loaded successfully");
    } catch (error) {
      console.error("❌ Error loading fonts:", error);
      setFontError(true);

      // Continue with system fonts if custom fonts fail
      setFontsLoaded(true);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  // ✅ Enhanced loading screen with platform-specific styling
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#deb9b6"
          style={styles.loadingIndicator}
        />
        <Text style={styles.loadingText}>
          {Platform.OS === "android" ? "Loading..." : "Loading..."}
        </Text>
        {fontError && (
          <Text style={styles.errorText}>Using system fonts as fallback</Text>
        )}
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
  loadingIndicator: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "normal",
      },
    }),
  },
  errorText: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "normal",
      },
    }),
  },
});
