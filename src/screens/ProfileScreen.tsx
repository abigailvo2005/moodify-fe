import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from "react-native";
import { User } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { formatDate, parseDate } from "../utils/formatDate";
import { isUsernameExisted, updateUser } from "../services/api";

export default function ProfileScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState<Date>(new Date());
  const [referralCode, setReferralCode] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { user, removeUser, setUser } = useAuth();

  

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out? 🥺", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await removeUser();
          navigation.replace("Auth");
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setName(user.name);
        setUsername(user.username);
        setDob(parseDate(user.dob));
        setReferralCode(user.referralCode);
      }
    };
    fetchUser();
  }, [user]);

  const handleUpdate = async () => {
    // Required Validation
    if (!name.trim() || !username.trim()) {
      Alert.alert("Oops! 😅", "Please fill in all required fields");
      return;
    }

    // Existed username Validation
    if (await isUsernameExisted(username.trim()), user?.id) {
       Alert.alert("Oops! 😅", "This username has already been taken. Please choose another one!");
      return;
    }

    // new User based on what user have edited
    const editedUser = {
      ...user,
      id: user?.id || "",
      name,
      username,
      dob: formatDate(dob, false),
      password: user?.password ?? "", // Ensure password is always a string
      referralCode: user?.referralCode ?? "", // Ensure referralCode is always a string
    };

    // update user in db
    await updateUser(user?.id || "", editedUser)
      .then(() => {
        console.log("Updated:", editedUser);
        Alert.alert("Yay! 🎉", "Your profile has been updated successfully!");

        // update user info in local storage
        setUser(editedUser);
      })
      .catch((error) => {
        Alert.alert("Oops!", "Failed to update profile.");
        console.error(error);
      });
  };

  const copyReferralCode = async () => {
    try {
      await Clipboard.setString(referralCode);
      Alert.alert("Copied! ✨", "Referral code has been copied to clipboard!");
    } catch (error) {
      Alert.alert("Oops!", "Failed to copy referral code");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>
            Let's keep your info up to date! 💫
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name ✨</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="rgba(93, 22, 40, 0.4)"
            />
          </View>

          {/* Username Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username 🌸</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="rgba(93, 22, 40, 0.4)"
              autoCapitalize="none"
            />
          </View>

          {/* Date of Birth Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text onPress={toggleDatePicker} style={styles.input}>
              {formatDate(dob, false)}
            </Text>
            {showDatePicker && (
              <CustomDatePicker
                dob={dob}
                setDob={setDob}
                toggleDatePicker={toggleDatePicker}
              />
            )}
          </View>

          {/* Referral Code Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Referral Code 💎</Text>
            <Text style={styles.fieldDescription}>
              Share with friends to spread the joy!
            </Text>
            <View style={styles.referralContainer}>
              <TextInput
                value={referralCode}
                style={[styles.input, styles.referralInput]}
                editable={false}
                selectTextOnFocus={true}
              />
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyReferralCode}
                activeOpacity={0.8}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Update My Info 💕</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Sign Out 👋</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    textAlign: "center",
  },

  formContainer: {
    paddingHorizontal: 24,
  },

  inputGroup: {
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 8,
  },

  fieldDescription: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    marginBottom: 8,
    fontStyle: "italic",
  },

  input: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "Fredoka",
    minHeight: 50,
  },

  referralContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  referralInput: {
    flex: 1,
    backgroundColor: "rgba(243, 180, 196, 0.05)",
    borderColor: "rgba(243, 180, 196, 0.2)",
    color: "rgba(93, 22, 40, 0.6)",
  },

  copyButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  copyButtonText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "FredokaSemiBold",
  },

  updateButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  updateButtonText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "FredokaSemiBold",
  },

  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.6)",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "rgba(93, 22, 40, 0.7)",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Fredoka",
  },

  bottomSpacing: {
    height: 60,
  },
});
