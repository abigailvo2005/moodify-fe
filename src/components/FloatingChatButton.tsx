import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface FloatingChatButtonProps {
  bottom?: number;
  right?: number;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  bottom = 100,
  right = 20,
}) => {
  const [animation] = useState(new Animated.Value(1));
  const navigation = useNavigation();

  const handlePress = () => {
    // Create a pulse animation
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to chat screen
    (navigation as any).navigate("ChatBot");
  };

  const handleLongPress = () => {
    // Create a different animation for long press
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={[styles.container, { bottom, right }]}>
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: animation }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.8}
          delayLongPress={500}
        >
          {/* Glow effect */}
          <View style={styles.glowEffect} />

          {/* Main button */}
          <View style={styles.mainButton}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
          </View>

          {/* Pulse animation overlay */}
          <View style={styles.pulseOverlay} />
        </TouchableOpacity>
      </Animated.View>

      {/* Notification dot (optional - could indicate AI availability) */}
      <View style={styles.notificationDot}>
        <View style={styles.notificationDotInner} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
  },

  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  touchable: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  glowEffect: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(243, 180, 196, 0.3)",
    shadowColor: "rgba(243, 180, 196, 0.8)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(158, 77, 127, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.6)",
  },

  pulseOverlay: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(243, 180, 196, 0.2)",
  },

  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  notificationDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
});
