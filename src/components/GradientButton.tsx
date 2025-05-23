import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

// params for the button (text displayed and the screen to navigate to)
interface GradientButtonProps {
  text: string;
  navFunc: () => void;
  style?: any;
}

// GradientButton component
export const GradientButton = ({ text, navFunc, style }: GradientButtonProps) => {
  return (
    <TouchableOpacity
      onPress={navFunc}
      activeOpacity={0.7}
      style={styles.button}
    >
      <LinearGradient
        colors={["#deb9b6", "#c099c7", "#deb9b6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }} // Diagonal gradient for diamond pattern effect
        locations={[0, 0.5, 1]} // Control the gradient
        style={[styles.gradient, style]}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

/* STYLES */
const styles = StyleSheet.create({
  button: {
    borderRadius: 1,
    paddingVertical: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontFamily: "FredokaSemiBold",
    color: "#f2e9f7",
    fontSize: 20,
    letterSpacing: 0.8,
    paddingVertical: 3,
  },
  gradient: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    borderRadius: 15,
  },
});
