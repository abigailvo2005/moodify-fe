// import { useNavigation, useRoute } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import LottieView from "lottie-react-native";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { MOOD_ICONS } from "../constants";
// import { useAuth } from "../contexts/AuthContext";
// import { deleteMood, getMoodById, updateMood } from "../services/apiSwitch";
// import { Mood } from "../types";
// import { formatDate } from "../utils/formatDate";

// export default function DetailMoodScreen() {
//   const [mood, setMood] = useState<Mood>();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedMood, setEditedMood] = useState<Mood | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [moodIcon, setMoodIcon] = useState<string | null>(null);

//   const route = useRoute();
//   const navigation = useNavigation();
//   const { user } = useAuth();
//   const { moodId, onMoodUpdated } = route.params as any;

//   // Fetch mood details when the component mounts or moodId changes - this ensures we always have the latest mood data and can handle cases where the user navigates back to this screen after editing.
//   useEffect(() => {
//     fetchMoodDetail();
//   }, [moodId]);

//   // Fetch mood details from the API
//   const fetchMoodDetail = async () => {
//     try {
//       setLoading(true);
//       const moodData = await getMoodById(moodId);
//       setMood(moodData);
//       setMoodIcon(mood?.mood || null); // Set initial mood icon based on the fetched mood
//       setEditedMood(moodData);
//     } catch (error) {
//       console.log("Error fetching mood:", error);
//       Alert.alert("Error", "Failed to load mood details");
//       navigation.goBack();
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle saving the edited mood
//   const handleSave = async () => {
//     if (!editedMood) return;

//     try {
//       setSaving(true);
//       await updateMood(editedMood.id, {
//         mood: moodIcon ?? mood?.mood,
//         description: editedMood.description ?? mood?.description,
//         reason: editedMood.reason ?? mood?.reason,
//         date: mood?.date,
//         isPrivate: editedMood.isPrivate ?? mood?.isPrivate,
//       });

//       // Update the local state with the edited mood
//       setMood(editedMood);
//       setIsEditing(false);

//       if (onMoodUpdated) {
//         onMoodUpdated();
//       }

//       Alert.alert("Success", "Mood updated successfully!");
//       navigation.goBack();
//     } catch (error) {
//       console.log("Error updating mood:", error);
//       Alert.alert("Error", "Failed to update mood");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Confirm mood deletion
//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Mood",
//       "Are you sure you want to delete this mood entry? This action cannot be undone.",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: confirmDelete,
//         },
//       ]
//     );
//   };

//   // Proceed mood deletion
//   const confirmDelete = async () => {
//     if (!mood) return;

//     try {
//       setSaving(true);
//       await deleteMood(mood.id);

//       if (onMoodUpdated) {
//         onMoodUpdated();
//       }

//       Alert.alert("Success", "Mood deleted successfully!", [
//         {
//           text: "OK",
//           onPress: () => navigation.goBack(),
//         },
//       ]);
//     } catch (error) {
//       console.log("Error deleting mood:", error);
//       Alert.alert("Error", "Failed to delete mood");
//       setSaving(false);
//     }
//   };

//   // Handle cancel editing
//   const handleCancel = () => {
//     setEditedMood(mood ?? null);
//     setIsEditing(false);
//     setMoodIcon(mood?.mood || null);
//   };

//   const isOwner = mood?.userId === user?.id;

//   // loading state UI
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4299E1" />
//         <Text style={styles.loadingText}>Loading mood details...</Text>
//       </View>
//     );
//   }

//   if (!mood) {
//     return (
//       <View style={styles.errorContainer}>
//         <Icon name="alert-circle-outline" size={60} color="#F56565" />
//         <Text style={styles.errorText}>Mood not found</Text>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.screenContainer}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//     >
//       <ScrollView
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         contentContainerStyle={styles.scrollContentContainer}
//       >
//         {/* Background Gradient */}
//         <LinearGradient
//           colors={["#deb9b6", "#9383c7"]}
//           style={StyleSheet.absoluteFill}
//         />
//         <View style={styles.container}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrow-back" size={24} color="#9e4d7f" />
//             </TouchableOpacity>

