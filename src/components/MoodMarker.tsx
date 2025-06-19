import LottieView from "lottie-react-native";
import React from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { MOOD_ICONS } from "../constants";
import { FriendMoodPin } from "../types";

const { width, height } = Dimensions.get("window");

// Custom Mood Marker Component
export const MoodMarker = ({
  pin,
  onPress,
}: {
  pin: FriendMoodPin;
  onPress: () => void;
}) => {
  // Find the corresponding mood icon
  const moodIcon = MOOD_ICONS.find(
    (icon) => icon.label.toLowerCase() === pin.mood.mood.toLowerCase()
  );

  const isCurrentUser = pin.friend.id === pin.friend.id; // You'll need to pass current user ID

  return (
    <TouchableOpacity
      style={[styles.moodMarkerContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* ✅ FIX 1: Simplified Background Circle for Android */}
      <View
        style={[
          styles.moodMarkerBackground,
          { backgroundColor: getMoodColor(pin.mood.mood) },
          // ✅ FIX 2: Remove shadows on Android to prevent clipping
          Platform.OS === "android" && {},
        ]}
      >
        {/* ✅ FIX 3: Conditional LottieView rendering */}
        {moodIcon && Platform.OS === "ios" ? (
          // Use LottieView on iOS (works better)
          <LottieView
            source={moodIcon.animation}
            style={styles.moodAnimation}
            autoPlay
            loop
          />
        ) : (
          // ✅ FIX 4: Use emoji fallback on Android for better compatibility
          <Text style={styles.moodEmoji}>{getMoodEmoji(pin.mood.mood)}</Text>
        )}
      </View>

      {/* User Name - Simplified for Android */}
      <View style={[styles.moodMarkerNameContainer]}>
        <Text style={styles.moodMarkerName} numberOfLines={1}>
          {pin.friend.name} 
        </Text>
      </View>

      {/* ✅ FIX 6: Remove pulse effect on Android (causes rendering issues) */}
      {Platform.OS === "ios" && (
        <View
          style={[
            styles.pulseEffect,
            { backgroundColor: getMoodColor(pin.mood.mood) },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

// ✅ Helper function to get mood emoji (Android fallback)
const getMoodEmoji = (mood: string): string => {
  const moodEmojis: { [key: string]: string } = {
    Happy: "😊",
    Sad: "😢",
    Excited: "🤩",
    Angry: "😠",
    Neutral: "😐",
    Tired: "😴",
    Scared: "😰",
  };
  return moodEmojis[mood] || "😊";
};

// Helper function to get mood color
const getMoodColor = (mood: string): string => {
  const moodColors: { [key: string]: string } = {
    Happy: "#4CAF50",
    Sad: "#2196F3",
    Excited: "#FF9800",
    Angry: "#F44336",
    Neutral: "#9E9E9E",
    Tired: "#9C27B0",
    Scared: "#795548",
  };
  return moodColors[mood] || "#9E9E9E";
};

const styles = StyleSheet.create({
  pulseEffect: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
    top: -25,
  },

  // ✅ FIXED: Android-compatible marker styles
  moodMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
    // ✅ Add explicit dimensions for better Android rendering
    width: 80,
    height: 100,
    // ✅ Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        width: 60,
        height: 60,
      },
      android: {
        width: 60,
        height: 60,
      },
    }),
  },

  moodMarkerBackground: {
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    // ✅ Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        width: 60,
        height: 60,
      },
      android: {
        paddingHorizontal: 20,
        paddingVertical: 20,
      },
    }),
  },

  moodAnimation: {
    width: 40,
    height: 40,
  },

  // ✅ NEW: Emoji fallback style for Android
  moodEmoji: {
    fontSize: 28,
    textAlign: "center",
    // Ensure emoji is centered
    lineHeight: Platform.OS === "android" ? 32 : 28,
  },

  moodMarkerNameContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    width: 100,
    // ✅ Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  moodMarkerName: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    textAlign: "center",
  },
});
