// src/utils/fonts.ts - UPDATED VERSION
import { Platform } from "react-native";

export const customFonts = {
  Pacifico: require("../../assets/fonts/Pacifico/Pacifico-Regular.ttf"),
  Fredoka: require("../../assets/fonts/Fredoka/static/Fredoka-Regular.ttf"),
  FredokaSemiBold: require("../../assets/fonts/Fredoka/static/Fredoka-SemiBold.ttf"),
  FredokaBold: require("../../assets/fonts/Fredoka/static/Fredoka-Bold.ttf"),
};

// ✅ Android-safe font names
export const fontFamily = {
  pacifico: Platform.select({
    ios: "Pacifico",
    android: "Pacifico-Regular", // Android requires exact font file name
  }),
  fredoka: Platform.select({
    ios: "Fredoka",
    android: "Fredoka-Regular",
  }),
  fredokaSemiBold: Platform.select({
    ios: "FredokaSemiBold",
    android: "Fredoka-SemiBold",
  }),
  fredokaBold: Platform.select({
    ios: "FredokaBold",
    android: "Fredoka-Bold",
  }),
};

// ✅ Fallback fonts for reliability
export const getFontFamily = (fontName: keyof typeof fontFamily) => {
  const selectedFont = fontFamily[fontName];

  // Fallback to system fonts if custom font fails
  const fallbacks = {
    pacifico: Platform.select({
      ios: "System",
      android: "normal",
    }),
    fredoka: Platform.select({
      ios: "System",
      android: "normal",
    }),
    fredokaSemiBold: Platform.select({
      ios: "System",
      android: "normal",
    }),
    fredokaBold: Platform.select({
      ios: "System",
      android: "normal",
    }),
  };

  return selectedFont || fallbacks[fontName];
};
