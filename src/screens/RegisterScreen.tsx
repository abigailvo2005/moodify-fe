import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { GradientButton } from "../components/GradientButton";
import {
  checkReferralCode,
  isUsernameExisted,
  registerUser,
} from "../services/apiSwitch";
import { User } from "../types";
import { formatDate } from "../utils/formatDate";

const { width, height } = Dimensions.get("screen");

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleRegister = async () => {
    try {
      const formattedDob = formatDate(dob, false);

      // Generate a unique referral code
      let referralCode = "";
      let isExist = false;
      do {
        referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        isExist = await checkReferralCode(referralCode);
      } while (isExist);
      // Check if the referral code already exists

      // Required Validation
      if (!name.trim() || !username.trim() || !password.trim()) {
        Alert.alert("Oops! 😅", "Please fill in all required fields");
        return;
      }

      // Existed username Validation
      if (await isUsernameExisted(username.trim())) {
        Alert.alert(
          "Oops! 😅",
          "This username has already been taken. Please choose another one!"
        );
        return;
      }

      const newUser: User = {
        name,
        username,
        password,
        dob: formattedDob,
        referralCode: referralCode,
        friends: [],
      };

      await registerUser(newUser);
      Alert.alert("Success", "You Can Now Login");
      navigation.goBack();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={["#deb9b6", "#9383c7"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={[styles.container, { minHeight: height }]}>
          <View style={styles.welcomeContainer}>
            <LottieView
              source={require("../../assets/animations/warm-welcome.json")}
              style={styles.welcomeAnimation}
              autoPlay
              loop
            />
          </View>

          {/* Form section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.inputField}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.inputField}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.inputField}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text onPress={toggleDatePicker} style={styles.inputField}>
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

            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <GradientButton text="Register" navFunc={handleRegister} />
              </View>
              
                <Text
                  style={styles.loginLabel}
                  onPress={() => navigation.navigate("Login")}
                >
                  Already have an account? Login here
                </Text>
              
            </View>
          </View>
        </View>
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

  welcomeContainer: {
    marginBottom: -200,
    padding: 10,
    borderRadius: 10,
    marginTop: 30,
  },
  welcomeText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    fontFamily: "Pacifico",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: -10,
  },
  welcomeAnimation: {
    width: width,
    height: height / 3, // Giảm chiều cao để có space cho form
    alignSelf: "center",
    marginBottom: -50,
    marginTop: -110,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: "FredokaBold",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: "Fredoka",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },
  buttonWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  loginLabel: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Fredoka",
  },
});
