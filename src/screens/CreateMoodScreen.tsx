import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import uuid from "react-native-uuid";
import { MOOD_ICONS } from "../constants";
import { createMood } from "../services/api";
import { Mood, User } from "../types";
import { useAuth } from "../contexts/AuthContext";

const CreateMoodScreen = ({ navigation }: any) => {
  const [moodIcon, setMoodIcon] = useState<string | null>(null);
  const [moodDescription, setMoodDescription] = useState("");
  const [reason, setReason] = useState("");
  const {user} = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);

  // Function to handle mood saving
  const handleSave = async () => {
    try {
      // Replace with actual API call
      console.log("Mood saved:", {
        moodIcon,
        moodDescription,
        reason,
        isPrivate,
      });
      // Create a new mood object
      const newMood: Mood = {
        id: uuid.v4(), // Generate a random ID
        userId: user ? user.id : "",
        mood: moodIcon || "",
        description: moodDescription,
        reason,
        date: new Date().toISOString(),
        isPrivate,
      };

      // Call the API to save the mood
      await createMood(newMood); 
      console.log("Mood saved successfully!");

      // Navigate to the MoodList screen inside the BottomTab navigator
      navigation.navigate("Tabs", { screen: "Mood" });
    } catch (error) {
      console.error("Error saving mood:", error);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ marginBottom: 8 }}>Mood Icon:</Text>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {MOOD_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon.label}
            onPress={() => setMoodIcon(icon.label)}
            style={{ marginHorizontal: 8 }}
          >
            <LottieView
              source={icon.animation}
              style={{ width: 50, height: 50 }}
              autoPlay
              loop
            />
            <Text
              style={{
                textAlign: "center",
                color: moodIcon === icon.label ? "#333" : "#bdbdbd",
              }}
            >
              {icon.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text>Mood Description:</Text>
      <TextInput
        placeholder="Describe your mood..."
        value={moodDescription}
        onChangeText={setMoodDescription}
        style={styles.input}
      />
      <Text>Reason:</Text>
      <TextInput
        placeholder="Why do you feel this way?"
        value={reason}
        onChangeText={setReason}
        style={styles.input}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 12,
        }}
      >
        <Text>Private?</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>
      <Button
        title="Save Mood"
        onPress={handleSave}
        disabled={!moodIcon || !moodDescription}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    marginTop: 4,
  },
});
export default CreateMoodScreen;
