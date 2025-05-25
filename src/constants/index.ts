// constants/routes.ts
export const ROUTES = {
  HOME: "Home",
  MOODS: "Mood",
  CONNECT_FRIENDS: "Friends",
  PROFILE: "Profile",
  LOGIN: "Login",
  REGISTER: "Register",
  CREATE_MOOD: "CreateMood",
};

export const QUESTIONS = [
    "How are you feeling today?",
    "What's your mood like right now?",
    "Ready to capture your emotions?",
    "How would you describe your day?",
    "What's bringing you joy today?",
  ];

export const CAROUSEL_ANIMATIONS = [
  require("../../assets/carousel/carousel-1.json"),
  require("../../assets/carousel/carousel-2.json"),
  require("../../assets/carousel/carousel-3.json"),
  require("../../assets/carousel/carousel-4.json"),
];

export const MOOD_ICONS = [
  {
    name: "HAPPY",
    label: "Happy",
    animation: require("../../assets/happy-animation.json"),
  },
  {
    name: "SAD",
    label: "Sad",
    animation: require("../../assets/sad-animation.json"),
  },
  {
    name: "NEUTRAL",
    label: "Neutral",
    animation: require("../../assets/neutral-animation.json"),
  },
  {
    name: "EXCITED",
    label: "Excited",
    animation: require("../../assets/excited-animation.json"),
  },
  {
    name: "ANGRY",
    label: "Angry",
    animation: require("../../assets/angry-animation.json"),
  },
  {
    name: "TIRED",
    label: "Tired",
    animation: require("../../assets/tired-animation.json"),
  },
  {
    name: "SCARED",
    label: "Scared",
    animation: require("../../assets/scared-animation.json"),
  },
];
