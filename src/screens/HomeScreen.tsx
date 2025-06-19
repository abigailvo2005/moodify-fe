import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MOOD_ICONS, ROUTES } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { AnimatedQuestionText } from "../components/AnimatedQuestionText";
import { AnimationCarousel } from "../components/Carousel";
import { FloatingChatButton } from "../components/FloatingChatButton"; // ← ADD: Import FloatingChatButton

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Auth");
  };

  useEffect(() => {
    console.log("User data:", user);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#deb9b6", "#9383c7"]}
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />

      {/* Top Carousel */}
      <AnimationCarousel />

      {/* Main Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Question Text */}
        <AnimatedQuestionText />

        {/* Add New Mood Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate(ROUTES.CREATE_MOOD)}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Add New Mood +</Text>
        </TouchableOpacity>

        {/* Connect Friends Section */}
        <TouchableOpacity
          style={styles.connectFriendsContainer}
          onPress={() => {
            navigation.navigate(ROUTES.CONNECT_FRIENDS);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.connectFriendsText}>
            Curious about your friends' vibes? {"\n"}
            <Text style={styles.connectFriendsSubtext}>
              Connect with them now! 💫
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Additional Navigation Buttons */}
        <View style={styles.additionalButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate(ROUTES.MOODS)}
          >
            <Text style={styles.secondaryButtonText}>My Moods</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
          >
            <Text style={styles.secondaryButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom animation */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Wave Animation */}
      <View style={styles.bottomWaveContainer}>
        <LottieView
          source={require("../../assets/animations/wave.json")} // Replace with your wave animation
          autoPlay
          loop
          style={styles.waveAnimation}
        />
      </View>

      {/* ← ADD: Floating Chat Button - positioned to avoid tab bar */}
      <FloatingChatButton bottom={ height / 50 } right={width / 20 } />

      {/* Debug Logout Button (you can remove this) */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Content Styles
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Button Styles
  primaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "FredokaSemiBold", // Make sure this font is loaded
    color: "#6B5B95",
    fontWeight: "600",
  },

  // Connect Friends Styles
  connectFriendsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 20,
    borderRadius: 20,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  connectFriendsText: {
    fontSize: 16,
    fontFamily: "Fredoka", // Make sure this font is loaded
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  connectFriendsSubtext: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Additional Buttons
  additionalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    flex: 0.45,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "FredokaSemiBold",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },

  // Bottom Wave Animation
  bottomWaveContainer: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    height: height * 0.4,
    zIndex: -1,
  },
  waveAnimation: {
    width: "100%",
    height: "100%",
  },

  // Debug Logout Button
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  logoutText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "FredokaSemiBold",
  },
});