//             <Text style={styles.headerTitle}>Mood Details</Text>

//             {/* Header actions for editing and saving mood - only for owner of this mood */}
//             {isOwner && (
//               <View style={styles.headerActions}>
//                 {/* User is not editing */}
//                 {!isEditing ? (
//                   <TouchableOpacity
//                     style={styles.editButton}
//                     onPress={() => setIsEditing(true)}
//                   >
//                     <Icon name="create-outline" size={24} color="#9e4d7f" />
//                   </TouchableOpacity>
//                 ) : (
//                   // User is editing
//                   <View style={styles.editActions}>
//                     <TouchableOpacity
//                       style={styles.cancelButton}
//                       onPress={handleCancel}
//                     >
//                       <Icon name="close" size={25} color="#9e4d7f" />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.saveButton}
//                       onPress={handleSave}
//                       disabled={saving}
//                     >
//                       {saving ? (
//                         <ActivityIndicator size="small" color="#FFFFFF" />
//                       ) : (
//                         <Icon name="checkmark" size={20} color="#FFFFFF" />
//                       )}
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               </View>
//             )}
//           </View>

//           <ScrollView
//             style={styles.content}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Mood */}
//             <View style={[styles.moodCard, { borderLeftColor: "#D53F8C" }]}>
//               <View style={styles.moodHeader}>
//                 <Text style={styles.moodLabel}>Mood</Text>
//                 {/* Mood Edit Panel if its owner is editing */}
//                 {isEditing && isOwner ? (
//                   <ScrollView
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={{
//                       flexGrow: 1,
//                       alignItems: "center",
//                     }}
//                     style={{ width: "100%", marginBottom: 16 }}
//                   >
//                     {MOOD_ICONS.map((icon) => (
//                       <TouchableOpacity
//                         key={icon.label}
//                         onPress={() => setMoodIcon(icon.label)}
//                         style={{ marginHorizontal: 8 }}
//                       >
//                         <LottieView
//                           source={icon.animation}
//                           style={{ width: 50, height: 50 }}
//                           autoPlay
//                           loop
//                         />
//                         <Text
//                           style={[
//                             styles.moodInput,
//                             {
//                               color:
//                                 moodIcon === icon.label ||
//                                 (moodIcon === icon.label &&
//                                   mood.mood === icon.label &&
//                                   mood.mood === moodIcon)
//                                   ? "#9e4d7f"
//                                   : "#bdbdbd",
//                             },
//                           ]}
//                         >
//                           {icon.label}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 ) : (
//                   <View style={{ display: "flex", alignItems: "center" }}>
//                     {MOOD_ICONS.map(
//                       (item) =>
//                         item.label === mood.mood && (
//                           <LottieView
//                             key={item.label}
//                             source={item.animation}
//                             style={{ width: 80, height: 80 }}
//                             autoPlay
//                             loop
//                           />
//                         )
//                     )}
//                     <Text style={styles.moodText}>{mood.mood}</Text>
//                   </View>
//                 )}
//               </View>
//             </View>

//             {/* Description */}
//             <View style={styles.noteCard}>
//               <Text style={styles.noteLabel}>Description</Text>
//               {isEditing && isOwner ? (
//                 <TextInput
//                   style={styles.noteInput}
//                   value={editedMood?.description || ""}
//                   onChangeText={(text) =>
//                     setEditedMood((prev) =>
//                       prev ? { ...prev, description: text } : null
//                     )
//                   }
//                   placeholder="Describe your mood in detail..."
//                   multiline
//                   numberOfLines={4}
//                 />
//               ) : (
//                 <Text style={styles.noteText}>
//                   {mood.description || "No description provided"}
//                 </Text>
//               )}
//             </View>

//             {/* Reason */}
//             <View style={styles.noteCard}>
//               <Text style={styles.noteLabel}>Reason</Text>
//               {isEditing && isOwner ? (
//                 <TextInput
//                   style={styles.noteInput}
//                   value={editedMood?.reason || ""}
//                   onChangeText={(text) =>
//                     setEditedMood((prev) =>
//                       prev ? { ...prev, reason: text } : null
//                     )
//                   }
//                   placeholder="What caused this mood?"
//                   multiline
//                   numberOfLines={3}
//                 />
//               ) : (
//                 <Text style={styles.noteText}>
//                   {mood.reason || "No reason specified"}
//                 </Text>
//               )}
//             </View>

//             {/* Date */}
//             <View style={styles.infoCard}>
//               <Text style={styles.infoLabel}>Date</Text>
//               <Text style={styles.infoText}>
//                 {formatDate(mood.date, false)}
//               </Text>
//             </View>

//             {/* Privacy */}
//             <View style={styles.infoCard}>
//               <Text style={styles.infoLabel}>Privacy</Text>
//               {/* Privacy Toggle for editing mood */}
//               {isEditing && isOwner ? (
//                 <TouchableOpacity
//                   style={[
//                     styles.privacyToggle,
//                     {
//                       backgroundColor: editedMood?.isPrivate
//                         ? "#FED7D7"
//                         : "#C6F6D5",
//                     },
//                   ]}
//                   onPress={() =>
//                     setEditedMood((prev) =>
//                       prev ? { ...prev, isPrivate: !prev.isPrivate } : null
//                     )
//                   }
//                 >
//                   <Text
//                     style={[
//                       styles.privacyText,
//                       {
//                         color: editedMood?.isPrivate ? "#C53030" : "#276749",
//                       },
//                     ]}
//                   >
//                     {editedMood?.isPrivate ? "Private" : "Public"}
//                   </Text>
//                 </TouchableOpacity>
//               ) : (
//                 <View
//                   style={[
//                     styles.privacyBadge,
//                     {
//                       backgroundColor: mood.isPrivate ? "#FED7D7" : "#C6F6D5",
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.privacyBadgeText,
//                       {
//                         color: mood.isPrivate ? "#C53030" : "#276749",
//                       },
//                     ]}
//                   >
//                     {mood.isPrivate ? "Private" : "Public"}
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Delete Button */}
//             {isOwner && !isEditing && (
//               <TouchableOpacity
//                 style={styles.deleteButton}
//                 onPress={handleDelete}
//                 disabled={saving}
//               >
//                 <Icon name="trash-outline" size={20} color="#F56565" />
//                 <Text style={styles.deleteButtonText}>Delete Mood</Text>
//               </TouchableOpacity>
//             )}
//           </ScrollView>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   screenContainer: {
//     flex: 1,
//     backgroundColor: "transparent",
//     paddingTop: 20,
//     paddingBottom: 20,
//   },

//   container: {
//     flex: 1,
//   },

//   scrollContentContainer: {
//     flexGrow: 1,
//     paddingBottom: 40,
//   },

//   // Loading and Error States
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: "#718096",
//     fontFamily: "Fredoka",
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//   },
//   errorText: {
//     marginTop: 10,
//     fontSize: 18,
//     color: "#F56565",
//     fontFamily: "FredokaSemiBold",
//   },

//   // Header and Actions (edit/save/cancel)
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 20,
//     backgroundBlendMode: "multiply",
//     borderBottomWidth: 1,
//     borderBottomColor: "transparent",
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 25,
//     fontFamily: "FredokaSemiBold",
//     color: "#63163e",
//     flex: 1,
//     textAlign: "center",
//     textShadowColor: "#ad9aa2",
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 2,
//   },
//   headerActions: {
//     width: 40,
//     alignItems: "flex-end",
//   },
//   editButton: {
//     padding: 8,
//   },
//   editActions: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   cancelButton: {
//     padding: 6,
//   },
//   saveButton: {
//     backgroundColor: "#9e4d7f",
//     padding: 6,
//     paddingHorizontal: 8,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   // Delete Button
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   deleteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#FED7D7",
//     padding: 16,
//     borderRadius: 12,
//     marginTop: 20,
//     marginBottom: 40,
//     gap: 8,
//   },
//   deleteButtonText: {
//     fontSize: 16,
//     color: "#F56565",
//     fontFamily: "FredokaSemiBold",
//   },

//   // Main mood card with prominent styling
//   moodCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderLeftWidth: 4,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//     minHeight: 150,
//   },
//   moodHeader: {
//     flexDirection: "column",
//     gap: 8,
//   },
//   moodLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#2D3748",
//     marginBottom: 4,
//     fontFamily: "FredokaSemiBold",
//   },
//   moodInput: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#D53F8C",
//     marginTop: 12,
//     fontFamily: "Fredoka",
//     paddingHorizontal: 0,
//     textAlign: "center",
//   },
//   moodText: {
//     fontSize: 18,
//     fontWeight: "500",
//     color: "#D53F8C",
//     paddingVertical: 4,
//     fontFamily: "Fredoka",
//   },

//   // Note cards for description and reason
//   noteCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: "#D53F8C",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   noteLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#4A5568",
//     marginBottom: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     fontFamily: "FredokaSemiBold",
//   },
//   noteInput: {
//     fontSize: 16,
//     color: "#2D3748",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 8,
//     padding: 12,
//     minHeight: 80,
//     textAlignVertical: "top",
//     fontFamily: "Fredoka",
//   },
//   noteText: {
//     fontSize: 16,
//     color: "#4A5568",
//     lineHeight: 22,
//     fontFamily: "Fredoka",
//   },

//   // Info cards for date and other read-only info
//   infoCard: {
//     backgroundColor: "#F7FAFC",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: "#D53F8C",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   infoLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#4A5568",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     fontFamily: "FredokaSemiBold",
//   },
//   infoText: {
//     fontSize: 16,
//     color: "#2D3748",
//     fontFamily: "Fredoka",
//   },

//   // Privacy toggle and badge
//   privacyToggle: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     minWidth: 80,
//     alignItems: "center",
//   },
//   privacyText: {
//     fontSize: 14,
//     fontWeight: "600",
//     fontFamily: "Fredoka",
//   },
//   privacyBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     alignItems: "center",
//   },
//   privacyBadgeText: {
//     fontSize: 14,
//     fontWeight: "600",
//     fontFamily: "Fredoka",
//   },
// });


import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { MOOD_ICONS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { deleteMood, getMoodById, updateMood } from "../services/apiSwitch";
import { supabaseImageService } from "../services/imageUploadService"; 
import { Mood } from "../types";
import { formatDate } from "../utils/formatDate";

const { width, height } = Dimensions.get("window");

export default function DetailMoodScreen() {
  const [mood, setMood] = useState<Mood>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMood, setEditedMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [moodIcon, setMoodIcon] = useState<string | null>(null);
  
  // ← ADD IMAGE STATE
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | undefined>(undefined);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { moodId, onMoodUpdated } = route.params as any;

  // Fetch mood details when the component mounts or moodId changes
  useEffect(() => {
    fetchMoodDetail();
  }, [moodId]);

  // Fetch mood details from the API
  const fetchMoodDetail = async () => {
    try {
      setLoading(true);
      const moodData = await getMoodById(moodId);
      setMood(moodData);
      setMoodIcon(moodData?.mood || null);
      setEditedMood(moodData);
      
      // ← SET IMAGE URLS
      setImageUrl(moodData?.imageUrl);
      setOriginalImageUrl(moodData?.imageUrl);
      
    } catch (error) {
      console.log("Error fetching mood:", error);
      Alert.alert("Error", "Failed to load mood details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // ← ADD IMAGE HANDLING FUNCTIONS
  const handleImageSelection = () => {
    Alert.alert(
      "📸 Change Photo",
      "Choose an option",
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
          text: "🗑️ Remove Photo",
          style: "destructive",
          onPress: handleRemovePhoto,
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
      setImageLoading(true);
      const result = await supabaseImageService.takePhoto(user?.id || "unknown");
      
      if (result.success && result.url) {
        setImageUrl(result.url);
        console.log("✅ New photo taken:", result.url);
      } else {
        Alert.alert("Error", result.error || "Failed to take photo");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to take photo");
      console.error("Take photo error:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setImageLoading(true);
      const result = await supabaseImageService.pickFromGallery(user?.id || "unknown");
      
      if (result.success && result.url) {
        setImageUrl(result.url);
        console.log("✅ New photo selected:", result.url);
      } else {
        Alert.alert("Error", result.error || "Failed to pick photo");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to pick photo");
      console.error("Pick photo error:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo", 
      "Are you sure you want to remove this photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setImageUrl(undefined);
            console.log("📸 Photo marked for removal");
          },
        },
      ]
    );
  };

  const showImageModal = () => {
    if (imageUrl) {
      setIsImageModalVisible(true);
    }
  };

  // Handle saving the edited mood
  const handleSave = async () => {
    if (!editedMood) return;

    try {
      setSaving(true);
      
      // ← DELETE OLD IMAGE FROM SUPABASE IF CHANGED
      const shouldDeleteOldImage = originalImageUrl && 
                                   originalImageUrl !== imageUrl && 
                                   imageUrl !== undefined;
      
      if (shouldDeleteOldImage) {
        console.log("🗑️ Deleting old image from Supabase...");
        const deleteSuccess = await supabaseImageService.deleteImage(originalImageUrl);
        if (deleteSuccess) {
          console.log("✅ Old image deleted successfully");
        } else {
          console.log("⚠️ Failed to delete old image (continuing anyway)");
        }
      }

      // Update mood with new data
      await updateMood(editedMood.id, {
        mood: moodIcon ?? mood?.mood,
        description: editedMood.description ?? mood?.description,
        reason: editedMood.reason ?? mood?.reason,
        date: mood?.date,
        isPrivate: editedMood.isPrivate ?? mood?.isPrivate,
        imageUrl: imageUrl, // ← ADD IMAGE URL
        hasImage: Boolean(imageUrl), // ← ADD HAS IMAGE FLAG
      });

      // Update the local state with the edited mood
      const updatedMood = {
        ...editedMood,
        imageUrl: imageUrl,
        hasImage: Boolean(imageUrl),
      };
      
      setMood(updatedMood);
      setEditedMood(updatedMood);
      setOriginalImageUrl(imageUrl); // Update original URL reference
      setIsEditing(false);

      if (onMoodUpdated) {
        onMoodUpdated();
      }

      Alert.alert("Success", "Mood updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.log("Error updating mood:", error);
      Alert.alert("Error", "Failed to update mood");
    } finally {
      setSaving(false);
    }
  };

  // Confirm mood deletion
  const handleDelete = () => {
    Alert.alert(
      "Delete Mood",
      "Are you sure you want to delete this mood entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  // Proceed mood deletion
  const confirmDelete = async () => {
    if (!mood) return;

    try {
      setSaving(true);
      
      // ← DELETE IMAGE FROM SUPABASE BEFORE DELETING MOOD
      if (mood.imageUrl) {
        console.log("🗑️ Deleting image from Supabase before mood deletion...");
        const deleteSuccess = await supabaseImageService.deleteImage(mood.imageUrl);
        if (deleteSuccess) {
          console.log("✅ Image deleted successfully");
        } else {
          console.log("⚠️ Failed to delete image (continuing with mood deletion)");
        }
      }
      
      await deleteMood(mood.id);

      if (onMoodUpdated) {
        onMoodUpdated();
      }

      Alert.alert("Success", "Mood deleted successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("Error deleting mood:", error);
      Alert.alert("Error", "Failed to delete mood");
      setSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setEditedMood(mood ?? null);
    setIsEditing(false);
    setMoodIcon(mood?.mood || null);
    setImageUrl(originalImageUrl); // ← RESET IMAGE TO ORIGINAL
  };

  const isOwner = mood?.userId === user?.id;

  // loading state UI
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4299E1" />
        <Text style={styles.loadingText}>Loading mood details...</Text>
      </View>
    );
  }

  if (!mood) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color="#F56565" />
        <Text style={styles.errorText}>Mood not found</Text>
      </View>
    );
  }

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
        {/* Background Gradient */}
        <LinearGradient
          colors={["#deb9b6", "#9383c7"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#9e4d7f" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Mood Details</Text>

            {/* Header actions for editing and saving mood - only for owner of this mood */}
            {isOwner && (
              <View style={styles.headerActions}>
                {/* User is not editing */}
                {!isEditing ? (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Icon name="create-outline" size={24} color="#9e4d7f" />
                  </TouchableOpacity>
                ) : (
                  // User is editing
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                    >
                      <Icon name="close" size={25} color="#9e4d7f" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Icon name="checkmark" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* ← ADD IMAGE SECTION */}
            {(imageUrl || isEditing) && (
              <View style={styles.imageCard}>
                <Text style={styles.imageLabel}>Photo</Text>
                
                {imageUrl ? (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity
                      style={styles.imagePreview}
                      onPress={showImageModal}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: imageUrl }} style={styles.moodImage} />
                      <View style={styles.imageOverlay}>
                        <Icon name="expand-outline" size={24} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                    
                    {isEditing && isOwner && (
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={handleImageSelection}
                        disabled={imageLoading}
                      >
                        {imageLoading ? (
                          <ActivityIndicator size="small" color="#9e4d7f" />
                        ) : (
                          <>
                            <Icon name="camera-outline" size={20} color="#9e4d7f" />
                            <Text style={styles.changeImageText}>Change Photo</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  // No image but in editing mode
                  isEditing && isOwner && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={handleImageSelection}
                      disabled={imageLoading}
                    >
                      {imageLoading ? (
                        <ActivityIndicator size="large" color="#9e4d7f" />
                      ) : (
                        <>
                          <Icon name="camera-outline" size={32} color="#9e4d7f" />
                          <Text style={styles.addImageText}>Add Photo</Text>
                          <Text style={styles.addImageSubtext}>Capture this mood moment</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}

            {/* Mood */}
            <View style={[styles.moodCard, { borderLeftColor: "#D53F8C" }]}>
              <View style={styles.moodHeader}>
                <Text style={styles.moodLabel}>Mood</Text>
                {/* Mood Edit Panel if its owner is editing */}
                {isEditing && isOwner ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      flexGrow: 1,
                      alignItems: "center",
                    }}
                    style={{ width: "100%", marginBottom: 16 }}
                  >
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
                          style={[
                            styles.moodInput,
                            {
                              color:
                                moodIcon === icon.label ||
                                (moodIcon === icon.label &&
                                  mood.mood === icon.label &&
                                  mood.mood === moodIcon)
                                  ? "#9e4d7f"
                                  : "#bdbdbd",
                            },
                          ]}
                        >
                          {icon.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={{ display: "flex", alignItems: "center" }}>
                    {MOOD_ICONS.map(
                      (item) =>
                        item.label === mood.mood && (
                          <LottieView
                            key={item.label}
                            source={item.animation}
                            style={{ width: 80, height: 80 }}
                            autoPlay
                            loop
                          />
                        )
                    )}
                    <Text style={styles.moodText}>{mood.mood}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Description */}
            <View style={styles.noteCard}>
              <Text style={styles.noteLabel}>Description</Text>
              {isEditing && isOwner ? (
                <TextInput
                  style={styles.noteInput}
                  value={editedMood?.description || ""}
                  onChangeText={(text) =>
                    setEditedMood((prev) =>
                      prev ? { ...prev, description: text } : null
                    )
                  }
                  placeholder="Describe your mood in detail..."
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.noteText}>
                  {mood.description || "No description provided"}
                </Text>
              )}
            </View>

            {/* Reason */}
            <View style={styles.noteCard}>
              <Text style={styles.noteLabel}>Reason</Text>
              {isEditing && isOwner ? (
                <TextInput
                  style={styles.noteInput}
                  value={editedMood?.reason || ""}
                  onChangeText={(text) =>
                    setEditedMood((prev) =>
                      prev ? { ...prev, reason: text } : null
                    )
                  }
                  placeholder="What caused this mood?"
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.noteText}>
                  {mood.reason || "No reason specified"}
                </Text>
              )}
            </View>

            {/* Date */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoText}>
                {formatDate(mood.date, false)}
              </Text>
            </View>

            {/* Privacy */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Privacy</Text>
              {/* Privacy Toggle for editing mood */}
              {isEditing && isOwner ? (
                <TouchableOpacity
                  style={[
                    styles.privacyToggle,
                    {
                      backgroundColor: editedMood?.isPrivate
                        ? "#FED7D7"
                        : "#C6F6D5",
                    },
                  ]}
                  onPress={() =>
                    setEditedMood((prev) =>
                      prev ? { ...prev, isPrivate: !prev.isPrivate } : null
                    )
                  }
                >
                  <Text
                    style={[
                      styles.privacyText,
                      {
                        color: editedMood?.isPrivate ? "#C53030" : "#276749",
                      },
                    ]}
                  >
                    {editedMood?.isPrivate ? "Private" : "Public"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.privacyBadge,
                    {
                      backgroundColor: mood.isPrivate ? "#FED7D7" : "#C6F6D5",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.privacyBadgeText,
                      {
                        color: mood.isPrivate ? "#C53030" : "#276749",
                      },
                    ]}
                  >
                    {mood.isPrivate ? "Private" : "Public"}
                  </Text>
                </View>
              )}
            </View>

            {/* Delete Button */}
            {isOwner && !isEditing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={saving}
              >
                <Icon name="trash-outline" size={20} color="#F56565" />
                <Text style={styles.deleteButtonText}>Delete Mood</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* ← IMAGE MODAL FOR FULL SCREEN VIEW */}
        <Modal
          visible={isImageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsImageModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={() => setIsImageModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsImageModalVisible(false)}
                >
                  <Icon name="close" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },

  container: {
    flex: 1,
  },

  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#718096",
    fontFamily: "Fredoka",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: "#F56565",
    fontFamily: "FredokaSemiBold",
  },

  // Header and Actions (edit/save/cancel)
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundBlendMode: "multiply",
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: "FredokaSemiBold",
    color: "#63163e",
    flex: 1,
    textAlign: "center",
    textShadowColor: "#ad9aa2",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  headerActions: {
    width: 40,
    alignItems: "flex-end",
  },
  editButton: {
    padding: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    padding: 6,
  },
  saveButton: {
    backgroundColor: "#9e4d7f",
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  // Delete Button
  content: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FED7D7",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#F56565",
    fontFamily: "FredokaSemiBold",
  },

  // ← ADD IMAGE STYLES
  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#D53F8C",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "FredokaSemiBold",
  },
  imageContainer: {
    alignItems: "center",
  },
  imagePreview: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  moodImage: {
    width: width - 80,
    height: 200,
    borderRadius: 12,
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(243, 180, 196, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: "#9e4d7f",
    fontFamily: "FredokaSemiBold",
  },
  addImageButton: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
    borderStyle: "dashed",
  },
  addImageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9e4d7f",
    fontFamily: "FredokaSemiBold",
    marginTop: 8,
  },
  addImageSubtext: {
    fontSize: 12,
    color: "rgba(158, 77, 127, 0.7)",
    fontFamily: "Fredoka",
    marginTop: 4,
  },

  // Modal styles for full screen image view
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: width,
    height: height * 0.8,
  },

  // Main mood card with prominent styling
  moodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 150,
  },
  moodHeader: {
    flexDirection: "column",
    gap: 8,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
    fontFamily: "FredokaSemiBold",
  },
  moodInput: {
    fontSize: 16,
    fontWeight: "500",
    color: "#D53F8C",
    marginTop: 12,
    fontFamily: "Fredoka",
    paddingHorizontal: 0,
    textAlign: "center",
  },
  moodText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#D53F8C",
    paddingVertical: 4,
    fontFamily: "Fredoka",
  },

  // Note cards for description and reason
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#D53F8C",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "FredokaSemiBold",
  },
  noteInput: {
    fontSize: 16,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily: "Fredoka",
  },
  noteText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 22,
    fontFamily: "Fredoka",
  },

  // Info cards for date and other read-only info
  infoCard: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#D53F8C",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "FredokaSemiBold",
  },
  infoText: {
    fontSize: 16,
    color: "#2D3748",
    fontFamily: "Fredoka",
  },

  // Privacy toggle and badge
  privacyToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  privacyText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Fredoka",
  },
  privacyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  privacyBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Fredoka",
  },
});