import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Text,
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../services/api";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import TypewriterText from "../components/TypeWriterText";
import { GradientButton } from "../components/GradientButton";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await loginUser(username, password);

      if (!res) {
        Alert.alert("Login failed", "Incorrect username or password");
        return;
      }

      if (res) {
        setUser(res);
        console.log("Login User:", res);
        navigation.replace("App");
      } else {
        Alert.alert("Login failed", "Incorrect username or password");
      }
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
        {/* welcome section */}
        <View style={[styles.container, { minHeight: height }]}>
          <View style={styles.welcomeContainer}>
            <LottieView
              source={require("../../assets/warm-welcome.json")}
              style={styles.welcomeAnimation}
              autoPlay
              loop
            />
            <Text style={styles.welcomeSubText}>welcome to</Text>
            <TypewriterText text="Moodify!" style={styles.welcomeText} />
          </View>

          {/* Form login */}
          <View style={styles.formContainer}>
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

            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <GradientButton text="Login" navFunc={handleLogin} />
              </View>
              <View style={styles.buttonWrapper}>
                <GradientButton
                  text="Register"
                  navFunc={() => navigation.navigate("Register")}
                />
              </View>
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
    marginBottom: height * -0.15,
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
  },
  welcomeSubText: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Pacifico",
    marginBottom: 3,
  },
  welcomeAnimation: {
    width: width,
    height: height / 2.5,
    alignSelf: "center",
    marginBottom: height * -0.09,
    marginTop: height * -0.12,
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
});
