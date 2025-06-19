// src/utils/shadowUtils.ts - NEW FILE
import { Platform, ViewStyle } from "react-native";

export interface ShadowOptions {
  elevation?: number;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

// ✅ Cross-platform shadow utility
export const createShadow = (options: ShadowOptions = {}): ViewStyle => {
  const {
    elevation = 5,
    shadowColor = "#000",
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.25,
    shadowRadius = 3.84,
  } = options;

  return Platform.select({
    ios: {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    },
    android: {
      elevation,
    },
  }) as ViewStyle;
};

// ✅ Predefined shadow styles
export const shadowStyles = {
  small: createShadow({
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  }),

  medium: createShadow({
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }),

  large: createShadow({
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  }),

  button: createShadow({
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }),

  card: createShadow({
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  }),

  modal: createShadow({
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  }),
};

// ✅ Helper for buttons specifically
export const buttonShadow = (pressed: boolean = false) => {
  if (pressed) {
    return createShadow({
      elevation: 1,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    });
  }

  return shadowStyles.button;
};
