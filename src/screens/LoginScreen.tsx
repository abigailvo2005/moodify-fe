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
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
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
                <Text style={styles.welcomeSubText}>welcome to</Text>
                <TypewriterText text="Moodify!" style={styles.welcomeText} />
              </View>

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
  welcomeSubText: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Pacifico",
    marginBottom: 3,
  },
  welcomeAnimation: {
    width: width,
    height: height / 2.5, // Giảm chiều cao để có space cho form
    alignSelf: "center",
    marginBottom: -100,
    marginTop: -100,
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
