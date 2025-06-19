import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Shadow } from "react-native-shadow-2";

// params for the button (text displayed and the screen to navigate to)
interface GradientButtonProps {
  text: string;
  navFunc: () => void;
  style?: any;
}

// GradientButton component
export const GradientButton = ({
  text,
  navFunc,
  style,
}: GradientButtonProps) => {
  return (
    <View style={styles.container}>
      <Shadow
        distance={10}
        startColor={"#00000020"}
        offset={[0, 4]}
        style={styles.shadow}
      >
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
      </Shadow>
    </View>
  );
};

/* STYLES */
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  shadow: {
    borderRadius: 20,
    marginBottom: 20,
  },

  button: {
    paddingTop: 0,
    paddingBottom: 3,
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
    paddingHorizontal: 100,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: 15,
  },
});
