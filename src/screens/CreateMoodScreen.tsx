import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import { MoodCamera } from "../components/MoodCamera";
import { LocationPicker } from "../components/LocationPicker"; // ← ADD: Import LocationPicker
import { MOOD_ICONS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { createMood } from "../services/apiSwitch";
import { Mood, LocationData } from "../types"; // ← ADD: Import LocationData

const { width } = Dimensions.get("window");

const CreateMoodScreen = ({ navigation }: any) => {
  const [moodIcon, setMoodIcon] = useState<string>("");
  const [moodDescription, setMoodDescription] = useState("");
  const [reason, setReason] = useState("");
  const { user } = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<LocationData | undefined>(undefined); // ← ADD: Location state
  const [saving, setSaving] = useState(false);

  const getCurrentMoodIcon = () => {
    return MOOD_ICONS.find((icon) => icon.label === moodIcon) || MOOD_ICONS[0];
  };

  const handleImageChanged = (newImageUrl: string | undefined) => {
    setImageUrl(newImageUrl);
    console.log(
      "📸 Image URL changed:",
      newImageUrl ? "Image added" : "Image removed"
    );
  };

  // ← ADD: Handle location changes
  const handleLocationChanged = (newLocation: LocationData | undefined) => {
    setLocation(newLocation);
    console.log(
      "📍 Location changed:",
      newLocation ? "Location added" : "Location removed"
    );
  };

  const handleSave = async () => {
    if (!moodIcon) {
      Alert.alert("Oops!", "Please select a mood first 💕");
      return;
    }

    if (!moodDescription.trim()) {
      Alert.alert("Oops! 😅", "Please at lease describe how are you feeling.");
      return;
    }

    try {
      setSaving(true);

      const newMood: Mood = {
        id: uuid.v4().toString(),
        userId: user?.id || "no userId found",
        mood: moodIcon || "",
        description: moodDescription,
        reason,
        date: new Date().toISOString(),
        isPrivate,
        imageUrl: imageUrl || undefined,
        hasImage: Boolean(imageUrl),
        location: location || undefined, // ← ADD: Include location
        hasLocation: Boolean(location), // ← ADD: Include location flag
      };

      console.log("💾 Saving mood with data:", newMood);

      await createMood(newMood);

      // ← UPDATE: Different success messages based on what's included
      let successMessage = "Your mood has been saved successfully!";
      if (imageUrl && location) {
        successMessage =
          "Your mood with photo and location has been saved successfully!";
      } else if (imageUrl) {
        successMessage = "Your mood with photo has been saved successfully!";
      } else if (location) {
        successMessage = "Your mood with location has been saved successfully!";
      }

      Alert.alert("Yay! 🎉", successMessage, [
        {
          text: "Continue",
          onPress: () => navigation.navigate("Tabs", { screen: "Mood" }),
        },
      ]);
    } catch (error) {
      console.log("Error saving mood:", error);
      Alert.alert("Oops!", "Something went wrong. Please try again 💔");
    } finally {
      setSaving(false);
    }
  };

  const renderMoodItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setMoodIcon(item.label)}
      style={[
        styles.moodChip,
        moodIcon === item.label && styles.selectedMoodChip,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.moodChipText,
          moodIcon === item.label && styles.selectedMoodChipText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Header with Back Button */}
        <View style={styles.headerWithBack}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>How are you feeling?</Text>
          <Text style={styles.headerSubtitle}>
            Let's capture this moment 💫
          </Text>
        </View>

        {/* Current Mood Display */}
        <View style={styles.currentMoodContainer}>
          <LottieView
            source={getCurrentMoodIcon().animation}
            style={styles.currentMoodIcon}
            autoPlay
            loop
          />
          <Text style={styles.currentMoodLabel}>
            {getCurrentMoodIcon().label}
          </Text>
        </View>

        {/* Mood Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Choose your mood</Text>
          <FlatList
            data={MOOD_ICONS}
            renderItem={renderMoodItem}
            keyExtractor={(item) => item.label}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodList}
          />
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Mood Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>What's on your mind? ✨</Text>
            <TextInput
              placeholder="Share your thoughts..."
              placeholderTextColor="rgba(93, 22, 40, 0.4)"
              value={moodDescription}
              onChangeText={setMoodDescription}
              style={styles.textInput}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Reason */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              What made you feel this way? 🤔
            </Text>
            <TextInput
              placeholder="Tell us more..."
              placeholderTextColor="rgba(93, 22, 40, 0.4)"
              value={reason}
              onChangeText={setReason}
              style={styles.textInput}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Camera Component */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Add a photo 📸</Text>
            <MoodCamera
              userId={user?.id || "unknown"}
              imageUrl={imageUrl}
              onImageChanged={handleImageChanged}
              disabled={saving}
            />
          </View>

          {/* ← ADD: Location Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Where are you? 📍</Text>
            <LocationPicker
              location={location}
              onLocationChanged={handleLocationChanged}
              disabled={saving}
            />
          </View>

          {/* Privacy Toggle */}
          <View style={styles.privacyContainer}>
            <View style={styles.privacyLabelContainer}>
              <Text style={styles.privacyLabel}>Keep this private? 🔒</Text>
              <Text style={styles.privacySubLabel}>
                Only you will see this entry
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{
                false: "rgba(243, 180, 196, 0.3)",
                true: "rgba(243, 180, 196, 0.8)",
              }}
              thumbColor={
                isPrivate ? "rgba(93, 22, 40, 0.9)" : "rgba(93, 22, 40, 0.5)"
              }
              ios_backgroundColor="rgba(243, 180, 196, 0.3)"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!moodIcon || !moodDescription.trim() || saving) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!moodIcon || !moodDescription.trim() || saving}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.saveButtonText,
              (!moodIcon || saving) && styles.saveButtonTextDisabled,
            ]}
          >
            {saving ? "Saving... 💫" : "Save My Mood 💕"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 20,
  },

  container: {
    flex: 1,
  },

  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  headerWithBack: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },

  backButton: {
    alignSelf: "flex-start",
  },

  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "Fredoka",
  },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    textAlign: "center",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    textAlign: "center",
  },

  currentMoodContainer: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 8,
  },

  currentMoodIcon: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },

  currentMoodLabel: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    textTransform: "capitalize",
  },

  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 16,
    textAlign: "center",
  },

  moodList: {
    paddingHorizontal: 8,
  },

  moodChip: {
    backgroundColor: "rgba(243, 180, 196, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },

  selectedMoodChip: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    borderColor: "rgba(93, 22, 40, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  moodChipText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    textTransform: "capitalize",
  },

  selectedMoodChipText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontWeight: "600",
  },

  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  fieldContainer: {
    marginBottom: 24,
  },

  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 8,
  },

  textInput: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "Fredoka",
    minHeight: 50,
  },

  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.2)",
  },

  privacyLabelContainer: {
    flex: 1,
    marginRight: 16,
  },

  privacyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 2,
  },

  privacySubLabel: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
  },

  saveButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    marginHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  saveButtonDisabled: {
    backgroundColor: "rgba(243, 180, 196, 0.3)",
    shadowOpacity: 0,
    elevation: 0,
  },

  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
  },

  saveButtonTextDisabled: {
    color: "rgba(93, 22, 40, 0.4)",
  },
});

export default CreateMoodScreen;
