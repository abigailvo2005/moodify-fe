import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MOOD_ICONS } from "../constants/index"; // Adjust the import path as necessary
import { Mood } from "../types"; // Adjust the import path as necessary
import { formatDate } from "../utils/formatDate";
import LottieView from "lottie-react-native";

interface MoodCardProps {
  mood: Mood;
}

export default function MoodCard({ mood }: MoodCardProps) {
  // Determine the mood icon based on the mood label or name
  let displayedIcon = null;
  for (const icon of Object.values(MOOD_ICONS)) {
    if (icon.label === mood.mood || icon.name === mood.mood) {
      displayedIcon = icon.animation;
      break;
    }
  }

  const isPrivate = mood.isPrivate;

  return (
    <View
      style={[
        styles.moodCard,
        { backgroundColor: isPrivate ? "#fff2fc" : "#FFFFFF" },
      ]}
    >
      {/* Left side - Mood Icon */}
      <View style={styles.leftSection}>
        <LottieView
          source={displayedIcon}
          style={{ width: 50, height: 50 }}
          autoPlay
          loop
        />
        <Text style={styles.moodLabel}>{mood.mood}</Text>
      </View>

      {/* Right side - Content */}
      <View style={styles.rightSection}>
        <View style={styles.headerRow}>
          <Text style={styles.description} numberOfLines={2}>
            {mood.description}
          </Text>
          <Ionicons
            name={isPrivate ? "person" : "globe-outline"}
            size={16}
            color={isPrivate ? "#FF6B9D" : "#9652d1"}
            style={styles.privacyIcon}
          />
        </View>

        {mood.reason && (
          <Text style={styles.reason} numberOfLines={2}>
            {mood.reason}
          </Text>
        )}

        <Text style={styles.date}>
          {formatDate(mood.date, false)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moodCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  leftSection: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    minWidth: 80,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontFamily: "FredokaSemiBold",
    color: "#c9659a",
    textAlign: "center",
    marginTop: 8,
  },
  rightSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: "FredokaSemiBold",
    color: "#2D3748",
    flex: 1,
    marginRight: 8,
  },
  privacyIcon: {
    marginTop: 2,
  },
  reason: {
    fontSize: 14,
    fontFamily: "FredokaSemiBold",
    color: "#718096",
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    fontFamily: "FredokaSemiBold",
    color: "#A0AEC0",
  },
});
