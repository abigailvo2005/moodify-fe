import React from "react";
import { Text } from "react-native";
import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  style?: any;
  loopDelay?: number;
  typingSpeed?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  style,
  loopDelay = 3000,
  typingSpeed = 150,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isWaiting) {
      // Wait before starting to delete or type again
      timeout = setTimeout(() => {
        setIsWaiting(false);
        if (currentIndex === text.length) {
          setIsDeleting(true);
        }
      }, loopDelay);
    } else if (isDeleting) {
      if (displayText.length === 0) {
        // Reset for next loop
        setIsDeleting(false);
        setCurrentIndex(0);
      } else {
        // Delete character
        timeout = setTimeout(() => {
          setDisplayText((prevText) => prevText.slice(0, -1));
        }, typingSpeed / 2); // Delete faster than typing
      }
    } else if (currentIndex < text.length) {
      // Add character
      timeout = setTimeout(() => {
        setDisplayText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);

        // If we've completed typing
        if (currentIndex === text.length - 1) {
          setIsWaiting(true);
        }
      }, typingSpeed);
    } else {
      // Finished typing, now wait
      setIsWaiting(true);
    }

    // When deleting, stop at the second first letter (index 1)
    if (isDeleting && displayText.length === 1) {
      setIsDeleting(false);
      setCurrentIndex(1);
    }

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    isWaiting,
    text,
    displayText,
    loopDelay,
    typingSpeed,
  ]);

  return (
    <Text
      style={[{
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        fontFamily: "Pacifico"
      }, style]}
    >
      {displayText}
    </Text>
  );
};

export default TypewriterText;
