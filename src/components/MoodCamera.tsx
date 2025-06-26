// src/components/MoodCamera.tsx - UPDATE existing file
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabaseImageService } from "../services/imageUploadService"; 

interface CameraProps {
  userId: string;
  imageUrl?: string;
  onImageChanged: (imageUrl: string | undefined) => void;
  disabled?: boolean;
}

export const MoodCamera: React.FC<CameraProps> = ({
  userId,
  imageUrl,
  onImageChanged,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const showImagePickerOptions = () => {
    Alert.alert(
      "📸 Add Photo to Mood",
      "Choose how you want to add a photo",
      [
        {
          text: "📷 Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "🖼️ Choose from Gallery",
          onPress: handlePickFromGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    try {
      setUploading(true);
      setUploadProgress("Opening camera...");

      // ← CHANGE TO USE SUPABASE SERVICE
      const result = await supabaseImageService.takePhoto(userId);

      if (result.success && result.url) {
        setUploadProgress("Photo captured and uploaded!");
        onImageChanged(result.url);
        console.log("✅ Photo taken and uploaded to Supabase:", result.url);
      } else {
        Alert.alert("Error", result.error || "Failed to take photo");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to take photo");
      console.log("Take photo error:", error);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setUploading(true);
      setUploadProgress("Opening gallery...");

      // ← CHANGE TO USE SUPABASE SERVICE
      const result = await supabaseImageService.pickFromGallery(userId);

      if (result.success && result.url) {
        setUploadProgress("Photo uploaded to Supabase!");
        onImageChanged(result.url);
        console.log("✅ Photo picked and uploaded to Supabase:", result.url);
      } else {
        Alert.alert("Error", result.error || "Failed to pick photo");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to pick photo");
      console.log("Pick photo error:", error);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          // Optional: Delete from Supabase Storage
          if (imageUrl) {
            console.log("🗑️ Attempting to delete image from Supabase...");
            const deleteSuccess = await supabaseImageService.deleteImage(
              imageUrl
            );
            if (deleteSuccess) {
              console.log("✅ Image deleted from Supabase Storage");
            } else {
              console.log("⚠️ Failed to delete image from Supabase Storage");
            }
          }

          onImageChanged(undefined);
          console.log("📸 Photo removed from mood");
        },
      },
    ]);
  };

  if (uploading) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator size="large" color="rgba(93, 22, 40, 0.8)" />
        <Text style={styles.uploadingText}>{uploadProgress}</Text>
      </View>
    );
  }

  if (imageUrl) {
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.moodImage} />
        <View style={styles.imageOverlay}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemovePhoto}
          >
            <Ionicons name="close-circle" size={30} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={showImagePickerOptions}
          >
            <Ionicons name="camera" size={24} color="rgba(93, 22, 40, 0.8)" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.addPhotoButton, disabled && styles.disabled]}
        onPress={showImagePickerOptions}
        disabled={disabled || uploading}
      >
        <Ionicons
          name="camera-outline"
          size={32}
          color="rgba(93, 22, 40, 0.7)"
        />
        <Text style={styles.addPhotoText}>Add Photo</Text>
        <Text style={styles.addPhotoSubtext}>Capture your mood moment</Text>
      </TouchableOpacity>
    </View>
  );
};

// ← UPDATE STYLES TO MATCH YOUR APP THEME
const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  addPhotoButton: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
    borderStyle: "dashed",
  },
  disabled: {
    opacity: 0.5,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginTop: 8,
  },
  addPhotoSubtext: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    marginTop: 4,
  },
  uploadingContainer: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
  },
  uploadingText: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginTop: 8,
    fontWeight: "500",
  },
  imageContainer: {
    position: "relative",
    marginVertical: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  moodImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
  },
  removeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 2,
  },
  changeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 6,
  },
});
