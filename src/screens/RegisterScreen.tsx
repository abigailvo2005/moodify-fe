import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Keyboard,
} from "react-native";
import uuid from "react-native-uuid";
import { checkReferralCode, registerUser } from "../services/api";
import { User } from "../types";
import { formatDate } from "../utils/formatDate";
import { GradientButton } from "../components/GradientButton";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { CustomDatePicker } from "../components/CustomDatePicker";

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
      const formattedDob = formatDate(dob);

      // Generate a unique referral code
      let referralCode = "";
      let isExist = false;
      do {
        referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        isExist = await checkReferralCode(referralCode);
        console.log("Generated referral code:", referralCode);
      } while (isExist);
      // Check if the referral code already exists

      const newUser: User = {
        id: uuid.v4(),
        name,
        username,
        password,
        dob: formattedDob,
        referralCode: referralCode,
        friends: [],
        token: "", // Optional, for JWT
      };

      await registerUser(newUser);
      Alert.alert("Success", "You Can Now Login");
      navigation.goBack();
    } catch (err) {
      console.error(err);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={["#deb9b6", "#9383c7"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Login */}
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            style={{ flex: 1, minHeight: height }}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.container, { minHeight: height }]}>
              <View style={styles.welcomeContainer}>
                <LottieView
                  source={require("../../assets/warm-welcome.json")}
                  style={styles.welcomeAnimation}
                  autoPlay
                  loop
                />
              </View>

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
                  <Text
                    onPress={toggleDatePicker}
                    style={styles.inputField}
                  >{formatDate(dob)}</Text>
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
                  <View style={styles.buttonWrapper}>
                    <GradientButton
                      text="Login"
                      navFunc={() => navigation.navigate("Login")}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 30,
    flex: 1,
  },
  welcomeContainer: {
    marginBottom: -100,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
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
    paddingBottom: 50, // Space cho keyboard
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
});
