import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { Dimensions } from "react-native";
import { QUESTIONS } from "../constants";
const { width, height } = Dimensions.get("window");

// Animated Text Component
export const AnimatedQuestionText = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateText = () => {
      // Fade out and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change text
        setCurrentQuestionIndex((prev) => (prev + 1) % QUESTIONS.length);

        // Reset position and fade in
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    const interval = setInterval(animateText, 5000);
    return () => clearInterval(interval);
  }, [QUESTIONS.length]);

  return (
    <Animated.View
      style={[
        styles.questionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.questionText}>{QUESTIONS[currentQuestionIndex]}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    marginVertical: 40,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 25,
    fontFamily: "Pacifico", // Make sure this font is loaded
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 36,
  },
});
